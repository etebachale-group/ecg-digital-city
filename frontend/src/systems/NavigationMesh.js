/**
 * NavigationMesh - Grid-based navigation mesh for pathfinding
 * 
 * Creates a 2D grid representation of the world for A* pathfinding.
 * Supports dynamic obstacle updates and 8-directional movement.
 */

class NavigationMesh {
  constructor(worldBounds, cellSize = 0.5) {
    // Handle both formats: { min, max } or { minX, maxX, minZ, maxZ }
    if (worldBounds.min !== undefined && worldBounds.max !== undefined) {
      this.worldBounds = {
        minX: worldBounds.min,
        maxX: worldBounds.max,
        minZ: worldBounds.min,
        maxZ: worldBounds.max
      };
    } else {
      this.worldBounds = worldBounds;
    }
    
    this.cellSize = Math.max(0.1, cellSize); // Ensure positive cellSize
    this.grid = null;
    this.width = 0;
    this.height = 0;
    
    this.createGrid();
  }

  /**
   * Create the navigation grid
   */
  createGrid() {
    const { minX, maxX, minZ, maxZ } = this.worldBounds;
    
    // Validate bounds
    if (minX >= maxX || minZ >= maxZ) {
      console.error('Invalid world bounds:', this.worldBounds);
      this.width = 100;
      this.height = 100;
    } else {
      this.width = Math.ceil((maxX - minX) / this.cellSize);
      this.height = Math.ceil((maxZ - minZ) / this.cellSize);
    }
    
    // Clamp dimensions to reasonable values
    this.width = Math.max(1, Math.min(this.width, 10000));
    this.height = Math.max(1, Math.min(this.height, 10000));
    
    // Initialize grid with all cells walkable
    this.grid = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(true)
    );
  }

  /**
   * Mark a cell or area as obstacle (non-walkable)
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @param {number} radius - Optional radius for circular obstacles
   */
  markObstacle(x, z, radius = 0) {
    if (radius === 0) {
      // Single cell
      const gridPos = this.worldToGrid(x, z);
      if (this.isValidGridPosition(gridPos.x, gridPos.z)) {
        this.grid[gridPos.z][gridPos.x] = false;
      }
    } else {
      // Circular area
      const centerGrid = this.worldToGrid(x, z);
      const radiusCells = Math.ceil(radius / this.cellSize);
      
      for (let dz = -radiusCells; dz <= radiusCells; dz++) {
        for (let dx = -radiusCells; dx <= radiusCells; dx++) {
          const gx = centerGrid.x + dx;
          const gz = centerGrid.z + dz;
          
          // Check if within radius
          const distance = Math.sqrt(dx * dx + dz * dz) * this.cellSize;
          if (distance <= radius && this.isValidGridPosition(gx, gz)) {
            this.grid[gz][gx] = false;
          }
        }
      }
    }
  }

  /**
   * Mark a cell or area as walkable
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @param {number} radius - Optional radius for circular areas
   */
  markWalkable(x, z, radius = 0) {
    if (radius === 0) {
      // Single cell
      const gridPos = this.worldToGrid(x, z);
      if (this.isValidGridPosition(gridPos.x, gridPos.z)) {
        this.grid[gridPos.z][gridPos.x] = true;
      }
    } else {
      // Circular area
      const centerGrid = this.worldToGrid(x, z);
      const radiusCells = Math.ceil(radius / this.cellSize);
      
      for (let dz = -radiusCells; dz <= radiusCells; dz++) {
        for (let dx = -radiusCells; dx <= radiusCells; dx++) {
          const gx = centerGrid.x + dx;
          const gz = centerGrid.z + dz;
          
          const distance = Math.sqrt(dx * dx + dz * dz) * this.cellSize;
          if (distance <= radius && this.isValidGridPosition(gx, gz)) {
            this.grid[gz][gx] = true;
          }
        }
      }
    }
  }

  /**
   * Check if a world position is walkable
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @returns {boolean}
   */
  isWalkable(x, z) {
    const gridPos = this.worldToGrid(x, z);
    
    if (!this.isValidGridPosition(gridPos.x, gridPos.z)) {
      return false;
    }
    
    return this.grid[gridPos.z][gridPos.x];
  }

  /**
   * Get neighboring cells for pathfinding (8-directional)
   * @param {number} gx - Grid X coordinate
   * @param {number} gz - Grid Z coordinate
   * @returns {Array<{x: number, z: number, cost: number}>}
   */
  getNeighbors(gx, gz) {
    const neighbors = [];
    
    // 8 directions: N, NE, E, SE, S, SW, W, NW
    const directions = [
      { dx: 0, dz: -1, cost: 1 },    // N
      { dx: 1, dz: -1, cost: 1.414 }, // NE (diagonal)
      { dx: 1, dz: 0, cost: 1 },     // E
      { dx: 1, dz: 1, cost: 1.414 },  // SE (diagonal)
      { dx: 0, dz: 1, cost: 1 },     // S
      { dx: -1, dz: 1, cost: 1.414 }, // SW (diagonal)
      { dx: -1, dz: 0, cost: 1 },    // W
      { dx: -1, dz: -1, cost: 1.414 } // NW (diagonal)
    ];
    
    for (const dir of directions) {
      const nx = gx + dir.dx;
      const nz = gz + dir.dz;
      
      if (this.isValidGridPosition(nx, nz) && this.grid[nz][nx]) {
        neighbors.push({
          x: nx,
          z: nz,
          cost: dir.cost
        });
      }
    }
    
    return neighbors;
  }

  /**
   * Convert world coordinates to grid coordinates
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @returns {{x: number, z: number}}
   */
  worldToGrid(x, z) {
    const { minX, minZ } = this.worldBounds;
    
    return {
      x: Math.floor((x - minX) / this.cellSize),
      z: Math.floor((z - minZ) / this.cellSize)
    };
  }

  /**
   * Convert grid coordinates to world coordinates (center of cell)
   * @param {number} gx - Grid X coordinate
   * @param {number} gz - Grid Z coordinate
   * @returns {{x: number, z: number}}
   */
  gridToWorld(gx, gz) {
    const { minX, minZ } = this.worldBounds;
    
    return {
      x: minX + (gx + 0.5) * this.cellSize,
      z: minZ + (gz + 0.5) * this.cellSize
    };
  }

  /**
   * Check if grid position is valid
   * @param {number} gx - Grid X coordinate
   * @param {number} gz - Grid Z coordinate
   * @returns {boolean}
   */
  isValidGridPosition(gx, gz) {
    return gx >= 0 && gx < this.width && gz >= 0 && gz < this.height;
  }

  /**
   * Clear all obstacles (reset grid)
   */
  clear() {
    this.grid = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(true)
    );
  }

  /**
   * Get grid dimensions
   * @returns {{width: number, height: number}}
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }
}

export default NavigationMesh;
