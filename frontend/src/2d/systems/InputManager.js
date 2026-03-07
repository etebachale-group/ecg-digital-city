import { Vector2D } from '../utils/Vector2D'

/**
 * InputManager - Handles keyboard, mouse, and touch input
 * Optimized for both desktop and mobile devices
 */
export class InputManager {
  constructor(config) {
    this.canvas = config.canvas
    this.camera = config.camera
    
    // Keyboard state
    this.keys = new Map()
    
    // Mouse/touch state
    this.mousePosition = new Vector2D(0, 0)
    this.isMouseDown = false
    
    // Callbacks
    this.keyDownCallbacks = []
    this.keyUpCallbacks = []
    this.clickCallbacks = []
    
    // Bind event handlers
    this._handleKeyDown = this._handleKeyDown.bind(this)
    this._handleKeyUp = this._handleKeyUp.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
    this._handleMouseDown = this._handleMouseDown.bind(this)
    this._handleMouseUp = this._handleMouseUp.bind(this)
    this._handleClick = this._handleClick.bind(this)
    
    // Add event listeners
    this._addEventListeners()
  }

  _addEventListeners() {
    window.addEventListener('keydown', this._handleKeyDown)
    window.addEventListener('keyup', this._handleKeyUp)
    
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this._handleMouseMove)
      this.canvas.addEventListener('mousedown', this._handleMouseDown)
      this.canvas.addEventListener('mouseup', this._handleMouseUp)
      this.canvas.addEventListener('click', this._handleClick)
      
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', this._handleMouseDown)
      this.canvas.addEventListener('touchend', this._handleMouseUp)
      this.canvas.addEventListener('touchmove', this._handleMouseMove)
    }
  }

  _handleKeyDown(event) {
    this.keys.set(event.key.toLowerCase(), true)
    
    // Notify callbacks
    this.keyDownCallbacks.forEach(callback => callback(event.key))
  }

  _handleKeyUp(event) {
    this.keys.set(event.key.toLowerCase(), false)
    
    // Notify callbacks
    this.keyUpCallbacks.forEach(callback => callback(event.key))
  }

  _handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    
    // Handle both mouse and touch events
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    
    this.mousePosition.set(
      clientX - rect.left,
      clientY - rect.top
    )
  }

  _handleMouseDown(event) {
    this.isMouseDown = true
    this._handleMouseMove(event)
  }

  _handleMouseUp(event) {
    this.isMouseDown = false
  }

  _handleClick(event) {
    const worldPos = this.getWorldMousePosition()
    this.clickCallbacks.forEach(callback => callback(worldPos))
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key 
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keys.get(key.toLowerCase()) || false
  }

  /**
   * Get normalized movement vector from WASD keys
   * @returns {Vector2D}
   */
  getMovementVector() {
    const movement = new Vector2D(0, 0)
    
    // WASD movement
    if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) {
      movement.y -= 1
    }
    if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) {
      movement.y += 1
    }
    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) {
      movement.x -= 1
    }
    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) {
      movement.x += 1
    }
    
    // Normalize diagonal movement
    if (movement.length() > 0) {
      return movement.normalize()
    }
    
    return movement
  }

  /**
   * Get mouse position in world coordinates
   * @returns {Vector2D}
   */
  getWorldMousePosition() {
    if (this.camera) {
      return this.camera.screenToWorld(this.mousePosition)
    }
    return this.mousePosition.clone()
  }

  /**
   * Register callback for key down events
   * @param {Function} callback 
   */
  onKeyDown(callback) {
    this.keyDownCallbacks.push(callback)
  }

  /**
   * Register callback for key up events
   * @param {Function} callback 
   */
  onKeyUp(callback) {
    this.keyUpCallbacks.push(callback)
  }

  /**
   * Register callback for click events
   * @param {Function} callback 
   */
  onClick(callback) {
    this.clickCallbacks.push(callback)
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('keydown', this._handleKeyDown)
    window.removeEventListener('keyup', this._handleKeyUp)
    
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._handleMouseMove)
      this.canvas.removeEventListener('mousedown', this._handleMouseDown)
      this.canvas.removeEventListener('mouseup', this._handleMouseUp)
      this.canvas.removeEventListener('click', this._handleClick)
      this.canvas.removeEventListener('touchstart', this._handleMouseDown)
      this.canvas.removeEventListener('touchend', this._handleMouseUp)
      this.canvas.removeEventListener('touchmove', this._handleMouseMove)
    }
    
    this.keys.clear()
    this.keyDownCallbacks = []
    this.keyUpCallbacks = []
    this.clickCallbacks = []
  }
}
