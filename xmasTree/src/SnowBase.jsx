import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function SnowBase() {
  const snowPileRef = useRef()
  const particlesRef = useRef()
  
  // Create base pile particles
  const particleCount = 100
  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Create circular distribution
      const angle = (i / particleCount) * Math.PI * 2
      const radiusVariation = 2.2 + Math.random() * 0.3
      
      positions[i * 3] = Math.cos(angle) * radiusVariation
      positions[i * 3 + 1] = -2 + Math.random() * 0.2 // Slight height variation
      positions[i * 3 + 2] = Math.sin(angle) * radiusVariation
      
      // Vary the size of each particle
      scales[i] = 0.2 + Math.random() * 0.3
    }
    
    return { positions, scales }
  }, [])

  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Add subtle movement to the particles
      particlesRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Main snow pile using a custom shape */}
      <mesh ref={snowPileRef} position={[0, -2.1, 0]}>
        <cylinderGeometry args={[2.5, 2.2, 0.3, 32]} />
        <meshStandardMaterial 
          color="#b3e0ff"
          transparent
          opacity={0.2}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Particle system for snow detail */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ffffff"
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>


    </group>
  )
}