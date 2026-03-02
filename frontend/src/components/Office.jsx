import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Plane, Text } from '@react-three/drei'
import Player from './Player'
import OtherPlayer from './OtherPlayer'
import { Desk, Chair, Bookshelf, Plant, CeilingLight, Whiteboard, MeetingTable } from './OfficeRoom'
import { useGameStore } from '../store/gameStore'
import { initSocket, disconnectSocket } from '../services/socket'

function Office() {
  const players = useGameStore((state) => state.players)

  useEffect(() => {
    // Inicializar Socket.IO al montar
    const socket = initSocket()

    return () => {
      // Desconectar al desmontar
      disconnectSocket()
    }
  }, [])

  return (
    <group>
      {/* Suelo */}
      <Plane
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#e0e0e0" />
      </Plane>

      {/* Recepción */}
      <group position={[-10, 0, 5]}>
        {/* Mostrador */}
        <Desk position={[0, 0, 0]} color="#8B4513" hasComputer={true} />
        <Chair position={[0, 0, -1.2]} rotation={[0, 0, 0]} />
        
        {/* Plantas decorativas */}
        <Plant position={[-2, 0, 0]} />
        <Plant position={[2, 0, 0]} />
        
        {/* Letrero */}
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.5}
          color="#2c3e50"
          anchorX="center"
        >
          RECEPCIÓN
        </Text>
        
        {/* Luz */}
        <CeilingLight position={[0, 0, 0]} />
      </group>

      {/* Área de Desarrollo */}
      <group position={[10, 0, 5]}>
        {/* Escritorios con computadoras */}
        {[0, 3, 6].map((x, i) => (
          <group key={i}>
            <Desk position={[x, 0, 0]} color="#3498db" hasComputer={true} />
            <Chair position={[x, 0, -1.2]} rotation={[0, 0, 0]} />
          </group>
        ))}
        
        {/* Estantería con libros técnicos */}
        <Bookshelf position={[9, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
        
        {/* Plantas */}
        <Plant position={[-1, 0, 2]} />
        
        {/* Luces */}
        <CeilingLight position={[3, 0, 0]} />
        
        <Text
          position={[3, 2.5, 0]}
          fontSize={0.5}
          color="#2c3e50"
          anchorX="center"
        >
          DESARROLLO
        </Text>
      </group>

      {/* Área de Marketing */}
      <group position={[10, 0, -10]}>
        {/* Escritorios */}
        {[0, 3, 6].map((x, i) => (
          <group key={i}>
            <Desk position={[x, 0, 0]} color="#e67e22" hasComputer={true} />
            <Chair position={[x, 0, -1.2]} rotation={[0, 0, 0]} />
          </group>
        ))}
        
        {/* Pizarra para brainstorming */}
        <Whiteboard position={[3, 0, -2.5]} rotation={[0, 0, 0]} />
        
        {/* Plantas */}
        <Plant position={[-1, 0, 2]} />
        <Plant position={[7, 0, 2]} />
        
        {/* Luces */}
        <CeilingLight position={[3, 0, 0]} />
        
        <Text
          position={[3, 2.5, 0]}
          fontSize={0.5}
          color="#2c3e50"
          anchorX="center"
        >
          MARKETING
        </Text>
      </group>

      {/* Sala de Reuniones */}
      <group position={[-10, 0, -25]}>
        {/* Mesa de reuniones grande */}
        <MeetingTable position={[0, 0, 0]} />
        
        {/* Pizarra */}
        <Whiteboard position={[0, 0, -3.5]} rotation={[0, 0, 0]} />
        
        {/* Plantas en las esquinas */}
        <Plant position={[-4, 0, -3]} />
        <Plant position={[4, 0, -3]} />
        
        {/* Luces */}
        <CeilingLight position={[-2, 0, 0]} />
        <CeilingLight position={[2, 0, 0]} />
        
        <Text
          position={[0, 2.8, -3.4]}
          fontSize={0.4}
          color="#2c3e50"
          anchorX="center"
        >
          SALA DE REUNIONES
        </Text>
      </group>

      {/* Área de Descanso / Coffee Break */}
      <group position={[10, 0, -25]}>
        {/* Mesa pequeña */}
        <Box args={[1.5, 0.05, 1.5]} position={[0, 0.75, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </Box>
        
        {/* Sillas alrededor */}
        <Chair position={[-1, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Chair position={[1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Chair position={[0, 0, -1]} rotation={[0, 0, 0]} />
        <Chair position={[0, 0, 1]} rotation={[0, Math.PI, 0]} />
        
        {/* Plantas */}
        <Plant position={[-2, 0, -2]} />
        <Plant position={[2, 0, -2]} />
        
        {/* Luz */}
        <CeilingLight position={[0, 0, 0]} />
        
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.4}
          color="#2c3e50"
          anchorX="center"
        >
          ÁREA DE DESCANSO
        </Text>
      </group>

      {/* Oficina del CEO */}
      <group position={[-10, 0, -10]}>
        {/* Escritorio ejecutivo */}
        <Desk position={[0, 0, 0]} color="#9b59b6" hasComputer={true} />
        <Chair position={[0, 0, -1.2]} rotation={[0, 0, 0]} />
        
        {/* Mesa de reuniones pequeña */}
        <MeetingTable position={[-2, 0, -3]} />
        
        {/* Estanterías */}
        <Bookshelf position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Bookshelf position={[3, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />
        
        {/* Plantas de lujo */}
        <Plant position={[-3, 0, -1]} />
        <Plant position={[3, 0, -1]} />
        
        {/* Luz */}
        <CeilingLight position={[0, 0, 0]} />
        
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.5}
          color="#2c3e50"
          anchorX="center"
        >
          CEO
        </Text>
      </group>

      {/* Paredes temporales para delimitar áreas */}
      <Box args={[0.2, 3, 50]} position={[-20, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#ccc" />
      </Box>
      <Box args={[0.2, 3, 50]} position={[20, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#ccc" />
      </Box>
      <Box args={[50, 3, 0.2]} position={[0, 1.5, -20]} castShadow>
        <meshStandardMaterial color="#ccc" />
      </Box>
      <Box args={[50, 3, 0.2]} position={[0, 1.5, 20]} castShadow>
        <meshStandardMaterial color="#ccc" />
      </Box>

      {/* Jugador local */}
      <Player />

      {/* Otros jugadores */}
      {Array.from(players.entries()).map(([id, player]) => (
        <OtherPlayer key={id} player={player} />
      ))}
    </group>
  )
}

export default Office
