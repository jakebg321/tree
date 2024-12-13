import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Node } from '../TreeNodes/Node'
import { Connection } from '../TreeNodes/Connection'
import { createTransactionSimulator } from '../../utils/transactionSimulator'
import { Html } from '@react-three/drei'
import { NodeManager } from '../../managers/NodeManager'
import { ConnectionManager } from '../../managers/ConnectionManager'

export default function ChristmasTree() {
  const nodeManager = useRef(new NodeManager())
  const connectionManager = useRef(new ConnectionManager())
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [simulationSpeed, setSimulationSpeed] = useState(1000)
  const simulatorRef = useRef(null)
  const { camera } = useThree()
  
  // Track zoom level for camera adjustment
  const [currentZoom, setCurrentZoom] = useState(8)
  
  // Adjust camera based on tree scale
  useFrame((state) => {
    const distance = camera.position.length()
    const nodeCount = nodeManager.current.getAllNodes().length
    const desiredZoom = Math.max(8, Math.min(20, 8 + Math.log10(1 + nodeCount / 100) * 5))
    
    if (Math.abs(desiredZoom - currentZoom) > 0.1) {
      setCurrentZoom(desiredZoom)
      camera.position.setLength(desiredZoom)
    }
  })

  // Update nodes and connections
  useEffect(() => {
    const updateVisuals = () => {
      const allNodes = nodeManager.current.getAllNodes()
      const allConnections = connectionManager.current.getAllConnections()
      
      setNodes(allNodes)
      setConnections(allConnections)
    }

    updateVisuals()
  }, [currentZoom])

  // Handle transactions
  useEffect(() => {
    simulatorRef.current = createTransactionSimulator({
      minInterval: simulationSpeed,
      maxInterval: simulationSpeed + 1000
    })

    const handleTransaction = (transaction) => {
      const newNode = nodeManager.current.handleTransaction(transaction)
      
      let newConnections = []
      // Only create connections for small transactions
      if (transaction.amount < 500) {
        console.log('Creating connections for small transaction:', transaction.amount)
        newConnections = connectionManager.current.createStringLightConnections(
          newNode,
          nodeManager.current.getAllNodes()
        )
      } else {
        console.log('Skipping connections for large transaction:', transaction.amount)
      }

      const allNodes = nodeManager.current.getAllNodes()
      const allConnections = [...connectionManager.current.getAllConnections()]
      
      setNodes(allNodes)
      setConnections(allConnections)
    }

    const unsubscribe = simulatorRef.current.addListener(handleTransaction)
    simulatorRef.current.start()

    return () => {
      simulatorRef.current.stop()
      unsubscribe()
    }
  }, [simulationSpeed])

  console.log('Rendering connections:', connections.length)

  return (
    <group>
      {/* Remove Controls component here */}
      
      {/* Base mesh structure */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={0}
            array={new Float32Array([])}
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Star */}
      <mesh position={[0, 8.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          position={node.position}
          size={node.type === 'transaction' ? 
            node.transactionData?.amount > 5000 ? 0.105 :  // Large transactions (reduced by 30% from 0.15)
            node.transactionData?.amount > 1000 ? 0.1 :    // Medium transactions
            0.06                                           // Small transactions
            : 0.06}
          intensity={node.intensity}
          color={
            node.type === 'transaction' ?
              node.transactionData?.amount > 5000 ? "#ffff00" :
              node.transactionData?.amount > 1000 ? "#ff00ff" : 
              "#00ffff"
            : "#00ffff"
          }
          isPulsing={node.type === 'transaction' && 
            Date.now() - (node.transactionData?.timestamp || 0) < 5000}
          isBitcoin={node.type === 'transaction' && 
            node.transactionData?.amount > 1000}
          transactionValue={node.type === 'transaction' ? 
            node.transactionData?.amount : 0}
        />
      ))}

      {/* Connections */}
      {connections.map(conn => {
        console.log('Connection data:', conn)
        return (
          <Connection
            key={conn.id}
            start={conn.start}
            end={conn.end}
            intensity={conn.intensity}
            animated={conn.animated}
            color={conn.intensity > 0.7 ? "#ffffff" : "#00ffff"}
            pulseSpeed={conn.animated ? 2 : 1}
          />
        )
      })}
    </group>
  )
}

// Remove the Controls component definition