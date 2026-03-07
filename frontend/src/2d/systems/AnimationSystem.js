import { ANIMATION_CONFIGS } from '../config/animations'

/**
 * AnimationSystem - Manages avatar animations
 * Handles state transitions and sprite animation playback
 */
export class AnimationSystem {
  /**
   * Update avatar animation based on current state
   * @param {Avatar2D} avatar - Avatar instance
   * @param {number} delta - Time delta
   */
  static updateAvatarAnimation(avatar, delta) {
    if (!avatar || !avatar.sprite) return
    
    // Determine target animation state based on avatar state
    let targetState = 'idle'
    
    if (avatar.velocity && avatar.velocity.length() > 0.1) {
      targetState = avatar.isRunning ? 'running' : 'walking'
    } else if (avatar.isSitting) {
      targetState = 'sitting'
    } else if (avatar.isDancing) {
      targetState = 'dancing'
    } else if (avatar.isInteracting) {
      targetState = 'interacting'
    } else if (avatar.isEmoting) {
      targetState = 'emoting'
    }
    
    // Transition to new state if changed
    if (avatar.currentState !== targetState) {
      this.transitionToState(avatar, targetState)
    }
    
    // Update sprite direction based on movement
    if (avatar.velocity && avatar.velocity.x !== 0) {
      avatar.sprite.scale.x = Math.abs(avatar.sprite.scale.x) * (avatar.velocity.x > 0 ? 1 : -1)
    }
  }

  /**
   * Transition avatar to a new animation state
   * @param {Avatar2D} avatar 
   * @param {string} newState 
   */
  static transitionToState(avatar, newState) {
    const config = ANIMATION_CONFIGS[newState]
    if (!config) {
      console.warn('Unknown animation state:', newState)
      return
    }
    
    // Update current state
    avatar.currentState = newState
    
    // If using AnimatedSprite, update animation
    if (avatar.sprite && avatar.sprite.textures) {
      // Get frame textures for this state
      const startFrame = this._getStartFrame(newState)
      const frameCount = config.frames.length
      const frameTextures = []
      
      for (let i = 0; i < frameCount; i++) {
        const frameIndex = startFrame + i
        if (avatar.allTextures && avatar.allTextures[frameIndex]) {
          frameTextures.push(avatar.allTextures[frameIndex])
        }
      }
      
      if (frameTextures.length > 0) {
        avatar.sprite.textures = frameTextures
        avatar.sprite.animationSpeed = config.frameRate / 60
        avatar.sprite.loop = config.loop
        
        // Play animation if not already playing
        if (!avatar.sprite.playing) {
          avatar.sprite.play()
        }
      }
    }
  }

  /**
   * Get starting frame index for animation state
   * @private
   */
  static _getStartFrame(state) {
    const frameMap = {
      'idle': 0,
      'walking': 4,
      'running': 8,
      'sitting': 12,
      'dancing': 13,
      'interacting': 17,
      'emoting': 19
    }
    return frameMap[state] || 0
  }

  /**
   * Play one-shot animation (non-looping)
   * @param {Avatar2D} avatar 
   * @param {string} state 
   * @param {Function} onComplete - Callback when animation completes
   */
  static playOneShotAnimation(avatar, state, onComplete) {
    const config = ANIMATION_CONFIGS[state]
    if (!config || config.loop) {
      console.warn('Cannot play looping animation as one-shot:', state)
      return
    }
    
    // Transition to state
    this.transitionToState(avatar, state)
    
    // Set up completion callback
    if (avatar.sprite && onComplete) {
      avatar.sprite.onComplete = () => {
        onComplete()
        avatar.sprite.onComplete = null
      }
    }
  }

  /**
   * Stop current animation
   * @param {Avatar2D} avatar 
   */
  static stopAnimation(avatar) {
    if (avatar.sprite && avatar.sprite.stop) {
      avatar.sprite.stop()
    }
  }

  /**
   * Pause current animation
   * @param {Avatar2D} avatar 
   */
  static pauseAnimation(avatar) {
    if (avatar.sprite && avatar.sprite.stop) {
      avatar.sprite.stop()
    }
  }

  /**
   * Resume current animation
   * @param {Avatar2D} avatar 
   */
  static resumeAnimation(avatar) {
    if (avatar.sprite && avatar.sprite.play) {
      avatar.sprite.play()
    }
  }
}
