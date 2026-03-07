import { useEffect, useState, useRef } from 'react'
import PixiApp from './core/PixiApp'
import { SceneManager } from './core/SceneManager'
import { CameraSystem2D } from './systems/CameraSystem2D'
import { InputManager } from './systems/InputManager'
import { NetworkSync } from './systems/NetworkSync'
import { Vector2D } from './utils/Vector2D'
import { setupWebGLContextLossHandler, setupGlobalErrorHandlers } from './utils/ErrorHandler'
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

  // Handle district transition
  const handleDistrictTransition = async (portal) => {
    if (!sceneManagerRef.current || !playerAvatarRef.current) return
    
    // Find target district
    const targetDistrict = districts.find(d => d.slug === portal.targetDistrict || d.name === portal.targetDistrict)
    
    if (!targetDistrict) {
      useGameStore.getState().showToast(
        `Distrito "${portal.targetDistrict}" no encontrado`,
        'error'
      )
      return
    }
    
    // Show loading toast
    useGameStore.getState().showToast(
      `🌀 Viajando a ${targetDistrict.name}...`,
      'info'
    )
    
    try {
      // Load new district
      await sceneManagerRef.current.loadDistrict(targetDistrict)
      
      // Move player to spawn point
      const spawnPoint = portal.spawnPoint || { x: 0, y: 0 }
      playerAvatarRef.current.position.set(spawnPoint.x, spawnPoint.y)
      playerAvatarRef.current.targetPosition.set(spawnPoint.x, spawnPoint.y)
      
      // Update game store
      useGameStore.getState().setDistrict(targetDistrict.slug)
      
      // Success toast
      useGameStore.getState().showToast(
        `✅ Llegaste a ${targetDistrict.name}`,
        'success'
      )
    } catch (error) {
      console.error('Error loading district:', error)
      useGameStore.getState().showToast(
        'Error al cambiar de distrito',
        'error'
      )
    }
  }

  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers()
    
    // Expose showToast to window for error handler
    window.showToast = (message, type) => {
      useGameStore.getState().showToast(message, type)
    }
    
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
    try {
      console.log('🎮 Pixi.js 2D initialized!')
      
      // Setup WebGL context loss handler
      setupWebGLContextLossHandler(app, () => {
        console.log('Rebuilding scene after context restore...')
        // Scene will be rebuilt automatically on next frame
      })
      
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
      sceneManager.init().catch(error => {
        console.error('Error initializing scene:', error)
        useGameStore.getState().showToast('Error loading game. Please refresh.', 'error')
      })
      
      // Initialize CameraSystem
      const cameraSystem = new CameraSystem2D({
        viewport: { width: app.screen.width, height: app.screen.height },
        worldBounds: WORLD_BOUNDS,
        smoothing: 0.1
      })
      cameraSystemRef.current = cameraSystem
      sceneManager.cameraSystem = cameraSystem
      
      // Set camera target to player (with delay to ensure player is created)
      setTimeout(() => {
        if (playerAvatarRef.current && playerAvatarRef.current.transform) {
          cameraSystem.setTarget(playerAvatarRef.current)
        }
      }, 100)
      
      // Initialize InputManager
      const inputManager = new InputManager({
        canvas: app.view,
        camera: cameraSystem
      })
      inputManagerRef.current = inputManager
      sceneManager.inputManager = inputManager
      
      // Setup zoom controls
      inputManager.onWheel((delta) => {
        try {
          const currentZoom = cameraSystem.zoom
          const newZoom = currentZoom + delta
          cameraSystem.setZoom(newZoom)
        } catch (error) {
          console.error('Error handling zoom:', error)
        }
      })
      
      // Initialize NetworkSync
      const networkSync = new NetworkSync({
        sceneManager,
        playerAvatar: playerAvatarRef.current
      })
      networkSyncRef.current = networkSync
      
      // Setup Socket.IO event listeners for multiplayer
      const socket = getSocket()
      if (socket) {
        socket.on('world:users', (data) => {
          try {
            networkSync.onUsersList(data)
          } catch (error) {
            console.error('Error handling users list:', error)
          }
        })
        socket.on('world:user-joined', (data) => {
          try {
            networkSync.onPlayerJoined(data)
          } catch (error) {
            console.error('Error handling user joined:', error)
          }
        })
        socket.on('world:user-moved', (data) => {
          try {
            networkSync.onPlayerMoved(data)
          } catch (error) {
            console.error('Error handling user moved:', error)
          }
        })
        socket.on('world:user-left', (data) => {
          try {
            networkSync.onPlayerLeft(data)
          } catch (error) {
            console.error('Error handling user left:', error)
          }
        })
        socket.on('chat:message', (data) => {
          try {
            networkSync.onChatMessage(data)
          } catch (error) {
            console.error('Error handling chat message:', error)
          }
        })
        socket.on('disconnect', () => {
          try {
            networkSync.onDisconnect()
          } catch (error) {
            console.error('Error handling disconnect:', error)
          }
        })
        socket.on('connect', () => {
          try {
            networkSync.onReconnect()
          } catch (error) {
            console.error('Error handling reconnect:', error)
          }
        })
      }
      
      // Game loop
      app.ticker.add((delta) => {
        try {
        const deltaTime = delta / 60 // Convert to seconds
        
        // Safety check for WebGL context
        if (!sceneManager || !sceneManager.worldContainer || !sceneManager.worldContainer.transform) {
          return // Skip frame if context is lost
        }
        
        // Handle player movement
        if (playerAvatarRef.current && playerAvatarRef.current.transform && inputManager) {
        const movementVector = inputManager.getMovementVector()
        
        if (movementVector.length() > 0) {
          const isRunning = inputManager.isKeyPressed('shift')
          const speed = isRunning ? RUN_SPEED : WALK_SPEED
          
          const velocity = Vector2D.multiply(movementVector, speed * deltaTime)
          const currentPos = new Vector2D(
            playerAvatarRef.current.position.x,
            playerAvatarRef.current.position.y
          )
          const newPosition = Vector2D.add(currentPos, velocity)
          
          // Check collision with avatar radius
          const avatarRadius = 8 // Avatar collision radius
          const collisionSystem = sceneManager.collisionSystem
          
          if (collisionSystem) {
            // Check if new position collides
            if (!collisionSystem.checkCollision(newPosition, avatarRadius)) {
              // No collision, move freely
              playerAvatarRef.current.moveTo(newPosition)
            } else {
              // Collision detected, try to slide
              const resolvedPosition = collisionSystem.resolveCollision(
                newPosition,
                velocity,
                avatarRadius
              )
              playerAvatarRef.current.moveTo(resolvedPosition)
            }
          } else {
            // Fallback: simple bounds checking
            newPosition.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, newPosition.x))
            newPosition.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, newPosition.y))
            playerAvatarRef.current.moveTo(newPosition)
          }
          
          playerAvatarRef.current.setVelocity(velocity)
          playerAvatarRef.current.isRunning = isRunning
        } else {
          playerAvatarRef.current.setVelocity(new Vector2D(0, 0))
        }
        
        // Check for nearby doors (E key to interact)
        if (inputManager.isKeyPressed('e') && sceneManager.collisionSystem) {
          const playerPos = new Vector2D(
            playerAvatarRef.current.position.x,
            playerAvatarRef.current.position.y
          )
          
          // Check for doors
          const nearbyDoor = sceneManager.collisionSystem.getNearbyDoor(playerPos, 15)
          if (nearbyDoor) {
            sceneManager.collisionSystem.toggleDoor(nearbyDoor.id)
            useGameStore.getState().showToast(
              nearbyDoor.isOpen ? '🚪 Puerta abierta' : '🚪 Puerta cerrada',
              'info'
            )
          }
          
          // Check for portals
          const nearbyPortal = sceneManager.getNearbyPortal(playerPos, 25)
          if (nearbyPortal) {
            handleDistrictTransition(nearbyPortal)
          }
        }
        
        // Show interaction hints
        if (playerAvatarRef.current && sceneManager) {
          const playerPos = new Vector2D(
            playerAvatarRef.current.position.x,
            playerAvatarRef.current.position.y
          )
          
          // Check for nearby interactables
          const nearbyDoor = sceneManager.collisionSystem?.getNearbyDoor(playerPos, 15)
          const nearbyPortal = sceneManager.getNearbyPortal(playerPos, 25)
          
          if (nearbyPortal) {
            sceneManager.showInteractionHint(
              { x: nearbyPortal.position.x, y: nearbyPortal.position.y },
              `Press E to travel to ${nearbyPortal.targetDistrict}`
            )
          } else if (nearbyDoor) {
            sceneManager.showInteractionHint(
              playerPos,
              `Press E to ${nearbyDoor.isOpen ? 'close' : 'open'} door`
            )
          } else {
            sceneManager.hideInteractionHint()
          }
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
      } catch (error) {
        // Handle WebGL context loss or other errors gracefully
        if (error.message && error.message.includes('context')) {
          console.warn('WebGL context error in game loop, skipping frame')
        } else {
          console.error('Error in game loop:', error)
        }
      }
    })
    
    console.log('✅ 2D Game loop started with multiplayer support!')
    } catch (error) {
      console.error('❌ Error initializing 2D game:', error)
      
      // Show error to user
      if (useGameStore.getState().showToast) {
        useGameStore.getState().showToast(
          'Error initializing game. Please refresh the page.',
          'error'
        )
      }
      
      // Try to recover by reloading after delay
      setTimeout(() => {
        console.log('Attempting to reload page...')
        window.location.reload()
      }, 3000)
    }
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
