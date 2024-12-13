import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Snowball explosion particles
const SnowballExplosion = ({ position }) => {
  const particles = useRef()
  const [visible, setVisible] = useState(true)
  const particleCount = 50  // Increased from 20
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8    // Increased spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (particles.current) {
      const positions = particles.current.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += (Math.random() - 0.5) * 0.15   // Increased movement
        positions[i * 3 + 1] += Math.random() * 0.15
        positions[i * 3 + 2] += (Math.random() - 0.5) * 0.15
      }
      particles.current.geometry.attributes.position.needsUpdate = true
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800)  // Increased duration
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <points ref={particles} position={position}>
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
        color="white"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const Snowball = ({ position, target, onHit }) => {
  const ref = useRef()
  const startPos = new THREE.Vector3(...position)
  const targetPos = new THREE.Vector3(...target)
  const [time, setTime] = useState(0)
  const [trail, setTrail] = useState([])
  
  useFrame((state, delta) => {
    if (ref.current) {
      setTime(t => t + delta * 2)
      
      const progress = Math.min(time, 1)
      const height = 2 * Math.sin(progress * Math.PI)
      
      const currentPos = new THREE.Vector3()
      currentPos.lerpVectors(startPos, targetPos, progress)
      currentPos.y += height
      
      ref.current.position.copy(currentPos)
      
      // Enhanced trail effect
      if (progress < 1) {
        setTrail(prev => [...prev.slice(-15), {...currentPos}]) // Increased trail length
      }
      
      if (progress >= 1) {
        onHit(currentPos)
      }
    }
  })

  return (
    <>
      {/* Main snowball with glow */}
      <group>
        {/* Glow sphere */}
        <mesh ref={ref} position={position} scale={[1.4, 1.4, 1.4]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#4466ff"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Main snowball */}
        <mesh ref={ref} position={position}>
          <sphereGeometry args={[0.2, 16, 16]} /> {/* Increased size */}
          <meshStandardMaterial 
            color="white" 
            emissive="#6699ff"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Enhanced trail */}
      {trail.map((pos, i) => (
        <mesh 
          key={i} 
          position={[pos.x, pos.y, pos.z]} 
          scale={[0.15 * (1 - i/15), 0.15 * (1 - i/15), 0.15 * (1 - i/15)]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#6699ff"
            emissiveIntensity={0.3 * (1 - i/15)}
            transparent 
            opacity={0.3 * (1 - i/15)}
          />
        </mesh>
      ))}
    </>
  )
}

const Snowman = ({ position, rotation, isHit, isThrowingSnowball }) => {
  const groupRef = useRef()
  const rightArmRef = useRef()
  const leftArmRef = useRef()
  const [wobble, setWobble] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    if (isHit) {
      // Random wobble direction
      setWobble({
        x: (Math.random() - 0.65) * 0.5,
        y: (Math.random() - 0.65) * 0.5
      })
      // Reset wobble after animation
      const timer = setTimeout(() => setWobble({ x: 0, y: 0 }), 300)
      return () => clearTimeout(timer)
    }
  }, [isHit])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth return to original position for wobble
      groupRef.current.rotation.x += (wobble.x - groupRef.current.rotation.x) * 0.1
      groupRef.current.rotation.z += (wobble.y - groupRef.current.rotation.z) * 0.1
    }

    // Enhanced arm throwing animation
    if (rightArmRef.current && leftArmRef.current) {
      if (isThrowingSnowball) {
        const throwingArm = position[0] > 0 ? leftArmRef.current : rightArmRef.current
        // Wind up and throw animation
        throwingArm.rotation.x = THREE.MathUtils.lerp(
          throwingArm.rotation.x,
          -Math.PI * 0.8,  // More extreme throw angle
          0.4  // Faster movement
        )
        throwingArm.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.2  // Add wobble
        // Scale effect during throw
        throwingArm.scale.y = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1
      } else {
        // Smooth return to rest position
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, Math.PI / 4, 0.15)
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.PI / 4, 0.15)
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, 0.15)
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, 0.15)
        rightArmRef.current.scale.y = THREE.MathUtils.lerp(rightArmRef.current.scale.y, 1, 0.15)
        leftArmRef.current.scale.y = THREE.MathUtils.lerp(leftArmRef.current.scale.y, 1, 0.15)
      }
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Bottom sphere */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
      
      {/* Middle sphere */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.8} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.15, 2.3, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.15, 2.3, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Carrot nose */}
      <mesh position={[0, 2.2, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color="#ff6b0f" />
      </mesh>

      {/* Updated stick arms with refs */}
      <mesh ref={rightArmRef} position={[0.6, 1.5, 0]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      <mesh ref={leftArmRef} position={[-0.6, 1.5, 0]} rotation={[Math.PI / 4, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>

      {/* Scarf */}
      <mesh position={[0, 1.8, 0]} rotation={[0.1, Math.random(), 0]}>
        <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI * 1.4]} />
        <meshStandardMaterial color={isHit ? "#ff4444" : "#ff0000"} />
      </mesh>
    </group>
  )
}

export const SnowmanBattle = () => {
  const [snowballs, setSnowballs] = useState([])
  const [explosions, setExplosions] = useState([])
  const [hitStates, setHitStates] = useState({ left: false, right: false })
  const [throwingStates, setThrowingStates] = useState({ left: false, right: false })
  const snowballId = useRef(0)
  
  const positions = {
    leftSnowman: [8, -2, -8],  // Changed from [-8, -2, -8]
    rightSnowman: [14, -2, -8]  // Changed from [8, -2, -8]
  }
  
  useEffect(() => {
    const interval = setInterval(() => {
      const isLeft = snowballId.current % 2 === 0
      const start = isLeft ? positions.leftSnowman : positions.rightSnowman
      const target = isLeft ? positions.rightSnowman : positions.leftSnowman
      
      // Set throwing animation state
      setThrowingStates(prev => ({
        ...prev,
        [isLeft ? 'left' : 'right']: true
      }))

      // Longer throwing animation duration
      setTimeout(() => {
        setThrowingStates(prev => ({
          ...prev,
          [isLeft ? 'left' : 'right']: false
        }))
      }, 800)  // Increased from 500
      
      // Adjust start position to be in the throwing hand
      const handOffset = isLeft ? [-0.6, 1.5, 0] : [0.6, 1.5, 0]
      setSnowballs(prev => [...prev, {
        id: snowballId.current,
        start: [
          start[0] + handOffset[0],
          start[1] + handOffset[1],
          start[2] + handOffset[2]
        ],
        target: [target[0], target[1] + 2, target[2]]
      }])
      
      snowballId.current++
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSnowballHit = (id, position) => {
    // Add explosion effect
    setExplosions(prev => [...prev, { id, position }])
    
    // Set hit state for wobble animation
    const isLeft = id % 2 === 0
    setHitStates(prev => ({
      ...prev,
      [isLeft ? 'right' : 'left']: true
    }))
    
    // Remove hit state after animation
    setTimeout(() => {
      setHitStates(prev => ({
        ...prev,
        [isLeft ? 'right' : 'left']: false
      }))
    }, 300)
    
    // Remove snowball
    setSnowballs(prev => prev.filter(ball => ball.id !== id))
    
    // Remove explosion after animation
    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== id))
    }, 500)
  }

  return (
    <group>
      <Snowman 
        position={positions.leftSnowman} 
        rotation={[0, Math.PI / 4, 0]}
        isHit={hitStates.left}
        isThrowingSnowball={throwingStates.left}
      />
      <Snowman 
        position={positions.rightSnowman} 
        rotation={[0, -Math.PI / 4, 0]}
        isHit={hitStates.right}
        isThrowingSnowball={throwingStates.right}
      />
      
      {snowballs.map(ball => (
        <Snowball
          key={ball.id}
          position={ball.start}
          target={ball.target}
          onHit={(pos) => handleSnowballHit(ball.id, pos)}
        />
      ))}
      
      {explosions.map(explosion => (
        <SnowballExplosion
          key={explosion.id}
          position={[explosion.position.x, explosion.position.y, explosion.position.z]}
        />
      ))}
    </group>
  )
}