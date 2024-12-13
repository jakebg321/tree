import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const ConstructionEffect = ({ position, color = "#00ffff" }) => {
  const sparkRef = useRef()
  const particleCount = 15
  const positions = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.2
    positions[i * 3 + 1] = Math.random() * 0.2
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2
  }

  useFrame((state) => {
    if (sparkRef.current) {
      const positions = sparkRef.current.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.02
        if (positions[i * 3 + 1] > 0.3) {
          positions[i * 3 + 1] = 0
        }
      }
      sparkRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={sparkRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const CryptoDisplay = () => {
  const [copied, setCopied] = useState(false)
  const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  const [constructionIndex, setConstructionIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setConstructionIndex(i => (i + 1) % (address.length + 20))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Html position={[0, 0.5, 0]} transform>
      <div className="relative w-[500px]">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-transparent">
          <div className="font-mono text-lg overflow-hidden">
            {address.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-300"
                style={{
                  color: i > constructionIndex ? '#164e63' : '#00ffff',
                  textShadow: i > constructionIndex ? 'none' : '0 0 10px #00ffff',
                  transform: i > constructionIndex ? 'translateY(2px)' : 'translateY(0)',
                  opacity: i > constructionIndex ? 0.5 : 1
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all text-white text-sm"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
    </Html>
  )
}

const Elf = ({ position, offset = 0, scale = 1 }) => {
  const elfRef = useRef()
  const armRef = useRef()
  const hammerGlowRef = useRef()
  const [isHammering, setIsHammering] = useState(true)

  useFrame((state) => {
    if (armRef.current && elfRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Hammering animation
      if (isHammering) {
        armRef.current.rotation.x = Math.sin((time + offset) * 8) * 0.4 - 0.3
        if (hammerGlowRef.current) {
          hammerGlowRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 8) * 0.3
        }
      }
      
      // Subtle body movement
      elfRef.current.position.y = position[1] + Math.sin((time + offset) * 2) * 0.05
    }
  })

  return (
    <group ref={elfRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
        <meshStandardMaterial 
          color="#2da44e"
          emissive="#1a6334"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffd6b3" />
      </mesh>

      {/* Glowing Hat */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial 
          color="#e74c3c"
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Working Arm with Hammer */}
      <group ref={armRef} position={[0.3, 0.5, 0]}>
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
          <meshStandardMaterial color="#2da44e" />
        </mesh>
        <mesh ref={hammerGlowRef} position={[0.2, -0.1, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.25]} />
          <meshStandardMaterial 
            color="#4444ff"
            emissive="#0055ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Other Arm */}
      <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#2da44e" />
      </mesh>

      {/* Face Features */}
      <mesh position={[-0.08, 0.75, 0.15]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial 
          color="black"
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.08, 0.75, 0.15]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial 
          color="black"
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

const HolographicWorkbench = () => {
  const benchRef = useRef()
  
  useFrame((state) => {
    if (benchRef.current) {
      const time = state.clock.getElapsedTime()
      benchRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.1
    }
  })

  return (
    <group>
      <mesh ref={benchRef} position={[0, 0.4, 0]}>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          emissive="#000066"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Holographic Grid Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0.41, (i - 2) * 0.2]}>
          <planeGeometry args={[3, 0.01]} />
          <meshBasicMaterial 
            color="#00ffff"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export const CryptoWorkshop = () => {
  return (
    // Updated position to be left of "Our Work" button
    <group position={[-10, 0, 5]}>  {/* Moved to the left */}
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 5, 0]}
        intensity={2}
        color="#00ffff"
        distance={10}
        decay={2}
      />
      {/* Main Scene */}
      <group rotation={[0, Math.PI * 0.58, 0]}>  {/* Slight rotation to face camera better */}
        <HolographicWorkbench />
        <CryptoDisplay />
        <Elf position={[-1.2, 0, 0]} offset={0} scale={1.2} />
        <Elf position={[1.2, 0, 0]} offset={Math.PI} scale={1.2} />
        
        {/* Construction Effects */}
        <ConstructionEffect position={[-0.8, 0.6, 0]} />
        <ConstructionEffect position={[0.8, 0.6, 0]} />
      </group>
    </group>
  )
}


export default CryptoWorkshop