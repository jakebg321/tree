import type { NodeState, NodeType, TransactionSize } from '../types'
import * as THREE from 'three'

export class NodeManager {
  private baseNodes: Map<string, NodeState> = new Map()
  private transactionNodes: Map<string, NodeState> = new Map()
  private maxNodes: number = 10000
  private treeHeight: number = 8
  private baseWidth: number = 4
  private levels: number = 10
  private currentScale: number = 1

  constructor() {
    // Only initialize once
    if (this.baseNodes.size === 0) {
      this.initializeBaseNodes()
    }
  }

  private initializeBaseNodes() {
    console.log('Initializing base nodes...')
    const heightStep = this.treeHeight / (this.levels - 1)

    for (let level = 0; level < this.levels; level++) {
      const y = level * heightStep
      const levelWidth = this.baseWidth * (1 - (level / this.levels))
      // Increase number of nodes per level for more connection points
      const nodesInLevel = Math.max(8, Math.floor(16 * (1 - (level / this.levels))))
      
      console.log(`Creating level ${level} with ${nodesInLevel} nodes at height ${y}`)
      
      for (let i = 0; i < nodesInLevel; i++) {
        const angle = (i / nodesInLevel) * Math.PI * 2
        const x = Math.cos(angle) * levelWidth
        const z = Math.sin(angle) * levelWidth
        
        const node: NodeState = {
          id: `base-${level}-${i}`,
          position: [x, y, z],
          type: 'base',
          connections: new Set(),
          intensity: 0.5, // Reduced intensity for base nodes
          isAnimating: false
        }
        
        this.baseNodes.set(node.id, node)
      }
    }
    console.log(`Total base nodes created: ${this.baseNodes.size}`)
  }

  private calculateSurfacePosition(size: TransactionSize): [number, number, number] {
    // Random height between 0.1 and 0.9 of tree height, regardless of transaction size
    const heightPercent = 0.1 + Math.random() * 0.8
    const height = this.treeHeight * heightPercent * this.currentScale
    const levelWidth = this.baseWidth * (1 - (height / (this.treeHeight * this.currentScale))) * this.currentScale
    
    const angle = Math.random() * Math.PI * 2
    return [
      Math.cos(angle) * levelWidth,
      height,
      Math.sin(angle) * levelWidth
    ]
  }

  private calculateNodePosition(type: string, amount?: number): [number, number, number] {
    // Log the incoming parameters
    console.log('Calculating position for:', { type, amount })
    
    // Calculate height based on tree dimensions
    const height = this.treeHeight * this.currentScale
    
    // If it's a transaction, log the height calculation
    let y
    if (type === 'transaction') {
      y = amount && amount > 1000 ? 
        height * (0.2 + Math.random() * 0.3) :  // 20-50% up for large transactions
        height * (0.5 + Math.random() * 0.5)    // 50-100% up for small transactions
      console.log('Transaction Y position:', { amount, y, height })
    } else {
      y = height * Math.random()
      console.log('Regular node Y position:', { y, height })
    }

    // Calculate radius at this height
    const radius = this.baseWidth * (1 - y / height) * this.currentScale
    console.log('Radius at height:', { y, radius })

    // Calculate position on circle at this height
    const angle = Math.random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    console.log('Final position:', { x, y, z })

    return [x, y, z]
  }

  public handleTransaction(transaction: {
    id: string,
    amount: number,
    timestamp: number,
    type: string,
    sizeCategory: TransactionSize
  }): NodeState {
    console.log('Handling transaction:', transaction)
    
    // Log before creating new node
    console.log('Creating node with amount:', transaction.amount)

    if (this.transactionNodes.size >= this.maxNodes - this.baseNodes.size) {
      const oldest = Array.from(this.transactionNodes.values())
        .sort((a, b) => (a.transactionData?.timestamp || 0) - (b.transactionData?.timestamp || 0))[0]
      if (oldest) {
        this.transactionNodes.delete(oldest.id)
      }
    }

    this.updateScale()
    const position = this.calculateSurfacePosition(transaction.sizeCategory)
    
    const newNode: NodeState = {
      id: `tx-${transaction.id}`,
      position,
      type: 'transaction',
      transactionData: {
        amount: transaction.amount,
        size: transaction.sizeCategory,
        timestamp: transaction.timestamp
      },
      connections: new Set(),
      intensity: this.calculateIntensity(transaction.amount),
      isAnimating: true
    }

    this.transactionNodes.set(newNode.id, newNode)
    return newNode
  }

  private updateScale() {
    const totalNodes = this.getAllNodes().length
    const targetScale = Math.min(3, 1 + Math.log10(1 + totalNodes / 500))
    
    if (targetScale !== this.currentScale) {
      this.currentScale = targetScale
      this.updateNodePositions()
    }
  }

  private updateNodePositions() {
    [...this.baseNodes.values(), ...this.transactionNodes.values()].forEach(node => {
      const [x, y, z] = node.position
      const heightPercent = y / (this.treeHeight * this.currentScale)
      const radius = this.baseWidth * (1 - heightPercent) * this.currentScale
      const angle = Math.atan2(z, x)

      node.position = [
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ]
    })
  }

  private calculateIntensity(amount: number): number {
    return Math.min(0.9, 0.5 + (amount / 10000) * 0.4)
  }

  public getCurrentScale(): number {
    return this.currentScale
  }

  public getNodesForZoomLevel(zoomLevel: number): NodeState[] {
    const currentTime = Date.now()
    const recentThreshold = currentTime - 5000 // Last 5 seconds

    return [...this.baseNodes.values(), ...this.transactionNodes.values()].filter(node => {
      if (node.type === 'base') return true
      const timeSinceCreation = currentTime - (node.transactionData?.timestamp || 0)
      return node.transactionData?.amount! > 1000 || timeSinceCreation < recentThreshold
    })
  }

  public getAllNodes(): NodeState[] {
    return [...this.baseNodes.values(), ...this.transactionNodes.values()]
  }

  public getBaseNodes(): NodeState[] {
    return [...this.baseNodes.values()]
  }

  public getTransactionNodes(): NodeState[] {
    return [...this.transactionNodes.values()]
  }

  public getNodeById(id: string): NodeState | undefined {
    return this.baseNodes.get(id) || this.transactionNodes.get(id)
  }
}