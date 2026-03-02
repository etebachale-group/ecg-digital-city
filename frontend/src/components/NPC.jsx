import { useRef, useState } from 'react'
import { Box, Sphere, Text, Circle } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

function NPC({ name, position, info, color = "#e74c3c" }) {
  const groupRef = useRef()
  const [isNear, setIsNear] = useState(false)
  const player = useGameStore((state) => state.player)
  const selectNPC = useGameStore((state) => state.selectNPC)

  useFrame(() => {
    if (!groupRef.current) return

    // Calcular distancia al jugador
    const dx = player.position.x - position[0]
    const dz = player.position.z - position[2]
    const distance = Math.sqrt(dx * dx + dz * dz)

    setIsNear(distance < 2)
  })

  const handleInteract = () => {
    if (isNear) {
      selectNPC({ name, info })
    }
  }

  return (
    <group ref={groupRef} position={position} onClick={handleInteract}>
      {/* Círculo de interacción */}
      {isNear && (
        <Circle args={[1, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0,