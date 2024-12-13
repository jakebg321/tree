import { Html } from '@react-three/drei'
import { useState } from 'react'
import { audioManager } from './BackgroundMusic'

const playSkaterSpeech = () => {
  const audio = new Audio('/ice-skater-speech.mp3')
  audio.volume = 0.7
  audioManager.setSkaterTalking(true)
  
  audio.play()
  audio.onended = () => {
    audioManager.setSkaterTalking(false)
  }
}

const ViewButton = ({ label, position, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Html position={position} center>
      <button
        onClick={onClick}
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
        {label}
      </button>
    </Html>
  )
}

window.moveToView = (view) => {
  switch (view) {
    case 'snowman':
      window.snowmanView();
      break;
    case 'skater':
      window.skaterView();
      break;
    case 'crypto':
      window.cryptoView();
      break;
  }
}

export const SceneButtons = () => {
  return (
    <>
      {/* Position these above your scene elements */}
      <ViewButton 
        label="About Us" 
        position={[11, 2, -8]} // Above snowman battle
        onClick={() => window.moveToView('snowman')}
      />
      <ViewButton 
        label="Our Work" 
        position={[-12, 2, -12]} // Above ice skater
        onClick={() => {
          window.moveToView('skater')
          playSkaterSpeech()
        }}
      />
      <ViewButton 
        label="Crypto Address" 
        position={[-10, 0, 5]}
        onClick={() => window.moveToView('crypto')}
      />
      {/* Add more buttons as needed */}
    </>
  )
}