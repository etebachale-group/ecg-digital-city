import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser', // Better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'pixi-vendor': ['pixi.js'], // Separate Pixi.js chunk
          'socket-vendor': ['socket.io-client'],
          'zustand-vendor': ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit for vendor chunks
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  // Optimize for Render Free tier
  optimizeDeps: {
    include: ['pixi.js', 'react', 'react-dom', 'zustand', 'socket.io-client']
  }
})
