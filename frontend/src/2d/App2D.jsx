import { useEffect, useState, useRef } from 'react'
import PixiApp from './core/PixiApp'
import { SceneManager } from './core/SceneManager'
import { CameraSystem2D } from './systems/CameraSystem2D'
import { InputManager } from './systems/InputManager'
import { NetworkSync } from './systems/NetworkSync'
import { Vector2D } from './utils/Vector2D'
import UI from '../components/UI'
import Toast from '../components/Toast'
import XPBar from '../components/XPBar'
import MissionPanel from '../components/MissionPanel'
import LevelUpModal from '../components/LevelUpModal'
import AchievementToast from '../components/AchievementToast'
import DistrictMap from '../components/DistrictMap'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { useGamificationStore } from '../store/gamificationStore'
import { initSocket, disconnectSocket, getSocket } from '../services/socket'
import AuthScreen from '../components/AuthScreen'
import { API_URL } from '../config/api'

/**
 * App2D - Main 2D application component
 * Integrates Pixi.js with React and game systems
 * Optimized for Render Free tier with multiplayer support
 */
function App2D() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [districts, setDistricts] = useState([])
  const currentDistrict = useGameStore((state) => state.player.district)
  const dailyLogin = useGamificationStore((state) => state.dailyLogin)
  const levelUpData = useGamificationStore((state) => state.levelUpData)
  const closeLevelUpModal = useGamificationStore((state) => state.closeLevelUpModal)
  const achievementUnlocked = useGamificationStore((state) => state.achievementUnlocked)
  const closeAchievementToast = useGamificationStore((state) => state.closeAchievementToast)

  // Game systems refs
  const sceneManagerRef = useRef(null)
  const cameraSystemRef = useRef(null)
  const inputManagerRef = useRef(null)
  const networkSyncRef = useRef(null)
  const playerAvatarRef = useRef(null)

  // Constants
  const WALK_SPEED = 3
  const RUN_SPEED = 6
  const WORLD_BOUNDS = { minX: -90, maxX: 90, minY: -90, maxY: 90 }

  useEffect(() => {
    // Load districts
    const loadDistricts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/districts`)
        if (!response.ok) {
          throw new Error('Error al cargar distritos')
        }
        const data = await response.json()
        setDistricts(data)
        useGameStore.getState().setDistricts(data)
      } catch (error) {
        console.error('Error cargando distritos:', error)
        useGameStore.getState().showToast(
          'Error al cargar distritos. Verifica que el backend esté corriendo.',
          'error'
        )
      }
    }

    if (isAuthenticated && user) {
      // Initialize socket
      try {
        initSocket()
      } catch (error) {
        console.error('Error al inicializar socket:', error)
      }
      
      loadDistricts()
      
      // Daily login
      if (user.id) {
        dailyLogin(user.id).then((data) => {
          if (data && data.progress) {
            useGameStore.getState().showToast(
              `¡Bienvenido! +10 XP 🎉 Racha: ${data.progress.streakDays || 0} días`,
              'success'
            )
          }
        }).catch(error => {
          console.error('Error en daily login:', error)
        })
      }
    }
    
    return () => {
      if (isAuthenticated) {
        try {
          disconnectSocket()
        } catch (error) {
          console.error('Error al desconectar socket:', error)
        }
      }
    }
  }, [isAuthenticated, user?.id])

  const handlePixiReady = (app) => {
    console.log('🎮 Pixi.js 2D initialized!')
    
    // Get active district
    const activeDistrict = districts.find(d => d.slug === currentDistrict) || districts[0]
    
    // Initialize SceneManager
    const sceneManager = new SceneManager({
      app,
      districtData: activeDistrict,
      onPlayerRef: (player) => {
        playerAvatarRef.current = player
        console.log('👤 Player avatar created')
        
        // Initialize NetworkSync after player is created
        if (networkSyncRef.current) {
          networkSyncRef.current.setPlayerAvatar(player)
        }
      }
    })
    sceneManagerRef.current = sceneManager
    
    // Initialize scene
    sceneManager.init()
    
    // Initialize CameraSystem
    const cameraSystem = new CameraSystem2D({
      viewport: { width: app.screen.width, height: app.screen.height },
      worldBounds: WORLD_BOUNDS,
      smoothing: 0.1
    })
    cameraSystemRef.current = cameraSystem
    sceneManager.cameraSystem = cameraSystem
    
    // Set camera target to player
    if (playerAvatarRef.current) {
      cameraSystem.setTarget(playerAvatarRef.current)
    }
    
    // Initialize InputManager
    const inputManager = new InputManager({
      canvas: app.view,
      camera: cameraSystem
    })
    inputManagerRef.current = inputManager
    sceneManager.inputManager = inputManager
    
    // Initialize NetworkSync
    const networkSync = new NetworkSync({
      sceneManager,
      playerAvatar: playerAvatarRef.current
    })
    networkSyncRef.current = networkSync
    
    // Setup Socket.IO event listeners for multiplayer
    const socket = getSocket()
    if (socket) {
      socket.on('world:users', (data) => networkSync.onUsersList(data))
      socket.on('world:user-joined', (data) => networkSync.onPlayerJoined(data))
      socket.on('world:user-moved', (data) => networkSync.onPlayerMoved(data))
      socket.on('world:user-left', (data) => networkSync.onPlayerLeft(data))
      socket.on('disconnect', () => networkSync.onDisconnect())
      socket.on('connect', () => networkSync.onReconnect())
    }
    
    // Game loop
    app.ticker.add((delta) => {
      const deltaTime = delta / 60 // Convert to seconds
      
      // Handle player movement
      if (playerAvatarRef.current && inputManager) {
        const movementVector = inputManager.getMovementVector()
        
        if (movementVector.length() > 0) {
          const isRunning = inputManager.isKeyPressed('shift')
          const speed = isRunning ? RUN_SPEED : WALK_SPEED
          
          const velocity = Vector2D.multiply(movementVector, speed * deltaTime)
          const newPosition = Vector2D.add(
            new Vector2D(playerAvatarRef.current.position.x, playerAvatarRef.current.position.y),
            velocity
          )
          
          // Simple bounds checking (collision will be added later)
          newPosition.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, newPosition.x))
          newPosition.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, newPosition.y))
          
          playerAvatarRef.current.moveTo(newPosition)
          playerAvatarRef.current.setVelocity(velocity)
          playerAvatarRef.current.isRunning = isRunning
        } else {
          playerAvatarRef.current.setVelocity(new Vector2D(0, 0))
        }
      }
      
      // Update scene
      if (sceneManager) {
        sceneManager.update(deltaTime)
      }
      
      // Update camera
      if (cameraSystem) {
        cameraSystem.update(deltaTime)
        cameraSystem.applyToContainer(sceneManager.worldContainer)
      }
      
      // Update network sync
      if (networkSync) {
        networkSync.update(deltaTime)
      }
    })
    
    console.log('✅ 2D Game loop started with multiplayer support!')
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <>
      {/* Pixi.js Canvas */}
      <PixiApp 
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor={0x87CEEB}
        onReady={handlePixiReady}
      />
      
      {/* UI Overlay (same as 3D version) */}
      <UI />
      <XPBar />
      <MissionPanel />
      <DistrictMap />
      <Toast />
      
      {/* Modals */}
      {levelUpData && (
        <LevelUpModal 
          level={levelUpData.level} 
          onClose={closeLevelUpModal}
        />
      )}
      
      {achievementUnlocked && (
        <AchievementToast
          achievement={achievementUnlocked}
          onClose={closeAchievementToast}
        />
      )}
      
      {/* FPS Counter for development */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        2D Mode (Pixi.js)
      </div>
    </>
  )
}

export default App2D
