import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function SnowBk() {
  const points = useRef()
  const { camera } = useThree()
  
  // Reduced particle count to compensate for larger, more detailed flakes
  const particlesCount = 3000
  const radius = 50//////50 is good for snow ffs its bakwards alsmost stroked out at 5
  const fallSpeed = 0.015 // Slightly slower for more realistic movement

  // Create a custom texture for snowflakes
  const snowflakeTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    
    // Function to draw a snowflake pattern
    const drawSnowflake = (pattern) => {
      ctx.clearRect(0, 0, 128, 128)
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      
      switch(pattern) {
        case 0: // Simple star pattern
          for (let i = 0; i < 6; i++) {
            ctx.save()
            ctx.translate(64, 64)
            ctx.rotate(i * Math.PI / 3)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, 30)
            ctx.stroke()
            // Add small branches
            ctx.translate(0, 15)
            ctx.rotate(Math.PI / 4)
            ctx.moveTo(0, 0)
            ctx.lineTo(0, 10)
            ctx.rotate(-Math.PI / 2)
            ctx.moveTo(0, 0)
            ctx.lineTo(0, 10)
            ctx.stroke()
            ctx.restore()
          }
          break
          
        case 1: // Hexagon pattern
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            ctx.save()
            ctx.translate(64, 64)
            ctx.rotate(i * Math.PI / 3)
            ctx.moveTo(0, 0)
            ctx.lineTo(0, 25)
            ctx.restore()
          }
          ctx.stroke()
          break
      }
    }

    // Draw the first pattern
    drawSnowflake(0)
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3)
    const scales = new Float32Array(particlesCount)
    const rotations = new Float32Array(particlesCount)
    
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(radius * 2)
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(radius * 2)
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(radius * 2)
      
      // Random size variation
      scales[i] = 0.2 + Math.random() * 0.3
      // Random initial rotation
      rotations[i] = Math.random() * Math.PI * 2
    }
    
    return {
      positions,
      scales,
      rotations
    }
  }, [])
  
  useFrame((state, delta) => {
    if (!points.current) return
    
    const positions = points.current.geometry.attributes.position.array
    
    for (let i = 0; i < particlesCount; i++) {
      // Update position
      positions[i * 3 + 1] -= fallSpeed * (0.5 + Math.random())
      
      // Reset if below camera view
      if (positions[i * 3 + 1] < camera.position.y - radius) {
        positions[i * 3] = camera.position.x + THREE.MathUtils.randFloatSpread(radius * 2)
        positions[i * 3 + 1] = camera.position.y + radius
        positions[i * 3 + 2] = camera.position.z + THREE.MathUtils.randFloatSpread(radius * 2)
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true
    // Slowly rotate the points group for more natural movement
    points.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.9}
        map={snowflakeTexture}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  )
}