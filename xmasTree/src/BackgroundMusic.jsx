import { useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'

// Create a central audio manager
export const audioManager = {
  isSkaterTalking: false,
  setSkaterTalking: (isTalking) => {
    audioManager.isSkaterTalking = isTalking
    if (audioManager.backgroundMusic) {
      audioManager.backgroundMusic.volume = isTalking ? 0.05 : 0.15
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
  const [isPlaying, setIsPlaying] = useState(true)
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15
      audioManager.backgroundMusic = audioRef.current
      audioRef.current.currentTime = 10
      audioRef.current.play()

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current.currentTime >= audioRef.current.duration - 10) {
          audioRef.current.currentTime = 10
        }
      })
    }

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
        autoPlay
      />
      <Html position={[-1, -3, 0]}>
        <button
          onClick={togglePlay}
          style={{
            padding: '10px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </Html>
    </>
  )
}