/**
 * DepthSorter - Manages z-index/renderOrder for 2.5D depth sorting
 * 
 * Calculates and updates z-index based on Y position to create proper
 * depth perception in isometric/2.5D views.
 */

class DepthSorter {
  constructor() {
    this.objects = new Map(); // objectId -> { object, yPosition, zIndex, isDirty, isStatic }
    this.dirtyObjects = new Set();
  }

  /**
   * Register an object for depth sorting
   * @param {string} id - Unique object identifier
   * @param {Object} object - Three.js object with renderOrder property
   * @param {number} yPosition - Y position in world space
   * @param {boolean} isStatic - Whether object position is static
   */
  register(id, object, yPosition, isStatic = false) {
    const zIndex = this.calculateZIndex(yPosition);
    
    this.objects.set(id, {
      object,
      yPosition,
      zIndex,
      isDirty: false,
      isStatic
    });
    
    // Apply initial z-index
    if (object.renderOrder !== undefined) {
      object.renderOrder = zIndex;
    }
  }

  /**
   * Unregister an object from depth sorting
   * @param {string} id - Object identifier
   */
  unregister(id) {
    this.objects.delete(id);
    this.dirtyObjects.delete(id);
  }

  /**
   * Calculate z-index based on Y position
   * Formula: zIndex = 1000 - (yPosition * 10)
   * 
   * Objects further back (higher Y) have lower z-index
   * @param {number} yPosition - Y position in world space
   * @returns {number} - Calculated z-index
   */
  calculateZIndex(yPosition) {
    return Math.floor(1000 - (yPosition * 10));
  }

  /**
   * Mark an object as dirty (needs z-index recalculation)
   * @param {string} id - Object identifier
   */
  markDirty(id) {
    const obj = this.objects.get(id);
    if (obj && !obj.isStatic) {
      obj.isDirty = true;
      this.dirtyObjects.add(id);
    }
  }

  /**
   * Update Y position of an object and mark as dirty
   * @param {string} id - Object identifier
   * @param {number} newYPosition - New Y position
   */
  updatePosition(id, newYPosition) {
    const obj = this.objects.get(id);
    if (obj) {
      if (obj.yPosition !== newYPosition) {
        obj.yPosition = newYPosition;
        this.markDirty(id);
      }
    }
  }

  /**
   * Update z-index for all dirty objects
   * Only recalculates for objects that have moved
   */
  update() {
    if (this.dirtyObjects.size === 0) {
      return;
    }

    for (const id of this.dirtyObjects) {
      const obj = this.objects.get(id);
      if (obj && obj.isDirty) {
        const newZIndex = this.calculateZIndex(obj.yPosition);
        
        if (newZIndex !== obj.zIndex) {
          obj.zIndex = newZIndex;
          
          // Update Three.js renderOrder
          if (obj.object.renderOrder !== undefined) {
            obj.object.renderOrder = newZIndex;
          }
        }
        
        obj.isDirty = false;
      }
    }

    this.dirtyObjects.clear();
  }

  /**
   * Force update all objects (including static ones)
   * Use sparingly, only when necessary (e.g., scene reload)
   */
  forceUpdateAll() {
    for (const [id, obj] of this.objects) {
      const newZIndex = this.calculateZIndex(obj.yPosition);
      obj.zIndex = newZIndex;
      
      if (obj.object.renderOrder !== undefined) {
        obj.object.renderOrder = newZIndex;
      }
      
      obj.isDirty = false;
    }
    
    this.dirtyObjects.clear();
  }

  /**
   * Get current z-index for an object
   * @param {string} id - Object identifier
   * @returns {number|null} - Current z-index or null if not found
   */
  getZIndex(id) {
    const obj = this.objects.get(id);
    return obj ? obj.zIndex : null;
  }

  /**
   * Get all registered objects sorted by z-index
   * @returns {Array<{id: string, zIndex: number, yPosition: number}>}
   */
  getSortedObjects() {
    const sorted = Array.from(this.objects.entries()).map(([id, obj]) => ({
      id,
      zIndex: obj.zIndex,
      yPosition: obj.yPosition
    }));
    
    sorted.sort((a, b) => b.zIndex - a.zIndex); // Higher z-index first
    return sorted;
  }

  /**
   * Clear all registered objects
   */
  clear() {
    this.objects.clear();
    this.dirtyObjects.clear();
  }

  /**
   * Get statistics about depth sorter state
   * @returns {Object} - Statistics object
   */
  getStats() {
    let staticCount = 0;
    let dynamicCount = 0;
    
    for (const obj of this.objects.values()) {
      if (obj.isStatic) {
        staticCount++;
      } else {
        dynamicCount++;
      }
    }
    
    return {
      totalObjects: this.objects.size,
      staticObjects: staticCount,
      dynamicObjects: dynamicCount,
      dirtyObjects: this.dirtyObjects.size
    };
  }
}

export default DepthSorter;
