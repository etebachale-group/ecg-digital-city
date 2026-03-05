/**
 * SpatialPartitioner - Spatial partitioning for efficient proximity queries
 * 
 * Divides the world into sectors to optimize nearby object queries.
 * Reduces O(n) searches to O(k) where k is objects in nearby sectors.
 */

class SpatialPartitioner {
  constructor(sectorSize = 10) {
    this.sectorSize = sectorSize;
    this.sectors = new Map(); // sectorKey -> Set of object IDs
    this.objectLocations = new Map(); // objectId -> { x, z, sectorKey }
  }

  /**
   * Get sector key for a position
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @returns {string} - Sector key
   */
  getSectorKey(x, z) {
    const sectorX = Math.floor(x / this.sectorSize);
    const sectorZ = Math.floor(z / this.sectorSize);
    return `${sectorX},${sectorZ}`;
  }

  /**
   * Add an object to the spatial partitioner
   * @param {string} id - Object identifier
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   */
  addObject(id, x, z) {
    const sectorKey = this.getSectorKey(x, z);
    
    // Add to sector
    if (!this.sectors.has(sectorKey)) {
      this.sectors.set(sectorKey, new Set());
    }
    this.sectors.get(sectorKey).add(id);
    
    // Store object location
    this.objectLocations.set(id, { x, z, sectorKey });
  }

  /**
   * Update an object's position
   * @param {string} id - Object identifier
   * @param {number} x - New world X coordinate
   * @param {number} z - New world Z coordinate
   */
  updateObject(id, x, z) {
    const oldLocation = this.objectLocations.get(id);
    
    if (!oldLocation) {
      // Object doesn't exist, add it
      this.addObject(id, x, z);
      return;
    }
    
    const newSectorKey = this.getSectorKey(x, z);
    
    // Check if sector changed
    if (oldLocation.sectorKey !== newSectorKey) {
      // Remove from old sector
      const oldSector = this.sectors.get(oldLocation.sectorKey);
      if (oldSector) {
        oldSector.delete(id);
        
        // Clean up empty sector
        if (oldSector.size === 0) {
          this.sectors.delete(oldLocation.sectorKey);
        }
      }
      
      // Add to new sector
      if (!this.sectors.has(newSectorKey)) {
        this.sectors.set(newSectorKey, new Set());
      }
      this.sectors.get(newSectorKey).add(id);
    }
    
    // Update location
    this.objectLocations.set(id, { x, z, sectorKey: newSectorKey });
  }

  /**
   * Remove an object from the spatial partitioner
   * @param {string} id - Object identifier
   */
  removeObject(id) {
    const location = this.objectLocations.get(id);
    
    if (location) {
      // Remove from sector
      const sector = this.sectors.get(location.sectorKey);
      if (sector) {
        sector.delete(id);
        
        // Clean up empty sector
        if (sector.size === 0) {
          this.sectors.delete(location.sectorKey);
        }
      }
      
      // Remove location
      this.objectLocations.delete(id);
    }
  }

  /**
   * Get nearby objects within a radius
   * @param {number} x - Center X coordinate
   * @param {number} z - Center Z coordinate
   * @param {number} radius - Search radius
   * @returns {Array<string>} - Array of object IDs
   */
  getNearbyObjects(x, z, radius) {
    const nearbyIds = new Set();
    
    // Calculate sector range to check
    const minSectorX = Math.floor((x - radius) / this.sectorSize);
    const maxSectorX = Math.floor((x + radius) / this.sectorSize);
    const minSectorZ = Math.floor((z - radius) / this.sectorSize);
    const maxSectorZ = Math.floor((z + radius) / this.sectorSize);
    
    // Check all sectors in range
    for (let sx = minSectorX; sx <= maxSectorX; sx++) {
      for (let sz = minSectorZ; sz <= maxSectorZ; sz++) {
        const sectorKey = `${sx},${sz}`;
        const sector = this.sectors.get(sectorKey);
        
        if (sector) {
          for (const id of sector) {
            const location = this.objectLocations.get(id);
            if (location) {
              // Check actual distance
              const dx = location.x - x;
              const dz = location.z - z;
              const distance = Math.sqrt(dx * dx + dz * dz);
              
              if (distance <= radius) {
                nearbyIds.add(id);
              }
            }
          }
        }
      }
    }
    
    return Array.from(nearbyIds);
  }

  /**
   * Get objects in a specific sector
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @returns {Array<string>} - Array of object IDs in the sector
   */
  getObjectsInSector(x, z) {
    const sectorKey = this.getSectorKey(x, z);
    const sector = this.sectors.get(sectorKey);
    return sector ? Array.from(sector) : [];
  }

  /**
   * Get all objects in the partitioner
   * @returns {Array<{id: string, x: number, z: number}>}
   */
  getAllObjects() {
    const objects = [];
    for (const [id, location] of this.objectLocations) {
      objects.push({
        id,
        x: location.x,
        z: location.z
      });
    }
    return objects;
  }

  /**
   * Get object location
   * @param {string} id - Object identifier
   * @returns {{x: number, z: number}|null}
   */
  getObjectLocation(id) {
    const location = this.objectLocations.get(id);
    return location ? { x: location.x, z: location.z } : null;
  }

  /**
   * Clear all objects
   */
  clear() {
    this.sectors.clear();
    this.objectLocations.clear();
  }

  /**
   * Get statistics about spatial partitioner
   * @returns {Object}
   */
  getStats() {
    let totalObjects = 0;
    let maxObjectsPerSector = 0;
    let minObjectsPerSector = Infinity;
    
    for (const sector of this.sectors.values()) {
      const count = sector.size;
      totalObjects += count;
      maxObjectsPerSector = Math.max(maxObjectsPerSector, count);
      minObjectsPerSector = Math.min(minObjectsPerSector, count);
    }
    
    const avgObjectsPerSector = this.sectors.size > 0 
      ? totalObjects / this.sectors.size 
      : 0;
    
    return {
      totalSectors: this.sectors.size,
      totalObjects,
      avgObjectsPerSector: avgObjectsPerSector.toFixed(2),
      maxObjectsPerSector,
      minObjectsPerSector: minObjectsPerSector === Infinity ? 0 : minObjectsPerSector,
      sectorSize: this.sectorSize
    };
  }

  /**
   * Get sector bounds for visualization/debugging
   * @param {number} x - World X coordinate
   * @param {number} z - World Z coordinate
   * @returns {{minX: number, maxX: number, minZ: number, maxZ: number}}
   */
  getSectorBounds(x, z) {
    const sectorX = Math.floor(x / this.sectorSize);
    const sectorZ = Math.floor(z / this.sectorSize);
    
    return {
      minX: sectorX * this.sectorSize,
      maxX: (sectorX + 1) * this.sectorSize,
      minZ: sectorZ * this.sectorSize,
      maxZ: (sectorZ + 1) * this.sectorSize
    };
  }

  /**
   * Get all active sector keys
   * @returns {Array<string>}
   */
  getActiveSectors() {
    return Array.from(this.sectors.keys());
  }
}

export default SpatialPartitioner;
