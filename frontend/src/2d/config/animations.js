/**
 * Animation Configuration System
 * Defines all animation states and their properties
 */

/**
 * @typedef {'idle' | 'walking' | 'running' | 'sitting' | 'dancing' | 'interacting' | 'emoting'} AnimationState
 */

/**
 * @typedef {Object} AnimationConfig
 * @property {AnimationState} state - Animation state name
 * @property {number[]} frames - Frame indices in spritesheet
 * @property {number} frameRate - Frames per second
 * @property {boolean} loop - Whether animation should loop
 */

/**
 * Animation configurations for all avatar states
 * @type {Record<AnimationState, AnimationConfig>}
 */
export const ANIMATION_CONFIGS = {
  idle: {
    state: 'idle',
    frames: [0, 1, 2, 3],
    frameRate: 4,
    loop: true
  },
  walking: {
    state: 'walking',
    frames: [4, 5, 6, 7],
    frameRate: 8,
    loop: true
  },
  running: {
    state: 'running',
    frames: [8, 9, 10, 11],
    frameRate: 12,
    loop: true
  },
  sitting: {
    state: 'sitting',
    frames: [12],
    frameRate: 1,
    loop: false
  },
  dancing: {
    state: 'dancing',
    frames: [13, 14, 15, 16],
    frameRate: 6,
    loop: true
  },
  interacting: {
    state: 'interacting',
    frames: [17, 18],
    frameRate: 4,
    loop: true
  },
  emoting: {
    state: 'emoting',
    frames: [19, 20, 21],
    frameRate: 6,
    loop: false
  }
}

/**
 * Validate animation configuration
 * @param {AnimationConfig} config 
 * @returns {boolean}
 */
export function validateAnimationConfig(config) {
  if (!config.state || typeof config.state !== 'string') {
    console.error('Invalid animation state:', config.state)
    return false
  }
  
  if (!Array.isArray(config.frames) || config.frames.length === 0) {
    console.error('Invalid frames array:', config.frames)
    return false
  }
  
  if (typeof config.frameRate !== 'number' || config.frameRate <= 0) {
    console.error('Invalid frame rate:', config.frameRate)
    return false
  }
  
  if (typeof config.loop !== 'boolean') {
    console.error('Invalid loop value:', config.loop)
    return false
  }
  
  return true
}

/**
 * Get animation config by state
 * @param {AnimationState} state 
 * @returns {AnimationConfig | null}
 */
export function getAnimationConfig(state) {
  const config = ANIMATION_CONFIGS[state]
  if (!config) {
    console.error('Animation state not found:', state)
    return null
  }
  return config
}

/**
 * Get all available animation states
 * @returns {AnimationState[]}
 */
export function getAvailableStates() {
  return Object.keys(ANIMATION_CONFIGS)
}
