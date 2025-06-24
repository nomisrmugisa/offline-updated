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
  // Production-like server config for network testing
  server: {
    host: '192.168.1.155', // Specific IP only, not 0.0.0.0
    port: 5200,
    strictPort: true,
    // Remove proxy in production-like mode
    // Force app to use real network IPs
  },
  preview: {
    host: '192.168.1.155',
    port: 5200,
  }
}); 