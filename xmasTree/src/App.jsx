import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene/Scene'
import SnowBk from './snowBk'
import SnowBase from './SnowBase'
import { SantaSleigh } from './SantaSleigh'
import { PresentBase } from './PresentBase'
import { SkatingScene } from './IceSkater'
import ErrorBoundary from './ErrorBoundary'
import { SnowmanBattle } from './SnowmanBattle'
import { EnhancedCameraController } from './EnhancedCameraController'
import { SceneButtons } from './SceneButtons'
import { BackgroundMusic } from './components/BackgroundMusic'
import { NavigationButtons } from './NavigationButtons'
import SnowTerrain from './SnowTerrain';
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ErrorBoundary>
        <Canvas /* ... existing Canvas props ... */>
          <Suspense fallback={null}>
            <EnhancedCameraController />
            <SceneButtons />
            <ambientLight intensity={0.4} />
            <Scene />
            <SantaSleigh />
            <SnowBase />
            <PresentBase />
            <SkatingScene />
            <SnowmanBattle />
            <BackgroundMusic />
            <SnowTerrain />

          </Suspense>
        </Canvas>

        <NavigationButtons /> {/* Outside the Canvas */}

      </ErrorBoundary>
    </div>
  )
}