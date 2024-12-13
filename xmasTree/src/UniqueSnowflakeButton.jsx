import { Html } from '@react-three/drei'
import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const snowflakeEventBus = {
  listeners: new Set(),
  emit(snowflake) {
    this.listeners.forEach(listener => listener(snowflake))
  },
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

const generateUniquePattern = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  
  ctx.clearRect(0, 0, 128, 128)
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  
  // Generate random parameters
  const armCount = 6 + Math.floor(Math.random() * 4) // 6-9 arms
  const armLength = 15 + Math.random() * 20
  const branchCount = 1 + Math.floor(Math.random() * 4)
  const branchLength = 5 + Math.random() * 12
  const branchAngle = Math.PI / 4 + (Math.random() - 0.5) * (Math.PI / 4)
  const hasInnerDetail = Math.random() > 0.5
  
  // Draw main arms and branches
  for (let i = 0; i < armCount; i++) {
    ctx.save()
    ctx.translate(64, 64)
    ctx.rotate((i * 2 * Math.PI) / armCount)
    
    // Main arm
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, armLength)
    ctx.stroke()
    
    // Optional inner detail
    if (hasInnerDetail) {
      ctx.beginPath()
      ctx.arc(0, armLength/2, 2, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    // Branches
    for (let j = 0; j < branchCount; j++) {
      const branchPosition = (j + 1) * armLength / (branchCount + 1)
      ctx.save()
      ctx.translate(0, branchPosition)
      
      // Right branch
      ctx.rotate(branchAngle)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, branchLength)
      ctx.stroke()
      
      // Left branch
      ctx.rotate(-branchAngle * 2)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, branchLength)
      ctx.stroke()
      
      ctx.restore()
    }
    
    ctx.restore()
  }
  
  return canvas.toDataURL()
}

// Separate Modal component
const SnowflakeModal = ({ snowflake, onClose }) => {
  if (!snowflake) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '10px',
      border: '2px solid white',
      color: 'white',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <h3>Your Unique Snowflake</h3>
      <img 
        src={snowflake.pattern} 
        alt="Your unique snowflake"
        style={{ width: '150px', height: '150px', marginTop: '10px' }}
      />
      <p>Snowflake ID: {snowflake.id}</p>
    </div>
  )
}

export const UniqueSnowflakeButton = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [currentSnowflake, setCurrentSnowflake] = useState(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  
  // Check localStorage for previous generation
  useEffect(() => {
    const hasGeneratedBefore = localStorage.getItem('hasGeneratedSnowflake')
    if (hasGeneratedBefore) {
      setHasGenerated(true)
    }
  }, [])

  const generateSnowflake = useCallback(() => {
    const id = uuidv4().slice(0, 8)
    const pattern = generateUniquePattern()
    const newSnowflake = { id, pattern }
    
    setCurrentSnowflake(newSnowflake)
    setHasGenerated(true)
    localStorage.setItem('hasGeneratedSnowflake', 'true')
    snowflakeEventBus.emit(newSnowflake)
    
    // Clear the modal after 5 seconds
    setTimeout(() => {
      setCurrentSnowflake(null)
    }, 5000)
  }, [])

  return (
    <>
      {/* Button */}
      {!hasGenerated && (
        <Html position={[0, 4, 0]} center>
          <button
            onClick={generateSnowflake}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: isHovered ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              border: '2px solid white',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            Generate Your Unique Snowflake
          </button>
        </Html>
      )}
      
      {/* Modal - rendered separately from button */}
      {currentSnowflake && (
        <Html fullscreen>
          <SnowflakeModal 
            snowflake={currentSnowflake} 
            onClose={() => setCurrentSnowflake(null)} 
          />
        </Html>
      )}
    </>
  )
}