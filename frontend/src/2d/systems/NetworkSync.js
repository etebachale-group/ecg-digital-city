import { emitMove } from '../../services/socket'

/**
 * NetworkSync - Handles network synchronization for multiplayer
 * Optimized for Render Free tier with throttling and delta compression
 */
export class NetworkSync {
  constructor(config) {
    this.sceneManager = config.sceneManager
    this.playerAvatar = config.playerAvatar
    
    // Network optimization
    this.lastSentPosition = { x: 0, y: 0 }
    this.lastSentTime = 0
    this.updateInterval = 100 // 10 updates per second (optimized for Render Free)
    this.positionThreshold = 0.5 // Only send if moved more than 0.5 units
    
    // Connection state
    this.isConnected = true
    this.queuedUpdates = []
  }

  /**
   * Update network sync (called every frame)
   * @param {number} delta 
   */
  update(delta) {
    if (!this.playerAvatar) return
    
    const now = Date.now()
    
    // Throttle position updates
    if (now - this.lastSentTime >= this.updateInterval) {
      this._sendPositionUpdate()
      this.lastSentTime = now
    }
  }

  /**
   * Send position update to server (with delta compression)
   * @private
   */
  _sendPositionUpdate() {
    const currentPos = {
      x: this.playerAvatar.position.x,
      y: this.playerAvatar.position.y
    }
    
    // Check if position changed significantly
    const dx = Math.abs(currentPos.x - this.lastSentPosition.x)
    const dy = Math.abs(currentPos.y - this.lastSentPosition.y)
    
    if (dx > this.positionThreshold || dy > this.positionThreshold) {
      // Send update
      if (this.isConnected) {
        emitMove({
          x: currentPos.x,
          y: 0, // 2D mode, no Y axis
          z: currentPos.y // Use Z for 2D Y coordinate
        }, 0) // No rotation in 2D for now
        
        this.lastSentPosition = currentPos
      } else {
        // Queue update for when connection is restored
        this.queuedUpdates.push({
          position: currentPos,
          timestamp: Date.now()
        })
      }
    }
  }

  /**
   * Handle player joined event
   * @param {Object} data 
   */
  onPlayerJoined(data) {
    if (!this.sceneManager) return
    
    console.log('👤 Player joined:', data.username)
    
    this.sceneManager.addAvatar({
      id: data.userId,
      username: data.username,
      position: {
        x: data.position?.x || 0,
        y: data.position?.z || 0 // Map Z to 2D Y
      },
      avatarData: data.avatarData || {}
    })
  }

  /**
   * Handle player moved event
   * @param {Object} data 
   */
  onPlayerMoved(data) {
    if (!this.sceneManager) return
    
    const avatar = this.sceneManager.avatars.get(data.userId)
    if (avatar && avatar !== this.playerAvatar) {
      // Update remote player position
      avatar.moveTo({
        x: data.position?.x || 0,
        y: data.position?.z || 0 // Map Z to 2D Y
      })
      
      // Update velocity for animation
      if (data.velocity) {
        avatar.setVelocity({
          x: data.velocity.x || 0,
          y: data.velocity.z || 0
        })
      }
    }
  }

  /**
   * Handle player left event
   * @param {Object} data 
   */
  onPlayerLeft(data) {
    if (!this.sceneManager) return
    
    console.log('👋 Player left:', data.userId)
    this.sceneManager.removeAvatar(data.userId)
  }

  /**
   * Handle initial users list
   * @param {Object} data 
   */
  onUsersList(data) {
    if (!this.sceneManager) return
    
    console.log('📋 Users list received:', data.users.length, 'users')
    
    data.users.forEach(user => {
      // Don't add ourselves
      if (user.userId !== this.playerAvatar?.id) {
        this.sceneManager.addAvatar({
          id: user.userId,
          username: user.username || 'Usuario',
          position: {
            x: user.positionX || 0,
            y: user.positionZ || 0 // Map Z to 2D Y
          },
          avatarData: user.avatarData || {}
        })
      }
    })
  }

  /**
   * Handle connection lost
   */
  onDisconnect() {
    console.warn('🔌 Connection lost')
    this.isConnected = false
    
    // Freeze all remote players
    if (this.sceneManager) {
      this.sceneManager.avatars.forEach((avatar, id) => {
        if (avatar !== this.playerAvatar) {
          avatar.setVelocity({ x: 0, y: 0 })
        }
      })
    }
  }

  /**
   * Handle connection restored
   */
  onReconnect() {
    console.log('✅ Connection restored')
    this.isConnected = true
    
    // Send queued updates
    this._syncQueuedUpdates()
  }

  /**
   * Sync queued updates after reconnection
   * @private
   */
  _syncQueuedUpdates() {
    if (this.queuedUpdates.length === 0) return
    
    console.log('📤 Syncing', this.queuedUpdates.length, 'queued updates')
    
    // Send most recent position
    const lastUpdate = this.queuedUpdates[this.queuedUpdates.length - 1]
    emitMove({
      x: lastUpdate.position.x,
      y: 0,
      z: lastUpdate.position.y
    }, 0)
    
    // Clear queue
    this.queuedUpdates = []
  }

  /**
   * Set player avatar reference
   * @param {Avatar2D} avatar 
   */
  setPlayerAvatar(avatar) {
    this.playerAvatar = avatar
    if (avatar) {
      this.lastSentPosition = {
        x: avatar.position.x,
        y: avatar.position.y
      }
    }
  }

  /**
   * Clean up
   */
  destroy() {
    this.queuedUpdates = []
  }
}
