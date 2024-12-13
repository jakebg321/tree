import { useRef, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StylizedReindeer = ({ position, isRudolph = false }) => {
  return (
    // All reindeer now face the same direction (along the X axis)
    <group position={position}>
      {/* Simplified body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Stylized legs */}
      {[[-0.1, -0.2, 0.2], [-0.1, -0.2, -0.2], [0.1, -0.2, 0.2], [0.1, -0.2, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 4]} />
          <meshStandardMaterial color="#725037" />
        </mesh>
      ))}
      
      {/* Neck */}
      <mesh position={[0.3, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} rotation={[0, 0, Math.PI/3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Head */}
      <group position={[0.5, 0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} rotation={[0, Math.PI/2, Math.PI/6]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Rudolph's nose */}
        {isRudolph && (
          <mesh position={[0.2, 0, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
        
        {/* Antlers */}
        <group position={[0, 0.1, 0]}>
          {[-0.15, 0.15].map((z, i) => (
            <mesh key={i} position={[0, 0.1, z]}>
              <cylinderGeometry args={[0.02, 0.01, 0.4, 4]} rotation={[0.3 * (i ? 1 : -1), 0, 0.3]} />
              <meshStandardMaterial color="#5C4033" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

export const SantaSleigh = () => {
  const sleighGroupRef = useRef()
  const radius = 15
  const height = 12
  const speed = 0.2
  
  // Track position for rotation
  const currentPos = useRef({ x: 0, z: 0 })

  useFrame((state) => {
    if (sleighGroupRef.current) {
      const time = state.clock.getElapsedTime() * speed
      
      // Calculate new position
      const newX = Math.sin(time) * radius
      const newZ = Math.cos(time) * radius
      
      // Update position
      sleighGroupRef.current.position.x = newX
      sleighGroupRef.current.position.z = newZ
      sleighGroupRef.current.position.y = height + Math.sin(time * 2) * 0.3
      
      // Calculate tangent angle
      sleighGroupRef.current.rotation.y = Math.atan2(newX, newZ) + Math.PI / 8
      
      currentPos.current = { x: newX, z: newZ }
    }
  })

  // Formation setup
  const spacing = 2
  const pairSpread = 1

  const ReindeerWithBob = ({ position, isRudolph = false, index }) => {
    const bobRef = useRef()
    
    useFrame((state) => {
      if (bobRef.current) {
        const time = state.clock.getElapsedTime() * speed
        // Offset each reindeer slightly in the animation cycle
        const offset = index * 0.5
        bobRef.current.position.y = Math.sin((time * 4) + offset) * 0.2
      }
    })

    return (
      <group position={position}>
        <group ref={bobRef}>
          <StylizedReindeer position={[0, 0, 0]} isRudolph={isRudolph} />
        </group>
      </group>
    )
  }

  return (
    <group ref={sleighGroupRef}>
      {/* Lead reindeer (Rudolph) */}
      <ReindeerWithBob position={[0, 0, 0]} isRudolph={true} index={0} />
      
      {/* Paired reindeer */}
      {Array(4).fill().map((_, i) => (
        <group key={i} position={[-spacing * (i + 1), 0, 0]}>
          <ReindeerWithBob position={[0, 0, pairSpread]} index={i*2 + 1} />
          <ReindeerWithBob position={[0, 0, -pairSpread]} index={i*2 + 2} />
        </group>
      ))}

      {/* Sleigh */}
      <group position={[-spacing * 5, 0, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.5, 1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[-0.5, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Runners */}
        <mesh position={[0, -0.3, 0.4]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshStandardMaterial color="#daa520" />
        </mesh>
        <mesh position={[0, -0.3, -0.4]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshStandardMaterial color="#daa520" />
        </mesh>
        
        {/* Santa and sack */}
        <mesh position={[-0.5, 0.8, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#cc0000" />
        </mesh>
        <mesh position={[0.5, 0.4, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#2c5530" />
        </mesh>
      </group>

      {/* Reins */}
      {Array(8).fill().map((_, i) => (
        <mesh key={i} position={[-spacing * 2.5, 0.3, (i - 4) * 0.25]}>
          <cylinderGeometry args={[0.01, 0.01, spacing * 5, 4]} rotation={[0, 0, Math.PI/2]} />
          <meshStandardMaterial color="#463E3F" />
        </mesh>
      ))}
    </group>
  )
}