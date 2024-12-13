import { OrbitControls, Environment } from '@react-three/drei'
import ChristmasTree from './ChristmasTree'
import SnowBk from '../../snowBk'
import SnowBase from '../../SnowBase'


export default function Scene() {
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
        enablePan={false}
        maxDistance={15}
        minDistance={4}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}