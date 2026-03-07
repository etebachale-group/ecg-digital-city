/**
 * Feature flags configuration
 * Allows toggling between 3D and 2D rendering modes
 */

// Check localStorage for user preference, default to 2D for Render Free optimization
const getDefaultRenderMode = () => {
  const stored = localStorage.getItem('renderMode')
  if (stored === '3d' || stored === '2d') {
    return stored
  }
  // Default to 2D for better performance on Render Free
  return '2d'
}

export const FEATURES = {
  // Render mode: '3d' or '2d'
  RENDER_MODE: getDefaultRenderMode(),
  
  // Enable/disable features
  ENABLE_VOICE_CHAT: false,
  ENABLE_3D_AUDIO: false,
  ENABLE_PARTICLES: false, // Disable for better performance
  ENABLE_SHADOWS: false,   // Disable for better performance
}

/**
 * Toggle render mode between 3D and 2D
 */
export const toggleRenderMode = () => {
  const newMode = FEATURES.RENDER_MODE === '3d' ? '2d' : '3d'
  FEATURES.RENDER_MODE = newMode
  localStorage.setItem('renderMode', newMode)
  // Reload page to apply changes
  window.location.reload()
}

/**
 * Set render mode
 * @param {'3d' | '2d'} mode 
 */
export const setRenderMode = (mode) => {
  if (mode !== '3d' && mode !== '2d') {
    console.error('Invalid render mode:', mode)
    return
  }
  FEATURES.RENDER_MODE = mode
  localStorage.setItem('renderMode', mode)
  window.location.reload()
}

/**
 * Get current render mode
 * @returns {'3d' | '2d'}
 */
export const getRenderMode = () => {
  return FEATURES.RENDER_MODE
}
