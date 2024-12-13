import { useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'

// Create a central audio manager
export const audioManager = {
  isSkaterTalking: false,
  setSkaterTalking: (isTalking) => {
    audioManager.isSkaterTalking = isTalking
    if (audioManager.backgroundMusic) {
      audioManager.backgroundMusic.volume = isTalking ? 0.1 : 0.3
    }
  },
  backgroundMusic: null,
  adjustBackgroundVolume: (volume) => {
    if (audioManager.backgroundMusic) {
      audioManager.backgroundMusic.volume = volume
    }
  }
}

export const BackgroundMusic = () => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true) // Default to true for autoplay
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3 // Set initial volume to 30%
      audioManager.backgroundMusic = audioRef.current
      
      // Start playing automatically
      audioRef.current.currentTime = 10
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay prevented:", error)
          setIsPlaying(false)
        })
      }

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current.currentTime >= audioRef.current.duration - 10) {
          audioRef.current.currentTime = 10
        }
      })
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioManager.backgroundMusic = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/SPACETRAIN UNLIMITED - Christmas Wonderland.mp3"
        loop
        style={{ display: 'none' }}
      />
      <Html position={[-1, -3, 0]}>
        <button
          onClick={togglePlay}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: isPlaying ? '#ff4444' : '#44ff44',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'Arial',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {isPlaying ? '🔇 Mute Music' : '🎵 Play Music'}
        </button>
      </Html>
    </>
  )
}