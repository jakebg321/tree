import React, { useState, useEffect } from 'react'
import { createTransactionSimulator } from './utils/transactionSimulator'

export const NavigationButtons = ({ simulatorRef }) => {
  const [audio] = useState(() => new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const buttonStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    margin: '0 5px'
  }

  const containerStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
    zIndex: 1000
  }

  useEffect(() => {
    audio.src = '/SPACETRAIN UNLIMITED - Christmas Wonderland.mp3'
    audio.loop = true
    
    audio.addEventListener('loadeddata', () => {
      audio.currentTime = 15
      setIsLoaded(true)
    })

    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= audio.duration - 15) {
        audio.currentTime = 15
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    // Initialize the transaction simulator if it doesn't exist
    if (!simulatorRef.current) {
      simulatorRef.current = createTransactionSimulator()
    }
  }, [simulatorRef])

  const togglePlay = () => {
    if (!isLoaded) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleGenerateBurst = () => {
    if (simulatorRef.current) {
      simulatorRef.current.generateBurst(10, 100) // Generate 10 transactions with 100ms interval
    }
  }

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => window.moveToView('default')}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        Home
      </button>
      <button
        style={buttonStyle}
        onClick={() => window.handleBack?.()}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        Back
      </button>
      <button
        style={buttonStyle}
        onClick={togglePlay}
        disabled={!isLoaded}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        {!isLoaded ? '🎵 Loading...' : isPlaying ? '🔇 Mute' : '🎵 Play'}
      </button>
      <button
        style={buttonStyle}
        onClick={handleGenerateBurst}
        onMouseEnter={e => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
        onMouseLeave={e => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
      >
        Generate 10
      </button>
    </div>
  )
}