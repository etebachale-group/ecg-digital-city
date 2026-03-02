import { useState, useEffect } from 'react'
import './CameraIndicator.css'

function CameraIndicator() {
  const [cameraMode, setCameraMode] = useState('Tercera Persona')
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'v' || e.key === 'V') {
        // Ciclar entre modos
        setCameraMode(prev => {
          if (prev === 'Tercera Persona') return 'Primera Persona'
          if (prev === 'Primera Persona') return 'Vista Cenital'
          if (prev === 'Vista Cenital') return 'Vista 2D Lateral'
          return 'Tercera Persona'
        })
        
        // Mostrar indicador temporalmente
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 2000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showIndicator) return null

  return (
    <div className="camera-indicator">
      <div className="camera-icon">🎥</div>
      <div className="camera-mode">{cameraMode}</div>
    </div>
  )
}

export default CameraIndicator
