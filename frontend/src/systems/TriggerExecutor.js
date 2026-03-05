/**
 * TriggerExecutor
 * 
 * Executes triggers associated with interactive objects.
 * Handles different trigger types: state_change, grant_xp, unlock_achievement, teleport
 */

class TriggerExecutor {
  constructor(avatarStateManager = null, gamificationSystem = null) {
    this.avatarStateManager = avatarStateManager;
    this.gamificationSystem = gamificationSystem;
    
    // Trigger handlers by type
    this.handlers = {
      state_change: this.handleStateChange.bind(this),
      grant_xp: this.handleGrantXP.bind(this),
      unlock_achievement: this.handleUnlockAchievement.bind(this),
      teleport: this.handleTeleport.bind(this)
    };
    
    // Callbacks
    this.onTriggerExecutedCallbacks = [];
    this.onTriggerFailedCallbacks = [];
  }

  /**
   * Execute triggers for an object
   * @param {Array} triggers - Array of trigger objects
   * @param {Object} context - Execution context (userId, objectId, etc.)
   * @returns {Promise<Array>} - Results of trigger executions
   */
  async executeTriggers(triggers, context = {}) {
    if (!triggers || triggers.length === 0) {
      return [];
    }

    // Sort by priority (higher priority first)
    const sortedTriggers = [...triggers].sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA;
    });

    const results = [];

    // Execute triggers in order
    for (const trigger of sortedTriggers) {
      try {
        // Check if trigger is active
        if (trigger.is_active === false) {
          continue;
        }

        // Evaluate condition if present
        if (trigger.condition && !this.evaluateCondition(trigger.condition, context)) {
          continue;
        }

        // Execute trigger
        const result = await this.executeTrigger(trigger, context);
        results.push({
          triggerId: trigger.id,
          triggerType: trigger.trigger_type,
          success: true,
          result
        });

        // Notify success
        this.notifyTriggerExecuted(trigger, result, context);

      } catch (error) {
        console.error(`Error executing trigger ${trigger.id}:`, error);
        
        results.push({
          triggerId: trigger.id,
          triggerType: trigger.trigger_type,
          success: false,
          error: error.message
        });

        // Notify failure
        this.notifyTriggerFailed(trigger, error, context);

        // Continue with next trigger (error resilience)
      }
    }

    return results;
  }

  /**
   * Execute a single trigger
   * @param {Object} trigger - Trigger object
   * @param {Object} context - Execution context
   * @returns {Promise<any>}
   */
  async executeTrigger(trigger, context) {
    const handler = this.handlers[trigger.trigger_type];

    if (!handler) {
      throw new Error(`Unknown trigger type: ${trigger.trigger_type}`);
    }

    return await handler(trigger.trigger_data, context);
  }

  /**
   * Evaluate trigger condition
   * @param {Object} condition - Condition object
   * @param {Object} context - Execution context
   * @returns {boolean}
   */
  evaluateCondition(condition, context) {
    try {
      // Simple condition evaluation
      // Supports: equals, not_equals, greater_than, less_than, contains

      if (condition.type === 'equals') {
        const value = this.getContextValue(condition.field, context);
        return value === condition.value;
      }

      if (condition.type === 'not_equals') {
        const value = this.getContextValue(condition.field, context);
        return value !== condition.value;
      }

      if (condition.type === 'greater_than') {
        const value = this.getContextValue(condition.field, context);
        return value > condition.value;
      }

      if (condition.type === 'less_than') {
        const value = this.getContextValue(condition.field, context);
        return value < condition.value;
      }

      if (condition.type === 'contains') {
        const value = this.getContextValue(condition.field, context);
        return Array.isArray(value) && value.includes(condition.value);
      }

      if (condition.type === 'and') {
        return condition.conditions.every(c => this.evaluateCondition(c, context));
      }

      if (condition.type === 'or') {
        return condition.conditions.some(c => this.evaluateCondition(c, context));
      }

      // Default: condition passes
      return true;

    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Get value from context by field path
   * @param {string} field - Field path (e.g., "user.level")
   * @param {Object} context - Context object
   * @returns {any}
   */
  getContextValue(field, context) {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Handle state_change trigger
   * @param {Object} data - Trigger data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>}
   */
  async handleStateChange(data, context) {
    if (!this.avatarStateManager) {
      throw new Error('AvatarStateManager not available');
    }

    const { state, position } = data;

    if (!state) {
      throw new Error('State not specified in trigger data');
    }

    const result = await this.avatarStateManager.transition(state, {
      position,
      triggeredBy: context.objectId
    });

    if (!result) {
      throw new Error(`Failed to transition to state: ${state}`);
    }

    return { state, success: true };
  }

  /**
   * Handle grant_xp trigger
   * @param {Object} data - Trigger data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>}
   */
  async handleGrantXP(data, context) {
    if (!this.gamificationSystem) {
      throw new Error('Gamification system not available');
    }

    const { amount, reason } = data;

    if (!amount || amount <= 0) {
      throw new Error('Invalid XP amount');
    }

    // Check rate limiting (once per object per 5 minutes)
    const rateLimitKey = `xp_${context.userId}_${context.objectId}`;
    const lastGrant = this.getLastGrantTime(rateLimitKey);
    const now = Date.now();

    if (lastGrant && (now - lastGrant) < 5 * 60 * 1000) {
      throw new Error('XP rate limit exceeded');
    }

    // Grant XP through gamification system
    const result = await this.gamificationSystem.grantXP(
      context.userId,
      amount,
      reason || `Interaction with ${context.objectId}`
    );

    // Update rate limit
    this.setLastGrantTime(rateLimitKey, now);

    return {
      amount,
      newTotal: result.totalXP,
      levelUp: result.levelUp || false
    };
  }

  /**
   * Handle unlock_achievement trigger
   * @param {Object} data - Trigger data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>}
   */
  async handleUnlockAchievement(data, context) {
    if (!this.gamificationSystem) {
      throw new Error('Gamification system not available');
    }

    const { achievementId } = data;

    if (!achievementId) {
      throw new Error('Achievement ID not specified');
    }

    const result = await this.gamificationSystem.unlockAchievement(
      context.userId,
      achievementId
    );

    return {
      achievementId,
      unlocked: result.unlocked,
      alreadyUnlocked: result.alreadyUnlocked || false
    };
  }

  /**
   * Handle teleport trigger
   * @param {Object} data - Trigger data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>}
   */
  async handleTeleport(data, context) {
    const { position, officeId } = data;

    if (!position || typeof position.x !== 'number' || typeof position.z !== 'number') {
      throw new Error('Invalid teleport position');
    }

    // Emit teleport event (to be handled by game logic)
    if (context.socket) {
      context.socket.emit('player:teleport', {
        position,
        officeId: officeId || context.currentOfficeId
      });
    }

    return {
      position,
      officeId: officeId || context.currentOfficeId
    };
  }

  /**
   * Get last grant time for rate limiting
   * @param {string} key - Rate limit key
   * @returns {number|null}
   */
  getLastGrantTime(key) {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key);
      return value ? parseInt(value, 10) : null;
    }
    return null;
  }

  /**
   * Set last grant time for rate limiting
   * @param {string} key - Rate limit key
   * @param {number} time - Timestamp
   */
  setLastGrantTime(key, time) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, time.toString());
    }
  }

  /**
   * Register custom trigger handler
   * @param {string} triggerType - Trigger type
   * @param {Function} handler - Handler function
   */
  registerHandler(triggerType, handler) {
    this.handlers[triggerType] = handler;
  }

  /**
   * Register callback for trigger executed
   * @param {Function} callback - (trigger, result, context) => void
   */
  onTriggerExecuted(callback) {
    this.onTriggerExecutedCallbacks.push(callback);
  }

  /**
   * Register callback for trigger failed
   * @param {Function} callback - (trigger, error, context) => void
   */
  onTriggerFailed(callback) {
    this.onTriggerFailedCallbacks.push(callback);
  }

  /**
   * Notify callbacks of trigger executed
   * @private
   */
  notifyTriggerExecuted(trigger, result, context) {
    for (const callback of this.onTriggerExecutedCallbacks) {
      try {
        callback(trigger, result, context);
      } catch (error) {
        console.error('Error in trigger executed callback:', error);
      }
    }
  }

  /**
   * Notify callbacks of trigger failed
   * @private
   */
  notifyTriggerFailed(trigger, error, context) {
    for (const callback of this.onTriggerFailedCallbacks) {
      try {
        callback(trigger, error, context);
      } catch (error) {
        console.error('Error in trigger failed callback:', error);
      }
    }
  }

  /**
   * Clear rate limit cache
   */
  clearRateLimits() {
    if (typeof localStorage !== 'undefined') {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('xp_')) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
}

// Export for both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TriggerExecutor;
}

export default TriggerExecutor;
