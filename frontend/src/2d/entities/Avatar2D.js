import * as PIXI from 'pixi.js'
import { Vector2D } from '../utils/Vector2D'
import { AvatarSpriteGenerator } from '../utils/AvatarSpriteGenerator'
import { AnimationSystem } from '../systems/AnimationSystem'
import { ChatBubble2D } from '../ui/ChatBubble2D'
import { validateAvatarData, validateUsername, sanitizeChatMessage } from '../utils/DataValidator'

/**
 * Avatar2D - 2D avatar representation with sprite-based rendering
 * Now with procedural sprite generation and animations!
 */
export class Avatar2D extends PIXI.Container {
  constructor(config) {
    super()
    
    this.id = config.id
    this.username = validateUsername(config.username)
    this.isPlayer = config.isPlayer || false
    this.avatarData = validateAvatarData(config.avatarData)
    
    // Position and movement
    this.position.set(config.position.x, config.position.y)
    this.velocity = new Vector2D(0, 0)
    
    // Animation state
    this.currentState = 'idle'
    this.isRunning = false
    this.isSitting = false
    this.isDancing = false
    this.isInteracting = false
    this.isEmoting = false
    
    // For smooth interpolation
    this.targetPosition = new Vector2D(config.position.x, config.position.y)
    
    // Chat bubble
    this.chatBubble = null
    
    // Generate sprite textures
    this._initializeSprite()
    
    // Create username label
    this._createNameLabel()
  }

  /**
   * Initialize sprite with procedural textures
   * @private
   */
  _initializeSprite() {
    try {
      // Generate all animation textures
      this.allTextures = AvatarSpriteGenerator.generateAvatarTextures(this.avatarData)
      
      // Create animated sprite with idle frames
      const idleTextures = this.allTextures.slice(0, 4)
      this.sprite = new PIXI.AnimatedSprite(idleTextures)
      this.sprite.anchor.set(0.5, 0.5)
      this.sprite.animationSpeed = 0.1
      this.sprite.loop = true
      this.sprite.play()
      
      this.addChild(this.sprite)
    } catch (error) {
      console.error('Error generating avatar sprite:', error)
      // Fallback to simple rectangle
      this._createFallbackSprite()
    }
  }

  /**
   * Create fallback sprite if generation fails
   * @private
   */
  _createFallbackSprite() {
    this.sprite = new PIXI.Graphics()
    this.sprite.beginFill(this.isPlayer ? 0x3498db : 0xe74c3c)
    // Aumentar tamaño del avatar: 64x96 (más grande y visible)
    this.sprite.drawRect(-32, -48, 64, 96)
    this.sprite.endFill()
    
    // Agregar círculo para la cabeza
    this.sprite.beginFill(this.isPlayer ? 0xfdbcb4 : 0xf5a89c)
    this.sprite.drawCircle(0, -32, 20)
    this.sprite.endFill()
    
    this.addChild(this.sprite)
  }

  /**
   * Create username label
   * @private
   */
  _createNameLabel() {
    this.nameLabel = new PIXI.Text(this.username, {
      fontFamily: 'Arial',
      fontSize: 16, // Aumentar tamaño de fuente
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 3
    })
    this.nameLabel.anchor.set(0.5, 1)
    this.nameLabel.position.set(0, -60) // Ajustar posición para avatar más grande
    this.addChild(this.nameLabel)
  }

  /**
   * Update avatar (called every frame)
   * @param {number} delta 
   */
  update(delta) {
    // Safety check for WebGL context loss
    if (!this.transform || !this.position) {
      console.warn('Avatar transform lost, skipping update')
      return
    }
    
    // Smooth position interpolation
    const smoothFactor = 0.2
    this.position.x += (this.targetPosition.x - this.position.x) * smoothFactor
    this.position.y += (this.targetPosition.y - this.position.y) * smoothFactor
    
    // Update animation
    try {
      AnimationSystem.updateAvatarAnimation(this, delta)
    } catch (error) {
      console.error('Error updating animation:', error)
    }
    
    // Update chat bubble
    if (this.chatBubble) {
      try {
        const shouldRemove = this.chatBubble.update(delta)
        if (shouldRemove) {
          this.removeChatBubble()
        }
      } catch (error) {
        console.error('Error updating chat bubble:', error)
        this.removeChatBubble()
      }
    }
  }

  /**
   * Move avatar to a position
   * @param {Vector2D} position 
   */
  moveTo(position) {
    // Safety check for WebGL context loss
    if (!this.targetPosition) {
      console.warn('Avatar targetPosition lost, skipping moveTo')
      return
    }
    this.targetPosition.set(position.x, position.y)
  }

  /**
   * Set avatar velocity
   * @param {Vector2D} velocity 
   */
  setVelocity(velocity) {
    this.velocity = velocity
  }

  /**
   * Set avatar customization and regenerate sprite
   * @param {Object} customization 
   */
  setCustomization(customization) {
    this.avatarData = validateAvatarData(customization)
    
    // Remove old sprite
    if (this.sprite) {
      this.removeChild(this.sprite)
      if (this.sprite.destroy) {
        this.sprite.destroy()
      }
    }
    
    // Regenerate sprite with new customization
    this._initializeSprite()
  }

  /**
   * Play animation state
   * @param {string} state 
   */
  playAnimation(state) {
    AnimationSystem.transitionToState(this, state)
  }

  /**
   * Trigger emote
   * @param {Function} onComplete 
   */
  emote(onComplete) {
    this.isEmoting = true
    AnimationSystem.playOneShotAnimation(this, 'emoting', () => {
      this.isEmoting = false
      if (onComplete) onComplete()
    })
  }

  /**
   * Show chat message above avatar
   * @param {string} message 
   */
  showChatMessage(message) {
    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeChatMessage(message)
    
    if (!sanitizedMessage) {
      return // Don't show empty messages
    }
    
    // Remove existing bubble
    this.removeChatBubble()
    
    // Create new bubble
    this.chatBubble = new ChatBubble2D({
      message: sanitizedMessage,
      maxWidth: 200,
      lifetime: 5000
    })
    
    this.addChild(this.chatBubble)
  }

  /**
   * Remove chat bubble
   */
  removeChatBubble() {
    if (this.chatBubble) {
      this.removeChild(this.chatBubble)
      this.chatBubble.destroy()
      this.chatBubble = null
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove chat bubble
    this.removeChatBubble()
    
    // Destroy textures
    if (this.allTextures) {
      this.allTextures.forEach(texture => {
        if (texture && texture.destroy) {
          texture.destroy(true)
        }
      })
    }
    
    super.destroy({ children: true })
  }
}
