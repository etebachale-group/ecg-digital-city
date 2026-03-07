import { Vector2D } from '../utils/Vector2D'

/**
 * CollisionSystem2D - 2D collision detection and response
 * Uses AABB (Axis-Aligned Bounding Box) for efficient collision detection
 * Optimized for Render Free tier
 */
export class CollisionSystem2D {
  constructor(config) {
    this.worldBounds = config.worldBounds || {
      minX: -100,
      maxX: 100,
      minY: -100,
      maxY: 100
    }
    
    // Collision data
    this.obstacles = [] // Array of rectangles
    this.doors = [] // Array of interactive doors
    this.spatialGrid = null // Will be set up when obstacles are added
  }

  /**
   * Add obstacle to collision system
   * @param {Object} rect - {x, y, width, height}
   */
  addObstacle(rect) {
    this.obstacles.push(rect)
  }

  /**
   * Add door to collision system
   * @param {Object} door - {id, x, y, width, height, isOpen}
   */
  addDoor(door) {
    this.doors.push({
      ...door,
      isOpen: door.isOpen || false
    })
  }

  /**
   * Check if position collides with any obstacle
   * @param {Vector2D} position 
   * @param {number} radius - Avatar collision radius
   * @returns {boolean}
   */
  checkCollision(position, radius) {
    // Check world bounds
    if (position.x - radius < this.worldBounds.minX || 
        position.x + radius > this.worldBounds.maxX ||
        position.y - radius < this.worldBounds.minY || 
        position.y + radius > this.worldBounds.maxY) {
      return true
    }
    
    // Check obstacles
    for (const obstacle of this.obstacles) {
      if (this._circleRectCollision(position, radius, obstacle)) {
        return true
      }
    }
    
    // Check closed doors
    for (const door of this.doors) {
      if (!door.isOpen && this._circleRectCollision(position, radius, door)) {
        return true
      }
    }
    
    return false
  }

  /**
   * Resolve collision with smooth sliding
   * @param {Vector2D} position 
   * @param {Vector2D} velocity 
   * @param {number} radius 
   * @returns {Vector2D} - Resolved position
   */
  resolveCollision(position, velocity, radius) {
    // If no collision, return original position
    if (!this.checkCollision(position, radius)) {
      return position.clone()
    }
    
    // Try sliding along X axis
    const slideX = new Vector2D(position.x, position.y - velocity.y)
    if (!this.checkCollision(slideX, radius)) {
      return slideX
    }
    
    // Try sliding along Y axis
    const slideY = new Vector2D(position.x - velocity.x, position.y)
    if (!this.checkCollision(slideY, radius)) {
      return slideY
    }
    
    // Can't move, return previous position
    return new Vector2D(
      position.x - velocity.x,
      position.y - velocity.y
    )
  }

  /**
   * Get nearby door within range
   * @param {Vector2D} position 
   * @param {number} range 
   * @returns {Object|null}
   */
  getNearbyDoor(position, range) {
    for (const door of this.doors) {
      const doorCenter = new Vector2D(
        door.x + door.width / 2,
        door.y + door.height / 2
      )
      
      const distance = Vector2D.distance(position, doorCenter)
      if (distance <= range) {
        return door
      }
    }
    return null
  }

  /**
   * Toggle door state
   * @param {string} doorId 
   */
  toggleDoor(doorId) {
    const door = this.doors.find(d => d.id === doorId)
    if (door) {
      door.isOpen = !door.isOpen
      console.log(`Door ${doorId} is now ${door.isOpen ? 'open' : 'closed'}`)
    }
  }

  /**
   * Circle-Rectangle collision detection
   * @private
   */
  _circleRectCollision(circlePos, radius, rect) {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circlePos.x, rect.x + rect.width))
    const closestY = Math.max(rect.y, Math.min(circlePos.y, rect.y + rect.height))
    
    // Calculate distance from circle center to closest point
    const dx = circlePos.x - closestX
    const dy = circlePos.y - closestY
    const distanceSquared = dx * dx + dy * dy
    
    return distanceSquared < (radius * radius)
  }

  /**
   * Clear all obstacles and doors
   */
  clear() {
    this.obstacles = []
    this.doors = []
  }

  /**
   * Get all obstacles (for debugging)
   * @returns {Array}
   */
  getObstacles() {
    return this.obstacles
  }

  /**
   * Get all doors (for debugging)
   * @returns {Array}
   */
  getDoors() {
    return this.doors
  }
}
