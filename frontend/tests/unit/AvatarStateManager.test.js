/**
 * Unit Tests for AvatarStateManager
 */

const AvatarStateManager = require('../../src/systems/AvatarStateManager');

describe('AvatarStateManager - Unit Tests', () => {
  describe('Initialization', () => {
    test('starts in idle state', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.getCurrentState()).toBe('idle');
      expect(manager.getPreviousState()).toBeNull();
    });

    test('initializes with empty history', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.getStateHistory()).toEqual([]);
    });

    test('is not transitioning initially', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.isInTransition()).toBe(false);
    });
  });

  describe('Valid State Transitions', () => {
    test('transitions from idle to walking', async () => {
      const manager = new AvatarStateManager();
      
      const result = await manager.transition('walking');
      
      expect(result).toBe(true);
      expect(manager.getCurrentState()).toBe('walking');
      expect(manager.getPreviousState()).toBe('idle');
    });

    test('transitions from idle to running', async () => {
      const manager = new AvatarStateManager();
      
      const result = await manager.transition('running');
      
      expect(result).toBe(true);
      expect(manager.getCurrentState()).toBe('running');
    });

    test('transitions from idle to sitting', async () => {
      const manager = new AvatarStateManager();
      
      const result = await manager.transition('sitting');
      
      expect(result).toBe(true);
      expect(manager.getCurrentState()).toBe('sitting');
    });

    test('transitions from walking to running', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      const result = await manager.transition('running');
      
      expect(result).toBe(true);
      expect(manager.getCurrentState()).toBe('running');
    });

    test('transitions from sitting back to idle', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('sitting');
      const result = await manager.transition('idle');
      
      expect(result).toBe(true);
      expect(manager.getCurrentState()).toBe('idle');
    });
  });

  describe('Invalid State Transitions', () => {
    test('rejects transition from sitting to walking', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('sitting');
      const result = await manager.transition('walking');
      
      expect(result).toBe(false);
      expect(manager.getCurrentState()).toBe('sitting');
    });

    test('rejects transition from interacting to running', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('interacting');
      const result = await manager.transition('running');
      
      expect(result).toBe(false);
      expect(manager.getCurrentState()).toBe('interacting');
    });

    test('rejects transition to same state', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      const result = await manager.transition('walking');
      
      expect(result).toBe(false);
    });

    test('rejects invalid state name', async () => {
      const manager = new AvatarStateManager();
      
      const result = await manager.transition('flying');
      
      expect(result).toBe(false);
      expect(manager.getCurrentState()).toBe('idle');
    });
  });

  describe('Transition Validation', () => {
    test('canTransition returns true for valid transitions', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.canTransition('idle', 'walking')).toBe(true);
      expect(manager.canTransition('idle', 'sitting')).toBe(true);
      expect(manager.canTransition('walking', 'running')).toBe(true);
    });

    test('canTransition returns false for invalid transitions', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.canTransition('sitting', 'walking')).toBe(false);
      expect(manager.canTransition('interacting', 'running')).toBe(false);
    });

    test('canTransition returns false for same state', () => {
      const manager = new AvatarStateManager();
      
      expect(manager.canTransition('idle', 'idle')).toBe(false);
      expect(manager.canTransition('walking', 'walking')).toBe(false);
    });
  });

  describe('State History', () => {
    test('adds states to history', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      await manager.transition('idle');
      await manager.transition('sitting');
      
      const history = manager.getStateHistory();
      
      expect(history.length).toBe(3);
      expect(history[0].state).toBe('idle');
      expect(history[1].state).toBe('walking');
      expect(history[2].state).toBe('idle');
    });

    test('includes timestamps in history', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      
      const history = manager.getStateHistory();
      
      expect(history[0].timestamp).toBeDefined();
      expect(typeof history[0].timestamp).toBe('number');
    });

    test('limits history size', async () => {
      const manager = new AvatarStateManager();
      
      // Perform more transitions than max history size
      for (let i = 0; i < 15; i++) {
        await manager.transition(i % 2 === 0 ? 'walking' : 'idle');
      }
      
      const history = manager.getStateHistory();
      
      expect(history.length).toBeLessThanOrEqual(manager.maxHistorySize);
    });
  });

  describe('Transition Animation', () => {
    test('sets transitioning flag during transition', async () => {
      const manager = new AvatarStateManager();
      
      const transitionPromise = manager.transition('walking');
      
      // Should be transitioning immediately
      expect(manager.isInTransition()).toBe(true);
      
      await transitionPromise;
      
      // Should not be transitioning after completion
      expect(manager.isInTransition()).toBe(false);
    });

    test('transition progress starts at 0 and ends at 1', async () => {
      const manager = new AvatarStateManager();
      
      const transitionPromise = manager.transition('walking');
      
      // Progress should be between 0 and 1 during transition
      const progressDuring = manager.getTransitionProgress();
      expect(progressDuring).toBeGreaterThanOrEqual(0);
      expect(progressDuring).toBeLessThanOrEqual(1);
      
      await transitionPromise;
      
      // Progress should be 1 after completion
      expect(manager.getTransitionProgress()).toBe(1);
    });

    test('cancels ongoing transition', async () => {
      const manager = new AvatarStateManager();
      
      const transitionPromise = manager.transition('walking');
      
      manager.cancelTransition();
      
      expect(manager.isInTransition()).toBe(false);
      
      await transitionPromise;
    });
  });

  describe('State Change Callbacks', () => {
    test('notifies callbacks on state change', async () => {
      const manager = new AvatarStateManager();
      let callbackCalled = false;
      
      manager.onStateChange(() => {
        callbackCalled = true;
      });
      
      await manager.transition('walking');
      
      expect(callbackCalled).toBe(true);
    });

    test('passes correct parameters to callback', async () => {
      const manager = new AvatarStateManager();
      let receivedNewState = null;
      let receivedOldState = null;
      let receivedData = null;
      
      manager.onStateChange((newState, oldState, data) => {
        receivedNewState = newState;
        receivedOldState = oldState;
        receivedData = data;
      });
      
      await manager.transition('walking', { speed: 5 });
      
      expect(receivedNewState).toBe('walking');
      expect(receivedOldState).toBe('idle');
      expect(receivedData).toEqual({ speed: 5 });
    });

    test('calls multiple callbacks', async () => {
      const manager = new AvatarStateManager();
      let callback1Called = false;
      let callback2Called = false;
      
      manager.onStateChange(() => { callback1Called = true; });
      manager.onStateChange(() => { callback2Called = true; });
      
      await manager.transition('walking');
      
      expect(callback1Called).toBe(true);
      expect(callback2Called).toBe(true);
    });

    test('removes callback', async () => {
      const manager = new AvatarStateManager();
      let callbackCalled = false;
      
      const callback = () => { callbackCalled = true; };
      
      manager.onStateChange(callback);
      manager.offStateChange(callback);
      
      await manager.transition('walking');
      
      expect(callbackCalled).toBe(false);
    });

    test('handles callback errors gracefully', async () => {
      const manager = new AvatarStateManager();
      
      manager.onStateChange(() => {
        throw new Error('Callback error');
      });
      
      // Should not throw
      await expect(manager.transition('walking')).resolves.toBe(true);
    });
  });

  describe('Force Set State', () => {
    test('bypasses validation', () => {
      const manager = new AvatarStateManager();
      
      manager.forceSetState('sitting');
      
      expect(manager.getCurrentState()).toBe('sitting');
      expect(manager.getPreviousState()).toBe('idle');
    });

    test('allows invalid transitions', () => {
      const manager = new AvatarStateManager();
      
      manager.forceSetState('sitting');
      manager.forceSetState('running'); // Invalid normally
      
      expect(manager.getCurrentState()).toBe('running');
    });
  });

  describe('Reset', () => {
    test('resets to idle state', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      manager.reset();
      
      expect(manager.getCurrentState()).toBe('idle');
      expect(manager.getPreviousState()).toBeNull();
    });

    test('clears history', async () => {
      const manager = new AvatarStateManager();
      
      await manager.transition('walking');
      await manager.transition('idle');
      
      manager.reset();
      
      expect(manager.getStateHistory()).toEqual([]);
    });

    test('clears transition state', async () => {
      const manager = new AvatarStateManager();
      
      const transitionPromise = manager.transition('walking');
      manager.reset();
      
      expect(manager.isInTransition()).toBe(false);
      
      await transitionPromise;
    });
  });

  describe('Configuration', () => {
    test('returns current configuration', () => {
      const manager = new AvatarStateManager();
      
      const config = manager.getConfig();
      
      expect(config.currentState).toBe('idle');
      expect(config.transitions).toBeDefined();
      expect(config.transitionDuration).toBe(300);
    });

    test('includes all transition rules', () => {
      const manager = new AvatarStateManager();
      
      const config = manager.getConfig();
      
      expect(config.transitions.idle).toContain('walking');
      expect(config.transitions.idle).toContain('sitting');
      expect(config.transitions.walking).toContain('running');
      expect(config.transitions.sitting).toContain('idle');
    });
  });

  describe('Socket Integration', () => {
    test('emits state change to socket', async () => {
      const mockSocket = {
        emit: jest.fn()
      };
      
      const manager = new AvatarStateManager(mockSocket);
      
      await manager.transition('walking');
      
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'avatar:state-change',
        expect.objectContaining({
          state: 'walking',
          previousState: 'idle'
        })
      );
    });

    test('does not emit if no socket', async () => {
      const manager = new AvatarStateManager();
      
      // Should not throw
      await expect(manager.transition('walking')).resolves.toBe(true);
    });
  });
});
