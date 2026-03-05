/**
 * AvatarStateManager - Manages avatar state machine and transitions
 * 
 * Handles state transitions, animations, and synchronization with server.
 * States: idle, walking, running, sitting, interacting, dancing
 */

class AvatarStateManager {
  constructor(socket = null) {
    this.socket = socket;
    this.currentState = 'idle';
    this.previousState = null;
    this.stateHistory = [];
    this.maxHistorySize = 10;
    
    // Transition configuration
    this.transitions = this.defineTransitions();
    
    // Animation state
    this.isTransitioning = false;
    this.transitionStartTime = null;
    this.transitionDuration = 300; // ms
    
    // Callbacks
    this.onStateChangeCallbacks = [];
  }

  /**
   * Define valid state transitions
   * @returns {Object} - Transition rules
   */
  defineTransitions() {
    return {
      idle: ['walking', 'running', 'sitting', 'interacting', 'dancing'],
      walking: ['idle', 'running'],
      running: ['idle', 'walking'],
      sitting: ['idle'],
      interacting: ['idle'],
      dancing: ['idle']
    };
  }

  /**
   * Check if a state transition is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean}
   */
  canTransition(fromState, toState) {
    if (fromState === toState) {
      return false; // No transition needed
    }
    
    const allowedTransitions = this.transitions[fromState];
    return allowedTransitions && allowedTransitions.includes(toState);
  }

  /**
   * Transition to a new state
   * @param {string} newState - Target state
   * @param {Object} data - Additional data (position, objectId, etc.)
   * @returns {boolean} - Success
   */
  async transition(newState, data = {}) {
    // Validate state
    const validStates = ['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing'];
    if (!validStates.includes(newState)) {
      console.warn(`Invalid state: ${newState}`);
      return false;
    }
    
    // Check if transition is allowed
    if (!this.canTransition(this.currentState, newState)) {
      console.warn(`Invalid transition: ${this.currentState} -> ${newState}`);
      return false;
    }
    
    // Cancel any ongoing transition
    if (this.isTransitioning) {
      this.cancelTransition();
    }
    
    // Store previous state
    this.previousState = this.currentState;
    
    // Add to history
    this.stateHistory.push({
      state: this.currentState,
      timestamp: Date.now()
    });
    
    // Trim history
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
    
    // Start transition animation
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    // Animate transition
    await this.animateTransition(this.currentState, newState, data);
    
    // Update state
    this.currentState = newState;
    this.isTransitioning = false;
    
    // Notify callbacks
    this.notifyStateChange(newState, this.previousState, data);
    
    // Sync with server
    if (this.socket) {
      this.socket.emit('avatar:state-change', {
        state: newState,
        previousState: this.previousState,
        timestamp: Date.now(),
        data
      });
    }
    
    return true;
  }

  /**
   * Animate state transition
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @param {Object} data - Additional data
   * @returns {Promise}
   */
  animateTransition(fromState, toState, data) {
    return new Promise((resolve) => {
      // Calculate transition duration based on states
      let duration = this.transitionDuration;
      
      // Sitting requires position alignment
      if (toState === 'sitting' && data.position) {
        duration = 500; // Longer for sitting
      }
      
      // Use easing function for smooth transition
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Cancel ongoing transition
   */
  cancelTransition() {
    this.isTransitioning = false;
    this.transitionStartTime = null;
  }

  /**
   * Get current state
   * @returns {string}
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Get previous state
   * @returns {string|null}
   */
  getPreviousState() {
    return this.previousState;
  }

  /**
   * Get state history
   * @returns {Array<{state: string, timestamp: number}>}
   */
  getStateHistory() {
    return [...this.stateHistory];
  }

  /**
   * Force set state (use with caution, bypasses validation)
   * @param {string} state - State to set
   */
  forceSetState(state) {
    this.previousState = this.currentState;
    this.currentState = state;
    this.notifyStateChange(state, this.previousState);
  }

  /**
   * Register state change callback
   * @param {Function} callback - Callback function (newState, oldState, data) => void
   */
  onStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
  }

  /**
   * Unregister state change callback
   * @param {Function} callback - Callback to remove
   */
  offStateChange(callback) {
    const index = this.onStateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onStateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all callbacks of state change
   * @private
   */
  notifyStateChange(newState, oldState, data = {}) {
    for (const callback of this.onStateChangeCallbacks) {
      try {
        callback(newState, oldState, data);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    }
  }

  /**
   * Check if currently transitioning
   * @returns {boolean}
   */
  isInTransition() {
    return this.isTransitioning;
  }

  /**
   * Get transition progress (0-1)
   * @returns {number}
   */
  getTransitionProgress() {
    if (!this.isTransitioning || !this.transitionStartTime) {
      return 1;
    }
    
    const elapsed = Date.now() - this.transitionStartTime;
    return Math.min(elapsed / this.transitionDuration, 1);
  }

  /**
   * Reset to idle state
   */
  reset() {
    this.currentState = 'idle';
    this.previousState = null;
    this.isTransitioning = false;
    this.transitionStartTime = null;
    this.stateHistory = [];
  }

  /**
   * Get state machine configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      transitions: this.transitions,
      isTransitioning: this.isTransitioning,
      transitionDuration: this.transitionDuration
    };
  }
}

export default AvatarStateManager;
