import { Box, Sphere, Cylinder } from '@react-three/drei'

function OfficeObject3D({ object }) {
  const { objectType, position, rotation, scale, color } = object

  const renderObject = () => {
    switch (objectType) {
      case 'desk':
        return (
          <group>
            <Box args={[2, 0.1, 1]} position={[0, 0.75, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.1, 0.75, 0.1]} position={[-0.9, 0.375, -0.4]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.1, 0.75, 0.1]} position={[0.9, 0.375, -0.4]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.1, 0.75, 0.1]} position={[-0.9, 0.375, 0.4]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.1, 0.75, 0.1]} position={[0.9, 0.375, 0.4]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
          </group>
        )

      case 'chair':
        return (
          <group>
            <Box args={[0.5, 0.1, 0.5]} position={[0, 0.5, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.5, 0.6, 0.1]} position={[0, 0.8, -0.2]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => (
              <Cylinder key={i} args={[0.05, 0.05, 0.5]} position={[x, 0.25, z]} castShadow>
                <meshStandardMaterial color={color} />
              </Cylinder>
            ))}
          </group>
        )

      case 'plant':
        return (
          <group>
            <Cylinder args={[0.2, 0.25, 0.4]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color="#8B4513" />
            </Cylinder>
            <Sphere args={[0.4, 16, 16]} position={[0, 0.6, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
          </group>
        )

      case 'lamp':
        return (
          <group>
            <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]} castShadow>
              <meshStandardMaterial color="#333" />
            </Cylinder>
            <Sphere args={[0.2, 16, 16]} position={[0, 1.5, 0]} castShadow>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Sphere>
          </group>
        )

      case 'table':
        return (
          <group>
            <Box args={[1.5, 0.1, 1.5]} position={[0, 0.75, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
              <Box key={i} args={[0.1, 0.75, 0.1]} position={[x, 0.375, z]} castShadow>
                <meshStandardMaterial color={color} />
              </Box>
            ))}
          </group>
        )

      case 'computer':
        return (
          <group>
            <Box args={[0.5, 0.4, 0.05]} position={[0, 0.2, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            <Box args={[0.3, 0.02, 0.2]} position={[0, 0, 0.1]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
          </group>
        )

      case 'whiteboard':
        return (
          <Box args={[2, 1.2, 0.05]} position={[0, 1.5, 0]} castShadow>
            <meshStandardMaterial color={color} />
          </Box>
        )

      case 'bookshelf':
        return (
          <group>
            <Box args={[1.5, 2, 0.4]} position={[0, 1, 0]} castShadow>
              <meshStandardMaterial color={color} />
            </Box>
            {[0.5, 1, 1.5].map((y, i) => (
              <Box key={i} args={[1.4, 0.05, 0.35]} position={[0, y, 0]} castShadow>
                <meshStandardMaterial color="#8B4513" />
              </Box>
            ))}
          </group>
        )

      default:
        return (
          <Box args={[1, 1, 1]} castShadow>
            <meshStandardMaterial color={color} />
          </Box>
        )
    }
  }

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
    >
      {renderObject()}
    </group>
  )
}

export default OfficeObject3D
