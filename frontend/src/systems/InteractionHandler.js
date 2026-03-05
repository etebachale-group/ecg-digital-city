/**
 * InteractionHandler - Handles user interactions with interactive objects
 * 
 * Manages click detection, proximity detection, and interaction execution.
 * Integrates with pathfinding for distant objects and provides visual feedback.
 */

import * as THREE from 'three';

class InteractionHandler {
  constructor(camera, scene, socket, pathfindingEngine = null) {
    this.camera = camera;
    this.scene = scene;
    this.socket = socket;
    this.pathfindingEngine = pathfindingEngine;
    
    // Raycaster for click detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Interactive objects registry
    this.interactiveObjects = new Map(); // objectId -> { mesh, data, isHighlighted }
    
    // State
    this.highlightedObject = null;
    this.nearbyObjects = [];
    this.proximityRadius = 2; // units
    
    // Callbacks
    this.onInteractionCallbacks = [];
    this.onHighlightCallbacks = [];
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup DOM event listeners
   */
  setupEventListeners() {
    // Click detection
    window.addEventListener('click', this.handleClick.bind(this));
    
    // Mouse move for hover detection
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Key press for E key interaction
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  /**
   * Register an interactive object
   * @param {string} id - Object ID
   * @param {THREE.Object3D} mesh - Three.js mesh
   * @param {Object} data - Object data (name, type, position, etc.)
   */
  registerObject(id, mesh, data) {
    this.interactiveObjects.set(id, {
      mesh,
      data,
      isHighlighted: false,
      originalMaterial: mesh.material ? mesh.material.clone() : null
    });
    
    // Make mesh interactive
    if (mesh) {
      mesh.userData.interactiveId = id;
      mesh.userData.isInteractive = true;
    }
  }

  /**
   * Unregister an interactive object
   * @param {string} id - Object ID
   */
  unregisterObject(id) {
    const obj = this.interactiveObjects.get(id);
    if (obj && obj.isHighlighted) {
      this.unhighlightObject(id);
    }
    this.interactiveObjects.delete(id);
  }

  /**
   * Handle click event
   * @param {MouseEvent} event
   */
  handleClick(event) {
    // Get normalized mouse position
    const mousePos = this.getNormalizedMousePosition(event);
    this.mouse.set(mousePos.x, mousePos.y);
    
    // Raycast from camera
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Get all meshes from interactive objects
    const meshes = Array.from(this.interactiveObjects.values())
      .map(obj => obj.mesh)
      .filter(mesh => mesh !== null);
    
    const intersects = this.raycaster.intersectObjects(meshes, true);
    
    if (intersects.length > 0) {
      const clickedObject = this.findInteractiveObject(intersects[0].object);
      
      if (clickedObject) {
        this.initiateInteraction(clickedObject.id, clickedObject.data);
      }
    }
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event
   */
  handleMouseMove(event) {
    const mousePos = this.getNormalizedMousePosition(event);
    this.mouse.set(mousePos.x, mousePos.y);
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const meshes = Array.from(this.interactiveObjects.values())
      .map(obj => obj.mesh)
      .filter(mesh => mesh !== null);
    
    const intersects = this.raycaster.intersectObjects(meshes, true);
    
    if (intersects.length > 0) {
      const hoveredObject = this.findInteractiveObject(intersects[0].object);
      
      if (hoveredObject && hoveredObject.id !== this.highlightedObject) {
        // Unhighlight previous
        if (this.highlightedObject) {
          this.unhighlightObject(this.highlightedObject);
        }
        
        // Highlight new
        this.highlightObject(hoveredObject.id);
        
        // Change cursor
        document.body.style.cursor = 'pointer';
      }
    } else {
      // No object hovered
      if (this.highlightedObject) {
        this.unhighlightObject(this.highlightedObject);
        this.highlightedObject = null;
      }
      document.body.style.cursor = 'default';
    }
  }

  /**
   * Handle key press event
   * @param {KeyboardEvent} event
   */
  handleKeyPress(event) {
    if (event.key === 'e' || event.key === 'E') {
      // Find nearby object
      const nearbyObject = this.findNearbyObject();
      
      if (nearbyObject) {
        this.executeInteraction(nearbyObject.id, nearbyObject.data);
      }
    }
  }

  /**
   * Get normalized mouse position (-1 to 1)
   * @param {MouseEvent} event
   * @returns {{x: number, y: number}}
   */
  getNormalizedMousePosition(event) {
    return {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    };
  }

  /**
   * Find interactive object from clicked mesh
   * @param {THREE.Object3D} object
   * @returns {{id: string, data: Object}|null}
   */
  findInteractiveObject(object) {
    // Check object and its parents for interactive ID
    let current = object;
    while (current) {
      if (current.userData.interactiveId) {
        const obj = this.interactiveObjects.get(current.userData.interactiveId);
        if (obj) {
          return {
            id: current.userData.interactiveId,
            data: obj.data
          };
        }
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Find nearby object within proximity radius
   * @param {THREE.Vector3} playerPosition - Player position (optional)
   * @returns {{id: string, data: Object}|null}
   */
  findNearbyObject(playerPosition = null) {
    if (!playerPosition) {
      // Get player position from camera or scene
      playerPosition = this.camera.position;
    }
    
    let closestObject = null;
    let closestDistance = this.proximityRadius;
    
    for (const [id, obj] of this.interactiveObjects) {
      if (obj.data.position) {
        const dx = obj.data.position.x - playerPosition.x;
        const dz = obj.data.position.z - playerPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance <= closestDistance) {
          closestDistance = distance;
          closestObject = { id, data: obj.data };
        }
      }
    }
    
    return closestObject;
  }

  /**
   * Initiate interaction (with range checking)
   * @param {string} objectId - Object ID
   * @param {Object} objectData - Object data
   */
  initiateInteraction(objectId, objectData) {
    // Check if player is within range
    const playerPosition = this.camera.position;
    const objectPosition = objectData.position;
    
    if (!objectPosition) {
      console.warn('Object has no position data');
      return;
    }
    
    const dx = objectPosition.x - playerPosition.x;
    const dz = objectPosition.z - playerPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance <= this.proximityRadius) {
      // Within range, execute immediately
      this.executeInteraction(objectId, objectData);
    } else {
      // Out of range, trigger pathfinding
      if (this.pathfindingEngine) {
        console.log(`Object out of range (${distance.toFixed(2)}m), pathfinding to object...`);
        
        // Notify callbacks about pathfinding
        this.notifyInteraction('pathfinding', objectId, objectData);
        
        // Find path to object
        // This would be handled by the Player component
        // We just emit an event here
        if (this.socket) {
          this.socket.emit('interaction:pathfind', {
            objectId,
            targetPosition: objectPosition
          });
        }
      } else {
        console.warn('Object out of range and no pathfinding engine available');
      }
    }
  }

  /**
   * Execute interaction (emit to server)
   * @param {string} objectId - Object ID
   * @param {Object} objectData - Object data
   */
  executeInteraction(objectId, objectData) {
    console.log(`Executing interaction with object: ${objectData.name || objectId}`);
    
    // Emit to server
    if (this.socket) {
      this.socket.emit('interaction:request', {
        objectId,
        timestamp: Date.now()
      });
    }
    
    // Notify callbacks
    this.notifyInteraction('execute', objectId, objectData);
  }

  /**
   * Highlight an object
   * @param {string} objectId - Object ID
   */
  highlightObject(objectId) {
    const obj = this.interactiveObjects.get(objectId);
    if (!obj || obj.isHighlighted) return;
    
    // Apply highlight effect
    if (obj.mesh && obj.mesh.material) {
      // Store original material if not already stored
      if (!obj.originalMaterial) {
        obj.originalMaterial = obj.mesh.material.clone();
      }
      
      // Apply highlight (increase emissive)
      if (obj.mesh.material.emissive) {
        obj.mesh.material.emissive.setHex(0x444444);
      }
      
      // Or add outline (if using OutlinePass)
      // This would require additional setup
    }
    
    obj.isHighlighted = true;
    this.highlightedObject = objectId;
    
    // Notify callbacks
    this.notifyHighlight(objectId, true);
  }

  /**
   * Unhighlight an object
   * @param {string} objectId - Object ID
   */
  unhighlightObject(objectId) {
    const obj = this.interactiveObjects.get(objectId);
    if (!obj || !obj.isHighlighted) return;
    
    // Remove highlight effect
    if (obj.mesh && obj.mesh.material && obj.originalMaterial) {
      if (obj.mesh.material.emissive) {
        obj.mesh.material.emissive.setHex(0x000000);
      }
    }
    
    obj.isHighlighted = false;
    
    // Notify callbacks
    this.notifyHighlight(objectId, false);
  }

  /**
   * Update nearby objects list
   * @param {THREE.Vector3} playerPosition - Player position
   */
  updateNearbyObjects(playerPosition) {
    this.nearbyObjects = [];
    
    for (const [id, obj] of this.interactiveObjects) {
      if (obj.data.position) {
        const dx = obj.data.position.x - playerPosition.x;
        const dz = obj.data.position.z - playerPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance <= this.proximityRadius) {
          this.nearbyObjects.push({
            id,
            data: obj.data,
            distance
          });
        }
      }
    }
    
    // Sort by distance
    this.nearbyObjects.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get nearby objects
   * @returns {Array<{id: string, data: Object, distance: number}>}
   */
  getNearbyObjects() {
    return this.nearbyObjects;
  }

  /**
   * Register interaction callback
   * @param {Function} callback - (action, objectId, objectData) => void
   */
  onInteraction(callback) {
    this.onInteractionCallbacks.push(callback);
  }

  /**
   * Register highlight callback
   * @param {Function} callback - (objectId, isHighlighted) => void
   */
  onHighlight(callback) {
    this.onHighlightCallbacks.push(callback);
  }

  /**
   * Notify interaction callbacks
   * @private
   */
  notifyInteraction(action, objectId, objectData) {
    for (const callback of this.onInteractionCallbacks) {
      try {
        callback(action, objectId, objectData);
      } catch (error) {
        console.error('Error in interaction callback:', error);
      }
    }
  }

  /**
   * Notify highlight callbacks
   * @private
   */
  notifyHighlight(objectId, isHighlighted) {
    for (const callback of this.onHighlightCallbacks) {
      try {
        callback(objectId, isHighlighted);
      } catch (error) {
        console.error('Error in highlight callback:', error);
      }
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('keydown', this.handleKeyPress);
    
    this.interactiveObjects.clear();
    this.onInteractionCallbacks = [];
    this.onHighlightCallbacks = [];
  }
}

export default InteractionHandler;
