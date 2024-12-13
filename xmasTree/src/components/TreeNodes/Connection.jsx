// src/components/TreeNodes/Connection.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Connection = ({ 
  start, 
  end, 
  intensity = 0.5,
  color = "#00ff99",
  animated = false,
  pulseSpeed = 1
}) => {
  const lineRef = useRef()
  
  // Create path that follows tree surface between nodes
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const segments = 20
    const points = []
    
    // Add first point exactly at start node center
    points.push(startVec)
    
    // Calculate curved path points between nodes
    for (let i = 1; i < segments; i++) {
      const t = i / segments
      
      // Get the angle difference between start and end points
      const startAngle = Math.atan2(start[2], start[0])
      const endAngle = Math.atan2(end[2], end[0])
      let angleDiff = endAngle - startAngle
      
      // Ensure we take the shortest path around the tree
      if (Math.abs(angleDiff) > Math.PI) {
        angleDiff = angleDiff > 0 ? 
          angleDiff - 2 * Math.PI : 
          angleDiff + 2 * Math.PI
      }
      
      // Calculate current angle
      const currentAngle = startAngle + angleDiff * t
      
      // Interpolate height
      const y = start[1] + (end[1] - start[1]) * t
      
      // Calculate radius at this height (tree's conical shape)
      const baseWidth = 4 // Tree's base width
      const treeHeight = 8 // Tree's height
      const radius = baseWidth * (1 - y / treeHeight)
      
      // Calculate position on tree surface
      const x = Math.cos(currentAngle) * radius
      const z = Math.sin(currentAngle) * radius
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    // Add last point exactly at end node center
    points.push(endVec)
    
    return points
  }, [start, end])

  useFrame((state) => {
    if (animated && lineRef.current) {
      const t = state.clock.elapsedTime
      lineRef.current.material.opacity = intensity * (0.7 + Math.sin(t * pulseSpeed) * 0.3)
    }
  })

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry>
          <float32BufferAttribute 
            attach="attributes-position" 
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={color}
          transparent 
          opacity={intensity}
          blending={THREE.AdditiveBlending}
          linewidth={2}
          depthWrite={false}
        />
      </line>
    </group>
  )
}