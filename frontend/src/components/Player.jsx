import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Cylinder, Text } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { emitMove, emitStop } from '../services/socket'
import { collisionSystem } from './CollisionSystem'
import AvatarStateManager from '../systems/AvatarStateManager'
import PathfindingEngine from '../systems/PathfindingEngine'
import NavigationMesh from '../systems/NavigationMesh'
import * as THREE from 'three'

// Variable global para el modo de cámara (compartida con ThirdPersonCamera)
export let currentCameraMode = 'third-person'
export const setCameraMode = (mode) => {
  currentCameraMode = mode
}

function Player() {
  const playerRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const modelRef = useRef()
  
  // Avatar State Manager
  const avatarStateManager = useRef(null)
  const pathfindingEngine = useRef(null)
  const navigationMesh = useRef(null)
  
  const player = useGameStore((state) => state.player)
  const updatePlayerPosition = useGameStore((state) => state.updatePlayerPosition)
  const currentPath = useGameStore((state) => state.currentPath)
  const setCurrentPath = useGameStore((state) => state.setCurrentPath)
  const isFollowingPath = useGameStore((state) => state.isFollowingPath)
  const setIsFollowingPath = useGameStore((state) => state.setIsFollowingPath)
  
  const keysPressed = useRef({})
  const velocity = useRef({ x: 0, z: 0 })
  const isMoving = useRef(false)
  const currentRotation = useRef(0)
  const targetRotation = useRef(0)
  const walkCycle = useRef(0)
  const pathIndex = useRef(0)
  
  const [isRunning, setIsRunning] = useState(false)
  const [animationState, setAnimationState] = useState('idle')
  const [nearbyDoor, setNearbyDoor] = useState(null)
  const [isFirstPerson, setIsFirstPerson] = useState(false)
  
  // Initialize systems
  useEffect(() => {
    avatarStateManager.current = new AvatarStateManager()
    navigationMesh.current = new NavigationMesh({ min: -45, max: 45 }, 0.5)
    pathfindingEngine.current = new PathfindingEngine(navigationMesh.current)
    
    // Mark obstacles in navigation mesh from collision system
    const obstacles = collisionSystem.getObstacles()
    obstacles.forEach(obstacle => {
      navigationMesh.current.markObstacle(obstacle.position, obstacle.size)
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      keysPressed.current[key] = true
      
      if (key === 'shift') setIsRunning(true)
      
      // Cancel pathfinding when manual movement starts
      if (['w', 'a', 's', 'd'].includes(key) && isFollowingPath) {
        setCurrentPath(null)
        setIsFollowingPath(false)
        pathIndex.current = 0
      }
      
      // Interactuar con puertas
      if (key === 'e' && nearbyDoor) {
        collisionSystem.toggleDoor(nearbyDoor.id)
      }
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      keysPressed.current[key] = false
      if (key === 'shift') setIsRunning(false)
    }
    
    const handleClick = (e) => {
      // Handle click-to-move (pathfinding)
      if (e.button === 0 && pathfindingEngine.current && playerRef.current) {
        // Get click position in world space (simplified - would need proper raycasting)
        const clickPos = { x: e.clientX, z: e.clientY } // Placeholder
        const currentPos = { 
          x: playerRef.current.position.x, 
          z: playerRef.current.position.z 
        }
        
        // Calculate path
        const path = pathfindingEngine.current.findPath(currentPos, clickPos)
        if (path && path.length > 1) {
          setCurrentPath(path)
          setIsFollowingPath(true)
          pathIndex.current = 0
          
          // Transition to walking state
          if (avatarStateManager.current) {
            avatarStateManager.current.transition('walking').catch(console.error)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('click', handleClick)
    }
  }, [nearbyDoor, isFollowingPath, setCurrentPath, setIsFollowingPath])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    
    // Verificar modo de cámara para ocultar/mostrar modelo
    setIsFirstPerson(currentCameraMode === 'first-person')
    
    const currentState = avatarStateManager.current?.currentState || 'idle'
    const isSitting = currentState === 'sitting'
    const isDancing = currentState === 'dancing'
    const isInteracting = currentState === 'interacting'

    const baseSpeed = 5
    const runMultiplier = isRunning ? 2 : 1
    const speed = baseSpeed * runMultiplier
    
    let moveX = 0
    let moveZ = 0
    
    // Handle pathfinding movement
    if (isFollowingPath && currentPath && currentPath.length > 0) {
      const targetWaypoint = currentPath[pathIndex.current]
      if (targetWaypoint) {
        const dx = targetWaypoint.x - playerRef.current.position.x
        const dz = targetWaypoint.z - playerRef.current.position.z
        const distance = Math.sqrt(dx * dx + dz * dz)
        
        if (distance < 0.2) {
          // Reached waypoint, move to next
          pathIndex.current++
          if (pathIndex.current >= currentPath.length) {
            // Path complete
            setCurrentPath(null)
            setIsFollowingPath(false)
            pathIndex.current = 0
            if (avatarStateManager.current) {
              avatarStateManager.current.transition('idle').catch(console.error)
            }
          }
        } else {
          // Move towards waypoint
          moveX = dx / distance
          moveZ = dz / distance
        }
      }
    } else if (!isSitting && !isDancing && !isInteracting) {
      // Handle WASD movement
      if (keysPressed.current['w']) moveZ -= 1
      if (keysPressed.current['s']) moveZ += 1
      if (keysPressed.current['a']) moveX -= 1
      if (keysPressed.current['d']) moveX += 1

      if (moveX !== 0 && moveZ !== 0) {
        moveX *= 0.707
        moveZ *= 0.707
      }
    }

    velocity.current.x = moveX * speed * delta
    velocity.current.z = moveZ * speed * delta

    const newPosition = {
      x: playerRef.current.position.x + velocity.current.x,
      y: isSitting ? 0.5 : 1,
      z: playerRef.current.position.z + velocity.current.z
    }

    // Verificar colisiones antes de mover
    const hasCollision = collisionSystem.checkCollision(newPosition, 0.5)
    
    if (!hasCollision) {
      newPosition.x = Math.max(-45, Math.min(45, newPosition.x))
      newPosition.z = Math.max(-45, Math.min(45, newPosition.z))
      playerRef.current.position.set(newPosition.x, newPosition.y, newPosition.z)
    } else {
      // Si hay colisión, intentar deslizarse por la pared
      const slideX = {
        x: playerRef.current.position.x + velocity.current.x,
        y: newPosition.y,
        z: playerRef.current.position.z
      }
      const slideZ = {
        x: playerRef.current.position.x,
        y: newPosition.y,
        z: playerRef.current.position.z + velocity.current.z
      }
      
      if (!collisionSystem.checkCollision(slideX, 0.5)) {
        playerRef.current.position.set(slideX.x, slideX.y, slideX.z)
        newPosition.x = slideX.x
        newPosition.z = slideX.z
      } else if (!collisionSystem.checkCollision(slideZ, 0.5)) {
        playerRef.current.position.set(slideZ.x, slideZ.y, slideZ.z)
        newPosition.x = slideZ.x
        newPosition.z = slideZ.z
      }
      
      // If collision during pathfinding, recalculate path
      if (isFollowingPath && pathfindingEngine.current) {
        const targetWaypoint = currentPath[currentPath.length - 1]
        const currentPos = { x: playerRef.current.position.x, z: playerRef.current.position.z }
        const newPath = pathfindingEngine.current.findPath(currentPos, targetWaypoint)
        if (newPath && newPath.length > 1) {
          setCurrentPath(newPath)
          pathIndex.current = 0
        } else {
          setCurrentPath(null)
          setIsFollowingPath(false)
          pathIndex.current = 0
        }
      }
    }
    
    // Verificar puertas cercanas
    const playerPos = new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z)
    const door = collisionSystem.getNearbyDoor(playerPos, 2)
    setNearbyDoor(door)

    // Animaciones según el estado
    if (moveX !== 0 || moveZ !== 0) {
      targetRotation.current = Math.atan2(moveX, moveZ)
      
      let rotationDiff = targetRotation.current - currentRotation.current
      while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
      while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
      
      currentRotation.current += rotationDiff * 0.15
      playerRef.current.rotation.y = currentRotation.current
      
      // Ciclo de caminata
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
      
      // Update state
      const targetState = isRunning ? 'running' : 'walking'
      if (avatarStateManager.current && avatarStateManager.current.currentState !== targetState) {
        avatarStateManager.current.transition(targetState).catch(console.error)
      }
      setAnimationState(targetState)
      
      if (!isMoving.current) {
        isMoving.current = true
      }
      
      emitMove(newPosition, currentRotation.current)
      updatePlayerPosition(newPosition, currentRotation.current)
    } else {
      if (isMoving.current) {
        isMoving.current = false
        const targetState = isSitting ? 'sitting' : isDancing ? 'dancing' : isInteracting ? 'interacting' : 'idle'
        if (avatarStateManager.current && avatarStateManager.current.currentState !== targetState) {
          avatarStateManager.current.transition(targetState).catch(console.error)
        }
        setAnimationState(targetState)
        emitStop(newPosition)
      }
      
      // Animación idle (respiración)
      if (headRef.current && !isSitting && !isDancing) {
        headRef.current.position.y = 1.8 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      }
      
      // Animación de baile
      if (isDancing && headRef.current && leftArmRef.current && rightArmRef.current) {
        const danceTime = state.clock.elapsedTime * 3
        headRef.current.rotation.z = Math.sin(danceTime) * 0.2
        leftArmRef.current.rotation.z = Math.sin(danceTime) * 0.5
        rightArmRef.current.rotation.z = -Math.sin(danceTime) * 0.5
        leftArmRef.current.rotation.x = Math.cos(danceTime * 1.5) * 0.3
        rightArmRef.current.rotation.x = Math.cos(danceTime * 1.5 + Math.PI) * 0.3
      }
    }
  })

  const currentState = avatarStateManager.current?.currentState || 'idle'
  const isSitting = currentState === 'sitting'
  const isDancing = currentState === 'dancing'
  const isInteracting = currentState === 'interacting'
  
  return (
    <group ref={playerRef} position={[player.position.x, player.position.y, player.position.z]}>
      {/* Modelo del jugador - oculto en primera persona */}
      <group ref={modelRef} visible={!isFirstPerson}>
        {/* Torso */}
      <Box 
        args={[0.7, 0.9, 0.4]} 
        position={[0, isSitting ? 0.6 : 0.9, 0]} 
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color="#2c3e50" 
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
            color="#34495e" 
            roughness={0.9}
          />
        </Sphere>
      </group>
      
      {/* Brazo izquierdo */}
      <group ref={leftArmRef} position={[-0.45, isSitting ? 0.8 : 0.9, 0]}>
        <Cylinder args={[0.12, 0.1, 0.7, 16]} rotation={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#2c3e50" roughness={0.7} />
        </Cylinder>
        {/* Mano */}
        <Sphere args={[0.12, 16, 16]} position={[0, -0.4, 0]} castShadow>
          <meshStandardMaterial color="#fdbcb4" roughness={0.8} />
        </Sphere>
      </group>
      
      {/* Brazo derecho */}
      <group ref={rightArmRef} position={[0.45, isSitting ? 0.8 : 0.9, 0]}>
        <Cylinder args={[0.12, 0.1, 0.7, 16]} rotation={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#2c3e50" roughness={0.7} />
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
              <meshStandardMaterial color="#34495e" roughness={0.7} />
            </Cylinder>
            {/* Pie */}
            <Box args={[0.15, 0.1, 0.25]} position={[0, -0.45, 0.05]} castShadow>
              <meshStandardMaterial color="#2c3e50" roughness={0.8} />
            </Box>
          </group>
          
          {/* Pierna derecha */}
          <group ref={rightLegRef} position={[0.18, 0.4, 0]}>
            <Cylinder args={[0.14, 0.12, 0.8, 16]} castShadow>
              <meshStandardMaterial color="#34495e" roughness={0.7} />
            </Cylinder>
            {/* Pie */}
            <Box args={[0.15, 0.1, 0.25]} position={[0, -0.45, 0.05]} castShadow>
              <meshStandardMaterial color="#2c3e50" roughness={0.8} />
            </Box>
          </group>
        </>
      )}
      
      {/* Indicador de estado */}
      {isRunning && (
        <Sphere args={[0.12, 16, 16]} position={[0, 2.6, 0]}>
          <meshStandardMaterial 
            color="#f39c12" 
            emissive="#f39c12" 
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
        {player.username || 'Tú'} {isRunning && '🏃'} {isSitting && '💺'} {isDancing && '💃'} {isInteracting && '🤝'}
      </Text>
      </group>
      
      {/* Prompt de interacción con puerta - siempre visible */}
      {nearbyDoor && (
        <Text
          position={[0, isSitting ? 2.6 : 3.2, 0]}
          fontSize={0.2}
          color="#f39c12"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          [E] {nearbyDoor.isOpen ? 'Cerrar' : 'Abrir'} Puerta
        </Text>
      )}
    </group>
  )
}

export default Player
