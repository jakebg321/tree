// src/components/TreeNodes/Node.jsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Node = ({ 
  position, 
  size = 0.15,
  intensity = 0.9,
  color = "#00ff99",
  isPulsing = false,
  isBitcoin = false,
  transactionValue = 0
}) => {
  const nodeRef = useRef()
  const glowRef = useRef()
  const bitcoinRef = useRef()
  
  useFrame((state) => {
    if (nodeRef.current) {
      const t = state.clock.elapsedTime
      
      // Optimize animations based on node type
      const baseScale = isBitcoin ? 1.2 : 1
      const animationScale = isPulsing ? 
        baseScale + Math.sin(t * 4) * 0.2 :
        baseScale + Math.sin(t * 2) * 0.05
      
      nodeRef.current.scale.setScalar(animationScale)
      
      if (glowRef.current && isPulsing) {
        glowRef.current.material.opacity = intensity * (0.6 + Math.sin(t * 4) * 0.4)
      }

      if (isBitcoin && bitcoinRef.current) {
        bitcoinRef.current.rotation.y = t * 0.5
      }
    }
  })

  // Calculate reduced glow for large transactions
  const glowIntensity = isBitcoin ? intensity * 0.5 : intensity

  return (
    <group position={position}>
      <group ref={nodeRef}>
        {/* Core light point */}
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={intensity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[size * 1.5, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={glowIntensity * 0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Outer glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 2.5, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={glowIntensity * 0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Bitcoin symbol for large transactions */}
        {isBitcoin && (
          <group ref={bitcoinRef}>
            <mesh position={[0, 0, size * 0.1]}>
              <planeGeometry args={[size * 3, size * 3]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              >
                {/* You might want to add a Bitcoin symbol texture here */}
              </meshBasicMaterial>
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}