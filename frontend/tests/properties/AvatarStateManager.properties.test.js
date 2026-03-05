/**
 * Property-Based Tests for AvatarStateManager
 */

const fc = require('fast-check');
const AvatarStateManager = require('../../src/systems/AvatarStateManager');

describe('AvatarStateManager - Property Tests', () => {
  /**
   * Property 14: Sitting Position Alignment
   * Validates: Requirements 5.4
   */
  test('Property 14: State transitions are tracked in history', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting', 'interacting', 'dancing'),
        async (targetState) => {
          const manager = new AvatarStateManager();
          
          await manager.transition(targetState);
          
          const history = manager.getStateHistory();
          expect(history.length).toBeGreaterThan(0);
          expect(history[history.length - 1].state).toBe('idle');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 16: Transition Cancellation
   * Validates: Requirements 6.3
   */
  test('Property 16: Transition can be cancelled', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting'),
        async (targetState) => {
          const manager = new AvatarStateManager();
          
          // Start transition
          const transitionPromise = manager.transition(targetState);
          
          // Cancel immediately
          manager.cancelTransition();
          
          expect(manager.isInTransition()).toBe(false);
          
          await transitionPromise;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Valid transitions always succeed
   */
  test('Property: All valid transitions succeed', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting', 'interacting', 'dancing'),
        async (targetState) => {
          const manager = new AvatarStateManager();
          
          const result = await manager.transition(targetState);
          
          expect(result).toBe(true);
          expect(manager.getCurrentState()).toBe(targetState);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Invalid transitions are rejected
   */
  test('Property: Invalid transitions fail', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('sitting', 'interacting', 'dancing'),
        fc.constantFrom('walking', 'running'),
        async (fromState, toState) => {
          const manager = new AvatarStateManager();
          
          // First transition to non-idle state
          await manager.transition(fromState);
          
          // Try invalid transition
          const result = await manager.transition(toState);
          
          expect(result).toBe(false);
          expect(manager.getCurrentState()).toBe(fromState);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Previous state is tracked
   */
  test('Property: Previous state is always tracked', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting'),
        async (targetState) => {
          const manager = new AvatarStateManager();
          const initialState = manager.getCurrentState();
          
          await manager.transition(targetState);
          
          expect(manager.getPreviousState()).toBe(initialState);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: State history has maximum size
   */
  test('Property: State history respects max size', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('walking', 'idle'), { minLength: 15, maxLength: 20 }),
        async (transitions) => {
          const manager = new AvatarStateManager();
          
          for (const state of transitions) {
            await manager.transition(state);
          }
          
          const history = manager.getStateHistory();
          expect(history.length).toBeLessThanOrEqual(manager.maxHistorySize);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Transition to same state is rejected
   */
  test('Property: Cannot transition to current state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting'),
        async (state) => {
          const manager = new AvatarStateManager();
          
          await manager.transition(state);
          
          const result = await manager.transition(state);
          
          expect(result).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Callbacks are notified on state change
   */
  test('Property: Callbacks receive correct state information', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('walking', 'running', 'sitting'),
        async (targetState) => {
          const manager = new AvatarStateManager();
          let callbackCalled = false;
          let receivedNewState = null;
          let receivedOldState = null;
          
          manager.onStateChange((newState, oldState) => {
            callbackCalled = true;
            receivedNewState = newState;
            receivedOldState = oldState;
          });
          
          await manager.transition(targetState);
          
          expect(callbackCalled).toBe(true);
          expect(receivedNewState).toBe(targetState);
          expect(receivedOldState).toBe('idle');
        }
      ),
      { numRuns: 20 }
    );
  });
});
