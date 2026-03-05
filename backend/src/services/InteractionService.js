/**
 * InteractionService
 * 
 * Handles interaction processing, queue management, and XP rate limiting
 * for the Interactive Objects System.
 */

const InteractiveObject = require('../models/InteractiveObject');
const InteractionNode = require('../models/InteractionNode');
const InteractionQueue = require('../models/InteractionQueue');
const InteractionLog = require('../models/InteractionLog');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class InteractionService {
  /**
   * Process an interaction request
   * @param {number} userId - ID of the user initiating the interaction
   * @param {number} objectId - ID of the interactive object
   * @param {number|null} nodeId - Optional specific node ID
   * @returns {Promise<Object>} Interaction result
   */
  async processInteraction(userId, objectId, nodeId = null) {
    try {
      // Validate the interaction
      await this.validateInteraction(userId, objectId);
      
      // Execute the interaction
      const result = await this.executeInteraction(userId, objectId, nodeId);
      
      return result;
    } catch (error) {
      // Log failed interaction
      await this.logInteraction(userId, objectId, false, {
        errorMessage: error.message
      });
      throw error;
    }
  }

  /**
   * Validate an interaction request
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If validation fails
   */
  async validateInteraction(userId, objectId) {
    // Check if object exists
    const object = await InteractiveObject.findByPk(objectId);
    if (!object) {
      throw new Error('Object not found');
    }

    // Check if object is active
    if (!object.isActive) {
      throw new Error('Object is not active');
    }

    return true;
  }

  /**
   * Execute an interaction
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @param {number|null} nodeId - Optional specific node ID
   * @returns {Promise<Object>} Interaction result with node and XP info
   */
  async executeInteraction(userId, objectId, nodeId = null) {
    // Find an available node
    let node;
    if (nodeId) {
      node = await InteractionNode.findByPk(nodeId);
      if (!node || node.objectId !== objectId) {
        throw new Error('Invalid node for this object');
      }
    } else {
      // Find first available node
      node = await InteractionNode.findOne({
        where: {
          objectId,
          isOccupied: false
        }
      });
    }

    // If no node available, add to queue
    if (!node || node.isOccupied) {
      await this.joinQueue(userId, objectId, nodeId);
      return {
        success: false,
        queued: true,
        message: 'Object is occupied, added to queue'
      };
    }

    // Occupy the node
    node.isOccupied = true;
    node.occupiedBy = userId;
    node.occupiedAt = new Date();
    await node.save();

    // Check XP rate limiting
    const xpGranted = await this.grantXP(userId, objectId);

    // Log successful interaction
    await this.logInteraction(userId, objectId, true, {
      nodeId: node.id,
      xpGranted
    });

    return {
      success: true,
      queued: false,
      node,
      xpGranted
    };
  }

  /**
   * Grant XP for an interaction with rate limiting
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @returns {Promise<number>} Amount of XP granted (0 if rate limited)
   */
  async grantXP(userId, objectId) {
    const RATE_LIMIT_MINUTES = 5;
    const BASE_XP = 10;

    // Check last interaction time for this user and object
    const fiveMinutesAgo = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    
    const recentInteraction = await InteractionLog.findOne({
      where: {
        userId,
        objectId,
        success: true,
        timestamp: {
          [Op.gte]: fiveMinutesAgo
        }
      },
      order: [['timestamp', 'DESC']]
    });

    // If there's a recent interaction, no XP is granted
    if (recentInteraction) {
      return 0;
    }

    // Grant XP (in a real system, this would update the user's XP in the database)
    return BASE_XP;
  }

  /**
   * Join the interaction queue for an occupied object
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @param {number|null} nodeId - Optional specific node ID
   * @returns {Promise<Object>} Queue entry with position
   */
  async joinQueue(userId, objectId, nodeId = null) {
    // If no specific node, find any node for this object
    if (!nodeId) {
      const node = await InteractionNode.findOne({
        where: { objectId }
      });
      if (!node) {
        throw new Error('No nodes available for this object');
      }
      nodeId = node.id;
    }

    // Check if user is already in queue for this object
    const existingEntry = await InteractionQueue.findOne({
      where: {
        userId,
        objectId,
        nodeId
      }
    });

    if (existingEntry) {
      return {
        position: existingEntry.position,
        queueId: existingEntry.id
      };
    }

    // Find the current queue length to determine position
    const queueLength = await InteractionQueue.count({
      where: {
        objectId,
        nodeId
      }
    });

    // Create queue entry
    const QUEUE_TIMEOUT_SECONDS = 60;
    const expiresAt = new Date(Date.now() + QUEUE_TIMEOUT_SECONDS * 1000);

    const queueEntry = await InteractionQueue.create({
      objectId,
      nodeId,
      userId,
      position: queueLength + 1,
      expiresAt
    });

    return {
      position: queueEntry.position,
      queueId: queueEntry.id
    };
  }

  /**
   * Leave the interaction queue
   * @param {number} userId - ID of the user
   * @param {number} queueId - ID of the queue entry
   * @returns {Promise<boolean>} True if successfully left queue
   */
  async leaveQueue(userId, queueId) {
    const queueEntry = await InteractionQueue.findByPk(queueId);
    
    if (!queueEntry) {
      throw new Error('Queue entry not found');
    }

    if (queueEntry.userId !== userId) {
      throw new Error('Not authorized to leave this queue entry');
    }

    const { objectId, nodeId, position } = queueEntry;

    // Remove the queue entry
    await queueEntry.destroy();

    // Update positions of remaining users in queue
    await InteractionQueue.update(
      { position: sequelize.literal('position - 1') },
      {
        where: {
          objectId,
          nodeId,
          position: {
            [Op.gt]: position
          }
        }
      }
    );

    return true;
  }

  /**
   * Process the queue when a node becomes available
   * @param {number} objectId - ID of the interactive object
   * @param {number} nodeId - ID of the interaction node
   * @returns {Promise<Object|null>} Next user in queue or null
   */
  async processQueue(objectId, nodeId) {
    // Find the first person in queue (FIFO)
    const nextInQueue = await InteractionQueue.findOne({
      where: {
        objectId,
        nodeId
      },
      order: [['position', 'ASC']]
    });

    if (!nextInQueue) {
      return null;
    }

    // Remove from queue
    await nextInQueue.destroy();

    // Update positions of remaining users
    await InteractionQueue.update(
      { position: sequelize.literal('position - 1') },
      {
        where: {
          objectId,
          nodeId,
          position: {
            [Op.gt]: nextInQueue.position
          }
        }
      }
    );

    return {
      userId: nextInQueue.userId,
      position: nextInQueue.position
    };
  }

  /**
   * Get user's position in queue
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @returns {Promise<number|null>} Position in queue or null if not in queue
   */
  async getQueuePosition(userId, objectId) {
    const queueEntry = await InteractionQueue.findOne({
      where: {
        userId,
        objectId
      }
    });

    return queueEntry ? queueEntry.position : null;
  }

  /**
   * Check proximity between two positions
   * @param {Object} userPosition - User position {x, y, z}
   * @param {Object} objectPosition - Object position {x, y, z}
   * @param {number} maxDistance - Maximum allowed distance
   * @returns {boolean} True if within range
   */
  checkProximity(userPosition, objectPosition, maxDistance = 2) {
    const dx = userPosition.x - objectPosition.x;
    const dy = userPosition.y - objectPosition.y;
    const dz = userPosition.z - objectPosition.z;
    
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance <= maxDistance;
  }

  /**
   * Log an interaction
   * @param {number} userId - ID of the user
   * @param {number} objectId - ID of the interactive object
   * @param {boolean} success - Whether the interaction was successful
   * @param {Object} details - Additional details (errorMessage, xpGranted, nodeId)
   * @returns {Promise<Object>} Created log entry
   */
  async logInteraction(userId, objectId, success, details = {}) {
    return await InteractionLog.create({
      userId,
      objectId,
      interactionType: 'interaction',
      success,
      errorMessage: details.errorMessage || null,
      xpGranted: details.xpGranted || 0
    });
  }
}

// Export singleton instance
module.exports = new InteractionService();

