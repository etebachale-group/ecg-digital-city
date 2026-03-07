/**
 * ErrorHandler - Global error handling and recovery
 * Handles asset loading errors, WebGL context loss, network errors
 */

/**
 * Handle asset loading error
 * @param {Error} error - Error object
 * @param {string} assetName - Name of asset that failed
 * @param {Function} onRetry - Retry callback
 * @param {Function} onFallback - Fallback callback
 */
export function handleAssetLoadError(error, assetName, onRetry, onFallback) {
  console.error(`Failed to load asset: ${assetName}`, error)
  
  // Show toast notification
  if (window.showToast) {
    window.showToast(`Failed to load ${assetName}. Using fallback.`, 'warning')
  }
  
  // Use fallback immediately
  if (onFallback) {
    onFallback()
  }
  
  // Optionally retry after delay
  if (onRetry) {
    setTimeout(() => {
      console.log(`Retrying to load: ${assetName}`)
      onRetry()
    }, 5000) // 5 second delay
  }
}

/**
 * Handle WebGL context loss
 * @param {PIXI.Application} app - Pixi application
 * @param {Function} onRestore - Callback when context is restored
 */
export function setupWebGLContextLossHandler(app, onRestore) {
  if (!app || !app.view) return
  
  const canvas = app.view
  
  // Handle context loss
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    console.warn('⚠️ WebGL context lost')
    
    // Pause game loop
    if (app.ticker) {
      app.ticker.stop()
    }
    
    // Show notification
    if (window.showToast) {
      window.showToast('Graphics context lost. Reconnecting...', 'warning')
    }
  })
  
  // Handle context restore
  canvas.addEventListener('webglcontextrestored', () => {
    console.log('✅ WebGL context restored')
    
    // Resume game loop
    if (app.ticker) {
      app.ticker.start()
    }
    
    // Reload textures and rebuild scene
    if (onRestore) {
      onRestore()
    }
    
    // Show notification
    if (window.showToast) {
      window.showToast('Graphics context restored', 'success')
    }
  })
}

/**
 * Handle network error
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed
 */
export function handleNetworkError(error, operation) {
  console.error(`Network error during ${operation}:`, error)
  
  // Show toast notification
  if (window.showToast) {
    window.showToast(`Network error: ${operation}. Please check your connection.`, 'error')
  }
}

/**
 * Handle generic error with logging
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export function handleError(error, context) {
  console.error(`Error in ${context}:`, error)
  
  // Log to error tracking service (if configured)
  if (window.trackError) {
    window.trackError(error, { context })
  }
  
  // Show user-friendly message
  if (window.showToast) {
    window.showToast('An error occurred. Please refresh the page.', 'error')
  }
}

/**
 * Retry with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise}
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Safe JSON parse with fallback
 * @param {string} json - JSON string
 * @param {any} fallback - Fallback value
 * @returns {any}
 */
export function safeJSONParse(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return fallback
  }
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    event.preventDefault()
    
    if (window.trackError) {
      window.trackError(event.reason, { type: 'unhandledRejection' })
    }
  })
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    if (window.trackError) {
      window.trackError(event.error, { type: 'globalError' })
    }
  })
}
