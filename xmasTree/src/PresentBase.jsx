import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Bow = ({ size, color }) => {
  const bowRef = useRef()
  
  useFrame((state) => {
    if (bowRef.current) {
      // Subtle bow movement
      bowRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={bowRef} position={[0, size[1] / 2 + 0.05, 0]}>
      {/* Enhanced bow with loops and ribbons */}
      {[[-0.12, 0.1], [0.12, 0.1]].map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]} rotation={[0, i * Math.PI, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.02, 12, 8, Math.PI * 1.2]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
          {/* Hanging ribbons */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.02, 0, 0.3, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}
      {/* Bow center knot */}
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.04]} />
        <meshStandardMaterial 
          color={color}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

const Present = ({ position, rotation, size, baseColor, ribbonColor, includeBow = true }) => {
  const presentRef = useRef()
  
  return (
    <group position={position} rotation={rotation} ref={presentRef}>
      {/* Main present box with metallic wrapping */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={baseColor}
          metalness={0.4}
          roughness={0.3}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Ribbon cross */}
      <group>
        <mesh castShadow>
          <boxGeometry args={[size[0] * 1.02, size[1] * 1.02, size[2] * 0.08]} />
          <meshStandardMaterial 
            color={ribbonColor}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[size[0] * 0.08, size[1] * 1.02, size[2] * 1.02]} />
          <meshStandardMaterial 
            color={ribbonColor}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>
      
      {includeBow && <Bow size={size} color={ribbonColor} />}
    </group>
  )
}

const createClusterPosition = (radius, angle, previousPresents) => {
  const baseX = Math.cos(angle) * radius
  const baseZ = Math.sin(angle) * radius
  
  // Add slight random offset
  const offset = 0.3
  const x = baseX + (Math.random() - 0.5) * offset
  const z = baseZ + (Math.random() - 0.5) * offset
  
  // Check for overlaps and adjust
  let y = 0
  let foundSpot = false
  
  previousPresents.forEach(present => {
    const dx = x - present.position[0]
    const dz = z - present.position[2]
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    if (distance < 0.8) { // If presents are close
      // Stack on top with slight offset
      y = Math.max(y, present.position[1] + present.size[1])
      foundSpot = true
    }
  })
  
  // Add slight tilt for stacked presents
  const tilt = foundSpot ? [
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.2
  ] : [0, Math.random() * Math.PI * 2, 0]
  
  return { position: [x, y, z], rotation: tilt, foundSpot }
}

export const PresentBase = () => {
  const presentsConfig = useMemo(() => {
    const configs = []
    const colors = [
      "#ff0000", "#00aa00", "#0000ff", "#ff00ff", 
      "#ffcc00", "#00ffff", "#ff8800", "#88ff00",
      "#cc0000", "#006600", "#000088", "#880088"
    ]
    const ribbonColors = ["#ffffff", "#ffff00", "#ff9900", "#ff00ff", "#00ffff"]
    const totalPresents = 24 // Increased number of presents
    
    const createPresent = (index, previousPresents) => {
      // Size varies based on position - lower presents are generally larger
      const baseSize = 0.3 + Math.random() * 0.4
      const heightVariation = 0.4 + Math.random() * 0.4
      
      // Calculate position in a natural cluster
      const angle = (index / totalPresents) * Math.PI * 2
      const radius = 2.5 + Math.random() * 1
      const { position, rotation, foundSpot } = createClusterPosition(radius, angle, previousPresents)
      
      // Adjust size based on position
      const size = [
        baseSize * (1 + Math.random() * 0.3),
        heightVariation * (foundSpot ? 0.8 : 1), // Slightly shorter if stacked
        baseSize * (1 + Math.random() * 0.3)
      ]
      
      return {
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        ribbon: ribbonColors[Math.floor(Math.random() * ribbonColors.length)],
        position,
        rotation
      }
    }
    
    // Generate presents iteratively, considering previous placements
    for (let i = 0; i < totalPresents; i++) {
      configs.push(createPresent(i, configs))
    }
    
    return configs
  }, [])

  return (
    <group position={[0, -2, 0]}>
      {presentsConfig.map((config, index) => (
        <Present
          key={index}
          position={config.position}
          rotation={config.rotation}
          size={config.size}
          baseColor={config.color}
          ribbonColor={config.ribbon}
          includeBow={true}
        />
      ))}
    </group>
  )
}
