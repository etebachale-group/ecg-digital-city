import React, { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'

/**
 * PixiApp - Core Pixi.js application wrapper
 * Integrates Pixi.js with React lifecycle
 * Optimized for Render Free tier (low memory, fast load)
 */
const PixiApp = ({ width, height, backgroundColor = 0x87CEEB, onReady }) => {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Pixi Application with optimizations for low-end devices
    const app = new PIXI.Application({
      width: width || window.innerWidth,
      height: height || window.innerHeight,
      backgroundColor,
      resolution: Math.min(window.devicePixelRatio || 1, 2), // Cap at 2x for performance
      autoDensity: true,
      antialias: false, // Disable for better performance on Render Free
      powerPreference: 'low-power', // Optimize for battery/low-power devices
      forceCanvas: false // Try WebGL first, fallback to Canvas2D
    })

    // Append canvas to container
    containerRef.current.appendChild(app.view)
    appRef.current = app

    // Handle window resize
    const handleResize = () => {
      const newWidth = width || window.innerWidth
      const newHeight = height || window.innerHeight
      app.renderer.resize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Notify parent component that app is ready
    if (onReady) {
      onReady(app)
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      
      // Destroy Pixi app and free resources
      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true
        })
        appRef.current = null
      }
    }
  }, [width, height, backgroundColor, onReady])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }} 
    />
  )
}

export default PixiApp
