import { useEffect } from 'react'
import { Box, Plane } from '@react-three/drei'
import Player from './Player'
import OtherPlayer from './OtherPlayer'
import InteractiveDoor from './InteractiveDoor'
import { 
  Desk, Chair, Bookshelf, Plant, CeilingLight, Whiteboard, MeetingTable,
  CoffeeMachine, Printer, WaterCooler, WallPicture, Carpet, WallClock, Window, FileCabinet
} from './OfficeRoom'
import { useGameStore } from '../store/gameStore'
import { collisionSystem } from './CollisionSystem'
import { initSocket, disconnectSocket } from '../services/socket'

function RealisticOffice() {
  const players = useGameStore((state) => state.players)

  useEffect(() => {
    // Inicializar Socket.IO
    const socket = initSocket()

    // Configurar colisiones
    setupCollisions()

    return () => {
      disconnectSocket()
      collisionSystem.clear()
    }
  }, [])

  const setupCollisions = () => {
    collisionSystem.clear()

    // Paredes exteriores
    collisionSystem.addWall({ x: 0, y: 0, z: -30 }, { width: 60, height: 4, depth: 0.5 }) // Norte
    collisionSystem.addWall({ x: 0, y: 0, z: 30 }, { width: 60, height: 4, depth: 0.5 })  // Sur
    collisionSystem.addWall({ x: -30, y: 0, z: 0 }, { width: 0.5, height: 4, depth: 60 }) // Oeste
    collisionSystem.addWall({ x: 30, y: 0, z: 0 }, { width: 0.5, height: 4, depth: 60 })  // Este

    // Paredes interiores
    // Pasillo central vertical
    collisionSystem.addWall({ x: -10, y: 0, z: 0 }, { width: 0.3, height: 4, depth: 40 })
    collisionSystem.addWall({ x: 10, y: 0, z: 0 }, { width: 0.3, height: 4, depth: 40 })

    // Puertas
    collisionSystem.addDoor('door-reception', { x: -10, y: 0, z: 15 }, { width: 1.2, height: 2.5, depth: 0.1 })
    collisionSystem.addDoor('door-ceo', { x: -10, y: 0, z: -15 }, { width: 1.2, height: 2.5, depth: 0.1 })
    collisionSystem.addDoor('door-meeting', { x: 10, y: 0, z: -15 }, { width: 1.2, height: 2.5, depth: 0.1 })
    collisionSystem.addDoor('door-dev', { x: 10, y: 0, z: 5 }, { width: 1.2, height: 2.5, depth: 0.1 })
    collisionSystem.addDoor('door-break', { x: 10, y: 0, z: 15 }, { width: 1.2, height: 2.5, depth: 0.1 })

    // Objetos con colisión (escritorios, muebles)
    // Recepción
    collisionSystem.addObject({ x: -20, y: 0, z: 20 }, 1)
    
    // CEO
    collisionSystem.addObject({ x: -20, y: 0, z: -20 }, 1)
    
    // Desarrollo
    for (let i = 0; i < 3; i++) {
      collisionSystem.addObject({ x: 20, y: 0, z: 5 + i * 3 }, 0.8)
    }
  }

  const handleDoorInteract = (doorId, isOpen) => {
    console.log(`Puerta ${doorId} ${isOpen ? 'abierta' : 'cerrada'}`)
  }

  return (
    <group>
      {/* Suelo principal */}
      <Plane
        args={[60, 60]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#d0d0d0" roughness={0.8} />
      </Plane>

      {/* Paredes exteriores */}
      <Box args={[60, 4, 0.5]} position={[0, 2, -30]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      <Box args={[60, 4, 0.5]} position={[0, 2, 30]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      <Box args={[0.5, 4, 60]} position={[-30, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      <Box args={[0.5, 4, 60]} position={[30, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>

      {/* Techo */}
      <Plane
        args={[60, 60]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </Plane>

      {/* Pasillo central */}
      <Carpet position={[0, 10]} size={[20, 50]} color="#c0392b" />
      
      {/* Paredes del pasillo */}
      <Box args={[0.3, 4, 40]} position={[-10, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#bdc3c7" roughness={0.8} />
      </Box>
      <Box args={[0.3, 4, 40]} position={[10, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#bdc3c7" roughness={0.8} />
      </Box>

      {/* RECEPCIÓN */}
      <group position={[-20, 0, 20]}>
        <Desk position={[0, 0, 0]} color="#8B4513" hasComputer={true} />
        <Chair position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
        <Plant position={[-3, 0, 0]} />
        <Plant position={[3, 0, 0]} />
        <WallPicture position={[0, 2, -5]} rotation={[0, 0, 0]} imageColor="#3498db" />
        <WallClock position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <CeilingLight position={[0, 0, 0]} />
        <FileCabinet position={[-5, 0, -3]} />
      </group>

      {/* Puerta Recepción */}
      <InteractiveDoor
        id="door-reception"
        position={[-10, 0, 15]}
        rotation={[0, Math.PI / 2, 0]}
        onInteract={handleDoorInteract}
      />

      {/* OFICINA CEO */}
      <group position={[-20, 0, -20]}>
        <Desk position={[0, 0, 0]} color="#9b59b6" hasComputer={true} />
        <Chair position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
        <MeetingTable position={[0, 0, 5]} />
        <Bookshelf position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Bookshelf position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Plant position={[-5, 0, -5]} />
        <Plant position={[5, 0, -5]} />
        <WallPicture position={[0, 2, -8]} rotation={[0, 0, 0]} imageColor="#9b59b6" />
        <Window position={[-8, 2, -8]} rotation={[0, Math.PI / 2, 0]} />
        <CeilingLight position={[0, 0, 0]} />
        <FileCabinet position={[7, 0, -5]} />
        <Carpet position={[0, 0]} size={[15, 15]} color="#8e44ad" />
      </group>

      {/* Puerta CEO */}
      <InteractiveDoor
        id="door-ceo"
        position={[-10, 0, -15]}
        rotation={[0, Math.PI / 2, 0]}
        color="#9b59b6"
        onInteract={handleDoorInteract}
      />

      {/* SALA DE REUNIONES */}
      <group position={[20, 0, -20]}>
        <MeetingTable position={[0, 0, 0]} />
        <Whiteboard position={[0, 0, -8]} rotation={[0, 0, 0]} />
        <Plant position={[-8, 0, -7]} />
        <Plant position={[8, 0, -7]} />
        <WallPicture position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]} imageColor="#e74c3c" />
        <WallPicture position={[8, 2, 0]} rotation={[0, -Math.PI / 2, 0]} imageColor="#e74c3c" />
        <CeilingLight position={[-3, 0, 0]} />
        <CeilingLight position={[3, 0, 0]} />
        <WallClock position={[0, 2.5, -7.8]} rotation={[0, 0, 0]} />
        <Carpet position={[0, 0]} size={[16, 16]} color="#34495e" />
      </group>

      {/* Puerta Sala de Reuniones */}
      <InteractiveDoor
        id="door-meeting"
        position={[10, 0, -15]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#e74c3c"
        onInteract={handleDoorInteract}
      />

      {/* ÁREA DE DESARROLLO */}
      <group position={[20, 0, 10]}>
        {[0, 3, 6].map((z, i) => (
          <group key={i} position={[0, 0, z]}>
            <Desk position={[0, 0, 0]} color="#3498db" hasComputer={true} />
            <Chair position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
          </group>
        ))}
        <Bookshelf position={[-8, 0, 3]} rotation={[0, Math.PI / 2, 0]} />
        <Plant position={[-5, 0, 8]} />
        <Plant position={[5, 0, 8]} />
        <Whiteboard position={[0, 0, -5]} rotation={[0, 0, 0]} />
        <Printer position={[7, 0.8, 8]} />
        <WallPicture position={[8, 2, 3]} rotation={[0, -Math.PI / 2, 0]} imageColor="#3498db" />
        <CeilingLight position={[0, 0, 3]} />
        <FileCabinet position={[-7, 0, 8]} />
        <Carpet position={[0, 3]} size={[16, 14]} color="#2980b9" />
      </group>

      {/* Puerta Desarrollo */}
      <InteractiveDoor
        id="door-dev"
        position={[10, 0, 5]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#3498db"
        onInteract={handleDoorInteract}
      />

      {/* ÁREA DE DESCANSO */}
      <group position={[20, 0, 23]}>
        {/* Mesa central */}
        <Box args={[2, 0.05, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </Box>
        <Chair position={[-1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Chair position={[1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Chair position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
        <Chair position={[0, 0, 1.5]} rotation={[0, Math.PI, 0]} />
        
        <CoffeeMachine position={[-7, 0.8, -5]} />
        <WaterCooler position={[7, 0, -5]} />
        <Plant position={[-5, 0, 5]} />
        <Plant position={[5, 0, 5]} />
        <WallPicture position={[0, 2, -7]} rotation={[0, 0, 0]} imageColor="#f39c12" />
        <WallClock position={[-8, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />
        <CeilingLight position={[0, 0, 0]} />
        <Carpet position={[0, 0]} size={[16, 12]} color="#e67e22" />
      </group>

      {/* Puerta Área de Descanso */}
      <InteractiveDoor
        id="door-break"
        position={[10, 0, 15]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#f39c12"
        onInteract={handleDoorInteract}
      />

      {/* Iluminación ambiental del pasillo */}
      <CeilingLight position={[0, 0, -20]} />
      <CeilingLight position={[0, 0, -10]} />
      <CeilingLight position={[0, 0, 0]} />
      <CeilingLight position={[0, 0, 10]} />
      <CeilingLight position={[0, 0, 20]} />

      {/* Cuadros decorativos en el pasillo */}
      <WallPicture position={[-10, 2, -25]} rotation={[0, Math.PI / 2, 0]} imageColor="#e74c3c" />
      <WallPicture position={[10, 2, -25]} rotation={[0, -Math.PI / 2, 0]} imageColor="#3498db" />
      <WallPicture position={[-10, 2, 25]} rotation={[0, Math.PI / 2, 0]} imageColor="#2ecc71" />
      <WallPicture position={[10, 2, 25]} rotation={[0, -Math.PI / 2, 0]} imageColor="#f39c12" />

      {/* Plantas en el pasillo */}
      <Plant position={[-9, 0, -18]} />
      <Plant position={[9, 0, -18]} />
      <Plant position={[-9, 0, 18]} />
      <Plant position={[9, 0, 18]} />

      {/* Jugador local */}
      <Player />

      {/* Otros jugadores */}
      {Array.from(players.entries()).map(([id, player]) => (
        <OtherPlayer key={id} player={player} />
      ))}
    </group>
  )
}

export default RealisticOffice
