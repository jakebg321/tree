import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Elf = ({ position, offset = 0, scale = 1, onHammerImpact }) => {
  const elfRef = useRef()
  const armRef = useRef()
  const hammerGlowRef = useRef()
  const lastImpactTime = useRef(0)

  useFrame((state) => {
    if (armRef.current && elfRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Hammering animation
      const hammerAngle = Math.sin((time + offset) * 8) * 0.4 - 0.3
      armRef.current.rotation.x = hammerAngle
      
      // Detect hammer impact
      if (hammerAngle > 0.35 && time - lastImpactTime.current > 0.2) {
        lastImpactTime.current = time
        if (onHammerImpact) {
          const hammerPosition = new THREE.Vector3()
          hammerGlowRef.current.getWorldPosition(hammerPosition)
          onHammerImpact(hammerPosition.toArray())
        }
      }
      
      // Body animation
      elfRef.current.position.y = position[1] + Math.sin((time + offset) * 2) * 0.05
      elfRef.current.rotation.z = Math.sin((time + offset) * 2) * 0.03
      
      // Hammer glow
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

export const CryptoElves = ({ 
  leftPosition, 
  rightPosition, 
  onLeftHammerImpact, 
  onRightHammerImpact 
}) => {
  return (
    <>
      <Elf 
        position={leftPosition} 
        offset={0} 
        scale={1} 
        onHammerImpact={onLeftHammerImpact}
      />
      <Elf 
        position={rightPosition} 
        offset={Math.PI} 
        scale={1} 
        onHammerImpact={onRightHammerImpact}
      />
    </>
  )
}