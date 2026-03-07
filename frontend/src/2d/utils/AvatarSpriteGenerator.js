import * as PIXI from 'pixi.js'

/**
 * AvatarSpriteGenerator - Generates procedural avatar sprites
 * Perfect for Render Free tier - no image files needed!
 * Creates simple but effective 2D avatars using Pixi.js Graphics
 */
export class AvatarSpriteGenerator {
  /**
   * Generate avatar textures based on customization
   * @param {Object} customization - Avatar customization data
   * @returns {PIXI.Texture[]} Array of textures for animation frames
   */
  static generateAvatarTextures(customization = {}) {
    const {
      skinColor = '#fdbcb4',
      hairStyle = 'short',
      hairColor = '#000000',
      shirtColor = '#3498db',
      pantsColor = '#2c3e50',
      accessories = {}
    } = customization

    // Generate textures for different animation states
    const textures = []
    
    // Idle frames (4 frames - subtle breathing animation)
    for (let i = 0; i < 4; i++) {
      textures.push(this._createIdleFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    // Walking frames (4 frames)
    for (let i = 0; i < 4; i++) {
      textures.push(this._createWalkFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    // Running frames (4 frames)
    for (let i = 0; i < 4; i++) {
      textures.push(this._createRunFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    // Sitting frame (1 frame)
    textures.push(this._createSittingFrame(skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    
    // Dancing frames (4 frames)
    for (let i = 0; i < 4; i++) {
      textures.push(this._createDanceFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    // Interacting frames (2 frames)
    for (let i = 0; i < 2; i++) {
      textures.push(this._createInteractFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    // Emoting frames (3 frames)
    for (let i = 0; i < 3; i++) {
      textures.push(this._createEmoteFrame(i, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories))
    }
    
    return textures
  }

  /**
   * Create idle animation frame
   * @private
   */
  static _createIdleFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const breathOffset = Math.sin(frameIndex * Math.PI / 2) * 1 // Subtle breathing
    
    // Body (shirt)
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12, 8 + breathOffset, 24, 20)
    graphics.endFill()
    
    // Legs (pants)
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10, 28, 8, 16) // Left leg
    graphics.drawRect(2, 28, 8, 16)   // Right leg
    graphics.endFill()
    
    // Head (skin)
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, 0, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, 0)
    
    // Eyes
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4, -2, 2)
    graphics.drawCircle(4, -2, 2)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create walking animation frame
   * @private
   */
  static _createWalkFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const legOffset = Math.sin(frameIndex * Math.PI / 2) * 4
    
    // Body
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12, 8, 24, 20)
    graphics.endFill()
    
    // Legs (animated)
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10, 28 + legOffset, 8, 16) // Left leg
    graphics.drawRect(2, 28 - legOffset, 8, 16)   // Right leg
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, 0, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, 0)
    
    // Eyes
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4, -2, 2)
    graphics.drawCircle(4, -2, 2)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create running animation frame
   * @private
   */
  static _createRunFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const legOffset = Math.sin(frameIndex * Math.PI / 2) * 6 // More movement
    const bodyTilt = Math.sin(frameIndex * Math.PI / 2) * 2
    
    // Body (tilted forward)
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12, 8 + bodyTilt, 24, 20)
    graphics.endFill()
    
    // Legs (more animated)
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10, 28 + legOffset, 8, 16)
    graphics.drawRect(2, 28 - legOffset, 8, 16)
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, bodyTilt, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, bodyTilt)
    
    // Eyes
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4, -2 + bodyTilt, 2)
    graphics.drawCircle(4, -2 + bodyTilt, 2)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create sitting frame
   * @private
   */
  static _createSittingFrame(skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    
    // Body (sitting position)
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12, 12, 24, 16)
    graphics.endFill()
    
    // Legs (bent)
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10, 28, 8, 12)
    graphics.drawRect(2, 28, 8, 12)
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, 0, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, 0)
    
    // Eyes
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4, -2, 2)
    graphics.drawCircle(4, -2, 2)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create dancing animation frame
   * @private
   */
  static _createDanceFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const bounce = Math.abs(Math.sin(frameIndex * Math.PI / 2)) * 4
    const sway = Math.sin(frameIndex * Math.PI / 2) * 3
    
    // Body (bouncing and swaying)
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12 + sway, 8 - bounce, 24, 20)
    graphics.endFill()
    
    // Legs
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10 + sway, 28 - bounce, 8, 16)
    graphics.drawRect(2 + sway, 28 - bounce, 8, 16)
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(sway, -bounce, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, -bounce, sway)
    
    // Eyes (happy)
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4 + sway, -2 - bounce, 2)
    graphics.drawCircle(4 + sway, -2 - bounce, 2)
    graphics.endFill()
    
    // Smile
    graphics.lineStyle(1, 0x000000)
    graphics.arc(sway, 2 - bounce, 4, 0, Math.PI)
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create interacting frame
   * @private
   */
  static _createInteractFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const armExtend = frameIndex === 0 ? 0 : 4
    
    // Body
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12, 8, 24, 20)
    graphics.endFill()
    
    // Arm extended (interaction)
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawRect(12, 12, 8 + armExtend, 4)
    graphics.endFill()
    
    // Legs
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10, 28, 8, 16)
    graphics.drawRect(2, 28, 8, 16)
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, 0, 10)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, 0)
    
    // Eyes
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4, -2, 2)
    graphics.drawCircle(4, -2, 2)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Create emoting frame
   * @private
   */
  static _createEmoteFrame(frameIndex, skinColor, hairStyle, hairColor, shirtColor, pantsColor, accessories) {
    const graphics = new PIXI.Graphics()
    const scale = 1 + (frameIndex * 0.1) // Grow slightly
    
    // Body
    graphics.beginFill(this._hexToNumber(shirtColor))
    graphics.drawRect(-12 * scale, 8, 24 * scale, 20)
    graphics.endFill()
    
    // Legs
    graphics.beginFill(this._hexToNumber(pantsColor))
    graphics.drawRect(-10 * scale, 28, 8 * scale, 16)
    graphics.drawRect(2 * scale, 28, 8 * scale, 16)
    graphics.endFill()
    
    // Head
    graphics.beginFill(this._hexToNumber(skinColor))
    graphics.drawCircle(0, 0, 10 * scale)
    graphics.endFill()
    
    // Hair
    this._drawHair(graphics, hairStyle, hairColor, 0, 0, scale)
    
    // Eyes (excited)
    graphics.beginFill(0x000000)
    graphics.drawCircle(-4 * scale, -2, 3)
    graphics.drawCircle(4 * scale, -2, 3)
    graphics.endFill()
    
    // Accessories
    this._drawAccessories(graphics, accessories)
    
    return this._graphicsToTexture(graphics)
  }

  /**
   * Draw hair based on style
   * @private
   */
  static _drawHair(graphics, hairStyle, hairColor, yOffset = 0, xOffset = 0, scale = 1) {
    graphics.beginFill(this._hexToNumber(hairColor))
    
    switch (hairStyle) {
      case 'short':
        graphics.drawRect(-8 * scale + xOffset, -10 + yOffset, 16 * scale, 6)
        break
      case 'long':
        graphics.drawRect(-8 * scale + xOffset, -10 + yOffset, 16 * scale, 12)
        break
      case 'ponytail':
        graphics.drawRect(-8 * scale + xOffset, -10 + yOffset, 16 * scale, 6)
        graphics.drawCircle(0 + xOffset, -12 + yOffset, 4 * scale)
        break
      case 'bald':
        // No hair
        break
      default:
        graphics.drawRect(-8 * scale + xOffset, -10 + yOffset, 16 * scale, 6)
    }
    
    graphics.endFill()
  }

  /**
   * Draw accessories
   * @private
   */
  static _drawAccessories(graphics, accessories) {
    if (accessories.hat) {
      graphics.beginFill(0x8B4513) // Brown hat
      graphics.drawRect(-10, -16, 20, 4)
      graphics.drawCircle(0, -14, 8)
      graphics.endFill()
    }
    
    if (accessories.glasses) {
      graphics.lineStyle(2, 0x000000)
      graphics.drawCircle(-4, -2, 3)
      graphics.drawCircle(4, -2, 3)
      graphics.moveTo(-1, -2)
      graphics.lineTo(1, -2)
    }
  }

  /**
   * Convert hex color string to number
   * @private
   */
  static _hexToNumber(hex) {
    return parseInt(hex.replace('#', ''), 16)
  }

  /**
   * Convert Graphics to Texture
   * @private
   */
  static _graphicsToTexture(graphics) {
    const bounds = graphics.getBounds()
    const renderTexture = PIXI.RenderTexture.create({
      width: Math.ceil(bounds.width) + 40,
      height: Math.ceil(bounds.height) + 60
    })
    
    // Center the graphics
    graphics.position.set(20, 30)
    
    const renderer = PIXI.autoDetectRenderer()
    renderer.render(graphics, { renderTexture })
    
    return renderTexture
  }
}
