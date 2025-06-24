import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'MCCOD React App',
        short_name: 'MCCOD',
        description: 'MCCOD Application',
        theme_color: '#000000',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Expose on all network interfaces
    proxy: {
      // Proxy ICD-API requests
      '/icd-api': {
        target: 'http://localhost:8382',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icd-api/, '')
      },
      // Proxy DHIS2/Proxy service requests  
      '/proxy-api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, '')
      },
      // Direct DHIS2 proxy for tablet mode
      // Note: Authentication headers are now handled dynamically by the app
      '/dhis2-direct': {
        target: 'https://migration-dhis.sante.gov.bf',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dhis2-direct/, ''),
        secure: true
      }
    }
  }
});