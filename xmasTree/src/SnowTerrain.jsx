const SnowTerrain = () => {
    return (
      <group position={[0, -2.05, 0]}>
        {/* Main snow surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40, 50, 50]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
  
        {/* Subtle sparkle overlay */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[40, 40, 50, 50]} />
          <meshStandardMaterial
            color="#e0f0ff"
            roughness={0.3}
            metalness={0.4}
            transparent
            opacity={0.2}
          />
        </mesh>
  
        {/* Snow drifts for additional depth */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const radius = 15 + Math.sin(angle * 3) * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 5) * 0.3,
                Math.sin(angle) * radius
              ]}
              rotation={[0, angle + Math.PI, 0]}
            >
              <cylinderGeometry args={[1.5 + Math.random(), 0.5, 0.4, 6]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
          )
        })}
      </group>
    );
  };
  
  export default SnowTerrain;