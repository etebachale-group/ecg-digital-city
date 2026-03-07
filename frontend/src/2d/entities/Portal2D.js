import * as PIXI from 'pixi.js'

/**
 * Portal2D - Interactive portal for district transitions
 * Allows players to travel between districts
 */
export class Portal2D extends PIXI.Container {
  constructor(config) {
    super()
    
    this.id = config.id
    this.targetDistrict = config.targetDistrict
    this.spawnPoint = config.spawnPoint || { x: 0, y: 0 }
    this.position.set(config.x, config.y)
    this.width = config.width || 40
    this.height = config.height || 60
    
    this._createVisual()
    this._createLabel()
    this._startAnimation()
  }

  /**
   * Create portal visual
   * @private
   */
  _createVisual() {
    // Portal frame
    this.frame = new PIXI.Graphics()
    this.frame.lineStyle(3, 0x9C27B0, 1)
    this.frame.beginFill(0x7B1FA2, 0.3)
    this.frame.drawRoundedRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      8
    )
    this.frame.endFill()
    
    // Portal swirl effect
    this.swirl = new PIXI.Graphics()
    this.swirl.beginFill(0xE1BEE7, 0.5)
    this.swirl.drawCircle(0, 0, 15)
    this.swirl.endFill()
    
    this.swirl.beginFill(0xBA68C8, 0.3)
    this.swirl.drawCircle(5, 5, 10)
    this.swirl.endFill()
    
    this.addChild(this.frame)
    this.addChild(this.swirl)
  }

  /**
   * Create label
   * @private
   */
  _createLabel() {
    this.label = new PIXI.Text(`→ ${this.targetDistrict}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2
    })
    this.label.anchor.set(0.5, 0)
    this.label.position.set(0, this.height / 2 + 5)
    this.addChild(this.label)
  }

  /**
   * Start animation loop
   * @private
   */
  _startAnimation() {
    this.animationTime = 0
  }

  /**
   * Update portal animation
   * @param {number} delta 
   */
  update(delta) {
    this.animationTime += delta * 0.05
    
    // Rotate swirl
    if (this.swirl) {
      this.swirl.rotation = this.animationTime
    }
    
    // Pulse effect
    const pulse = 1 + Math.sin(this.animationTime * 2) * 0.1
    if (this.frame) {
      this.frame.scale.set(pulse, pulse)
    }
  }

  /**
   * Check if position is near portal
   * @param {Object} position 
   * @param {number} range 
   * @returns {boolean}
   */
  isNear(position, range) {
    const dx = position.x - this.position.x
    const dy = position.y - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= range
  }

  /**
   * Clean up resources
   */
  destroy() {
    super.destroy({ children: true })
  }
}
