import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'

export const BackgroundMusic = () => {
  const [audio] = useState(() => new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Set up audio
    audio.src = '/SPACETRAIN UNLIMITED - Christmas Wonderland.mp3'
    audio.loop = true
    
    // Set initial time when loaded
    audio.addEventListener('loadeddata', () => {
      audio.currentTime = 15 // Skip first 15 seconds instead of 10
      setIsLoaded(true)
    })

    // Handle loop timing
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= audio.duration - 15) { // Stop 15 seconds before end
        audio.currentTime = 15
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const togglePlay = () => {
    if (!isLoaded) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <Html position={[0, -3, 0]} center>
      <button
        onClick={togglePlay}
        disabled={!isLoaded}
        style={{
          padding: '10px 20px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: isPlaying ? '#ff4444' : '#44ff44',
          color: 'white',
          cursor: isLoaded ? 'pointer' : 'default',
          opacity: isLoaded ? 1 : 0.5,
          fontFamily: 'Arial',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {!isLoaded ? '🎵 Loading...' : 
         isPlaying ? '🔇 Mute Music' : '🎵 Play Music'}
      </button>
    </Html>
  )
}
