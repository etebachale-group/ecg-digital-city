import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import District from './components/District'
import UI from './components/UI'
import DistrictMap from './components/DistrictMap'
import ThirdPersonCamera from './components/ThirdPersonCamera'
import Toast from './components/Toast'
import XPBar from './components/XPBar'
import MissionPanel from './components/MissionPanel'
import LevelUpModal from './components/LevelUpModal'
import AchievementToast from './components/AchievementToast'
import { useAuthStore } from './store/authStore'
import { useGameStore } from './store/gameStore'
import { useGamificationStore } from './store/gamificationStore'
import { initSocket, disconnectSocket } from './services/socket'
import AuthScreen from './components/AuthScreen'
import { API_URL } from './config/api'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [districts, setDistricts] = useState([])
  const [playerRef, setPlayerRef] = useState(null)
  const currentDistrict = useGameStore((state) => state.player.district)
  const dailyLogin = useGamificationStore((state) => state.dailyLogin)
  const levelUpData = useGamificationStore((state) => state.levelUpData)
  const closeLevelUpModal = useGamificationStore((state) => state.closeLevelUpModal)
  const achievementUnlocked = useGamificationStore((state) => state.achievementUnlocked)
  const closeAchievementToast = useGamificationStore((state) => state.closeAchievementToast)

  useEffect(() => {
    // Cargar distritos desde la API
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
      // Inicializar socket
      try {
        initSocket()
      } catch (error) {
        console.error('Error al inicializar socket:', error)
      }
      
      loadDistricts()
      
      // Registrar login diario y dar XP
      if (user.id) {
        dailyLogin(user.id).then((data) => {
          if (data) {
            useGameStore.getState().showToast(
              `¡Bienvenido! +10 XP 🎉 Racha: ${data.progress.streakDays} días`,
              'success'
            )
          }
        }).catch(error => {
          console.error('Error en daily login:', error)
        })
      }
    }
    
    // Cleanup: desconectar socket al desmontar
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

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  const activeDistrict = districts.find(d => d.slug === currentDistrict)

  return (
    <>
      <Canvas
        camera={{ position: [0, 20, 30], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Iluminación */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* Cielo */}
          <Sky sunPosition={[100, 20, 100]} />
          
          {/* Distrito activo */}
          {activeDistrict && <District districtData={activeDistrict} onPlayerRef={setPlayerRef} />}
          
          {/* Cámara de tercera persona */}
          {playerRef && <ThirdPersonCamera target={playerRef} />}
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <UI />
      
      {/* XP Bar */}
      <XPBar />
      
      {/* Mission Panel */}
      <MissionPanel />
      
      {/* Mapa de distritos */}
      <DistrictMap />
      
      {/* Notificaciones Toast */}
      <Toast />
      
      {/* Modal de Subida de Nivel */}
      {levelUpData && (
        <LevelUpModal 
          level={levelUpData.level} 
          onClose={closeLevelUpModal}
        />
      )}
      
      {/* Achievement Toast */}
      {achievementUnlocked && (
        <AchievementToast
          achievement={achievementUnlocked}
          onClose={closeAchievementToast}
        />
      )}
    </>
  )
}

export default App
