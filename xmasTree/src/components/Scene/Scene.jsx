import { OrbitControls, Environment } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import ChristmasTree from './ChristmasTree'
import SnowBk from '../../snowBk'
import SnowBase from '../../SnowBase'

export default function Scene() {
  const orbitControlsRef = useRef()

  useEffect(() => {
    window.orbitControlsRef = orbitControlsRef;
  }, []);

  return (
    <>
      <color attach="background" args={['#000']} />
      <Environment preset="night" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <ChristmasTree />
      <SnowBk />
      <SnowBase />
      
      <OrbitControls 
        ref={orbitControlsRef}
        enablePan={false}
        maxDistance={20} // Increased from 15 to allow zooming out further
        minDistance={4}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.65} // Increased from Math.PI / 2 to allow higher viewing angle
        makeDefault
      />
    </>
  )
}
