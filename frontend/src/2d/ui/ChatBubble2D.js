import * as PIXI from 'pixi.js'

/**
 * ChatBubble2D - Speech bubble that appears above avatars
 * Displays chat messages in the 2D world
 */
export class ChatBubble2D extends PIXI.Container {
  constructor(config) {
    super()
    
    this.message = config.message || ''
    this.maxWidth = config.maxWidth || 200
    this.padding = 10
    this.lifetime = config.lifetime || 5000 // 5 seconds
    this.createdAt = Date.now()
    
    this._createBubble()
  }

  /**
   * Create the visual bubble
   * @private
   */
  _createBubble() {
    // Create text
    const textStyle = new PIXI.TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: '#000000',
      wordWrap: true,
      wordWrapWidth: this.maxWidth - this.padding * 2,
      align: 'center'
    })
    
    this.text = new PIXI.Text(this.message, textStyle)
    this.text.anchor.set(0.5, 0.5)
    
    // Calculate bubble dimensions
    const bubbleWidth = Math.min(this.text.width + this.padding * 2, this.maxWidth)
    const bubbleHeight = this.text.height + this.padding * 2
    
    // Create bubble background
    this.background = new PIXI.Graphics()
    this.background.beginFill(0xFFFFFF, 0.95)
    this.background.lineStyle(2, 0x333333, 1)
    this.background.drawRoundedRect(
      -bubbleWidth / 2,
      -bubbleHeight / 2,
      bubbleWidth,
      bubbleHeight,
      8
    )
    this.background.endFill()
    
    // Create tail (pointing down to avatar)
    this.background.beginFill(0xFFFFFF, 0.95)
    this.background.lineStyle(2, 0x333333, 1)
    this.background.moveTo(-8, bubbleHeight / 2)
    this.background.lineTo(0, bubbleHeight / 2 + 8)
    this.background.lineTo(8, bubbleHeight / 2)
    this.background.lineTo(-8, bubbleHeight / 2)
    this.background.endFill()
    
    // Add to container
    this.addChild(this.background)
    this.addChild(this.text)
    
    // Position above avatar (will be set by avatar)
    this.position.y = -50
  }

  /**
   * Update bubble (check lifetime)
   * @param {number} delta 
   * @returns {boolean} - true if should be removed
   */
  update(delta) {
    const elapsed = Date.now() - this.createdAt
    
    // Fade out in last second
    if (elapsed > this.lifetime - 1000) {
      const fadeProgress = (elapsed - (this.lifetime - 1000)) / 1000
      this.alpha = 1 - fadeProgress
    }
    
    // Return true if expired
    return elapsed >= this.lifetime
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.background) {
      this.background.destroy()
    }
    if (this.text) {
      this.text.destroy()
    }
    super.destroy({ children: true })
  }
}
