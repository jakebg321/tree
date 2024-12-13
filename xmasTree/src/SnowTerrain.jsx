import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SnowTerrain = () => {
  const terrainRef = useRef()
  
  const terrainSize = 250
  const resolution = 128
  const flatAreaRadius = 20
  
  const generateHeightMap = () => {
    const geometry = new THREE.PlaneGeometry(
      terrainSize,
      terrainSize,
      resolution,
      resolution
    )
    
    const positions = geometry.attributes.position.array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      
      const distanceFromCenter = Math.sqrt(x * x + z * z)
      
      if (distanceFromCenter < flatAreaRadius) {
        positions[i + 1] = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.3
      } else {
        const height = 
          Math.sin(x * 0.03) * Math.cos(z * 0.03) * 4 +
          Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2 +
          Math.sin(x * 0.15) * Math.cos(z * 0.15) * 1
        
        const edgeDistance = distanceFromCenter - flatAreaRadius
        const edgeFactor = Math.max(0, edgeDistance / 30)
        const duneHeight = Math.max(height, edgeFactor * 6)
        
        positions[i + 1] = duneHeight
      }
    }
    
    geometry.computeVertexNormals()
    return geometry
  }

  return (
    <group position={[0, -2.05, 0]}>
      {/* Base layer - solid white to prevent any see-through */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
      >
        <planeGeometry args={[terrainSize, terrainSize]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Main snow terrain with dunes */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        geometry={generateHeightMap()}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.95}
          metalness={0.05}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Subtle sparkle layer */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.1, 0]}
        geometry={generateHeightMap()}
      >
        <meshStandardMaterial
          color="#e8f0ff"
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.1}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Snow drifts */}
      {Array.from({ length: 100 }).map((_, i) => {
        const angle = (i / 100) * Math.PI * 2
        const radius = 35 + Math.sin(angle * 4) * 8
        const scale = 1.5 + Math.random() * 2
        
        if (radius < flatAreaRadius) return null
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 3) * 0.8,
              Math.sin(angle) * radius
            ]}
            rotation={[
              Math.random() * 0.3,
              angle + Math.PI + Math.random() * 0.8,
              Math.random() * 0.3
            ]}
            scale={[scale, scale * 0.5, scale * 2]}
          >
            <cylinderGeometry args={[1, 0.6, 0.8, 6]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              metalness={0.1}
              side={THREE.FrontSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default SnowTerrain