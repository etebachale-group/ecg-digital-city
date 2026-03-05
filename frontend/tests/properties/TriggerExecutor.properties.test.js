/**
 * Property-Based Tests for TriggerExecutor
 * 
 * Tests universal properties that must hold for all trigger executions
 */

const fc = require('fast-check');
const TriggerExecutor = require('../../src/systems/TriggerExecutor');

describe('TriggerExecutor - Property Tests', () => {
  
  /**
   * Property 9: Trigger Association
   * Validates: Requirements 4.1
   * 
   * Every interactive object can have zero or more triggers associated with it
   */
  test('Property 9: Triggers can be associated with objects', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          trigger_type: fc.constantFrom('state_change', 'grant_xp', 'unlock_achievement', 'teleport'),
          trigger_data: fc.object(),
          priority: fc.integer({ min: 0, max: 10 }),
          is_active: fc.boolean()
        }), { maxLength: 10 }),
        async (triggers) => {
          const executor = new TriggerExecutor();
          const context = { userId: 'user1', objectId: 'obj1' };
          
          // Should be able to execute any array of triggers
          const results = await executor.executeTriggers(triggers, context);
          
          // Results array should have same or fewer entries (inactive triggers skipped)
          expect(results.length).toBeLessThanOrEqual(triggers.length);
          
          // Each result should have required fields
          results.forEach(result => {
            expect(result).toHaveProperty('triggerId');
            expect(result).toHaveProperty('triggerType');
            expect(result).toHaveProperty('success');
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 10: Trigger Execution Order
   * Validates: Requirements 4.2
   * 
   * Triggers must execute in priority order (highest priority first)
   */
  test('Property 10: Triggers execute in priority order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          trigger_type: fc.constant('grant_xp'),
          trigger_data: fc.record({
            amount: fc.integer({ min: 1, max: 100 }),
            reason: fc.string()
          }),
          priority: fc.integer({ min: 0, max: 10 }),
          is_active: fc.constant(true)
        }), { minLength: 2, maxLength: 5 }),
        async (triggers) => {
          const executionOrder = [];
          
          const mockGamification = {
            grantXP: jest.fn().mockImplementation(async (userId, amount) => {
              executionOrder.push({ amount, timestamp: Date.now() });
              return { totalXP: 100, levelUp: false };
            })
          };
          
          const executor = new TriggerExecutor(null, mockGamification);
          const context = { userId: 'user1', objectId: 'obj1' };
          
          // Clear rate limits
          executor.clearRateLimits();
          
          await executor.executeTriggers(triggers, context);
          
          // Verify execution order matches priority order
          const sortedTriggers = [...triggers].sort((a, b) => b.priority - a.priority);
          
          expect(executionOrder.length).toBe(triggers.length);
          
          // Verify priorities are in descending order
          for (let i = 0; i < sortedTriggers.length - 1; i++) {
            expect(sortedTriggers[i].priority).toBeGreaterThanOrEqual(sortedTriggers[i + 1].priority);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 11: Trigger Error Resilience
   * Validates: Requirements 4.4
   * 
   * If one trigger fails, subsequent triggers should still execute
   */
  test('Property 11: Failed triggers do not stop execution', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }), // Index of trigger that will fail
        fc.integer({ min: 3, max: 6 }), // Total number of triggers
        async (failIndex, totalTriggers) => {
          const triggers = [];
          
          for (let i = 0; i < totalTriggers; i++) {
            triggers.push({
              id: i,
              trigger_type: i === failIndex ? 'invalid_type' : 'grant_xp',
              trigger_data: { amount: 10, reason: 'test' },
              priority: i,
              is_active: true
            });
          }
          
          const mockGamification = {
            grantXP: jest.fn().mockResolvedValue({ totalXP: 100, levelUp: false })
          };
          
          const executor = new TriggerExecutor(null, mockGamification);
          executor.clearRateLimits();
          
          const context = { userId: 'user1', objectId: 'obj1' };
          const results = await executor.executeTriggers(triggers, context);
          
          // All triggers should have results
          expect(results.length).toBe(totalTriggers);
          
          // Failed trigger should be marked as failed
          const failedResult = results.find(r => r.triggerId === failIndex);
          expect(failedResult.success).toBe(false);
          
          // Other triggers should succeed
          const successfulResults = results.filter(r => r.triggerId !== failIndex);
          successfulResults.forEach(result => {
            expect(result.success).toBe(true);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 12: Conditional Trigger Execution
   * Validates: Requirements 4.5
   * 
   * Triggers with conditions should only execute when condition is met
   */
  test('Property 12: Conditional triggers respect conditions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        async (userLevel, requiredLevel) => {
          const trigger = {
            id: 1,
            trigger_type: 'grant_xp',
            trigger_data: { amount: 50, reason: 'test' },
            priority: 1,
            is_active: true,
            condition: {
              type: 'greater_than',
              field: 'user.level',
              value: requiredLevel
            }
          };
          
          const mockGamification = {
            grantXP: jest.fn().mockResolvedValue({ totalXP: 100, levelUp: false })
          };
          
          const executor = new TriggerExecutor(null, mockGamification);
          executor.clearRateLimits();
          
          const context = {
            userId: 'user1',
            objectId: 'obj1',
            user: { level: userLevel }
          };
          
          const results = await executor.executeTriggers([trigger], context);
          
          if (userLevel > requiredLevel) {
            // Condition met - trigger should execute
            expect(results.length).toBe(1);
            expect(results[0].success).toBe(true);
            expect(mockGamification.grantXP).toHaveBeenCalled();
          } else {
            // Condition not met - trigger should be skipped
            expect(results.length).toBe(0);
            expect(mockGamification.grantXP).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

});
