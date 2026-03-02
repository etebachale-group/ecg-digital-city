import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { setCameraMode } from './Player'

function ThirdPersonCamera({ target, offset = [0, 5, 10], lookAtOffset = [0, 1, 0] }) {
  const { camera, gl } = useThree()
  const currentPosition = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3())
  
  // Control de cámara con mouse
  const [cameraAngle, setCameraAngle] = useState({ horizontal: 0, vertical: 0.3 })
  const [cameraDistance, setCameraDistance] = useState(10)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [cameraMode, setCameraMode] = useState('third-person') // 'third-person', 'first-person', 'top-down', '2d-side'
  
  // Body cam effect
  const bodyCamTime = useRef(0)
  const bodyCamBob = useRef({ x: 0, y: 0, z: 0 })
  const isPlayerMoving = useRef(false)
  const playerSpeed = useRef(0)

  useEffect(() => {
    // Inicializar posición de cámara
    if (target) {
      const initialPos = new Vector3(
        target.position.x + offset[0],
        target.position.y + offset[1],
        target.position.z + offset[2]
      )
      currentPosition.current.copy(initialPos)
      camera.position.copy(initialPos)
    }

    // Mouse down - iniciar arrastre
    const handleMouseDown = (e) => {
      if (e.button === 2) { // Click derecho
        setIsDragging(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
        e.preventDefault()
      }
    }

    // Mouse move - rotar cámara
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x
        const deltaY = e.clientY - lastMousePos.y
        
        setCameraAngle(prev => ({
          horizontal: prev.horizontal - deltaX * 0.005,
          vertical: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.vertical - deltaY * 0.005))
        }))
        
        setLastMousePos({ x: e.clientX, y: e.clientY })
      }
    }

    // Mouse up - detener arrastre
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    // Wheel - zoom
    const handleWheel = (e) => {
      e.preventDefault()
      setCameraDistance(prev => Math.max(3, Math.min(20, prev + e.deltaY * 0.01)))
    }

    // Context menu - deshabilitar
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    // Teclas para cambiar modo de cámara
    const handleKeyDown = (e) => {
      if (e.key === 'v' || e.key === 'V') {
        setCameraMode(prev => {
          const newMode = prev === 'third-person' ? 'first-person' :
                         prev === 'first-person' ? 'top-down' :
                         prev === 'top-down' ? '2d-side' : 'third-person'
          setCameraMode(newMode) // Actualizar en Player.jsx
          return newMode
        })
      }
      // Reset cámara con R
      if (e.key === 'r' || e.key === 'R') {
        setCameraAngle({ horizontal: 0, vertical: 0.3 })
        setCameraDistance(10)
        const newMode = 'third-person'
        setCameraMode(newMode)
        setCameraMode(newMode) // Actualizar en Player.jsx
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDragging, lastMousePos, gl])

  useFrame((state, delta) => {
    if (!target) return

    let idealOffset
    let lookAtHeight = lookAtOffset[1]
    let lookAtOffset3D = new Vector3(0, 0, 0)

    // Detectar si el jugador se está moviendo (para body cam)
    const currentPos = new Vector3(target.position.x, target.position.y, target.position.z)
    const lastPos = currentPosition.current
    const movementSpeed = currentPos.distanceTo(lastPos) / delta
    isPlayerMoving.current = movementSpeed > 0.1
    playerSpeed.current = movementSpeed

    // Calcular offset según modo de cámara
    switch (cameraMode) {
      case 'first-person':
        // Primera persona - Body Cam con efecto de balanceo
        const playerRotation = target.rotation.y
        
        // Incrementar tiempo para animación de balanceo
        if (isPlayerMoving.current) {
          bodyCamTime.current += delta * (playerSpeed.current > 5 ? 12 : 8) // Más rápido si corre
        }
        
        // Calcular balanceo de body cam (head bob)
        const bobIntensity = isPlayerMoving.current ? 1 : 0.2
        bodyCamBob.current.x = Math.sin(bodyCamTime.current) * 0.03 * bobIntensity // Balanceo lateral
        bodyCamBob.current.y = Math.abs(Math.sin(bodyCamTime.current * 2)) * 0.05 * bobIntensity // Balanceo vertical
        bodyCamBob.current.z = Math.cos(bodyCamTime.current) * 0.02 * bobIntensity // Balanceo adelante/atrás
        
        // Rotación adicional de la cámara (respiración y movimiento de cabeza)
        const breathingEffect = Math.sin(state.clock.elapsedTime * 2) * 0.01
        const headTilt = isPlayerMoving.current ? Math.sin(bodyCamTime.current) * 0.03 : 0
        
        // Posición de la cámara en los ojos con balanceo
        // CORREGIDO: Usar la rotación del jugador directamente
        idealOffset = new Vector3(
          bodyCamBob.current.x,
          1.8 + bodyCamBob.current.y + breathingEffect, // Altura de los ojos con balanceo
          bodyCamBob.current.z
        )
        
        // Mirar hacia adelante del personaje con efecto de balanceo
        // CORREGIDO: Calcular la dirección hacia adelante correctamente
        const forwardX = Math.sin(playerRotation + cameraAngle.horizontal)
        const forwardZ = Math.cos(playerRotation + cameraAngle.horizontal)
        
        lookAtOffset3D = new Vector3(
          forwardX * 5 + bodyCamBob.current.x * 2,
          1.8 + Math.sin(cameraAngle.vertical) * 2 + bodyCamBob.current.y + headTilt,
          forwardZ * 5 + bodyCamBob.current.z * 2
        )
        lookAtHeight = 0 // No usar lookAtHeight, usar lookAtOffset3D
        break
      
      case 'top-down':
        // Vista cenital
        idealOffset = new Vector3(0, 15, 0.1)
        lookAtHeight = 0
        break
      
      case '2d-side':
        // Vista 2D lateral (como juegos clásicos de plataformas)
        idealOffset = new Vector3(
          15, // Siempre a la derecha
          5,  // Altura media
          target.position.z // Sigue la Z del jugador
        )
        lookAtHeight = 1
        break
      
      case 'third-person':
      default:
        // Tercera persona - cámara orbital
        const horizontalDistance = cameraDistance * Math.cos(cameraAngle.vertical)
        const verticalDistance = cameraDistance * Math.sin(cameraAngle.vertical)
        
        idealOffset = new Vector3(
          Math.sin(cameraAngle.horizontal) * horizontalDistance,
          verticalDistance + 3,
          Math.cos(cameraAngle.horizontal) * horizontalDistance
        )
        break
    }

    // Calcular posición objetivo de la cámara
    const idealPosition = new Vector3()
    idealPosition.copy(target.position)
    idealPosition.add(idealOffset)

    // Suavizar movimiento de cámara (lerp)
    // En primera persona, más rápido para seguir el movimiento del cuerpo
    const lerpFactor = cameraMode === 'first-person' ? 0.3 : cameraMode === '2d-side' ? 0.15 : 0.1
    currentPosition.current.lerp(idealPosition, lerpFactor)
    camera.position.copy(currentPosition.current)

    // Calcular punto de mira
    const lookAtPosition = new Vector3()
    lookAtPosition.copy(target.position)
    
    if (cameraMode === 'first-person' && lookAtHeight === 0) {
      // En primera persona, usar el offset calculado con balanceo
      lookAtPosition.add(lookAtOffset3D)
    } else {
      lookAtPosition.y += lookAtHeight
    }

    // Suavizar rotación de cámara
    // En primera persona, más rápido para el efecto body cam
    const lookLerpFactor = cameraMode === 'first-person' ? 0.3 : 0.15
    currentLookAt.current.lerp(lookAtPosition, lookLerpFactor)
    camera.lookAt(currentLookAt.current)
    
    // Aplicar rotación de inclinación de cabeza en primera persona
    if (cameraMode === 'first-person' && isPlayerMoving.current) {
      const tiltAmount = Math.sin(bodyCamTime.current) * 0.02
      camera.rotation.z = tiltAmount
    } else if (cameraMode === 'first-person') {
      // Suavizar la inclinación cuando no se mueve
      camera.rotation.z *= 0.9
    }
  })

  return null
}

export default ThirdPersonCamera
