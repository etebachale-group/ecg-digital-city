import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'

function OtherPlayer({ player }) {
  const groupRef = useRef()
  const targetPosition = useRef(new THREE.Vector3(
    player.position.x,
    player.position.y || 1,
    player.position.z
  ))

  useEffect(() => {
    targetPosition.current.set(
      player.position.x,
      player.position.y || 1,
      player.position.z
    )
  }, [player.position])

  useFrame(() => {
    if (!groupRef.current) return

    // Interpolación suave de la posición
    groupRef.current.position.lerp(targetPosition.current, 0.1)
  })

  return (
    <group ref={groupRef}>
      {/* Cuerpo */}
      <Box args={[0.6, 1.6, 0.4]} position={[0, 0.8, 0]} castShadow>
        <meshStandardMaterial color="#e74c3c" />
      </Box>
      
      {/* Cabeza */}
      <Sphere args={[0.4, 16, 16]} position={[0, 1.8, 0]} castShadow>
        <meshStandardMaterial color="#fdbcb4" />
      </Sphere>
      
      {/* Nombre del jugador */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000"
      >
        {player.username}
      </Text>
    </group>
  )
}

export default OtherPlayer
