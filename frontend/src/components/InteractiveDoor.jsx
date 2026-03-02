import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'

function InteractiveDoor({ 
  id,
  position, 
  rotation = [0, 0, 0],
  width = 1.2,
  height = 2.5,
  depth = 0.1,
  color = "#8B4513",
  onInteract
}) {
  const doorRef = useRef()
  const [isOpen, setIsOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [playerNearby, setPlayerNearby] = useState(false)
  const targetRotation = useRef(rotation[1])
  const currentRotation = useRef(rotation[1])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'e' || e.key === 'E') && playerNearby) {
        const newState = !isOpen
        setIsOpen(newState)
        targetRotation.current = newState ? rotation[1] + Math.PI / 2 : rotation[1]
        
        if (onInteract) {
          onInteract(id, newState)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerNearby, isOpen, id, rotation, onInteract])

  useFrame((state) => {
    if (!doorRef.current) return

    // Animación suave de apertura/cierre
    const diff = targetRotation.current - currentRotation.current
    if (Math.abs(diff) > 0.01) {
      currentRotation.current += diff * 0.1
      doorRef.current.rotation.y = currentRotation.current
    }

    // Detectar jugador cercano (simplificado - en producción usar el sistema de colisiones)
    const playerPos = new THREE.Vector3(0, 0, 0) // Esto debería venir del gameStore
    const doorPos = new THREE.Vector3(position[0], position[1], position[2])
    const distance = playerPos.distanceTo(doorPos)
    
    const nearby = distance < 3
    if (nearby !== playerNearby) {
      setPlayerNearby(nearby)
      setShowPrompt(nearby)
    }
  })

  return (
    <group position={position}>
      {/* Marco de la puerta */}
      <Box args={[width + 0.2, height + 0.2, depth + 0.1]} position={[0, height / 2, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
      </Box>

      {/* Puerta */}
      <group ref={doorRef} position={[-width / 2, 0, 0]} rotation={rotation}>
        <Box args={[width, height, depth]} position={[width / 2, height / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial 
            color={color} 
            roughness={0.7}
            metalness={0.1}
          />
        </Box>

        {/* Manija */}
        <Box args={[0.05, 0.15, 0.2]} position={[width - 0.2, height / 2, depth / 2 + 0.1]} castShadow>
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
        </Box>

        {/* Detalles de la puerta */}
        <Box args={[width - 0.2, height - 0.4, 0.02]} position={[width / 2, height / 2, depth / 2 + 0.01]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </Box>
      </group>

      {/* Prompt de interacción */}
      {showPrompt && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {isOpen ? '[E] Cerrar' : '[E] Abrir'}
        </Text>
      )}
    </group>
  )
}

export default InteractiveDoor
