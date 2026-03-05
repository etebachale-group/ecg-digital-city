/**
 * InteractiveObjectManager
 * 
 * Manages interactive objects in the scene, handles synchronization
 * with server, and maintains local cache.
 */

class InteractiveObjectManager {
  constructor(socket = null, apiBaseUrl = '/api') {
    this.socket = socket;
    this.apiBaseUrl = apiBaseUrl;
    
    // Local cache of interactive objects
    this.objects = new Map(); // objectId -> object data
    
    // Callbacks
    this.onObjectAddedCallbacks = [];
    this.onObjectUpdatedCallbacks = [];
    this.onObjectRemovedCallbacks = [];
    this.onObjectStateChangedCallbacks = [];
    
    // Setup socket listeners
    if (this.socket) {
      this.setupSocketListeners();
    }
  }

  /**
   * Setup Socket.IO event listeners
   */
  setupSocketListeners() {
    // Object created
    this.socket.on('object:created', (data) => {
      this.addObject(data.object);
    });

    // Object updated
    this.socket.on('object:updated', (data) => {
      this.updateObject(data.objectId, data.updates);
    });

    // Object deleted
    this.socket.on('object:deleted', (data) => {
      this.removeObject(data.objectId);
    });

    // Object state changed
    this.socket.on('object:state-changed', (data) => {
      this.updateObjectState(data.objectId, data.state);
    });

    // Node occupied
    this.socket.on('node:occupied', (data) => {
      const object = this.objects.get(data.objectId);
      if (object) {
        if (!object.occupiedNodes) {
          object.occupiedNodes = new Set();
        }
        object.occupiedNodes.add(data.nodeId);
        this.notifyObjectUpdated(data.objectId, object);
      }
    });

    // Node released
    this.socket.on('node:released', (data) => {
      const object = this.objects.get(data.objectId);
      if (object) {
        if (object.occupiedNodes) {
          object.occupiedNodes.delete(data.nodeId);
        }
        this.notifyObjectUpdated(data.objectId, object);
      }
    });
  }

  /**
   * Load objects for a specific office from API
   * @param {string} officeId - Office ID
   * @returns {Promise<Array>}
   */
  async loadObjectsForOffice(officeId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/offices/${officeId}/objects`);
      
      if (!response.ok) {
        throw new Error(`Failed to load objects: ${response.statusText}`);
      }
      
      const data = await response.json();
      const objects = data.objects || [];
      
      // Add all objects to cache
      for (const object of objects) {
        this.addObject(object, false); // Don't notify for initial load
      }
      
      return objects;
    } catch (error) {
      console.error('Error loading objects:', error);
      return [];
    }
  }

  /**
   * Add object to cache
   * @param {Object} object - Object data
   * @param {boolean} notify - Whether to notify callbacks
   */
  addObject(object, notify = true) {
    if (!object || !object.id) {
      console.warn('Invalid object data');
      return;
    }
    
    this.objects.set(object.id, {
      ...object,
      occupiedNodes: new Set(object.occupiedNodes || [])
    });
    
    if (notify) {
      this.notifyObjectAdded(object.id, object);
    }
  }

  /**
   * Update object in cache
   * @param {string} objectId - Object ID
   * @param {Object} updates - Updates to apply
   */
  updateObject(objectId, updates) {
    const object = this.objects.get(objectId);
    
    if (!object) {
      console.warn(`Object ${objectId} not found`);
      return;
    }
    
    // Apply updates
    Object.assign(object, updates);
    
    this.notifyObjectUpdated(objectId, object);
  }

  /**
   * Update object state
   * @param {string} objectId - Object ID
   * @param {Object} state - New state
   */
  updateObjectState(objectId, state) {
    const object = this.objects.get(objectId);
    
    if (!object) {
      console.warn(`Object ${objectId} not found`);
      return;
    }
    
    object.state = state;
    
    this.notifyObjectStateChanged(objectId, state);
  }

  /**
   * Remove object from cache
   * @param {string} objectId - Object ID
   */
  removeObject(objectId) {
    const object = this.objects.get(objectId);
    
    if (!object) {
      return;
    }
    
    this.objects.delete(objectId);
    
    this.notifyObjectRemoved(objectId, object);
  }

  /**
   * Get object by ID
   * @param {string} objectId - Object ID
   * @returns {Object|null}
   */
  getObject(objectId) {
    return this.objects.get(objectId) || null;
  }

  /**
   * Get all objects
   * @returns {Array}
   */
  getAllObjects() {
    return Array.from(this.objects.values());
  }

  /**
   * Get objects by type
   * @param {string} objectType - Object type
   * @returns {Array}
   */
  getObjectsByType(objectType) {
    return this.getAllObjects().filter(obj => obj.objectType === objectType);
  }

  /**
   * Get objects in area
   * @param {number} centerX - Center X coordinate
   * @param {number} centerZ - Center Z coordinate
   * @param {number} radius - Search radius
   * @returns {Array}
   */
  getObjectsInArea(centerX, centerZ, radius) {
    return this.getAllObjects().filter(obj => {
      if (!obj.position) return false;
      
      const dx = obj.position.x - centerX;
      const dz = obj.position.z - centerZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      return distance <= radius;
    });
  }

  /**
   * Check if object is occupied
   * @param {string} objectId - Object ID
   * @returns {boolean}
   */
  isObjectOccupied(objectId) {
    const object = this.objects.get(objectId);
    return object && object.occupiedNodes && object.occupiedNodes.size > 0;
  }

  /**
   * Clear all objects
   */
  clear() {
    this.objects.clear();
  }

  /**
   * Register callback for object added
   * @param {Function} callback - (objectId, object) => void
   */
  onObjectAdded(callback) {
    this.onObjectAddedCallbacks.push(callback);
  }

  /**
   * Register callback for object updated
   * @param {Function} callback - (objectId, object) => void
   */
  onObjectUpdated(callback) {
    this.onObjectUpdatedCallbacks.push(callback);
  }

  /**
   * Register callback for object removed
   * @param {Function} callback - (objectId, object) => void
   */
  onObjectRemoved(callback) {
    this.onObjectRemovedCallbacks.push(callback);
  }

  /**
   * Register callback for object state changed
   * @param {Function} callback - (objectId, state) => void
   */
  onObjectStateChanged(callback) {
    this.onObjectStateChangedCallbacks.push(callback);
  }

  /**
   * Notify callbacks of object added
   * @private
   */
  notifyObjectAdded(objectId, object) {
    for (const callback of this.onObjectAddedCallbacks) {
      try {
        callback(objectId, object);
      } catch (error) {
        console.error('Error in object added callback:', error);
      }
    }
  }

  /**
   * Notify callbacks of object updated
   * @private
   */
  notifyObjectUpdated(objectId, object) {
    for (const callback of this.onObjectUpdatedCallbacks) {
      try {
        callback(objectId, object);
      } catch (error) {
        console.error('Error in object updated callback:', error);
      }
    }
  }

  /**
   * Notify callbacks of object removed
   * @private
   */
  notifyObjectRemoved(objectId, object) {
    for (const callback of this.onObjectRemovedCallbacks) {
      try {
        callback(objectId, object);
      } catch (error) {
        console.error('Error in object removed callback:', error);
      }
    }
  }

  /**
   * Notify callbacks of object state changed
   * @private
   */
  notifyObjectStateChanged(objectId, state) {
    for (const callback of this.onObjectStateChangedCallbacks) {
      try {
        callback(objectId, state);
      } catch (error) {
        console.error('Error in object state changed callback:', error);
      }
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.socket) {
      this.socket.off('object:created');
      this.socket.off('object:updated');
      this.socket.off('object:deleted');
      this.socket.off('object:state-changed');
      this.socket.off('node:occupied');
      this.socket.off('node:released');
    }
    
    this.clear();
    this.onObjectAddedCallbacks = [];
    this.onObjectUpdatedCallbacks = [];
    this.onObjectRemovedCallbacks = [];
    this.onObjectStateChangedCallbacks = [];
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    const totalObjects = this.objects.size;
    let occupiedObjects = 0;
    const objectsByType = {};
    
    for (const object of this.objects.values()) {
      // Count occupied
      if (object.occupiedNodes && object.occupiedNodes.size > 0) {
        occupiedObjects++;
      }
      
      // Count by type
      const type = object.objectType || 'unknown';
      objectsByType[type] = (objectsByType[type] || 0) + 1;
    }
    
    return {
      totalObjects,
      occupiedObjects,
      availableObjects: totalObjects - occupiedObjects,
      objectsByType
    };
  }
}

export default InteractiveObjectManager;
