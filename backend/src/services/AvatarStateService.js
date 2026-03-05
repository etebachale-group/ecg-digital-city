const Avatar = require('../models/Avatar');
const logger = require('../utils/logger');

/**
 * AvatarStateService
 * 
 * Manages avatar states (idle, walking, running, sitting, interacting, dancing)
 * with a state machine that validates transitions and synchronizes changes
 * across all clients via Socket.IO.
 * 
 * State Machine Transitions:
 * - idle → walking, sitting, interacting, dancing
 * - walking → idle, running
 * - running → walking, idle
 * - sitting → idle
 * - interacting → idle
 * - dancing → idle
 */
class AvatarStateService {
  constructor() {
    // Define valid state transitions
    this.transitions = {
      idle: ['walking', 'sitting', 'interacting', 'dancing'],
      walking: ['idle', 'running'],
      running: ['walking', 'idle'],
      sitting: ['idle'],
      interacting: ['idle'],
      dancing: ['idle']
    };

    // Valid states
    this.validStates = ['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'];
  }

  /**
   * Validate if a state transition is allowed
   * @param {string} currentState - Current avatar state
   * @param {string} newState - Desired new state
   * @returns {boolean} - True if transition is valid
   */
  validateTransition(currentState, newState) {
    // Validate states exist
    if (!this.validStates.includes(currentState)) {
      logger.warn(`Invalid current state: ${currentState}`);
      return false;
    }

    if (!this.validStates.includes(newState)) {
      logger.warn(`Invalid new state: ${newState}`);
      return false;
    }

    // Same state is always valid (no-op)
    if (currentState === newState) {
      return true;
    }

    // Check if transition is allowed
    const allowedTransitions = this.transitions[currentState] || [];
    return allowedTransitions.includes(newState);
  }

  /**
   * Change avatar state with validation
   * @param {number} userId - User ID
   * @param {string} newState - New state to transition to
   * @param {Object} context - Additional context (objectId, nodeId, position, etc.)
   * @returns {Object} - Updated avatar state or error
   */
  async changeState(userId, newState, context = {}) {
    try {
      // Find avatar
      const avatar = await Avatar.findOne({ where: { userId } });
      
      if (!avatar) {
        return {
          success: false,
          error: 'Avatar not found'
        };
      }

      const currentState = avatar.currentState || 'idle';

      // Validate transition
      if (!this.validateTransition(currentState, newState)) {
        return {
          success: false,
          error: `Invalid state transition: ${currentState} -> ${newState}`,
          currentState
        };
      }

      // If same state, no need to update
      if (currentState === newState) {
        return {
          success: true,
          state: currentState,
          previousState: avatar.previousState,
          noChange: true
        };
      }

      // Update avatar state
      const updates = {
        previousState: currentState,
        currentState: newState,
        stateChangedAt: new Date()
      };

      // Handle state-specific context
      if (newState === 'sitting' && context.nodeId) {
        updates.sittingAt = context.nodeId;
        updates.interactingWith = context.objectId || null;
      } else if (newState === 'interacting' && context.objectId) {
        updates.interactingWith = context.objectId;
        updates.sittingAt = null;
      } else {
        // Clear interaction references when returning to idle/walking/running
        if (['idle', 'walking', 'running'].includes(newState)) {
          updates.interactingWith = null;
          updates.sittingAt = null;
        }
      }

      await avatar.update(updates);

      logger.info(`Avatar state changed: User ${userId} from ${currentState} to ${newState}`);

      return {
        success: true,
        state: newState,
        previousState: currentState,
        stateChangedAt: updates.stateChangedAt,
        context: {
          interactingWith: updates.interactingWith,
          sittingAt: updates.sittingAt,
          ...context
        }
      };

    } catch (error) {
      logger.error('Error changing avatar state:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get current state of an avatar
   * @param {number} userId - User ID
   * @returns {Object} - Current avatar state information
   */
  async getCurrentState(userId) {
    try {
      const avatar = await Avatar.findOne({ where: { userId } });
      
      if (!avatar) {
        return {
          success: false,
          error: 'Avatar not found'
        };
      }

      return {
        success: true,
        state: avatar.currentState || 'idle',
        previousState: avatar.previousState,
        stateChangedAt: avatar.stateChangedAt,
        interactingWith: avatar.interactingWith,
        sittingAt: avatar.sittingAt
      };

    } catch (error) {
      logger.error('Error getting avatar state:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Broadcast state change to all clients in the same office
   * @param {Object} io - Socket.IO server instance
   * @param {number} userId - User ID
   * @param {string} newState - New state
   * @param {string} previousState - Previous state
   * @param {string} officeId - Office ID or room identifier
   * @param {Object} context - Additional context
   */
  broadcastStateChange(io, userId, newState, previousState, officeId, context = {}) {
    try {
      const message = {
        userId,
        newState,
        previousState,
        timestamp: new Date().toISOString(),
        context
      };

      // Broadcast to all clients in the office
      if (officeId) {
        io.to(`office:${officeId}`).emit('avatar:state-changed', message);
        logger.debug(`Broadcasted state change to office:${officeId}`, message);
      } else {
        // Fallback to district broadcast if no office
        io.to('district:central').emit('avatar:state-changed', message);
        logger.debug('Broadcasted state change to district:central', message);
      }

    } catch (error) {
      logger.error('Error broadcasting state change:', error);
    }
  }

  /**
   * Synchronize all avatar states in an office to a newly connected client
   * @param {Object} socket - Socket.IO socket instance
   * @param {string} officeId - Office ID
   */
  async syncStates(socket, officeId) {
    try {
      // Get all avatars in the office (this would need to be enhanced with actual office membership logic)
      // For now, we'll get all avatars with non-idle states as they're likely active
      const avatars = await Avatar.findAll({
        where: {
          currentState: {
            [require('sequelize').Op.ne]: 'idle'
          }
        }
      });

      const states = avatars.map(avatar => ({
        userId: avatar.userId,
        state: avatar.currentState,
        previousState: avatar.previousState,
        stateChangedAt: avatar.stateChangedAt,
        interactingWith: avatar.interactingWith,
        sittingAt: avatar.sittingAt
      }));

      socket.emit('avatar:states-sync', {
        officeId,
        states,
        timestamp: new Date().toISOString()
      });

      logger.debug(`Synced ${states.length} avatar states to socket ${socket.id}`);

    } catch (error) {
      logger.error('Error syncing avatar states:', error);
    }
  }

  /**
   * Save avatar state to database (persistence)
   * @param {number} userId - User ID
   * @param {string} state - State to save
   * @returns {boolean} - Success status
   */
  async saveState(userId, state) {
    try {
      const avatar = await Avatar.findOne({ where: { userId } });
      
      if (!avatar) {
        logger.warn(`Avatar not found for user ${userId}`);
        return false;
      }

      await avatar.update({
        currentState: state,
        stateChangedAt: new Date()
      });

      return true;

    } catch (error) {
      logger.error('Error saving avatar state:', error);
      return false;
    }
  }

  /**
   * Load avatar state from database
   * @param {number} userId - User ID
   * @returns {string|null} - Loaded state or null
   */
  async loadState(userId) {
    try {
      const avatar = await Avatar.findOne({ where: { userId } });
      
      if (!avatar) {
        logger.warn(`Avatar not found for user ${userId}`);
        return null;
      }

      return avatar.currentState || 'idle';

    } catch (error) {
      logger.error('Error loading avatar state:', error);
      return null;
    }
  }

  /**
   * Reset avatar to idle state (useful for cleanup on disconnect)
   * @param {number} userId - User ID
   * @returns {boolean} - Success status
   */
  async resetToIdle(userId) {
    try {
      const avatar = await Avatar.findOne({ where: { userId } });
      
      if (!avatar) {
        return false;
      }

      await avatar.update({
        previousState: avatar.currentState,
        currentState: 'idle',
        stateChangedAt: new Date(),
        interactingWith: null,
        sittingAt: null
      });

      logger.info(`Reset avatar to idle for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Error resetting avatar to idle:', error);
      return false;
    }
  }
}

module.exports = new AvatarStateService();
