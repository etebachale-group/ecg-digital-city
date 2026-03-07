import * as PIXI from 'pixi.js'
import { Avatar2D } from '../entities/Avatar2D'
import { DistrictRenderer2D } from '../entities/DistrictRenderer2D'
import { CollisionSystem2D } from '../systems/CollisionSystem2D'
import { InteractionHint2D } from '../ui/InteractionHint2D'
import { ConnectionIndicator } from '../ui/ConnectionIndicator'

/**
 * SceneManager - Manages the game scene, districts, and all visual elements
 * Optimized for Render Free tier with minimal memory usage
 */
export class SceneManager {
  constructor(config) {
    this.app = config.app
    this.districtData = config.districtData
    this.onPlayerRef = config.onPlayerRef
    
    // Scene hierarchy
    this.stage = this.app.stage
    this.worldContainer = new PIXI.Container()
    this.uiContainer = new PIXI.Container()
    
    // Enable sorting
    this.worldContainer.sortableChildren = true
    
    // Add containers to stage
    this.stage.addChild(this.worldContainer)
    this.stage.addChild(this.uiContainer)
    
    // Avatar registry
    this.avatars = new Map()
    this.playerAvatar = null
    
    // Systems (will be set externally)
    this.cameraSystem = null
    this.inputManager = null
    
    // District renderer
    this.districtRenderer = null
    
    // Collision system
    this.collisionSystem = new CollisionSystem2D({
      worldBounds: {
        minX: -90,
        maxX: 90,
        minY: -90,
        maxY: 90
      }
    })
    
    // Interaction hint
    this.interactionHint = new InteractionHint2D({
      message: 'Press E'
    })
    this.uiContainer.addChild(this.interactionHint)
    
    // Connection indicator
    this.connectionIndicator = new ConnectionIndicator()
    this.uiContainer.addChild(this.connectionIndicator)
  }

  /**
   * Initialize the scene with district data
   */
  async init() {
    // Create district renderer
    this.districtRenderer = new DistrictRenderer2D({
      districtData: this.districtData,
      container: this.worldContainer,
      collisionSystem: this.collisionSystem
    })
    
    // Load district
    await this.districtRenderer.load()
    
    // Create player avatar
    this._createPlayerAvatar()
  }

  /**
   * Create simple ground plane
   * @private
   * @deprecated - Now handled by DistrictRenderer2D
   */
  _createGround() {
    // This is now handled by DistrictRenderer2D
  }

  /**
   * Create player avatar
   * @private
   */
  _createPlayerAvatar() {
    // Get player customization from game store or use defaults
    const playerConfig = {
      id: 'player',
      username: 'Player',
      position: { x: 0, y: 0 },
      isPlayer: true,
      avatarData: {
        skinColor: '#fdbcb4',
        hairStyle: 'short',
        hairColor: '#8B4513',
        shirtColor: '#3498db',
        pantsColor: '#2c3e50',
        accessories: {}
      }
    }
    
    this.playerAvatar = new Avatar2D(playerConfig)
    this.worldContainer.addChild(this.playerAvatar)
    this.avatars.set('player', this.playerAvatar)
    
    // Notify parent
    if (this.onPlayerRef) {
      this.onPlayerRef(this.playerAvatar)
    }
  }

  /**
   * Add a remote avatar to the scene
   * @param {Object} avatarData 
   * @returns {Avatar2D}
   */
  addAvatar(avatarData) {
    if (this.avatars.has(avatarData.id)) {
      return this.avatars.get(avatarData.id)
    }
    
    const avatar = new Avatar2D({
      id: avatarData.id,
      username: avatarData.username,
      position: avatarData.position || { x: 0, y: 0 },
      isPlayer: false,
      avatarData: avatarData.avatarData || {
        skinColor: '#fdbcb4',
        hairStyle: 'short',
        hairColor: '#000000',
        shirtColor: '#e74c3c',
        pantsColor: '#34495e',
        accessories: {}
      }
    })
    
    this.worldContainer.addChild(avatar)
    this.avatars.set(avatarData.id, avatar)
    
    return avatar
  }

  /**
   * Remove an avatar from the scene
   * @param {string} avatarId 
   */
  removeAvatar(avatarId) {
    const avatar = this.avatars.get(avatarId)
    if (avatar) {
      this.worldContainer.removeChild(avatar)
      avatar.destroy()
      this.avatars.delete(avatarId)
    }
  }

  /**
   * Update scene (called every frame)
   * @param {number} delta 
   */
  update(delta) {
    // Update all avatars
    this.avatars.forEach(avatar => {
      avatar.update(delta)
    })
    
    // Update district renderer (portals animation)
    if (this.districtRenderer) {
      this.districtRenderer.update(delta)
    }
    
    // Update interaction hint
    if (this.interactionHint) {
      this.interactionHint.update(delta)
    }
    
    // Update connection indicator
    if (this.connectionIndicator) {
      this.connectionIndicator.update(delta)
    }
    
    // Depth sorting (Y-axis sorting for 2D)
    this._sortByDepth()
  }

  /**
   * Sort sprites by Y position for proper depth rendering
   * @private
   */
  _sortByDepth() {
    this.worldContainer.children.sort((a, b) => {
      const aY = a.position?.y || 0
      const bY = b.position?.y || 0
      return aY - bY
    })
  }

  /**
   * Load a new district
   * @param {Object} districtData 
   */
  async loadDistrict(districtData) {
    console.log('🔄 Loading new district:', districtData?.name)
    
    // Clear current district
    if (this.districtRenderer) {
      this.districtRenderer.destroy()
    }
    
    // Clear collision system
    this.collisionSystem.clear()
    
    // Clear avatars except player
    this.avatars.forEach((avatar, id) => {
      if (avatar !== this.playerAvatar) {
        this.worldContainer.removeChild(avatar)
        avatar.destroy()
        this.avatars.delete(id)
      }
    })
    
    // Load new district
    this.districtData = districtData
    this.districtRenderer = new DistrictRenderer2D({
      districtData,
      container: this.worldContainer,
      collisionSystem: this.collisionSystem
    })
    
    await this.districtRenderer.load()
    
    // Re-add player avatar to ensure it's on top
    if (this.playerAvatar) {
      this.worldContainer.removeChild(this.playerAvatar)
      this.worldContainer.addChild(this.playerAvatar)
    }
    
    console.log('✅ District loaded successfully')
  }

  /**
   * Get nearby portal
   * @param {Object} position 
   * @param {number} range 
   * @returns {Object|null}
   */
  getNearbyPortal(position, range) {
    if (this.districtRenderer) {
      return this.districtRenderer.getNearbyPortal(position, range)
    }
    return null
  }

  /**
   * Show interaction hint at world position
   * @param {Object} worldPos 
   * @param {string} message 
   */
  showInteractionHint(worldPos, message) {
    if (this.interactionHint && this.cameraSystem) {
      const screenPos = this.cameraSystem.worldToScreen(worldPos)
      this.interactionHint.position.set(screenPos.x, screenPos.y - 40)
      this.interactionHint.show(message)
    }
  }

  /**
   * Hide interaction hint
   */
  hideInteractionHint() {
    if (this.interactionHint) {
      this.interactionHint.hide()
    }
  }

  /**
   * Set connection status
   * @param {string} status - 'online', 'offline', 'reconnecting'
   */
  setConnectionStatus(status) {
    if (this.connectionIndicator) {
      this.connectionIndicator.setStatus(status)
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.districtRenderer) {
      this.districtRenderer.destroy()
    }
    
    this.avatars.forEach(avatar => avatar.destroy())
    this.avatars.clear()
    
    this.worldContainer.destroy({ children: true })
    this.uiContainer.destroy({ children: true })
  }
}
