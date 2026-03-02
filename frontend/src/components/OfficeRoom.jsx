import { Box, Cylinder, Sphere, Text } from '@react-three/drei'
import { useState } from 'react'

// Componente de Escritorio
function Desk({ position, color = "#8B4513", hasComputer = true }) {
  return (
    <group position={position}>
      {/* Mesa */}
      <Box args={[1.6, 0.05, 0.8]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </Box>
      
      {/* Patas */}
      {[[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].map((pos, i) => (
        <Cylinder key={i} args={[0.04, 0.04, 0.7, 8]} position={[pos[0], 0.4, pos[1]]} castShadow>
          <meshStandardMaterial color={color} />
        </Cylinder>
      ))}
      
      {hasComputer && (
        <>
          {/* Monitor */}
          <Box args={[0.5, 0.4, 0.05]} position={[0, 1.05, 0]} castShadow>
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
          </Box>
          {/* Pantalla */}
          <Box args={[0.48, 0.38, 0.01]} position={[0, 1.05, 0.03]} castShadow>
            <meshStandardMaterial 
              color="#1e90ff" 
              emissive="#1e90ff" 
              emissiveIntensity={0.3}
            />
          </Box>
          {/* Base del monitor */}
          <Cylinder args={[0.08, 0.12, 0.05, 16]} position={[0, 0.78, 0]} castShadow>
            <meshStandardMaterial color="#2c2c2c" />
          </Cylinder>
          
          {/* Teclado */}
          <Box args={[0.4, 0.02, 0.15]} position={[0, 0.78, 0.25]} castShadow>
            <meshStandardMaterial color="#2c2c2c" roughness={0.7} />
          </Box>
          
          {/* Mouse */}
          <Box args={[0.06, 0.03, 0.1]} position={[0.3, 0.78, 0.25]} castShadow>
            <meshStandardMaterial color="#2c2c2c" roughness={0.7} />
          </Box>
        </>
      )}
    </group>
  )
}

// Componente de Silla
function Chair({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Asiento */}
      <Cylinder args={[0.25, 0.25, 0.05, 16]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </Cylinder>
      
      {/* Respaldo */}
      <Box args={[0.45, 0.5, 0.05]} position={[0, 0.75, -0.2]} castShadow>
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </Box>
      
      {/* Pata central */}
      <Cylinder args={[0.05, 0.08, 0.45, 8]} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial color="#34495e" metalness={0.5} />
      </Cylinder>
      
      {/* Ruedas */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.15
        const z = Math.sin(rad) * 0.15
        return (
          <Sphere key={i} args={[0.04, 8, 8]} position={[x, 0.04, z]} castShadow>
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
          </Sphere>
        )
      })}
    </group>
  )
}

// Componente de Estantería
function Bookshelf({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Estructura */}
      <Box args={[1.5, 2, 0.3]} position={[0, 1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Box>
      
      {/* Estantes */}
      {[0.5, 1, 1.5].map((y, i) => (
        <Box key={i} args={[1.4, 0.03, 0.28]} position={[0, y, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.7} />
        </Box>
      ))}
      
      {/* Libros decorativos */}
      {[0.6, 1.1, 1.6].map((y, shelfIndex) => (
        <group key={shelfIndex}>
          {[-0.5, -0.2, 0.1, 0.4].map((x, bookIndex) => (
            <Box 
              key={bookIndex} 
              args={[0.15, 0.25, 0.2]} 
              position={[x, y + 0.15, 0]} 
              castShadow
            >
              <meshStandardMaterial 
                color={['#c0392b', '#2980b9', '#27ae60', '#f39c12'][bookIndex % 4]} 
                roughness={0.9}
              />
            </Box>
          ))}
        </group>
      ))}
    </group>
  )
}

// Componente de Planta
function Plant({ position }) {
  return (
    <group position={position}>
      {/* Maceta */}
      <Cylinder args={[0.15, 0.12, 0.2, 16]} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </Cylinder>
      
      {/* Hojas */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 0.15
        const z = Math.sin(rad) * 0.15
        return (
          <Sphere key={i} args={[0.12, 8, 8]} position={[x, 0.35 + i * 0.05, z]} castShadow>
            <meshStandardMaterial color="#27ae60" roughness={0.8} />
          </Sphere>
        )
      })}
    </group>
  )
}

// Componente de Lámpara de techo
function CeilingLight({ position }) {
  return (
    <group position={position}>
      {/* Cable */}
      <Cylinder args={[0.02, 0.02, 1, 8]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Cylinder>
      
      {/* Pantalla */}
      <Cylinder args={[0.3, 0.4, 0.3, 16]} position={[0, 1.35, 0]} castShadow>
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffeb3b" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      
      {/* Luz puntual */}
      <pointLight position={[0, 1.2, 0]} intensity={0.8} distance={8} color="#ffeb3b" castShadow />
    </group>
  )
}

// Componente de Pizarra
function Whiteboard({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Marco */}
      <Box args={[2.5, 1.5, 0.05]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.3} />
      </Box>
      
      {/* Superficie */}
      <Box args={[2.4, 1.4, 0.02]} position={[0, 1.5, 0.04]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </Box>
      
      {/* Bandeja para marcadores */}
      <Box args={[2.4, 0.05, 0.1]} position={[0, 0.7, 0.08]} castShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </group>
  )
}

// Componente de Mesa de reuniones
function MeetingTable({ position }) {
  return (
    <group position={position}>
      {/* Mesa */}
      <Box args={[3, 0.08, 1.5]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.2} />
      </Box>
      
      {/* Patas */}
      {[[-1.3, -0.6], [1.3, -0.6], [-1.3, 0.6], [1.3, 0.6]].map((pos, i) => (
        <Cylinder key={i} args={[0.06, 0.06, 0.7, 8]} position={[pos[0], 0.4, pos[1]]} castShadow>
          <meshStandardMaterial color="#654321" metalness={0.3} />
        </Cylinder>
      ))}
      
      {/* Sillas alrededor */}
      <Chair position={[0, 0, -1]} rotation={[0, 0, 0]} />
      <Chair position={[0, 0, 1]} rotation={[0, Math.PI, 0]} />
      <Chair position={[-1.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Chair position={[1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
}

// Componente de Sala de Reuniones completa
function MeetingRoom({ position }) {
  return (
    <group position={position}>
      {/* Suelo */}
      <Box args={[8, 0.1, 6]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </Box>
      
      {/* Paredes */}
      <Box args={[8, 3, 0.2]} position={[0, 1.5, -3]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      <Box args={[0.2, 3, 6]} position={[-4, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      <Box args={[0.2, 3, 6]} position={[4, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#ecf0f1" roughness={0.9} />
      </Box>
      
      {/* Mesa de reuniones */}
      <MeetingTable position={[0, 0, 0]} />
      
      {/* Pizarra */}
      <Whiteboard position={[0, 0, -2.9]} rotation={[0, 0, 0]} />
      
      {/* Luces */}
      <CeilingLight position={[-1.5, 0, 0]} />
      <CeilingLight position={[1.5, 0, 0]} />
      
      {/* Letrero */}
      <Text
        position={[0, 2.8, -2.85]}
        fontSize={0.3}
        color="#2c3e50"
        anchorX="center"
      >
        SALA DE REUNIONES
      </Text>
    </group>
  )
}

// Máquina de Café
function CoffeeMachine({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.5, 0.6, 0.4]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" roughness={0.3} metalness={0.7} />
      </Box>
      
      {/* Pantalla */}
      <Box args={[0.3, 0.2, 0.02]} position={[0, 0.5, 0.21]} castShadow>
        <meshStandardMaterial 
          color="#1e90ff" 
          emissive="#1e90ff" 
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Dispensador */}
      <Box args={[0.15, 0.1, 0.15]} position={[0, 0.2, 0.15]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </Box>
      
      {/* Taza */}
      <group position={[0, 0.15, 0.15]}>
        <Box args={[0.08, 0.1, 0.08]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </Box>
      </group>
    </group>
  )
}

// Impresora
function Printer({ position }) {
  return (
    <group position={position}>
      {/* Cuerpo principal */}
      <Box args={[0.6, 0.3, 0.5]} position={[0, 0.15, 0]} castShadow>
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
      </Box>
      
      {/* Bandeja de papel */}
      <Box args={[0.55, 0.02, 0.45]} position={[0, 0.31, 0]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </Box>
      
      {/* Pantalla */}
      <Box args={[0.15, 0.1, 0.02]} position={[0.2, 0.25, 0.26]} castShadow>
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00" 
          emissiveIntensity={0.3}
        />
      </Box>
      
      {/* Botones */}
      {[-0.05, 0, 0.05].map((x, i) => (
        <Box key={i} args={[0.03, 0.03, 0.02]} position={[x, 0.25, 0.26]} castShadow>
          <meshStandardMaterial color="#2c2c2c" />
        </Box>
      ))}
    </group>
  )
}

// Dispensador de Agua
function WaterCooler({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <Box args={[0.4, 0.8, 0.4]} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </Box>
      
      {/* Botella de agua */}
      <group position={[0, 0.9, 0]}>
        <Box args={[0.35, 0.5, 0.35]} castShadow>
          <meshStandardMaterial 
            color="#3498db" 
            transparent 
            opacity={0.6}
            roughness={0.1}
          />
        </Box>
      </group>
      
      {/* Dispensadores */}
      <Box args={[0.08, 0.08, 0.08]} position={[-0.1, 0.5, 0.21]} castShadow>
        <meshStandardMaterial color="#e74c3c" metalness={0.7} />
      </Box>
      <Box args={[0.08, 0.08, 0.08]} position={[0.1, 0.5, 0.21]} castShadow>
        <meshStandardMaterial color="#3498db" metalness={0.7} />
      </Box>
      
      {/* Bandeja de goteo */}
      <Box args={[0.35, 0.02, 0.15]} position={[0, 0.35, 0.15]} castShadow>
        <meshStandardMaterial color="#7f8c8d" metalness={0.5} />
      </Box>
    </group>
  )
}

// Cuadro en pared
function WallPicture({ position, rotation = [0, 0, 0], imageColor = "#3498db" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Marco */}
      <Box args={[1.2, 0.9, 0.05]} castShadow>
        <meshStandardMaterial color="#2c2c2c" roughness={0.3} metalness={0.5} />
      </Box>
      
      {/* Imagen */}
      <Box args={[1.1, 0.8, 0.02]} position={[0, 0, 0.03]} castShadow>
        <meshStandardMaterial color={imageColor} roughness={0.7} />
      </Box>
    </group>
  )
}

// Alfombra
function Carpet({ position, size = [3, 2], color = "#c0392b" }) {
  return (
    <Box args={[size[0], 0.02, size[1]]} position={[position[0], 0.01, position[1]]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} />
    </Box>
  )
}

// Reloj de pared
function WallClock({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base del reloj */}
      <Cylinder args={[0.25, 0.25, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.5} />
      </Cylinder>
      
      {/* Cara del reloj */}
      <Cylinder args={[0.23, 0.23, 0.02, 32]} position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </Cylinder>
      
      {/* Manecillas */}
      <Box args={[0.02, 0.15, 0.01]} position={[0, 0, 0.06]} castShadow>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>
      <Box args={[0.02, 0.12, 0.01]} position={[0, 0, 0.07]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>
    </group>
  )
}

// Ventana
function Window({ position, rotation = [0, 0, 0], size = [2, 2] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Marco */}
      <Box args={[size[0] + 0.2, size[1] + 0.2, 0.1]} castShadow>
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} />
      </Box>
      
      {/* Vidrio */}
      <Box args={[size[0], size[1], 0.02]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
        />
      </Box>
      
      {/* Divisor vertical */}
      <Box args={[0.05, size[1], 0.05]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>
      
      {/* Divisor horizontal */}
      <Box args={[size[0], 0.05, 0.05]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>
    </group>
  )
}

// Archivador
function FileCabinet({ position, color = "#7f8c8d" }) {
  return (
    <group position={position}>
      {/* Cuerpo */}
      <Box args={[0.5, 1.2, 0.6]} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </Box>
      
      {/* Cajones */}
      {[0.3, 0.6, 0.9].map((y, i) => (
        <group key={i}>
          <Box args={[0.45, 0.25, 0.02]} position={[0, y, 0.31]} castShadow>
            <meshStandardMaterial color="#2c2c2c" roughness={0.7} />
          </Box>
          {/* Manija */}
          <Box args={[0.15, 0.03, 0.05]} position={[0, y, 0.33]} castShadow>
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
          </Box>
        </group>
      ))}
    </group>
  )
}

export { 
  Desk, 
  Chair, 
  Bookshelf, 
  Plant, 
  CeilingLight, 
  Whiteboard, 
  MeetingTable, 
  MeetingRoom,
  CoffeeMachine,
  Printer,
  WaterCooler,
  WallPicture,
  Carpet,
  WallClock,
  Window,
  FileCabinet
}
