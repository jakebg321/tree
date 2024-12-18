import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { audioManager } from './BackgroundMusic'
import { IceSkaterSpeech, skaterDialogSequence } from './IceSkaterSpeech'

const SpeechBubble = ({ text }) => (
  <Html position={[2, 2, 0]} center>
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '10px 15px',
      borderRadius: '20px',
      maxWidth: '200px',
      textAlign: 'center',
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#333',
      transform: 'scale(1)',
      pointerEvents: 'none'
    }}>
      {text}
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '10px solid rgba(255, 255, 255, 0.9)'
      }} />
    </div>
  </Html>
)

const Skater = ({ position }) => {
    const skaterRef = useRef()
    const [bubblePosition, setBubblePosition] = useState([0, 0, 0])
    const [isPerforming, setIsPerforming] = useState(false)
    const [currentDialog, setCurrentDialog] = useState(0)
    const mouthRef = useRef()
    const radius = 3
    const height = -2
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio] = useState(() => new Audio('/ice-skater-speech.mp3'))
    const [isFalling, setIsFalling] = useState(false)
    const [isStumbling, setIsStumbling] = useState(false)
    const fallTimeoutRef = useRef(null)
    const [isJumping, setIsJumping] = useState(false)
    const [isTwirling, setIsTwirling] = useState(false)
    const trickTimeoutRef = useRef(null)

    const handleClick = async (event) => {
        event.stopPropagation()
        if (!isPlaying) {
            try {
                console.log('Starting skater speech...')
                setIsPlaying(true)
                setIsPerforming(true)
                audioManager.setSkaterTalking(true)
                
                audio.currentTime = 0
                await audio.play()
                
                // Reset everything after audio ends
                audio.onended = () => {
                    console.log('Speech ended')
                    setIsPlaying(false)
                    setIsPerforming(false)
                    audioManager.setSkaterTalking(false)
                    setCurrentDialog((prev) => (prev + 1) % skaterDialogSequence.length)
                }
            } catch (error) {
                console.error('Speech playback failed:', error)
                setIsPlaying(false)
                setIsPerforming(false)
                audioManager.setSkaterTalking(false)
            }
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            audio.pause()
            audio.currentTime = 0
            setIsPlaying(false)
            setIsPerforming(false)
            audioManager.setSkaterTalking(false)
        }
    }, [audio])

    useEffect(() => {
      window.setSkaterPerforming = setIsPerforming
      
      return () => {
        window.setSkaterPerforming = undefined
      }
    }, [])
  
    // Change dialog every few seconds when performing
    useEffect(() => {
      if (isPerforming) {
        const interval = setInterval(() => {
          setCurrentDialog((prev) => (prev + 1) % skaterDialogSequence.length)
        }, 4000)
        return () => clearInterval(interval)
      }
    }, [isPerforming])

    // Setup random falls
    useEffect(() => {
        const scheduleNextFall = () => {
            const nextFallTime = 5000 + Math.random() * 15000 // Random time between 5-20 seconds
            fallTimeoutRef.current = setTimeout(() => {
                if (!isPerforming) { // Don't fall during performance
                    setIsStumbling(true)
                    setTimeout(() => {
                        setIsStumbling(false)
                        setIsFalling(true)
                        setTimeout(() => {
                            setIsFalling(false)
                            scheduleNextFall()
                        }, 2000) // Stay fallen for 2 seconds
                    }, 1000) // Stumble for 1 second
                } else {
                    scheduleNextFall()
                }
            }, nextFallTime)
        }

        scheduleNextFall()
        return () => clearTimeout(fallTimeoutRef.current)
    }, [isPerforming])

    // Add random tricks effect
    useEffect(() => {
        const scheduleNextTrick = () => {
            const nextTrickTime = 8000 + Math.random() * 12000 // Random time between 8-20 seconds
            trickTimeoutRef.current = setTimeout(() => {
                if (!isPerforming && !isFalling && !isStumbling) {
                    // Randomly choose between jump and twirl
                    if (Math.random() > 0.5) {
                        setIsJumping(true)
                        setTimeout(() => setIsJumping(false), 1500)
                    } else {
                        setIsTwirling(true)
                        setTimeout(() => setIsTwirling(false), 2000)
                    }
                }
                scheduleNextTrick()
            }, nextTrickTime)
        }

        scheduleNextTrick()
        return () => clearTimeout(trickTimeoutRef.current)
    }, [isPerforming, isFalling, isStumbling])

  useFrame((state) => {
    if (skaterRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Mouth animation when talking
      if (mouthRef.current && isPerforming) {
        mouthRef.current.scale.y = 0.8 + Math.sin(time * 10) * 0.2
      }
      
      if (isFalling) {
        // Modified falling animation to stay visible above ice
        skaterRef.current.rotation.z = Math.PI / 2.5 // Less extreme tilt
        skaterRef.current.position.y = height + 0.2 // Keep slightly above ice surface
        skaterRef.current.rotation.x = Math.sin(time * 2) * 0.1 // Add slight wobble while fallen
      } else if (isStumbling) {
        // Stumbling animation
        skaterRef.current.rotation.z = Math.sin(time * 10) * 0.3
        skaterRef.current.position.y = height + Math.abs(Math.sin(time * 8) * 0.2)
      } else if (isPerforming) {
        // Special performance routine with spins and jumps
        const x = Math.sin(time * 0.5) * radius * Math.cos(time * 0.3)
        const z = Math.cos(time * 0.5) * radius * Math.sin(time * 0.3)
        const spin = time * 4
        const jump = Math.abs(Math.sin(time * 2)) * 0.5
        
        skaterRef.current.position.x = position[0] + x
        skaterRef.current.position.z = position[2] + z
        skaterRef.current.position.y = height + jump
        skaterRef.current.rotation.y = spin
        skaterRef.current.rotation.z = Math.sin(time * 2) * 0.3
      } else if (isJumping) {
        // Jumping animation
        const x = Math.sin(time * 0.5) * radius
        const z = Math.sin(time) * radius * 0.5
        const jumpHeight = Math.sin(time * 4) * 1.5 // Higher jump
        
        skaterRef.current.position.x = position[0] + x
        skaterRef.current.position.z = position[2] + z
        skaterRef.current.position.y = height + Math.max(0, jumpHeight)
        skaterRef.current.rotation.y += 0.2 // Rotation during jump
        skaterRef.current.rotation.z = Math.sin(time * 2) * 0.1
      } else if (isTwirling) {
        // Twirling animation
        const x = Math.sin(time * 0.5) * (radius * 0.5) // Tighter circle
        const z = Math.cos(time * 0.5) * (radius * 0.5)
        
        skaterRef.current.position.x = position[0] + x
        skaterRef.current.position.z = position[2] + z
        skaterRef.current.position.y = height + 0.2 // Slight lift
        skaterRef.current.rotation.y += 0.3 // Fast spin
        skaterRef.current.rotation.z = Math.sin(time * 4) * 0.2
      } else {
        // Regular figure-8 pattern
        const x = Math.sin(time * 0.5) * radius
        const z = Math.sin(time) * radius * 0.5
        
        skaterRef.current.position.x = position[0] + x
        skaterRef.current.position.z = position[2] + z
        skaterRef.current.position.y = height + Math.abs(Math.sin(time * 4) * 0.05)
        skaterRef.current.rotation.y = Math.atan2(x, z) + Math.PI
        skaterRef.current.rotation.z = Math.sin(time * 2) * 0.1 + Math.sin(time * 4) * 0.05
      }

      // Update bubble position to follow skater but ignore rotation
      setBubblePosition([
        skaterRef.current.position.x,
        skaterRef.current.position.y,
        skaterRef.current.position.z
      ])
    }
  })

  const currentDialogText = skaterDialogSequence[currentDialog]

  return (
    <>
      {/* Speech bubble rendered outside the rotating group */}
      {(isPerforming || isPlaying) && (
        <group position={bubblePosition}>
          <SpeechBubble text={skaterDialogSequence[currentDialog]} />
        </group>
      )}
      
      <group 
        ref={skaterRef} 
        position={position}
        onClick={handleClick}
        onPointerDown={handleClick} // Add this for better mobile support
      >
        {/* Remove speech bubble from here */}
        {/* Rest of skater mesh components */}
        {/* Dress */}
        <mesh position={[0, 0.7, 0]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial 
            color="#a0d8ff"
            emissive="#4080ff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Upper body */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
          <meshStandardMaterial color="#88c9ff" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ffd6b3" />
        </mesh>

        {/* Mouth - animated when talking */}
        <mesh 
          ref={mouthRef}
          position={[0, 1.35, 0.14]}
          scale={[0.04, 0.02, 0.01]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>

        {/* Hair */}
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#4a2f24" />
          </mesh>
        </group>

        {/* Arms */}
        <group>
          {[0.3, -0.3].map((x, i) => (
            <mesh key={i} position={[x, 1.1, 0]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
              <cylinderGeometry args={[0.06, 0.04, 0.4, 6]} />
              <meshStandardMaterial color="#88c9ff" />
            </mesh>
          ))}
        </group>

        {/* Legs/Skates */}
        {[0.1, -0.1].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[x, 0.1, 0.1]} rotation={[Math.PI/2, 0, 0]}>
              <boxGeometry args={[0.05, 0.15, 0.02]} />
              <meshStandardMaterial color="#C0C0C0" /> {/* Changed from "#silver" to "#C0C0C0" */}
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}
const IcePond = ({ position }) => {
  const iceRef = useRef()
  
  useFrame((state) => {
    if (iceRef.current) {
      // Subtle shimmer effect on ice
      iceRef.current.material.opacity = 0.6 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Ice surface with enhanced shimmer */}
      <mesh ref={iceRef} rotation={[-Math.PI/2, 0, 0]} position={[0, -1.95, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial 
          color="#b3e0ff"
          transparent
          opacity={0.8}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Brighter snow banks */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        return (
          <mesh 
            key={i} 
            position={[
              Math.cos(angle) * 4,
              -2,
              Math.sin(angle) * 4
            ]}
          >
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#404040"
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export const SkatingScene = () => {
  return (
    <group position={[-12, 0, -12]}>  {/* Moved further out and to the side */}
      <pointLight 
        position={[0, 5, 0]} 
        intensity={0.5} 
        color="#ffffff"
      />
      <IcePond position={[0, 0, 0]} />
      <Skater position={[0, 0, 0]} />
    </group>
  )
}
