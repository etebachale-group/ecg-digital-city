import { useRef, useEffect } from 'react'
import { Box, Plane, Text, Sphere, Cylinder } from '@react-three/drei'
import Player from './Player'
import OtherPlayer from './OtherPlayer'
import OfficeObject3D from './OfficeObject3D'
import RealisticOffice from './RealisticOffice'
import { Plant, CeilingLight, Desk, Chair, Bookshelf } from './OfficeRoom'
import { useGameStore } from '../store/gameStore'
import { collisionSystem } from './CollisionSystem'

function District({ districtData, onPlayerRef }) {
  const players = useGameStore((state) => state.players)
  const currentDistrict = useGameStore((state) => state.player.district)
  const officeObjects = useGameStore((state) => state.officeObjects)
  const playerRef = useRef()

  useEffect(() => {
    if (playerRef.current && onPlayerRef) {
      onPlayerRef(playerRef.current)
    }
  }, [playerRef.current, onPlayerRef])
  
  // Setup collision boxes for buildings when district loads
  useEffect(() => {
    // Clear previous collision data
    collisionSystem.clear()
    
    // Add collision boxes based on district
    if (districtData.slug === 'central') {
      // ECG Headquarters
      collisionSystem.addWall({ x: 0, y: 0, z: 0 }, { width: 20, height: 8, depth: 15 })
      collisionSystem.addDoor('hq-door', { x: 0, y: 0, z: 7.5 }, { width: 4, height: 3, depth: 0.2 })
      
      // ECG Academy
      collisionSystem.addWall({ x: -15, y: 0, z: -10 }, { width: 12, height: 6, depth: 10 })
      collisionSystem.addDoor('academy-door', { x: -15, y: 0, z: -5 }, { width: 3, height: 2.5, depth: 0.2 })
      
      // Incubadora
      collisionSystem.addWall({ x: 15, y: 0, z: -10 }, { width: 12, height: 6, depth: 10 })
      collisionSystem.addDoor('incubadora-door', { x: 15, y: 0, z: -5 }, { width: 3, height: 2.5, depth: 0.2 })
    } else if (districtData.slug === 'empresarial') {
      // Edificio de ejemplo
      collisionSystem.addWall({ x: 0, y: 0, z: 0 }, { width: 25, height: 10, depth: 25 })
      collisionSystem.addDoor('office-demo-door', { x: 0, y: 0, z: 12.5 }, { width: 4, height: 3, depth: 0.2 })
    } else if (districtData.slug === 'cultural') {
      // Galería
      collisionSystem.addWall({ x: -30, y: 0, z: 0 }, { width: 20, height: 8, depth: 15 })
      collisionSystem.addDoor('gallery-door', { x: -30, y: 0, z: 7.5 }, { width: 3, height: 2.5, depth: 0.2 })
      
      // Teatro
      collisionSystem.addWall({ x: 30, y: 0, z: 0 }, { width: 25, height: 10, depth: 20 })
      collisionSystem.addDoor('theater-door', { x: 30, y: 0, z: 10 }, { width: 4, height: 3, depth: 0.2 })
      
      // Museo
      collisionSystem.addWall({ x: 0, y: 0, z: -30 }, { width: 30, height: 12, depth: 20 })
      collisionSystem.addDoor('museum-door', { x: 0, y: 0, z: -20 }, { width: 4, height: 3, depth: 0.2 })
    } else if (districtData.slug === 'social') {
      // Cafetería
      collisionSystem.addWall({ x: -40, y: 0, z: 0 }, { width: 15, height: 6, depth: 12 })
      collisionSystem.addDoor('cafe-door', { x: -40, y: 0, z: 6 }, { width: 3, height: 2.5, depth: 0.2 })
      
      // Coworking
      collisionSystem.addWall({ x: 40, y: 0, z: 0 }, { width: 20, height: 5, depth: 15 })
      collisionSystem.addDoor('coworking-door', { x: 40, y: 0, z: 7.5 }, { width: 4, height: 3, depth: 0.2 })
    }
    
    console.log(`✅ Collision boxes and doors loaded for ${districtData.slug}`)
  }, [districtData.slug])

  // Solo renderizar si estamos en este distrito
  if (currentDistrict !== districtData.slug) {
    return null
  }

  const renderDistrictContent = () => {
    switch (districtData.slug) {
      case 'central':
        return <CentralDistrict />
      case 'empresarial':
        return <BusinessDistrict />
      case 'cultural':
        return <CulturalDistrict />
      case 'social':
        return <SocialDistrict />
      case 'office': // Oficina realista
        return <RealisticOffice />
      default:
        return null
    }
  }

  // Default position and size if not provided
  const position = districtData.position || { x: 0, z: 0 }
  const size = districtData.size || { width: 100, depth: 100 }

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Suelo del distrito */}
      <Plane
        args={[size.width, size.depth]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#d0d0d0" />
      </Plane>

      {/* Contenido específico del distrito */}
      {renderDistrictContent()}

      {/* Objetos de oficina (si estamos en una oficina) */}
      {officeObjects.map((obj) => (
        <OfficeObject3D key={obj.id} object={obj} />
      ))}

      {/* Portales a otros distritos */}
      <Portals currentDistrict={districtData.slug} />

      {/* Jugador local */}
      <group ref={playerRef}>
        <Player />
      </group>

      {/* Otros jugadores en este distrito */}
      {Array.from(players.entries())
        .filter(([id, player]) => player.district === districtData.slug)
        .map(([id, player]) => (
          <OtherPlayer key={id} player={player} />
        ))}
    </group>
  )
}

// Distrito Central
function CentralDistrict() {
  return (
    <group>
      {/* ECG Headquarters */}
      <group position={[0, 0, 0]}>
        <Box args={[20, 8, 15]} position={[0, 4, 0]} castShadow>
          <meshStandardMaterial color="#2c3e50" roughness={0.7} metalness={0.2} />
        </Box>
        
        {/* Ventanas */}
        {[1, 3, 5, 7].map((y, i) => (
          <group key={i}>
            {[-6, -2, 2, 6].map((x, j) => (
              <Box key={j} args={[1.5, 1, 0.1]} position={[x, y, 7.6]} castShadow>
                <meshStandardMaterial 
                  color="#1e90ff" 
                  emissive="#1e90ff" 
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.7}
                />
              </Box>
            ))}
          </group>
        ))}
        
        {/* Entrada principal */}
        <Box args={[4, 3, 0.2]} position={[0, 1.5, 7.6]} castShadow>
          <meshStandardMaterial color="#34495e" metalness={0.5} />
        </Box>
        
        {/* Plantas en la entrada */}
        <Plant position={[-3, 0, 9]} />
        <Plant position={[3, 0, 9]} />
        
        <Text position={[0, 9, 7.6]} fontSize={1} color="#ecf0f1">
          ECG HEADQUARTERS
        </Text>
      </group>

      {/* Plaza central con fuente mejorada */}
      <group position={[0, 0, 20]}>
        {/* Base de la fuente */}
        <Cylinder args={[4, 4, 0.5, 32]} position={[0, 0.25, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#95a5a6" roughness={0.3} />
        </Cylinder>
        
        {/* Agua */}
        <Cylinder args={[3.8, 3.8, 0.3, 32]} position={[0, 0.55, 0]} castShadow>
          <meshStandardMaterial 
            color="#3498db" 
            transparent 
            opacity={0.7}
            roughness={0.1}
            metalness={0.3}
          />
        </Cylinder>
        
        {/* Columna central */}
        <Cylinder args={[0.5, 0.5, 3, 16]} position={[0, 2, 0]} castShadow>
          <meshStandardMaterial color="#7f8c8d" metalness={0.5} />
        </Cylinder>
        
        {/* Esfera superior */}
        <Sphere args={[0.8, 32, 32]} position={[0, 3.8, 0]} castShadow>
          <meshStandardMaterial 
            color="#3498db" 
            emissive="#3498db" 
            emissiveIntensity={0.3}
          />
        </Sphere>
        
        {/* Bancos alrededor */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 6
          const z = Math.sin(rad) * 6
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, rad + Math.PI / 2, 0]}>
              <Box args={[2, 0.1, 0.5]} position={[0, 0.5, 0]} castShadow>
                <meshStandardMaterial color="#8B4513" />
              </Box>
              <Box args={[2, 0.5, 0.1]} position={[0, 0.75, -0.2]} castShadow>
                <meshStandardMaterial color="#8B4513" />
              </Box>
            </group>
          )
        })}
        
        {/* Plantas decorativas */}
        {[45, 135, 225, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 7
          const z = Math.sin(rad) * 7
          return <Plant key={i} position={[x, 0, z]} />
        })}
      </group>

      {/* ECG Academy */}
      <group position={[-15, 0, -10]}>
        <Box args={[12, 6, 10]} position={[0, 3, 0]} castShadow>
          <meshStandardMaterial color="#16a085" roughness={0.7} />
        </Box>
        
        {/* Ventanas */}
        {[2, 4].map((y, i) => (
          <group key={i}>
            {[-4, 0, 4].map((x, j) => (
              <Box key={j} args={[1.5, 1, 0.1]} position={[x, y, 5.1]} castShadow>
                <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.2} />
              </Box>
            ))}
          </group>
        ))}
        
        {/* Plantas */}
        <Plant position={[-7, 0, 6]} />
        <Plant position={[7, 0, 6]} />
        
        <Text position={[0, 7, 5.1]} fontSize={0.8} color="#ecf0f1">
          ECG ACADEMY
        </Text>
      </group>

      {/* Incubadora */}
      <group position={[15, 0, -10]}>
        <Box args={[12, 6, 10]} position={[0, 3, 0]} castShadow>
          <meshStandardMaterial color="#e74c3c" roughness={0.7} />
        </Box>
        
        {/* Ventanas */}
        {[2, 4].map((y, i) => (
          <group key={i}>
            {[-4, 0, 4].map((x, j) => (
              <Box key={j} args={[1.5, 1, 0.1]} position={[x, y, 5.1]} castShadow>
                <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.2} />
              </Box>
            ))}
          </group>
        ))}
        
        {/* Plantas */}
        <Plant position={[-7, 0, 6]} />
        <Plant position={[7, 0, 6]} />
        
        <Text position={[0, 7, 5.1]} fontSize={0.8} color="#ecf0f1">
          INCUBADORA
        </Text>
      </group>
      
      {/* Farolas de iluminación */}
      {[-20, -10, 10, 20].map((x, i) => (
        <group key={i} position={[x, 0, 30]}>
          <Cylinder args={[0.15, 0.15, 5, 8]} position={[0, 2.5, 0]} castShadow>
            <meshStandardMaterial color="#2c2c2c" metalness={0.7} />
          </Cylinder>
          <Sphere args={[0.4, 16, 16]} position={[0, 5.2, 0]} castShadow>
            <meshStandardMaterial 
              color="#ffeb3b" 
              emissive="#ffeb3b" 
              emissiveIntensity={0.8}
            />
          </Sphere>
          <pointLight position={[0, 5, 0]} intensity={0.5} distance={15} color="#ffeb3b" />
        </group>
      ))}
    </group>
  )
}

// Distrito Empresarial
function BusinessDistrict() {
  return (
    <group>
      {/* Grid de espacios para oficinas */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => {
          const x = (col - 1.5) * 40
          const z = (row - 2) * 40
          return (
            <group key={`${row}-${col}`} position={[x, 0, z]}>
              {/* Lote disponible */}
              <Box args={[30, 0.2, 30]} position={[0, 0.1, 0]} castShadow>
                <meshStandardMaterial color="#34495e" opacity={0.5} transparent />
              </Box>
              {/* Letrero */}
              <Text position={[0, 2, 0]} fontSize={1} color="#7f8c8d">
                LOTE {row * 4 + col + 1}
              </Text>
            </group>
          )
        })
      )}

      {/* Edificio de ejemplo */}
      <group position={[0, 0, 0]}>
        <Box args={[25, 10, 25]} position={[0, 5, 0]} castShadow>
          <meshStandardMaterial color="#2980b9" />
        </Box>
        <Text position={[0, 11, 12.6]} fontSize={1.2} color="#ecf0f1">
          OFICINA DEMO
        </Text>
      </group>
    </group>
  )
}

// Distrito Cultural
function CulturalDistrict() {
  return (
    <group>
      {/* Galería de arte */}
      <group position={[-30, 0, 0]}>
        <Box args={[20, 8, 15]} position={[0, 4, 0]} castShadow>
          <meshStandardMaterial color="#8e44ad" />
        </Box>
        <Text position={[0, 9, 7.6]} fontSize={1} color="#ecf0f1">
          GALERÍA
        </Text>
      </group>

      {/* Teatro */}
      <group position={[30, 0, 0]}>
        <Box args={[25, 10, 20]} position={[0, 5, 0]} castShadow>
          <meshStandardMaterial color="#c0392b" />
        </Box>
        <Text position={[0, 11, 10.1]} fontSize={1} color="#ecf0f1">
          TEATRO
        </Text>
      </group>

      {/* Museo */}
      <group position={[0, 0, -30]}>
        <Box args={[30, 12, 20]} position={[0, 6, 0]} castShadow>
          <meshStandardMaterial color="#d35400" />
        </Box>
        <Text position={[0, 13, 10.1]} fontSize={1} color="#ecf0f1">
          MUSEO
        </Text>
      </group>

      {/* Esculturas decorativas */}
      {[-20, 0, 20].map((x, i) => (
        <Sphere key={i} args={[1.5, 32, 32]} position={[x, 1.5, 20]} castShadow>
          <meshStandardMaterial color="#f39c12" />
        </Sphere>
      ))}
    </group>
  )
}

// Plaza Social
function SocialDistrict() {
  return (
    <group>
      {/* Zona de networking */}
      <group position={[0, 0, 0]}>
        {/* Mesas circulares con sillas */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 20
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Mesa circular */}
              <Cylinder args={[1.5, 1.5, 0.1, 32]} position={[0, 0.75, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#8B4513" roughness={0.6} />
              </Cylinder>
              {/* Pata de mesa */}
              <Cylinder args={[0.15, 0.15, 0.7, 16]} position={[0, 0.4, 0]} castShadow>
                <meshStandardMaterial color="#654321" />
              </Cylinder>
              {/* Sillas alrededor */}
              {[0, 90, 180, 270].map((chairAngle, j) => {
                const rad = ((chairAngle + angle * 180 / Math.PI) * Math.PI) / 180
                const chairX = Math.cos(rad) * 2
                const chairZ = Math.sin(rad) * 2
                return (
                  <Chair key={j} position={[chairX, 0, chairZ]} rotation={[0, rad + Math.PI, 0]} />
                )
              })}
              {/* Planta decorativa */}
              <Plant position={[0, 0.8, 0]} />
            </group>
          )
        })}
        
        {/* Luz central */}
        <pointLight position={[0, 8, 0]} intensity={1.5} distance={40} color="#f39c12" castShadow />
      </group>

      {/* Cafetería */}
      <group position={[-40, 0, 0]}>
        <Box args={[15, 6, 12]} position={[0, 3, 0]} castShadow>
          <meshStandardMaterial color="#e67e22" />
        </Box>
        
        {/* Barra de café */}
        <Desk position={[-5, 0, 4]} color="#8B4513" hasComputer={false} />
        
        {/* Mesas pequeñas */}
        {[-3, 0, 3].map((x, i) => (
          <group key={i} position={[x, 0, -2]}>
            <Cylinder args={[0.8, 0.8, 0.05, 16]} position={[0, 0.75, 0]} castShadow>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            <Chair position={[0, 0, -1.2]} rotation={[0, 0, 0]} />
            <Chair position={[0, 0, 1.2]} rotation={[0, Math.PI, 0]} />
          </group>
        ))}
        
        {/* Plantas */}
        <Plant position={[-7, 0, -5]} />
        <Plant position={[7, 0, -5]} />
        
        <Text position={[0, 7, 6.1]} fontSize={1} color="#ecf0f1">
          CAFETERÍA
        </Text>
      </group>

      {/* Coworking */}
      <group position={[40, 0, 0]}>
        <Box args={[20, 5, 15]} position={[0, 2.5, 0]} castShadow>
          <meshStandardMaterial color="#3498db" />
        </Box>
        
        {/* Escritorios compartidos */}
        {[-6, -2, 2, 6].map((x, i) => (
          <group key={i}>
            <Desk position={[x, 0, -3]} color="#3498db" hasComputer={true} />
            <Chair position={[x, 0, -4.2]} rotation={[0, 0, 0]} />
            <Desk position={[x, 0, 3]} color="#3498db" hasComputer={true} />
            <Chair position={[x, 0, 4.2]} rotation={[0, Math.PI, 0]} />
          </group>
        ))}
        
        {/* Estanterías */}
        <Bookshelf position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Bookshelf position={[10, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        
        {/* Plantas */}
        <Plant position={[-8, 0, 6]} />
        <Plant position={[8, 0, 6]} />
        
        <Text position={[0, 6, 7.6]} fontSize={1} color="#ecf0f1">
          COWORKING
        </Text>
      </group>

      {/* Jardín con árboles */}
      <group position={[0, 0, -40]}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 30
          const z = (Math.random() - 0.5) * 20
          const height = 2 + Math.random() * 2
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Tronco */}
              <Cylinder args={[0.3, 0.4, height, 8]} position={[0, height / 2, 0]} castShadow>
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
              </Cylinder>
              {/* Copa del árbol */}
              <Sphere args={[1.2, 16, 16]} position={[0, height + 0.8, 0]} castShadow>
                <meshStandardMaterial color="#2ecc71" roughness={0.8} />
              </Sphere>
            </group>
          )
        })}
        
        {/* Bancos para sentarse */}
        {[-10, 0, 10].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <Box args={[2, 0.1, 0.5]} position={[0, 0.5, 0]} castShadow>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            <Box args={[2, 0.5, 0.1]} position={[0, 0.75, -0.2]} castShadow>
              <meshStandardMaterial color="#8B4513" />
            </Box>
          </group>
        ))}
      </group>
    </group>
  )
}

// Portales de teletransporte
function Portals({ currentDistrict }) {
  const portals = [
    { to: 'central', label: 'CENTRAL', color: '#3498db', position: [0, 0, 45] },
    { to: 'empresarial', label: 'EMPRESARIAL', color: '#2ecc71', position: [45, 0, 0] },
    { to: 'cultural', label: 'CULTURAL', color: '#9b59b6', position: [0, 0, -45] },
    { to: 'social', label: 'SOCIAL', color: '#e74c3c', position: [-45, 0, 0] }
  ].filter(p => p.to !== currentDistrict)

  return (
    <group>
      {portals.map((portal, i) => (
        <group key={portal.to} position={portal.position}>
          {/* Portal visual */}
          <Sphere args={[3, 32, 32]} position={[0, 3, 0]}>
            <meshStandardMaterial
              color={portal.color}
              emissive={portal.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </Sphere>
          
          {/* Plataforma */}
          <Box args={[6, 0.3, 6]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color={portal.color} />
          </Box>
          
          {/* Letrero */}
          <Text position={[0, 6, 0]} fontSize={0.8} color="#fff">
            {portal.label}
          </Text>
        </group>
      ))}
    </group>
  )
}

export default District
