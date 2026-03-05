const InteractiveObject = require('../models/InteractiveObject');
const InteractionNode = require('../models/InteractionNode');
const ObjectTrigger = require('../models/ObjectTrigger');
const InteractionLog = require('../models/InteractionLog');
const { sequelize } = require('../config/database');

class InteractiveObjectService {
  // ==================== CRUD Operations ====================

  /**
   * Create a new interactive object
   * @param {number} officeId - Office ID where object will be placed
   * @param {object} objectData - Object properties (objectType, name, modelPath, position, rotation, scale, config)
   * @param {number} userId - User ID creating the object
   * @returns {Promise<InteractiveObject>}
   */
  async createObject(officeId, objectData, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate required fields
      if (!objectData.objectType || !objectData.name) {
        throw new Error('objectType and name are required');
      }

      // Validate object type
      const validTypes = ['chair', 'door', 'table', 'furniture'];
      if (!validTypes.includes(objectData.objectType)) {
        throw new Error(`Invalid objectType. Must be one of: ${validTypes.join(', ')}`);
      }

      // Validate position
      if (objectData.position) {
        this._validatePosition(objectData.position);
      }

      // Create the object
      const object = await InteractiveObject.create({
        officeId,
        objectType: objectData.objectType,
        name: objectData.name,
        modelPath: objectData.modelPath || null,
        position: objectData.position || { x: 0, y: 0, z: 0 },
        rotation: objectData.rotation || { x: 0, y: 0, z: 0 },
        scale: objectData.scale || { x: 1, y: 1, z: 1 },
        state: objectData.state || {},
        config: objectData.config || {},
        isActive: objectData.isActive !== undefined ? objectData.isActive : true,
        createdBy: userId
      }, { transaction });

      await transaction.commit();
      return object;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get an interactive object by ID
   * @param {number} objectId - Object ID
   * @returns {Promise<InteractiveObject|null>}
   */
  async getObject(objectId) {
    return await InteractiveObject.findByPk(objectId, {
      include: [
        { model: InteractionNode, as: 'nodes' },
        { model: ObjectTrigger, as: 'triggers' }
      ]
    });
  }

  /**
   * Get all interactive objects in an office
   * @param {number} officeId - Office ID
   * @returns {Promise<InteractiveObject[]>}
   */
  async getObjectsByOffice(officeId) {
    return await InteractiveObject.findAll({
      where: { officeId, isActive: true },
      include: [
        { model: InteractionNode, as: 'nodes' },
        { model: ObjectTrigger, as: 'triggers', where: { isActive: true }, required: false }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Update an interactive object
   * @param {number} objectId - Object ID
   * @param {object} updates - Fields to update
   * @param {number} userId - User ID making the update
   * @returns {Promise<InteractiveObject>}
   */
  async updateObject(objectId, updates, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const object = await InteractiveObject.findByPk(objectId, { transaction });
      
      if (!object) {
        throw new Error('Object not found');
      }

      // Validate updates
      if (updates.objectType) {
        const validTypes = ['chair', 'door', 'table', 'furniture'];
        if (!validTypes.includes(updates.objectType)) {
          throw new Error(`Invalid objectType. Must be one of: ${validTypes.join(', ')}`);
        }
      }

      if (updates.position) {
        this._validatePosition(updates.position);
      }

      // Update the object
      await object.update(updates, { transaction });

      await transaction.commit();
      return object;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete an interactive object (soft delete by setting isActive to false)
   * @param {number} objectId - Object ID
   * @param {number} userId - User ID deleting the object
   * @returns {Promise<boolean>}
   */
  async deleteObject(objectId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const object = await InteractiveObject.findByPk(objectId, { transaction });
      
      if (!object) {
        throw new Error('Object not found');
      }

      // Soft delete
      await object.update({ isActive: false }, { transaction });

      // Log the deletion
      await InteractionLog.create({
        userId,
        objectId,
        interactionType: 'delete',
        success: true,
        xpGranted: 0
      }, { transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ==================== State Management ====================

  /**
   * Update object state
   * @param {number} objectId - Object ID
   * @param {object} newState - New state object
   * @returns {Promise<InteractiveObject>}
   */
  async updateObjectState(objectId, newState) {
    const transaction = await sequelize.transaction();
    
    try {
      const object = await InteractiveObject.findByPk(objectId, { transaction });
      
      if (!object) {
        throw new Error('Object not found');
      }

      // Merge with existing state
      const updatedState = { ...object.state, ...newState };
      
      await object.update({ state: updatedState }, { transaction });

      await transaction.commit();
      return object;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get object state
   * @param {number} objectId - Object ID
   * @returns {Promise<object>}
   */
  async getObjectState(objectId) {
    const object = await InteractiveObject.findByPk(objectId);
    
    if (!object) {
      throw new Error('Object not found');
    }

    return object.state;
  }

  // ==================== Node Management ====================

  /**
   * Add an interaction node to an object
   * @param {number} objectId - Object ID
   * @param {object} nodeData - Node properties (position, requiredState, maxOccupancy)
   * @returns {Promise<InteractionNode>}
   */
  async addInteractionNode(objectId, nodeData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verify object exists
      const object = await InteractiveObject.findByPk(objectId, { transaction });
      if (!object) {
        throw new Error('Object not found');
      }

      // Validate required fields
      if (!nodeData.position || !nodeData.requiredState) {
        throw new Error('position and requiredState are required');
      }

      // Validate position
      this._validatePosition(nodeData.position);

      // Validate required state
      const validStates = ['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'];
      if (!validStates.includes(nodeData.requiredState)) {
        throw new Error(`Invalid requiredState. Must be one of: ${validStates.join(', ')}`);
      }

      // Create the node
      const node = await InteractionNode.create({
        objectId,
        position: nodeData.position,
        requiredState: nodeData.requiredState,
        isOccupied: false,
        occupiedBy: null,
        occupiedAt: null,
        maxOccupancy: nodeData.maxOccupancy || 1
      }, { transaction });

      await transaction.commit();
      return node;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Occupy an interaction node
   * @param {number} nodeId - Node ID
   * @param {number} userId - User ID occupying the node
   * @returns {Promise<InteractionNode>}
   */
  async occupyNode(nodeId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const node = await InteractionNode.findByPk(nodeId, { transaction });
      
      if (!node) {
        throw new Error('Node not found');
      }

      if (node.isOccupied) {
        throw new Error('Node is already occupied');
      }

      await node.update({
        isOccupied: true,
        occupiedBy: userId,
        occupiedAt: new Date()
      }, { transaction });

      await transaction.commit();
      return node;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Release an interaction node
   * @param {number} nodeId - Node ID
   * @param {number} userId - User ID releasing the node
   * @returns {Promise<InteractionNode>}
   */
  async releaseNode(nodeId, userId) {
    const transaction = await sequelize.transaction();
    
    try {
      const node = await InteractionNode.findByPk(nodeId, { transaction });
      
      if (!node) {
        throw new Error('Node not found');
      }

      // Verify the user is the one occupying the node
      if (node.occupiedBy !== userId) {
        throw new Error('User is not occupying this node');
      }

      await node.update({
        isOccupied: false,
        occupiedBy: null,
        occupiedAt: null
      }, { transaction });

      await transaction.commit();
      return node;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get available (unoccupied) nodes for an object
   * @param {number} objectId - Object ID
   * @returns {Promise<InteractionNode[]>}
   */
  async getAvailableNodes(objectId) {
    return await InteractionNode.findAll({
      where: {
        objectId,
        isOccupied: false
      }
    });
  }

  // ==================== Trigger Management ====================

  /**
   * Add a trigger to an object
   * @param {number} objectId - Object ID
   * @param {object} triggerData - Trigger properties (triggerType, triggerData, priority, condition)
   * @returns {Promise<ObjectTrigger>}
   */
  async addTrigger(objectId, triggerData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verify object exists
      const object = await InteractiveObject.findByPk(objectId, { transaction });
      if (!object) {
        throw new Error('Object not found');
      }

      // Validate required fields
      if (!triggerData.triggerType || !triggerData.triggerData) {
        throw new Error('triggerType and triggerData are required');
      }

      // Validate trigger type
      const validTypes = ['state_change', 'grant_xp', 'unlock_achievement', 'teleport'];
      if (!validTypes.includes(triggerData.triggerType)) {
        throw new Error(`Invalid triggerType. Must be one of: ${validTypes.join(', ')}`);
      }

      // Create the trigger
      const trigger = await ObjectTrigger.create({
        objectId,
        triggerType: triggerData.triggerType,
        triggerData: triggerData.triggerData,
        priority: triggerData.priority || 0,
        condition: triggerData.condition || null,
        isActive: true
      }, { transaction });

      await transaction.commit();
      return trigger;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Execute triggers for an object
   * @param {number} objectId - Object ID
   * @param {number} userId - User ID triggering the action
   * @param {object} context - Additional context for trigger execution
   * @returns {Promise<object[]>} Array of trigger execution results
   */
  async executeTriggers(objectId, userId, context = {}) {
    const triggers = await ObjectTrigger.findAll({
      where: {
        objectId,
        isActive: true
      },
      order: [['priority', 'DESC']] // Execute highest priority first
    });

    const results = [];

    for (const trigger of triggers) {
      try {
        // Check if trigger condition is met
        if (trigger.condition && !this._evaluateCondition(trigger.condition, context)) {
          results.push({
            triggerId: trigger.id,
            triggerType: trigger.triggerType,
            executed: false,
            reason: 'Condition not met'
          });
          continue;
        }

        // Execute trigger based on type
        const result = await this._executeTrigger(trigger, userId, context);
        
        results.push({
          triggerId: trigger.id,
          triggerType: trigger.triggerType,
          executed: true,
          result
        });
      } catch (error) {
        // Log error but continue with other triggers
        console.error(`Error executing trigger ${trigger.id}:`, error);
        
        results.push({
          triggerId: trigger.id,
          triggerType: trigger.triggerType,
          executed: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Execute a single trigger
   * @private
   */
  async _executeTrigger(trigger, userId, context) {
    switch (trigger.triggerType) {
      case 'state_change':
        return { newState: trigger.triggerData.state };
      
      case 'grant_xp':
        return { xpGranted: trigger.triggerData.amount };
      
      case 'unlock_achievement':
        return { achievementId: trigger.triggerData.achievementId };
      
      case 'teleport':
        return { 
          destination: trigger.triggerData.destination,
          officeId: trigger.triggerData.officeId
        };
      
      default:
        throw new Error(`Unknown trigger type: ${trigger.triggerType}`);
    }
  }

  /**
   * Evaluate trigger condition
   * @private
   */
  _evaluateCondition(condition, context) {
    // Simple condition evaluation
    // Supports: userLevel, hasPermission, worldState checks
    
    if (condition.minLevel && context.userLevel < condition.minLevel) {
      return false;
    }

    if (condition.requiredPermission && !context.permissions?.includes(condition.requiredPermission)) {
      return false;
    }

    if (condition.worldState) {
      for (const [key, value] of Object.entries(condition.worldState)) {
        if (context.worldState?.[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  // ==================== Persistence ====================

  /**
   * Save world state for an office
   * @param {number} officeId - Office ID
   * @returns {Promise<object>} Saved state summary
   */
  async saveWorldState(officeId) {
    const objects = await this.getObjectsByOffice(officeId);
    
    const state = {
      officeId,
      timestamp: new Date(),
      objectCount: objects.length,
      objects: objects.map(obj => ({
        id: obj.id,
        state: obj.state,
        nodes: obj.nodes?.map(node => ({
          id: node.id,
          isOccupied: node.isOccupied,
          occupiedBy: node.occupiedBy
        }))
      }))
    };

    // In a real implementation, this would save to a separate state table or cache
    // For now, we just return the state object
    return state;
  }

  /**
   * Load world state for an office
   * @param {number} officeId - Office ID
   * @returns {Promise<object>} Loaded state
   */
  async loadWorldState(officeId) {
    const objects = await this.getObjectsByOffice(officeId);
    
    return {
      officeId,
      timestamp: new Date(),
      objectCount: objects.length,
      objects: objects.map(obj => ({
        id: obj.id,
        objectType: obj.objectType,
        name: obj.name,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        state: obj.state,
        nodes: obj.nodes,
        triggers: obj.triggers
      }))
    };
  }

  // ==================== Validation Helpers ====================

  /**
   * Validate position object
   * @private
   */
  _validatePosition(position) {
    if (!position || typeof position !== 'object') {
      throw new Error('Position must be an object');
    }

    if (typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
      throw new Error('Position must have numeric x, y, z coordinates');
    }

    // Reasonable bounds check (adjust as needed)
    const MAX_COORD = 10000;
    if (Math.abs(position.x) > MAX_COORD || Math.abs(position.y) > MAX_COORD || Math.abs(position.z) > MAX_COORD) {
      throw new Error(`Position coordinates must be within ±${MAX_COORD}`);
    }
  }
}

module.exports = new InteractiveObjectService();
