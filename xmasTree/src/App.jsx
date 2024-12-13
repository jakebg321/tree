import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene/Scene'
import SnowBk from './snowBk'
import SnowBase from './SnowBase'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ErrorBoundary>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          camera={{ 
            position: [0, 2, 8], 
            fov: 75 
          }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}