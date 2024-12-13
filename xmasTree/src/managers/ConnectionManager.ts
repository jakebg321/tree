import type { ConnectionState, NodeState } from '../types'
import * as THREE from 'three'

export class ConnectionManager {
  private connections: Map<string, ConnectionState> = new Map()
  private maxConnectionsPerNode: number = 4
  private treeHeight: number = 8
  private baseWidth: number = 4
  private currentScale: number = 1

  private findNearbyNodes(node: NodeState, allNodes: NodeState[]): NodeState[] {
    const nodePosition = new THREE.Vector3(...node.position)
    
    // Calculate the radius at node's height
    const nodeHeight = node.position[1]
    const nodeRadius = this.baseWidth * (1 - nodeHeight / (this.treeHeight * this.currentScale)) * this.currentScale
    
    const validNodes = allNodes.filter(n => {
      // Skip self
      if (n.id === node.id) return false;
      
      // Allow more connections per node
      if (n.connections.size >= 3) return false;
      
      // For transactions, only consider small ones
      if (n.type === 'transaction' && n.transactionData?.amount! >= 500) return false;

      // Increased height difference tolerance
      const heightDiff = Math.abs(n.position[1] - nodeHeight);
      if (heightDiff > 1.2) return false;  // Increased from 0.8

      // Calculate angular difference for wrapping around tree
      const angle1 = Math.atan2(node.position[2], node.position[0]);
      const angle2 = Math.atan2(n.position[2], n.position[0]);
      let angleDiff = Math.abs(angle1 - angle2);
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }
      
      // More lenient angle difference
      if (angleDiff > Math.PI * 0.75) return false;  // Increased from Math.PI/2

      // Check if connection would follow surface
      return this.isValidSurfacePath(node.position, n.position);
    });

    // Sort by score and take up to 3 closest nodes
    return validNodes
      .map(n => ({
        node: n,
        score: this.calculateConnectionScore(node, n)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)  // Increased from 2
      .map(({node}) => node);
  }

  private isValidSurfacePath(start: [number, number, number], end: [number, number, number]): boolean {
    // Check 3 points along the path to ensure they stay near the surface
    const checkPoints = [0.25, 0.5, 0.75];
    
    for (const t of checkPoints) {
      // Interpolate position
      const y = start[1] + (end[1] - start[1]) * t;
      
      // Calculate expected radius at this height
      const expectedRadius = this.baseWidth * (1 - y / (this.treeHeight * this.currentScale)) * this.currentScale;
      
      // Calculate actual position
      const x = start[0] + (end[0] - start[0]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      const actualRadius = Math.sqrt(x * x + z * z);
      
      // Check if point is too far from expected surface
      const tolerance = 0.3 * this.currentScale;
      if (Math.abs(actualRadius - expectedRadius) > tolerance) {
        return false;
      }
    }
    
    return true;
  }

  private calculateConnectionScore(node1: NodeState, node2: NodeState): number {
    const pos1 = new THREE.Vector3(...node1.position);
    const pos2 = new THREE.Vector3(...node2.position);
    
    // Base score on distance
    const distance = pos1.distanceTo(pos2);
    let score = 1 / (distance + 0.1);
    
    // Less weight on height difference
    const heightDiff = Math.abs(node1.position[1] - node2.position[1]);
    score *= 1 - (heightDiff / (this.treeHeight * 2));
    
    // Encourage connections between different types of nodes
    if (node1.type !== node2.type) {
      score *= 1.5;
    }
    
    return score;
  }

  private areSurfaceConnectable(pos1: [number, number, number], pos2: [number, number, number]): boolean {
    // Make surface connection check more lenient
    const [x1, y1, z1] = pos1
    const [x2, y2, z2] = pos2
    const radius1 = Math.sqrt(x1 * x1 + z1 * z1)
    const radius2 = Math.sqrt(x2 * x2 + z2 * z2)
    
    const expectedRadius1 = this.baseWidth * (1 - y1 / (this.treeHeight * this.currentScale)) * this.currentScale
    const expectedRadius2 = this.baseWidth * (1 - y2 / (this.treeHeight * this.currentScale)) * this.currentScale
    
    // Increased tolerance
    const tolerance = 0.3 * this.currentScale
    return Math.abs(radius1 - expectedRadius1) < tolerance && 
           Math.abs(radius2 - expectedRadius2) < tolerance
  }

  public createConnectionsForNode(newNode: NodeState, allNodes: NodeState[]): ConnectionState[] {
    // Only create connections for small transactions
    if (newNode.type === 'transaction' && newNode.transactionData?.amount! >= 500) {
      console.log('Skipping connections for large transaction');
      return [];
    }

    console.log('Creating connections for node:', newNode.id);
    const nearbyNodes = this.findNearbyNodes(newNode, allNodes)
    console.log('Found nearby nodes:', nearbyNodes.length);

    const newConnections: ConnectionState[] = []

    nearbyNodes.forEach(targetNode => {
      const connection = {
        id: `conn-${newNode.id}-${targetNode.id}`,
        startId: newNode.id,
        endId: targetNode.id,
        start: newNode.position,
        end: targetNode.position,
        intensity: 0.8,
        animated: true
      }
      
      console.log('Created connection:', connection.id);
      newConnections.push(connection)
      this.connections.set(connection.id, connection)
      
      newNode.connections.add(targetNode.id)
      targetNode.connections.add(newNode.id)
    })

    return newConnections
  }

  private createConnection(startNode: NodeState, endNode: NodeState): ConnectionState {
    // Calculate base intensity with proximity consideration
    let baseIntensity = this.calculateIntensity(startNode, endNode)
    const distance = new THREE.Vector3(...startNode.position)
      .distanceTo(new THREE.Vector3(...endNode.position))
    
    if (distance < 2.0) {
      baseIntensity = Math.min(0.9, baseIntensity * (1.2 - distance * 0.1))
    }

    return {
      id: `conn-${startNode.id}-${endNode.id}`,
      startId: startNode.id,
      endId: endNode.id,
      start: startNode.position,
      end: endNode.position,
      intensity: baseIntensity,
      animated: startNode.type === 'transaction' || endNode.type === 'transaction'
    }
  }

  private calculateIntensity(startNode: NodeState, endNode: NodeState): number {
    if (startNode.type === 'transaction' || endNode.type === 'transaction') {
      const transNode = startNode.type === 'transaction' ? startNode : endNode
      const amount = transNode.transactionData?.amount || 0
      return Math.min(0.9, 0.6 + (amount / 10000) * 0.3)
    }
    return 0.5
  }

  public getVisibleConnections(zoomLevel: number): ConnectionState[] {
    const currentTime = Date.now()
    const recentThreshold = currentTime - 5000

    return [...this.connections.values()].filter(conn => {
      const startNode = conn.startId.startsWith('tx-')
      const endNode = conn.endId.startsWith('tx-')
      return !startNode && !endNode || conn.animated
    })
  }

  public updateScale(scale: number) {
    this.currentScale = scale
  }

  public getAllConnections(): ConnectionState[] {
    return [...this.connections.values()]
  }

  public removeConnectionsForNode(nodeId: string) {
    const connectionsToRemove = [...this.connections.values()]
      .filter(conn => conn.startId === nodeId || conn.endId === nodeId)
    
    connectionsToRemove.forEach(conn => {
      this.connections.delete(conn.id)
    })
  }

  public updateConnectionPositions(nodes: Map<string, NodeState>) {
    this.connections.forEach(connection => {
      const startNode = nodes.get(connection.startId)
      const endNode = nodes.get(connection.endId)
      
      if (startNode && endNode) {
        connection.start = startNode.position
        connection.end = endNode.position
      }
    })
  }

  private findNextInChain(node: NodeState, allNodes: NodeState[], excludeIds: Set<string>): NodeState | null {
    const nodePosition = new THREE.Vector3(...node.position)
    
    const candidates = allNodes
      .filter(other => {
        if (excludeIds.has(other.id)) return false
        if (other.type === 'transaction') return false
        if (other.connections.size >= 2) return false

        const otherPosition = new THREE.Vector3(...other.position)
        const distance = nodePosition.distanceTo(otherPosition)
        
        // Reduce maximum distance for tighter chains
        return distance < this.currentScale * 0.5 && 
               this.areSurfaceConnectable(node.position, other.position)
      })
      .map(other => ({
        node: other,
        distance: nodePosition.distanceTo(new THREE.Vector3(...other.position))
      }))
      .sort((a, b) => a.distance - b.distance)

    return candidates.length > 0 ? candidates[0].node : null
  }

  private calculateChainScore(node1: NodeState, node2: NodeState): number {
    const pos1 = new THREE.Vector3(...node1.position)
    const pos2 = new THREE.Vector3(...node2.position)
    const distance = pos1.distanceTo(pos2)
    
    // Prefer nodes that create a nice curve around the tree
    const angleScore = this.calculateAngleScore(node1.position, node2.position)
    
    return (1 / (distance + 0.1)) * angleScore
  }

  private calculateAngleScore(pos1: [number, number, number], pos2: [number, number, number]): number {
    const [x1, _, z1] = pos1
    const [x2, __, z2] = pos2
    const angle1 = Math.atan2(z1, x1)
    const angle2 = Math.atan2(z2, x2)
    const angleDiff = Math.abs(angle1 - angle2)
    
    // Prefer connections that follow the curve of the tree
    return angleDiff < Math.PI / 4 ? 1.5 : 1.0
  }

  public createStringLightConnections(node: NodeState, allNodes: NodeState[]): ConnectionState[] {
    if (node.type === 'transaction' && node.transactionData?.amount! >= 500) {
      console.log('Skipping string lights for large transaction');
      return [];
    }

    console.log('Creating string light connections for:', {
      nodeId: node.id,
      type: node.type,
      amount: node.transactionData?.amount
    });

    const nearbyNodes = this.findNearbyNodes(node, allNodes);
    const newConnections: ConnectionState[] = [];

    nearbyNodes.forEach(targetNode => {
      const connection = {
        id: `string-${node.id}-${targetNode.id}`,
        startId: node.id,
        endId: targetNode.id,
        start: node.position,
        end: targetNode.position,
        intensity: 1.0, // Maximum intensity for visibility
        animated: true
      };

      console.log('Created connection:', {
        id: connection.id,
        start: connection.start,
        end: connection.end
      });

      newConnections.push(connection);
      this.connections.set(connection.id, connection);
      
      node.connections.add(targetNode.id);
      targetNode.connections.add(node.id);
    });

    console.log(`Created ${newConnections.length} new connections`);
    return newConnections;
  }
}