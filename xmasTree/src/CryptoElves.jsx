// CryptoElves.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const Elf = ({ position, offset = 0, scale = 1 }) => {
  const elfRef = useRef()
  const armRef = useRef()
  const hammerGlowRef = useRef()

  useFrame((state) => {
    if (armRef.current && elfRef.current) {
      const time = state.clock.getElapsedTime()
      // More deliberate hammering animation
      armRef.current.rotation.x = Math.sin((time + offset) * 8) * 0.4 - 0.3
      
      // Slight body movement while working
      elfRef.current.position.y = position[1] + Math.sin((time + offset) * 2) * 0.05
      elfRef.current.rotation.z = Math.sin((time + offset) * 2) * 0.03
      
      // Hammer glow effect synced with hammering
      if (hammerGlowRef.current) {
        hammerGlowRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 8) * 0.3
      }
    }
  })

  return (
    <group ref={elfRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
        <meshStandardMaterial 
          color="#2da44e"
          metalness={0.3}
          roughness={0.7}
          emissive="#1a6334"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#ffd6b3"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Hat */}
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
        {/* Glowing Hammer */}
        <mesh ref={hammerGlowRef} position={[0.2, -0.1, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.25]} />
          <meshStandardMaterial 
            color="#4444ff"
            emissive="#0055ff"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* Other arm */}
      <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#2da44e" />
      </mesh>

      {/* Glowing eyes */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.75, 0.15]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial 
            color="black"
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Smile */}
      <mesh position={[0, 0.65, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.01, 12, 16, Math.PI]} />
        <meshStandardMaterial color="#ff3333" />
      </mesh>
    </group>
  )
}

const Workbench = () => {
  return (
    <group position={[0, -0.3, 0]}>
      {/* Desktop surface */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.1, 0.8]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#000033"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Table legs */}
      {[[-0.9, -0.3, -0.3], [0.9, -0.3, -0.3], 
        [-0.9, -0.3, 0.3], [0.9, -0.3, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Holographic projectors */}
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]}>
          <cylinderGeometry args={[0.1, 0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

export const CryptoWorkshopScene = () => {
  return (
    <group position={[0, 0, -8]}>
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
        intensity={2}
        color="#4444ff"
        castShadow
      />

      <Workbench />
      <Elf position={[-0.8, 0, 0.2]} offset={0} scale={1} />
      <Elf position={[0.8, 0, 0.2]} offset={Math.PI} scale={1} />
    </group>
  )
}
