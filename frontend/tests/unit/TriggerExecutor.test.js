/**
 * Unit Tests for TriggerExecutor
 * 
 * Tests specific scenarios, edge cases, and error conditions
 */

const TriggerExecutor = require('../../src/systems/TriggerExecutor');

describe('TriggerExecutor - Unit Tests', () => {

  let executor;
  let mockAvatarStateManager;
  let mockGamificationSystem;

  beforeEach(() => {
    // Mock AvatarStateManager
    mockAvatarStateManager = {
      transition: jest.fn().mockResolvedValue(true)
    };

    // Mock Gamification System
    mockGamificationSystem = {
      grantXP: jest.fn().mockResolvedValue({ totalXP: 150, levelUp: false }),
      unlockAchievement: jest.fn().mockResolvedValue({ unlocked: true, alreadyUnlocked: false })
    };

    executor = new TriggerExecutor(mockAvatarStateManager, mockGamificationSystem);
    executor.clearRateLimits();
  });

  describe('State Change Trigger', () => {
    test('should change avatar state', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'state_change',
        trigger_data: {
          state: 'sitting',
          position: { x: 10, y: 0, z: 5 }
        },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(mockAvatarStateManager.transition).toHaveBeenCalledWith('sitting', {
        position: { x: 10, y: 0, z: 5 },
        triggeredBy: 'chair1'
      });
    });

    test('should fail if state not specified', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'state_change',
        trigger_data: {},
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('State not specified');
    });

    test('should fail if AvatarStateManager not available', async () => {
      const executorWithoutASM = new TriggerExecutor(null, mockGamificationSystem);
      
      const trigger = {
        id: 1,
        trigger_type: 'state_change',
        trigger_data: { state: 'sitting' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executorWithoutASM.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('AvatarStateManager not available');
    });
  });

  describe('Grant XP Trigger', () => {
    test('should grant XP to user', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: {
          amount: 25,
          reason: 'Sat on chair'
        },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(results[0].result.amount).toBe(25);
      expect(mockGamificationSystem.grantXP).toHaveBeenCalledWith(
        'user1',
        25,
        'Sat on chair'
      );
    });

    test('should enforce rate limiting (5 minutes)', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 25, reason: 'test' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };

      // First execution should succeed
      const results1 = await executor.executeTriggers([trigger], context);
      expect(results1[0].success).toBe(true);

      // Second execution immediately after should fail
      const results2 = await executor.executeTriggers([trigger], context);
      expect(results2[0].success).toBe(false);
      expect(results2[0].error).toContain('rate limit');
    });

    test('should fail if amount is invalid', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 0, reason: 'test' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Invalid XP amount');
    });

    test('should use default reason if not provided', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 10 },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results[0].success).toBe(true);
      expect(mockGamificationSystem.grantXP).toHaveBeenCalledWith(
        'user1',
        10,
        'Interaction with chair1'
      );
    });
  });

  describe('Unlock Achievement Trigger', () => {
    test('should unlock achievement', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'unlock_achievement',
        trigger_data: { achievementId: 'first_sit' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(results[0].result.achievementId).toBe('first_sit');
      expect(mockGamificationSystem.unlockAchievement).toHaveBeenCalledWith(
        'user1',
        'first_sit'
      );
    });

    test('should fail if achievement ID not specified', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'unlock_achievement',
        trigger_data: {},
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'chair1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Achievement ID not specified');
    });
  });

  describe('Teleport Trigger', () => {
    test('should teleport user to position', async () => {
      const mockSocket = {
        emit: jest.fn()
      };

      const trigger = {
        id: 1,
        trigger_type: 'teleport',
        trigger_data: {
          position: { x: 20, y: 0, z: 30 },
          officeId: 'office2'
        },
        priority: 1,
        is_active: true
      };

      const context = {
        userId: 'user1',
        objectId: 'portal1',
        currentOfficeId: 'office1',
        socket: mockSocket
      };

      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(results[0].result.position).toEqual({ x: 20, y: 0, z: 30 });
      expect(results[0].result.officeId).toBe('office2');
      expect(mockSocket.emit).toHaveBeenCalledWith('player:teleport', {
        position: { x: 20, y: 0, z: 30 },
        officeId: 'office2'
      });
    });

    test('should use current office if not specified', async () => {
      const mockSocket = {
        emit: jest.fn()
      };

      const trigger = {
        id: 1,
        trigger_type: 'teleport',
        trigger_data: {
          position: { x: 20, y: 0, z: 30 }
        },
        priority: 1,
        is_active: true
      };

      const context = {
        userId: 'user1',
        objectId: 'portal1',
        currentOfficeId: 'office1',
        socket: mockSocket
      };

      const results = await executor.executeTriggers([trigger], context);

      expect(results[0].success).toBe(true);
      expect(results[0].result.officeId).toBe('office1');
    });

    test('should fail if position is invalid', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'teleport',
        trigger_data: {
          position: { x: 20 } // Missing z
        },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'portal1', socket: {} };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Invalid teleport position');
    });
  });

  describe('Trigger Priority', () => {
    test('should execute triggers in priority order', async () => {
      const executionOrder = [];

      mockGamificationSystem.grantXP = jest.fn().mockImplementation(async (userId, amount) => {
        executionOrder.push(amount);
        return { totalXP: 100, levelUp: false };
      });

      const triggers = [
        {
          id: 1,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 10, reason: 'low' },
          priority: 1,
          is_active: true
        },
        {
          id: 2,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 30, reason: 'high' },
          priority: 3,
          is_active: true
        },
        {
          id: 3,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 20, reason: 'medium' },
          priority: 2,
          is_active: true
        }
      ];

      const context = { userId: 'user1', objectId: 'obj1' };
      await executor.executeTriggers(triggers, context);

      // Should execute in order: 30 (priority 3), 20 (priority 2), 10 (priority 1)
      expect(executionOrder).toEqual([30, 20, 10]);
    });
  });

  describe('Conditional Execution', () => {
    test('should execute trigger when equals condition is met', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 50, reason: 'test' },
        priority: 1,
        is_active: true,
        condition: {
          type: 'equals',
          field: 'user.role',
          value: 'admin'
        }
      };

      const context = {
        userId: 'user1',
        objectId: 'obj1',
        user: { role: 'admin' }
      };

      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
    });

    test('should skip trigger when equals condition is not met', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 50, reason: 'test' },
        priority: 1,
        is_active: true,
        condition: {
          type: 'equals',
          field: 'user.role',
          value: 'admin'
        }
      };

      const context = {
        userId: 'user1',
        objectId: 'obj1',
        user: { role: 'user' }
      };

      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(0);
    });

    test('should handle greater_than condition', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 50, reason: 'test' },
        priority: 1,
        is_active: true,
        condition: {
          type: 'greater_than',
          field: 'user.level',
          value: 10
        }
      };

      const context1 = {
        userId: 'user1',
        objectId: 'obj1',
        user: { level: 15 }
      };

      const results1 = await executor.executeTriggers([trigger], context1);
      expect(results1.length).toBe(1);

      executor.clearRateLimits();

      const context2 = {
        userId: 'user2',
        objectId: 'obj1',
        user: { level: 5 }
      };

      const results2 = await executor.executeTriggers([trigger], context2);
      expect(results2.length).toBe(0);
    });

    test('should handle AND condition', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 50, reason: 'test' },
        priority: 1,
        is_active: true,
        condition: {
          type: 'and',
          conditions: [
            { type: 'greater_than', field: 'user.level', value: 5 },
            { type: 'equals', field: 'user.role', value: 'member' }
          ]
        }
      };

      const context = {
        userId: 'user1',
        objectId: 'obj1',
        user: { level: 10, role: 'member' }
      };

      const results = await executor.executeTriggers([trigger], context);
      expect(results.length).toBe(1);
    });

    test('should handle OR condition', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 50, reason: 'test' },
        priority: 1,
        is_active: true,
        condition: {
          type: 'or',
          conditions: [
            { type: 'equals', field: 'user.role', value: 'admin' },
            { type: 'equals', field: 'user.role', value: 'moderator' }
          ]
        }
      };

      const context = {
        userId: 'user1',
        objectId: 'obj1',
        user: { role: 'moderator' }
      };

      const results = await executor.executeTriggers([trigger], context);
      expect(results.length).toBe(1);
    });
  });

  describe('Inactive Triggers', () => {
    test('should skip inactive triggers', async () => {
      const triggers = [
        {
          id: 1,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 10, reason: 'test' },
          priority: 1,
          is_active: false
        },
        {
          id: 2,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 20, reason: 'test' },
          priority: 1,
          is_active: true
        }
      ];

      const context = { userId: 'user1', objectId: 'obj1' };
      const results = await executor.executeTriggers(triggers, context);

      expect(results.length).toBe(1);
      expect(results[0].triggerId).toBe(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown trigger type', async () => {
      const trigger = {
        id: 1,
        trigger_type: 'unknown_type',
        trigger_data: {},
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'obj1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Unknown trigger type');
    });

    test('should continue execution after error', async () => {
      const triggers = [
        {
          id: 1,
          trigger_type: 'unknown_type',
          trigger_data: {},
          priority: 2,
          is_active: true
        },
        {
          id: 2,
          trigger_type: 'grant_xp',
          trigger_data: { amount: 10, reason: 'test' },
          priority: 1,
          is_active: true
        }
      ];

      const context = { userId: 'user1', objectId: 'obj1' };
      const results = await executor.executeTriggers(triggers, context);

      expect(results.length).toBe(2);
      expect(results[0].success).toBe(false); // First trigger failed
      expect(results[1].success).toBe(true);  // Second trigger succeeded
    });
  });

  describe('Callbacks', () => {
    test('should call onTriggerExecuted callback', async () => {
      const callback = jest.fn();
      executor.onTriggerExecuted(callback);

      const trigger = {
        id: 1,
        trigger_type: 'grant_xp',
        trigger_data: { amount: 10, reason: 'test' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'obj1' };
      await executor.executeTriggers([trigger], context);

      expect(callback).toHaveBeenCalledWith(
        trigger,
        expect.any(Object),
        context
      );
    });

    test('should call onTriggerFailed callback', async () => {
      const callback = jest.fn();
      executor.onTriggerFailed(callback);

      const trigger = {
        id: 1,
        trigger_type: 'unknown_type',
        trigger_data: {},
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'obj1' };
      await executor.executeTriggers([trigger], context);

      expect(callback).toHaveBeenCalledWith(
        trigger,
        expect.any(Error),
        context
      );
    });
  });

  describe('Custom Handlers', () => {
    test('should allow registering custom trigger handlers', async () => {
      const customHandler = jest.fn().mockResolvedValue({ custom: true });
      executor.registerHandler('custom_type', customHandler);

      const trigger = {
        id: 1,
        trigger_type: 'custom_type',
        trigger_data: { foo: 'bar' },
        priority: 1,
        is_active: true
      };

      const context = { userId: 'user1', objectId: 'obj1' };
      const results = await executor.executeTriggers([trigger], context);

      expect(results.length).toBe(1);
      expect(results[0].success).toBe(true);
      expect(customHandler).toHaveBeenCalledWith({ foo: 'bar' }, context);
    });
  });

});
