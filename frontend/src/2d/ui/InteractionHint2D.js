import * as PIXI from 'pixi.js'

/**
 * InteractionHint2D - Shows interaction hints above interactive objects
 * Displays "Press E to..." messages
 */
export class InteractionHint2D extends PIXI.Container {
  constructor(config) {
    super()
    
    this.message = config.message || 'Press E'
    this.visible = false
    
    this._createHint()
  }

  /**
   * Create the hint visual
   * @private
   */
  _createHint() {
    // Background
    this.background = new PIXI.Graphics()
    this.background.beginFill(0x000000, 0.7)
    this.background.drawRoundedRect(-50, -15, 100, 30, 5)
    this.background.endFill()
    
    // Text
    this.text = new PIXI.Text(this.message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      fill: 0xFFFFFF,
      align: 'center'
    })
    this.text.anchor.set(0.5, 0.5)
    
    this.addChild(this.background)
    this.addChild(this.text)
  }

  /**
   * Show hint with message
   * @param {string} message 
   */
  show(message) {
    if (message) {
      this.text.text = message
    }
    this.visible = true
  }

  /**
   * Hide hint
   */
  hide() {
    this.visible = false
  }

  /**
   * Update hint (pulsing animation)
   * @param {number} delta 
   */
  update(delta) {
    if (this.visible) {
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1
      this.scale.set(pulse, pulse)
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    super.destroy({ children: true })
  }
}
