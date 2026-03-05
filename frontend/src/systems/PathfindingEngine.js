/**
 * PathfindingEngine - A* pathfinding algorithm implementation
 * 
 * Finds optimal paths through the navigation mesh using A* algorithm
 * with Euclidean distance heuristic.
 */

class PathfindingEngine {
  constructor(navigationMesh) {
    this.navMesh = navigationMesh;
    this.maxIterations = 1000; // Prevent infinite loops
  }

  /**
   * Find path from start to goal using A* algorithm
   * @param {number} startX - Start world X coordinate
   * @param {number} startZ - Start world Z coordinate
   * @param {number} goalX - Goal world X coordinate
   * @param {number} goalZ - Goal world Z coordinate
   * @returns {Array<{x: number, z: number}>|null} - Array of waypoints or null if no path
   */
  findPath(startX, startZ, goalX, goalZ) {
    // Convert to grid coordinates
    const startGrid = this.navMesh.worldToGrid(startX, startZ);
    const goalGrid = this.navMesh.worldToGrid(goalX, goalZ);
    
    // Check if start and goal are walkable
    if (!this.navMesh.isWalkable(startX, startZ)) {
      console.warn('Start position is not walkable');
      return null;
    }
    
    if (!this.navMesh.isWalkable(goalX, goalZ)) {
      console.warn('Goal position is not walkable');
      return null;
    }
    
    // A* algorithm
    const openSet = new MinHeap();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = this.gridKey(startGrid.x, startGrid.z);
    const goalKey = this.gridKey(goalGrid.x, goalGrid.z);
    
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startGrid.x, startGrid.z, goalGrid.x, goalGrid.z));
    
    openSet.insert({
      x: startGrid.x,
      z: startGrid.z,
      f: fScore.get(startKey)
    });
    
    let iterations = 0;
    
    while (!openSet.isEmpty() && iterations < this.maxIterations) {
      iterations++;
      
      const current = openSet.extractMin();
      const currentKey = this.gridKey(current.x, current.z);
      
      // Goal reached
      if (currentKey === goalKey) {
        return this.reconstructPath(cameFrom, current, startGrid, goalGrid);
      }
      
      closedSet.add(currentKey);
      
      // Check neighbors
      const neighbors = this.navMesh.getNeighbors(current.x, current.z);
      
      for (const neighbor of neighbors) {
        const neighborKey = this.gridKey(neighbor.x, neighbor.z);
        
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        const tentativeGScore = gScore.get(currentKey) + neighbor.cost;
        
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          
          const h = this.heuristic(neighbor.x, neighbor.z, goalGrid.x, goalGrid.z);
          const f = tentativeGScore + h;
          fScore.set(neighborKey, f);
          
          openSet.insert({
            x: neighbor.x,
            z: neighbor.z,
            f: f
          });
        }
      }
    }
    
    // No path found
    if (iterations >= this.maxIterations) {
      console.warn('Pathfinding exceeded max iterations');
    }
    
    return null;
  }

  /**
   * Heuristic function (Euclidean distance)
   * @param {number} x1 - Start X
   * @param {number} z1 - Start Z
   * @param {number} x2 - Goal X
   * @param {number} z2 - Goal Z
   * @returns {number}
   */
  heuristic(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Reconstruct path from A* result
   * @private
   */
  reconstructPath(cameFrom, current, startGrid, goalGrid) {
    const path = [];
    let node = current;
    
    // Build path backwards
    while (node) {
      const worldPos = this.navMesh.gridToWorld(node.x, node.z);
      path.unshift({ x: worldPos.x, z: worldPos.z });
      
      const key = this.gridKey(node.x, node.z);
      node = cameFrom.get(key);
    }
    
    // Validate path
    if (!this.validatePath(path)) {
      console.warn('Generated path contains non-walkable waypoints');
      return null;
    }
    
    return path;
  }

  /**
   * Validate that all waypoints in path are walkable
   * @param {Array<{x: number, z: number}>} path
   * @returns {boolean}
   */
  validatePath(path) {
    for (const waypoint of path) {
      if (!this.navMesh.isWalkable(waypoint.x, waypoint.z)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Create unique key for grid position
   * @private
   */
  gridKey(x, z) {
    return `${x},${z}`;
  }

  /**
   * Simplify path by removing redundant waypoints
   * Uses line-of-sight checks to remove intermediate points
   * @param {Array<{x: number, z: number}>} path
   * @param {number} tolerance - Distance tolerance for simplification
   * @returns {Array<{x: number, z: number}>}
   */
  simplifyPath(path, tolerance = 0.5) {
    if (path.length <= 2) {
      return path;
    }
    
    const simplified = [path[0]];
    let current = 0;
    
    while (current < path.length - 1) {
      let farthest = current + 1;
      
      // Find farthest visible point
      for (let i = current + 2; i < path.length; i++) {
        if (this.isLineOfSight(path[current], path[i])) {
          farthest = i;
        } else {
          break;
        }
      }
      
      simplified.push(path[farthest]);
      current = farthest;
    }
    
    return simplified;
  }

  /**
   * Check if there's line of sight between two points
   * Uses Bresenham's line algorithm
   * @param {{x: number, z: number}} p1
   * @param {{x: number, z: number}} p2
   * @returns {boolean}
   */
  isLineOfSight(p1, p2) {
    const grid1 = this.navMesh.worldToGrid(p1.x, p1.z);
    const grid2 = this.navMesh.worldToGrid(p2.x, p2.z);
    
    // Bresenham's line algorithm
    let x0 = grid1.x;
    let z0 = grid1.z;
    const x1 = grid2.x;
    const z1 = grid2.z;
    
    const dx = Math.abs(x1 - x0);
    const dz = Math.abs(z1 - z0);
    const sx = x0 < x1 ? 1 : -1;
    const sz = z0 < z1 ? 1 : -1;
    let err = dx - dz;
    
    while (true) {
      // Check if current cell is walkable
      if (!this.navMesh.isValidGridPosition(x0, z0) || !this.navMesh.grid[z0][x0]) {
        return false;
      }
      
      if (x0 === x1 && z0 === z1) {
        break;
      }
      
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        z0 += sz;
      }
    }
    
    return true;
  }

  /**
   * Smooth path using Catmull-Rom spline interpolation
   * @param {Array<{x: number, z: number}>} path
   * @param {number} segments - Number of segments between waypoints
   * @returns {Array<{x: number, z: number}>}
   */
  smoothPath(path, segments = 5) {
    if (path.length <= 2) {
      return path;
    }
    
    const smoothed = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const p0 = i > 0 ? path[i - 1] : path[i];
      const p1 = path[i];
      const p2 = path[i + 1];
      const p3 = i < path.length - 2 ? path[i + 2] : path[i + 1];
      
      for (let t = 0; t < segments; t++) {
        const u = t / segments;
        const point = this.catmullRom(p0, p1, p2, p3, u);
        
        // Only add if walkable
        if (this.navMesh.isWalkable(point.x, point.z)) {
          smoothed.push(point);
        }
      }
    }
    
    // Add final point
    smoothed.push(path[path.length - 1]);
    
    return smoothed;
  }

  /**
   * Catmull-Rom spline interpolation
   * @private
   */
  catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    );
    
    const z = 0.5 * (
      (2 * p1.z) +
      (-p0.z + p2.z) * t +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
    );
    
    return { x, z };
  }
}

/**
 * MinHeap implementation for A* open set
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(node) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].f >= this.heap[parentIndex].f) break;
      
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < this.heap.length && this.heap[leftChild].f < this.heap[smallest].f) {
        smallest = leftChild;
      }
      
      if (rightChild < this.heap.length && this.heap[rightChild].f < this.heap[smallest].f) {
        smallest = rightChild;
      }
      
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

export default PathfindingEngine;
