/**
 * Property-Based Tests for AvatarStateService
 * Feature: sistema-interacciones-avanzadas
 * 
 * These tests validate the AvatarStateService behavior across
 * a wide range of inputs using property-based testing with fast-check.
 */

const fc = require('fast-check');
const { sequelize } = require('../../src/config/database');
const AvatarStateService = require('../../src/services/AvatarStateService');
const Avatar = require('../../src/models/Avatar');

// Generators for property-based testing
const validStateArb = fc.constantFrom('idle', 'walking', 'running', 'sitting', 'interacting', 'dancing');

const userIdArb = fc.integer({ min: 1, max: 10000 });

const contextArb = fc.record({
  objectId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
  nodeId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
  position: fc.option(
    fc.record({
      x: fc.double({ min: -1000, max: 1000, noNaN: true }),
      y: fc.double({ min: -1000, max: 1000, noNaN: true }),
      z: fc.double({ min: -1000, max: 1000, noNaN: true })
    }),
    { nil: null }
  )
});

// Helper to create an avatar for testing
async function createTestAvatar(userId, initialState = 'idle') {
  return await Avatar.create({
    userId,
    skinColor: '#fdbcb4',
    hairStyle: 'short',
    hairColor: '#000000',
    shirtColor: '#3498db',
    pantsColor: '#2c3e50',
    accessories: {},
    currentState: initialState,
    previousState: null,
    stateChangedAt: new Date()
  });
}

describe('AvatarStateService Property Tests', () => {
  // Use the singleton service instance
  const service = AvatarStateService;

  beforeAll(async () => {
    // Ensure database connection is established
    await sequelize.authenticate();
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: true });
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Clean up and close connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean all avatars before each test
    await Avatar.destroy({ where: {}, truncate: true, cascade: true });
  });

  /**
   * Property 13: Avatar State Maintenance
   * 
   * **Validates: Requirements 5.1**
   * 
   * For any avatar in the system, it must have a current state at all times,
   * and the state must be one of: idle, walking, running, sitting, interacting, or dancing.
   */
  describe('Property 13: Avatar State Maintenance', () => {
    test('every avatar always has a valid state', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          validStateArb,
          async (userId, initialState) => {
            // Create avatar with initial state
            const avatar = await createTestAvatar(userId, initialState);
            
            // Reload from database to get actual stored value
            await avatar.reload();
            
            // Verify avatar has a valid state (Requirement 5.1)
            expect(avatar.currentState).toBeDefined();
            expect(avatar.currentState).not.toBeNull();
            expect(['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'])
              .toContain(avatar.currentState);
            
            // Verify state is the one we set
            expect(avatar.currentState).toBe(initialState);
            
            // Get current state through service (should match what we just created)
            const stateInfo = await service.getCurrentState(userId);
            
            expect(stateInfo.success).toBe(true);
            expect(stateInfo.state).toBeDefined();
            expect(['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'])
              .toContain(stateInfo.state);
            // The state from service should match what we created
            expect(stateInfo.state).toBe(avatar.currentState);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('avatars maintain valid state after state changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          fc.array(validStateArb, { minLength: 1, maxLength: 10 }),
          async (userId, stateSequence) => {
            // Create avatar with idle state
            const avatar = await createTestAvatar(userId, 'idle');
            await avatar.reload(); // Ensure we have the latest state
            
            let currentState = avatar.currentState; // Use actual state from DB
            
            // Attempt to change states in sequence
            for (const targetState of stateSequence) {
              const result = await service.changeState(userId, targetState);
              
              // If transition was successful and state actually changed, update current state
              if (result.success) {
                if (result.noChange) {
                  // State didn't change, keep current state
                } else {
                  // State changed successfully
                  currentState = targetState;
                }
              }
              // If transition failed, current state remains unchanged
              
              // Verify avatar still has a valid state
              const stateInfo = await service.getCurrentState(userId);
              expect(stateInfo.success).toBe(true);
              expect(stateInfo.state).toBeDefined();
              expect(['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'])
                .toContain(stateInfo.state);
              
              // State should match our tracked current state
              expect(stateInfo.state).toBe(currentState);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    test('newly created avatars default to idle state', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          async (userId) => {
            // Create avatar without specifying state (should default to idle)
            const avatar = await Avatar.create({
              userId,
              skinColor: '#fdbcb4',
              hairStyle: 'short',
              hairColor: '#000000',
              shirtColor: '#3498db',
              pantsColor: '#2c3e50',
              accessories: {}
            });
            
            // Verify default state is idle
            expect(avatar.currentState).toBe('idle');
            
            // Verify through service
            const stateInfo = await service.getCurrentState(userId);
            expect(stateInfo.success).toBe(true);
            expect(stateInfo.state).toBe('idle');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 15: State Transition Validation
   * 
   * **Validates: Requirements 5.5**
   * 
   * For any state transition request, the system must reject transitions
   * that are not valid according to the state machine.
   * 
   * Valid transitions:
   * - idle → walking, sitting, interacting, dancing
   * - walking → idle, running
   * - running → walking, idle
   * - sitting → idle
   * - interacting → idle
   * - dancing → idle
   */
  describe('Property 15: State Transition Validation', () => {
    test('only valid transitions are allowed by the state machine', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          validStateArb,
          validStateArb,
          async (userId, fromState, toState) => {
            // Create avatar with initial state
            await createTestAvatar(userId, fromState);
            
            // Define valid transitions
            const validTransitions = {
              idle: ['walking', 'sitting', 'interacting', 'dancing'],
              walking: ['idle', 'running'],
              running: ['walking', 'idle'],
              sitting: ['idle'],
              interacting: ['idle'],
              dancing: ['idle']
            };
            
            // Attempt state transition
            const result = await service.changeState(userId, toState);
            
            // Check if transition should be valid
            const isValidTransition = fromState === toState || 
                                     validTransitions[fromState].includes(toState);
            
            if (isValidTransition) {
              // Valid transition should succeed
              expect(result.success).toBe(true);
              
              if (fromState !== toState) {
                expect(result.state).toBe(toState);
                expect(result.previousState).toBe(fromState);
                expect(result.noChange).toBeUndefined();
              } else {
                // Same state transition is a no-op
                expect(result.noChange).toBe(true);
                expect(result.state).toBe(toState);
              }
            } else {
              // Invalid transition should fail (Requirement 5.5)
              expect(result.success).toBe(false);
              expect(result.error).toBeDefined();
              expect(result.error).toContain('Invalid state transition');
              
              // Verify state didn't change
              const stateInfo = await service.getCurrentState(userId);
              expect(stateInfo.state).toBe(fromState);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    test('invalid transitions preserve current state', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          async (userId) => {
            // Create avatar in sitting state
            await createTestAvatar(userId, 'sitting');
            
            // Try invalid transition: sitting → dancing (must go through idle)
            const result = await service.changeState(userId, 'dancing');
            
            // Should fail
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid state transition');
            
            // Verify state is still sitting
            const stateInfo = await service.getCurrentState(userId);
            expect(stateInfo.state).toBe('sitting');
          }
        ),
        { numRuns: 20 }
      );
    });

    test('validateTransition method correctly identifies valid and invalid transitions', async () => {
      await fc.assert(
        fc.asyncProperty(
          validStateArb,
          validStateArb,
          async (fromState, toState) => {
            // Define valid transitions
            const validTransitions = {
              idle: ['walking', 'sitting', 'interacting', 'dancing'],
              walking: ['idle', 'running'],
              running: ['walking', 'idle'],
              sitting: ['idle'],
              interacting: ['idle'],
              dancing: ['idle']
            };
            
            // Check validation
            const isValid = service.validateTransition(fromState, toState);
            
            // Expected result
            const shouldBeValid = fromState === toState || 
                                 validTransitions[fromState].includes(toState);
            
            expect(isValid).toBe(shouldBeValid);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 17: State Change Queuing
   * 
   * **Validates: Requirements 6.4**
   * 
   * For any sequence of rapid state change requests, they must be queued
   * and executed sequentially in the order received.
   * 
   * Note: This property tests that state changes are processed in order
   * and that the final state reflects the last valid transition in the sequence.
   */
  describe('Property 17: State Change Queuing', () => {
    test('multiple rapid state changes are handled correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          fc.array(validStateArb, { minLength: 2, maxLength: 10 }),
          async (userId, stateSequence) => {
            // Create avatar with idle state
            await createTestAvatar(userId, 'idle');
            
            // Track expected state after each transition
            let expectedState = 'idle';
            const results = [];
            
            // Execute state changes sequentially (simulating rapid changes)
            for (const targetState of stateSequence) {
              const result = await service.changeState(userId, targetState);
              results.push(result);
              
              // Update expected state if transition was successful
              if (result.success && !result.noChange) {
                expectedState = targetState;
              }
            }
            
            // Verify final state matches the last successful transition
            const finalState = await service.getCurrentState(userId);
            expect(finalState.success).toBe(true);
            expect(finalState.state).toBe(expectedState);
            
            // Verify all state changes were processed in order
            // (each result should reflect the state at that point in time)
            let currentState = 'idle';
            for (let i = 0; i < results.length; i++) {
              const result = results[i];
              const targetState = stateSequence[i];
              
              if (result.success && !result.noChange) {
                // Successful transition should have correct previous state
                expect(result.previousState).toBe(currentState);
                expect(result.state).toBe(targetState);
                currentState = targetState;
              } else if (result.success && result.noChange) {
                // No-op transition (same state)
                expect(result.state).toBe(currentState);
              } else {
                // Failed transition should preserve current state
                expect(result.success).toBe(false);
                // State should remain unchanged
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    test('state changes maintain consistency under rapid transitions', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdArb,
          async (userId) => {
            // Create avatar
            await createTestAvatar(userId, 'idle');
            
            // Perform a sequence of valid transitions rapidly
            const transitions = [
              'walking',  // idle → walking (valid)
              'running',  // walking → running (valid)
              'idle',     // running → idle (valid)
              'sitting',  // idle → sitting (valid)
              'idle',     // sitting → idle (valid)
              'dancing'   // idle → dancing (valid)
            ];
            
            // Execute all transitions
            for (const targetState of transitions) {
              await service.changeState(userId, targetState);
            }
            
            // Final state should be dancing
            const finalState = await service.getCurrentState(userId);
            expect(finalState.success).toBe(true);
            expect(finalState.state).toBe('dancing');
            expect(finalState.previousState).toBe('idle');
          }
        ),
        { numRuns: 20 }
      );
    }, 15000); // Increase timeout to 15 seconds

    test('concurrent state changes for different avatars are independent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(userIdArb, { minLength: 2, maxLength: 5 }),
          fc.array(validStateArb, { minLength: 2, maxLength: 5 }),
          async (userIds, states) => {
            // Ensure unique user IDs
            const uniqueUserIds = [...new Set(userIds)];
            if (uniqueUserIds.length < 2) return; // Skip if not enough unique users
            
            // Create avatars for all users
            for (const userId of uniqueUserIds) {
              await createTestAvatar(userId, 'idle');
            }
            
            // Change states for different users concurrently
            const stateChanges = uniqueUserIds.map((userId, index) => {
              const targetState = states[index % states.length];
              return service.changeState(userId, targetState);
            });
            
            // Wait for all state changes
            const results = await Promise.all(stateChanges);
            
            // Verify each user's state change was processed independently
            for (let i = 0; i < uniqueUserIds.length; i++) {
              const userId = uniqueUserIds[i];
              const targetState = states[i % states.length];
              const result = results[i];
              
              // Check if transition from idle to targetState is valid
              const validFromIdle = ['idle', 'walking', 'sitting', 'interacting', 'dancing'];
              const shouldSucceed = validFromIdle.includes(targetState);
              
              if (shouldSucceed) {
                expect(result.success).toBe(true);
              }
              
              // Verify final state
              const stateInfo = await service.getCurrentState(userId);
              expect(stateInfo.success).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
