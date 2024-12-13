import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { NodeManager } from './managers/NodeManager'

const VIEWPOINTS = {
  default: {
    position: new THREE.Vector3(0, 4, 12),
    target: new THREE.Vector3(0, 0, 0),
    onEnter: () => {
      window.setSkaterPerforming?.(false)
      window.setSnowmanPerforming?.(false)
    }
  },
  skater: {
    position: new THREE.Vector3(-14, 3, -8),
    target: new THREE.Vector3(-12, 0, -12),
    onEnter: () => {
      window.setSkaterPerforming?.(true)
    },
    onLeave: () => {
      window.setSkaterPerforming?.(false)
    }
  },
  snowman: {
    position: new THREE.Vector3(13, 3, -4),
    target: new THREE.Vector3(11, 0, -8),
    onEnter: () => {
      window.setSnowmanPerforming?.(true)
    },
    onLeave: () => {
      window.setSnowmanPerforming?.(false)
    }
  }
}

export const EnhancedCameraController = ({ simulatorRef }) => {
  const { camera, controls } = useThree()
  const [currentView, setCurrentView] = useState('default')
  const [transitioning, setTransitioning] = useState(false)
  const [lastTarget, setLastTarget] = useState(new THREE.Vector3())
  const [viewHistory, setViewHistory] = useState(['default'])

  const moveToView = (viewName) => {
    if (transitioning || !VIEWPOINTS[viewName]) return
    
    VIEWPOINTS[currentView]?.onLeave?.()
    
    setTransitioning(true)
    setCurrentView(viewName)
    setViewHistory(prev => [...prev, viewName])

    const startPos = camera.position.clone()
    const startTarget = lastTarget.clone()
    const endPos = VIEWPOINTS[viewName].position.clone()
    const endTarget = VIEWPOINTS[viewName].target.clone()

    setLastTarget(endTarget)
    
    let startTime = Date.now()
    const duration = 1500

    function animate() {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3)

      // Update camera position
      camera.position.lerpVectors(startPos, endPos, eased)
      
      // Update target for both camera and orbit controls
      const tempTarget = new THREE.Vector3()
      tempTarget.lerpVectors(startTarget, endTarget, eased)
      camera.lookAt(tempTarget)

      // Update OrbitControls target
      if (window.orbitControlsRef?.current) {
        window.orbitControlsRef.current.target.copy(tempTarget)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Ensure final position and target are exact
        camera.position.copy(endPos)
        camera.lookAt(endTarget)
        if (window.orbitControlsRef?.current) {
          window.orbitControlsRef.current.target.copy(endTarget)
          window.orbitControlsRef.current.update()
        }
        setTransitioning(false)
        VIEWPOINTS[viewName]?.onEnter?.()
      }
    }

    animate()
  }

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory]
      newHistory.pop() // Remove current view
      const previousView = newHistory[newHistory.length - 1]
      setViewHistory(newHistory)
      moveToView(previousView)
    }
  }

  // Initialize camera and lastTarget
  useEffect(() => {
    if (camera) {
      camera.position.copy(VIEWPOINTS.default.position)
      camera.lookAt(VIEWPOINTS.default.target)
      setLastTarget(VIEWPOINTS.default.target)
      
      // Initialize orbit controls target
      if (window.orbitControlsRef?.current) {
        window.orbitControlsRef.current.target.copy(VIEWPOINTS.default.target)
        window.orbitControlsRef.current.update()
      }
    }
  }, [camera])

  // Expose moveToView and handleBack functions
  useEffect(() => {
    window.moveToView = moveToView
    window.handleBack = handleBack

    return () => {
      delete window.moveToView
      delete window.handleBack
    }
  }, [])

  useEffect(() => {
    const nodeManager = new NodeManager()

    // Subscribe to transaction events
    const unsubscribe = simulatorRef.current?.addListener((transaction) => {
      const node = nodeManager.handleTransaction(transaction)
      // You can add additional visualization logic here
      console.log('New transaction node:', node)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [simulatorRef])

  return null
}