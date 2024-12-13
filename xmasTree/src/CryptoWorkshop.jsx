import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CryptoElves } from './CryptoElves'
import { CryptoAddressDisplay } from './CryptoAddress'

const HammerImpactEffect = ({ position }) => {
  const particlesRef = useRef()
  const particleCount = 20
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position[0]
    positions[i * 3 + 1] = position[1]
    positions[i * 3 + 2] = position[2]
    
    const angle = Math.random() * Math.PI * 2
    const speed = 0.02 + Math.random() * 0.03
    velocities[i * 3] = Math.cos(angle) * speed
    velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02
    velocities[i * 3 + 2] = Math.sin(angle) * speed
  }

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3]
        positions[i * 3 + 1] += velocities[i * 3 + 1]
        positions[i * 3 + 2] += velocities[i * 3 + 2]
        velocities[i * 3 + 1] -= 0.001
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
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
        size={0.02}
        color="#00ffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const Workbench = () => {
  const benchRef = useRef()
  
  useFrame((state) => {
    if (benchRef.current) {
      const time = state.clock.getElapsedTime()
      benchRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.1
    }
  })

  return (
    <group position={[0, -0.3, 0]}>
      <mesh ref={benchRef} position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#000033"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Holographic Grid Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0.41, (i - 2) * 0.2]}>
          <planeGeometry args={[2.2, 0.01]} />
          <meshBasicMaterial 
            color="#00ffff"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Table legs */}
      {[[-0.9, -0.3, -0.3], [0.9, -0.3, -0.3], 
        [-0.9, -0.3, 0.3], [0.9, -0.3, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export const CryptoWorkshop = () => {
  const [impactPositions, setImpactPositions] = useState([])
  const [activeCharIndex, setActiveCharIndex] = useState(0)

  const handleHammerImpact = (position) => {
    setImpactPositions(prev => [...prev, { id: Date.now(), position }])
    setActiveCharIndex(prev => (prev + 1) % 43)
    
    setTimeout(() => {
      setImpactPositions(prev => prev.filter(impact => impact.id !== Date.now()))
    }, 1000)
  }

  return (
    <group position={[-10, 0, 5]}>
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 5, 0]}
        intensity={2}
        color="#00ffff"
        distance={10}
        decay={2}
      />
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={1.5}
        color="#4444ff"
        castShadow
      />
      
      <group rotation={[0, Math.PI * 0.58, 0]}>
        <Workbench />
        <CryptoAddressDisplay activeCharIndex={activeCharIndex} />
        <CryptoElves 
          leftPosition={[-0.8, 0, 0.2]} 
          rightPosition={[0.8, 0, 0.2]}
          onLeftHammerImpact={handleHammerImpact}
          onRightHammerImpact={handleHammerImpact}
        />
        
        {impactPositions.map(impact => (
          <HammerImpactEffect key={impact.id} position={impact.position} />
        ))}
      </group>
    </group>
  )
}

export default CryptoWorkshop