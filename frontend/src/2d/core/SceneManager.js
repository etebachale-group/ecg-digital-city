import * as PIXI from 'pixi.js'
import { Avatar2D } from '../entities/Avatar2D'

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
    
    // Add containers to stage
    this.stage.addChild(this.worldContainer)
    this.stage.addChild(this.uiContainer)
    
    // Avatar registry
    this.avatars = new Map()
    this.playerAvatar = null
    
    // Systems (will be set externally)
    this.cameraSystem = null
    this.inputManager = null
  }

  /**
   * Initialize the scene with district data
   */
  async init() {
    // Create simple ground
    this._createGround()
    
    // Create player avatar
    this._createPlayerAvatar()
  }

  /**
   * Create simple ground plane
   * @private
   */
  _createGround() {
    const ground = new PIXI.Graphics()
    ground.beginFill(0x90EE90) // Light green
    ground.drawRect(-100, -100, 200, 200)
    ground.endFill()
    this.worldContainer.addChild(ground)
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
    // Clear current district
    this.worldContainer.removeChildren()
    
    // Load new district
    this.districtData = districtData
    this._createGround()
    
    // Re-add player avatar
    if (this.playerAvatar) {
      this.worldContainer.addChild(this.playerAvatar)
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.avatars.forEach(avatar => avatar.destroy())
    this.avatars.clear()
    
    this.worldContainer.destroy({ children: true })
    this.uiContainer.destroy({ children: true })
  }
}
