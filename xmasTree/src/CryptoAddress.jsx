
// CryptoAddress.jsx
import { useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export const CryptoAddressDisplay = () => {
  const [copied, setCopied] = useState(false)
  const glowRef = useRef()
  const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useFrame((state) => {
    if (glowRef.current) {
      const time = state.clock.getElapsedTime()
      // Sync glow with elf hammering
      glowRef.current.style.boxShadow = `0 0 ${10 + Math.sin(time * 8) * 5}px #00ffff`
    }
  })

  return (
    <Html position={[0, 1.5, 0]} center transform>
      <div 
        ref={glowRef}
        className="p-4 backdrop-blur-md bg-black/90 rounded-xl border border-cyan-500/30 shadow-lg"
        style={{ transform: 'scale(0.5)' }}
      >
        <div className="text-lg text-cyan-400 mb-2">Contract Address</div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm text-cyan-300 bg-black/50 p-2 rounded overflow-hidden">
            {address.split('').map((char, i) => (
              <span 
                key={i}
                className="inline-block"
                style={{
                  animation: `glow 1s ${i * 0.1}s infinite`,
                  opacity: 0.7 + Math.random() * 0.3
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all transform hover:scale-105 text-white font-bold"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px #00ffff; }
          50% { text-shadow: 0 0 10px #00ffff; }
        }
      `}</style>
    </Html>
  )
}