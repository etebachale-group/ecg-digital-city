import { Vector2D } from '../utils/Vector2D'

/**
 * CameraSystem2D - 2D camera with smooth following and viewport management
 * Optimized for performance on low-end devices
 */
export class CameraSystem2D {
  constructor(config) {
    this.viewport = config.viewport
    this.worldBounds = config.worldBounds || {
      minX: -100,
      maxX: 100,
      minY: -100,
      maxY: 100
    }
    this.smoothing = config.smoothing || 0.1
    
    // Camera state
    this.position = new Vector2D(0, 0)
    this.target = null
    this.zoom = 1.0
    
    // Zoom constraints
    this.minZoom = 0.5
    this.maxZoom = 2.0
  }

  /**
   * Set the target for the camera to follow
   * @param {Object} avatar - Avatar2D instance with position property
   */
  setTarget(avatar) {
    this.target = avatar
  }

  /**
   * Update camera position (smooth following)
   * @param {number} delta - Time delta
   */
  update(delta) {
    if (!this.target) return
    
    // Safety check for WebGL context loss
    if (!this.target.position || !this.position) {
      console.warn('Camera or target position lost, skipping update')
      return
    }
    
    // Calculate target position
    const targetPos = new Vector2D(
      this.target.position.x,
      this.target.position.y
    )
    
    // Smooth interpolation
    const smoothFactor = Math.min(1, this.smoothing * delta * 60)
    this.position.x += (targetPos.x - this.position.x) * smoothFactor
    this.position.y += (targetPos.y - this.position.y) * smoothFactor
    
    // Apply bounds constraints
    this._applyBounds()
  }

  /**
   * Apply camera bounds constraints
   * @private
   */
  _applyBounds() {
    const halfWidth = (this.viewport.width / 2) / this.zoom
    const halfHeight = (this.viewport.height / 2) / this.zoom
    
    // Constrain camera to world bounds
    this.position.x = Math.max(
      this.worldBounds.minX + halfWidth,
      Math.min(this.worldBounds.maxX - halfWidth, this.position.x)
    )
    
    this.position.y = Math.max(
      this.worldBounds.minY + halfHeight,
      Math.min(this.worldBounds.maxY - halfHeight, this.position.y)
    )
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {Vector2D} screenPos 
   * @returns {Vector2D}
   */
  screenToWorld(screenPos) {
    const worldX = (screenPos.x - this.viewport.width / 2) / this.zoom + this.position.x
    const worldY = (screenPos.y - this.viewport.height / 2) / this.zoom + this.position.y
    
    return new Vector2D(worldX, worldY)
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {Vector2D} worldPos 
   * @returns {Vector2D}
   */
  worldToScreen(worldPos) {
    const screenX = (worldPos.x - this.position.x) * this.zoom + this.viewport.width / 2
    const screenY = (worldPos.y - this.position.y) * this.zoom + this.viewport.height / 2
    
    return new Vector2D(screenX, screenY)
  }

  /**
   * Set zoom level
   * @param {number} zoom 
   */
  setZoom(zoom) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom))
    this._applyBounds() // Reapply bounds with new zoom
  }

  /**
   * Apply camera transform to a Pixi container
   * @param {PIXI.Container} container 
   */
  applyToContainer(container) {
    // Safety check for WebGL context loss
    if (!container || !container.position || !container.scale || !container.pivot) {
      console.warn('Container transform lost, skipping camera apply')
      return
    }
    
    // Center the container
    container.position.x = this.viewport.width / 2
    container.position.y = this.viewport.height / 2
    
    // Apply zoom
    container.scale.set(this.zoom, this.zoom)
    
    // Apply camera position (inverted for camera effect)
    container.pivot.x = this.position.x
    container.pivot.y = this.position.y
  }

  /**
   * Update viewport size (for window resize)
   * @param {number} width 
   * @param {number} height 
   */
  updateViewport(width, height) {
    this.viewport.width = width
    this.viewport.height = height
    this._applyBounds()
  }
}
