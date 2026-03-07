import * as PIXI from 'pixi.js'

/**
 * ConnectionIndicator - Shows connection status
 * Displays online/offline/reconnecting status
 */
export class ConnectionIndicator extends PIXI.Container {
  constructor() {
    super()
    
    this.status = 'online' // online, offline, reconnecting
    this.position.set(10, 10)
    
    this._createIndicator()
  }

  /**
   * Create the indicator visual
   * @private
   */
  _createIndicator() {
    // Background
    this.background = new PIXI.Graphics()
    this.background.beginFill(0x000000, 0.7)
    this.background.drawRoundedRect(0, 0, 120, 30, 5)
    this.background.endFill()
    
    // Status dot
    this.statusDot = new PIXI.Graphics()
    this.statusDot.beginFill(0x4CAF50) // Green for online
    this.statusDot.drawCircle(15, 15, 6)
    this.statusDot.endFill()
    
    // Status text
    this.statusText = new PIXI.Text('Online', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      fill: 0xFFFFFF
    })
    this.statusText.position.set(30, 8)
    
    this.addChild(this.background)
    this.addChild(this.statusDot)
    this.addChild(this.statusText)
    
    // Start hidden (only show when offline)
    this.visible = false
  }

  /**
   * Set connection status
   * @param {string} status - 'online', 'offline', 'reconnecting'
   */
  setStatus(status) {
    this.status = status
    
    // Update visual
    this.statusDot.clear()
    
    switch (status) {
      case 'online':
        this.statusDot.beginFill(0x4CAF50) // Green
        this.statusDot.drawCircle(15, 15, 6)
        this.statusDot.endFill()
        this.statusText.text = 'Online'
        this.visible = false // Hide when online
        break
        
      case 'offline':
        this.statusDot.beginFill(0xF44336) // Red
        this.statusDot.drawCircle(15, 15, 6)
        this.statusDot.endFill()
        this.statusText.text = 'Offline'
        this.visible = true
        break
        
      case 'reconnecting':
        this.statusDot.beginFill(0xFFC107) // Yellow
        this.statusDot.drawCircle(15, 15, 6)
        this.statusDot.endFill()
        this.statusText.text = 'Reconnecting...'
        this.visible = true
        break
    }
  }

  /**
   * Update indicator (pulsing animation when reconnecting)
   * @param {number} delta 
   */
  update(delta) {
    if (this.status === 'reconnecting') {
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2
      this.statusDot.scale.set(pulse, pulse)
    } else {
      this.statusDot.scale.set(1, 1)
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    super.destroy({ children: true })
  }
}
