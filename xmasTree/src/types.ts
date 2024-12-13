// src/types.ts
export type NodeType = 'base' | 'transaction'
export type TransactionSize = 'small' | 'medium' | 'large'

export interface NodeState {
  id: string
  position: [number, number, number]
  type: NodeType
  transactionData?: {
    amount: number
    size: TransactionSize
    timestamp: number
  }
  connections: Set<string>
  intensity: number
  isAnimating: boolean
}

export interface ConnectionState {
  id: string
  startId: string
  endId: string
  intensity: number
  animated: boolean
  start: [number, number, number]
  end: [number, number, number]
}