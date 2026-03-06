import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Cylinder, Text } from '@react-three/drei'
import * as THREE from 'three'

function OtherPlayer({ player }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const walkCycle = useRef(0)
  
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
  
  const state = player.state || 'idle'
  const isSitting = state === 'sitting'
  const isDancing = state === 'dancing'
  const isInteracting = state === 'interacting'
  const isWalking = state === 'walking'
  const isRunning = state === 'running'

  useFrame((frameState, delta) => {
    if (!groupRef.current) return

    // Interpolación suave de la posición
    groupRef.current.position.lerp(targetPosition.current, 0.1)
    
    // Animaciones según el estado
    if (isWalking || isRunning) {
      walkCycle.current += delta * (isRunning ? 12 : 8)
      
      // Animación de brazos
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(walkCycle.current) * 0.5
        rightArmRef.current.rotation.x = Math.sin(walkCycle.current + Math.PI) * 0.5
      }
      
      // Animación de piernas
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle.current) * 0.6
        rightLegRef.current.rotation.x = Math.sin(walkCycle.current + Math.PI) * 0.6
      }
      
      // Animación de cabeza (balanceo)
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(walkCycle.current * 2) * 0.05
        headRef.current.position.y = 1.8 + Math.abs(Math.sin(walkCycle.current * 2)) * 0.05
      }
    } else if (isDancing) {
      // Animación de baile
      const danceTime = frameState.clock.elapsedTime * 3
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(danceTime) * 0.2
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(danceTime) * 0.5
        rightArmRef.current.rotation.z = -Math.sin(danceTime) * 0.5
        leftArmRef.current.rotation.x = Math.cos(danceTime * 1.5) * 0.3
        rightArmRef.current.rotation.x = Math.cos(danceTime * 1.5 + Math.PI) * 0.3
      }
    } else if (state === 'idle' && !isSitting) {
      // Animación idle (respiración)
      if (headRef.current) {
        headRef.current.position.y = 1.8 + Math.sin(frameState.clock.elapsedTime * 2) * 0.02
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Torso */}
      <Box 
        args={[0.7, 0.9, 0.4]} 
        position={[0, isSitting ? 0.6 : 0.9, 0]} 
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color="#e74c3c" 
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
      
      {/* Cabeza */}
      <group ref={headRef} position={[0, isSitting ? 1.4 : 1.8, 0]}>
        <Sphere args={[0.35, 32, 32]} castShadow receiveShadow>
          <meshStandardMaterial 
            color="#fdbcb4" 
            roughness={0.8}
            metalness={0.0}
          />
        </Sphere>
        
        {/* Ojos */}
        <Sphere args={[0.08, 16, 16]} position={[-0.12, 0.08, 0.3]}>
          <meshStandardMaterial color="#2c3e50" />
        </Sphere>
        <Sphere args={[0.08, 16, 16]} position={[0.12, 0.08, 0.3]}>
          <meshStandardMaterial color="#2c3e50" />
        </Sphere>
        
        {/* Cabello */}
        <Sphere args={[0.38, 32, 32]} position={[0, 0.15, 0]} castShadow>
          <meshStandardMaterial 
            color="#8e44ad" 
            roughness={0.9}
          />
        </Sphere>
      </group>
      
      {/* Brazo izquierdo */}
      <group ref={leftArmRef} position={[-0.45, isSitting ? 0.8 : 0.9, 0]}>
        <Cylinder args={[0.12, 0.1, 0.7, 16]} rotation={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#e74c3c" roughness={0.7} />
        </Cylinder>
        {/* Mano */}
        <Sphere args={[0.12, 16, 16]} position={[0, -0.4, 0]} castShadow>
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </Sphere>
      </group>
      
      {/* Brazo derecho */}
      <group ref={rightArmRef} position={[0.45, isSitting ? 0.8 : 0.9, 0]}>
        <Cylinder args={[0.12, 0.1, 0.7, 16]} rotation={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#e74c3c" roughness={0.7} />
        </Cylinder>
        {/* Mano */}
        <Sphere args={[0.12, 16, 16]} position={[0, -0.4, 0]} castShadow>
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </Sphere>
      </group>
      
      {!isSitting && (
        <>
          {/* Pierna izquierda */}
          <group ref={leftLegRef} position={[-0.18, 0.4, 0]}>
            <Cylinder args={[0.14, 0.12, 0.8, 16]} castShadow>
              <meshStandardMaterial color="#c0392b" roughness={0.7} />
            </Cylinder>
            {/* Pie */}
            <Box args={[0.15, 0.1, 0.25]} position={[0, -0.45, 0.05]} castShadow>
              <meshStandardMaterial color="#2c3e50" roughness={0.8} />
            </Box>
          </group>
          
          {/* Pierna derecha */}
          <group ref={rightLegRef} position={[0.18, 0.4, 0]}>
            <Cylinder args={[0.14, 0.12, 0.8, 16]} castShadow>
              <meshStandardMaterial color="#c0392b" roughness={0.7} />
            </Cylinder>
            {/* Pie */}
            <Box args={[0.15, 0.1, 0.25]} position={[0, -0.45, 0.05]} castShadow>
              <meshStandardMaterial color="#2c3e50" roughness={0.8} />
            </Box>
          </group>
        </>
      )}
      
      {/* Indicadores de estado */}
      {isRunning && (
        <Sphere args={[0.12, 16, 16]} position={[0, 2.6, 0]}>
          <meshStandardMaterial 
            color="#f39c12" 
            emissive="#f39c12" 
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
      
      {isInteracting && (
        <Sphere args={[0.12, 16, 16]} position={[0, 2.6, 0]}>
          <meshStandardMaterial 
            color="#3498db" 
            emissive="#3498db" 
            emissiveIntensity={0.8}
          />
        </Sphere>
      )}
      
      {/* Sombra circular */}
      <Cylinder args={[0.4, 0.4, 0.01, 32]} position={[0, 0.01, 0]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </Cylinder>
      
      {/* Nombre del jugador */}
      <Text
        position={[0, isSitting ? 2.2 : 2.8, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {player.username} {isRunning && '🏃'} {isSitting && '💺'} {isDancing && '💃'} {isInteracting && '🤝'}
      </Text>
    </group>
  )
}

export default OtherPlayer
