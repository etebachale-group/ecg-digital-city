/**
 * Vector2D - 2D vector math utility class
 * Provides essential vector operations for 2D game development
 */
export class Vector2D {
  constructor(x = 0, y = 0) {
    // Validate inputs
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('Vector2D coordinates must be finite numbers')
    }
    
    this.x = x
    this.y = y
  }

  /**
   * Add two vectors
   * @param {Vector2D} a 
   * @param {Vector2D} b 
   * @returns {Vector2D}
   */
  static add(a, b) {
    return new Vector2D(a.x + b.x, a.y + b.y)
  }

  /**
   * Subtract vector b from vector a
   * @param {Vector2D} a 
   * @param {Vector2D} b 
   * @returns {Vector2D}
   */
  static subtract(a, b) {
    return new Vector2D(a.x - b.x, a.y - b.y)
  }

  /**
   * Multiply vector by scalar
   * @param {Vector2D} v 
   * @param {number} scalar 
   * @returns {Vector2D}
   */
  static multiply(v, scalar) {
    return new Vector2D(v.x * scalar, v.y * scalar)
  }

  /**
   * Calculate distance between two vectors
   * @param {Vector2D} a 
   * @param {Vector2D} b 
   * @returns {number}
   */
  static distance(a, b) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Normalize a vector (return unit vector)
   * @param {Vector2D} v 
   * @returns {Vector2D}
   */
  static normalize(v) {
    const len = v.length()
    if (len === 0) {
      return new Vector2D(0, 0)
    }
    return new Vector2D(v.x / len, v.y / len)
  }

  /**
   * Calculate dot product of two vectors
   * @param {Vector2D} a 
   * @param {Vector2D} b 
   * @returns {number}
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y
  }

  /**
   * Get the length (magnitude) of this vector
   * @returns {number}
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Normalize this vector (convert to unit vector)
   * @returns {Vector2D}
   */
  normalize() {
    return Vector2D.normalize(this)
  }

  /**
   * Clone this vector
   * @returns {Vector2D}
   */
  clone() {
    return new Vector2D(this.x, this.y)
  }

  /**
   * Set vector values
   * @param {number} x 
   * @param {number} y 
   */
  set(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('Vector2D coordinates must be finite numbers')
    }
    this.x = x
    this.y = y
  }

  /**
   * Check if two vectors are equal (within epsilon)
   * @param {Vector2D} other 
   * @param {number} epsilon 
   * @returns {boolean}
   */
  equals(other, epsilon = 0.0001) {
    return Math.abs(this.x - other.x) < epsilon && 
           Math.abs(this.y - other.y) < epsilon
  }
}
