import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tablet-specific secure configuration
export default defineConfig({
  plugins: [react()],
  
  server: {
    // Bind to specific network IP only
    host: '192.168.1.155',
    port: 5173,
    
    // Security headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://192.168.1.155:* http://localhost:*"
    },
    
    // CORS configuration for tablet mode
    cors: {
      origin: [
        'http://192.168.1.155:5173',
        'http://localhost:5173'
      ],
      credentials: true
    },
    
    // Network restrictions
    hmr: {
      host: '192.168.1.155'
    },
    
    // Proxy configuration for secure API access
    proxy: {
      '/icd-api': {
        target: 'http://192.168.1.155:8382',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icd-api/, ''),
        secure: false
      },
      '/proxy-api': {
        target: 'http://192.168.1.155:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, ''),
        secure: false
      },
      '/dhis2-direct': {
        target: 'https://migration-dhis.sante.gov.bf',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dhis2-direct/, ''),
        secure: true
        // Note: Authentication headers are now handled dynamically by the app
      }
    }
  }
}) 