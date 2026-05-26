import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'app-logo-32.png',
        'app-logo-180.png',
        'social-cover.jpg',
        'pwa-splash-192.png',
        'pwa-splash-512.png',
        'pwa-splash-maskable-512.png'
      ],
      manifest: {
        name: '3 Berlian POS Penyewaan Kostum',
        short_name: '3B POS',
        description: 'Sistem POS penyewaan kostum Sanggar Seni 3 Berlian',
        lang: 'id',
        theme_color: '#0D47A1',
        background_color: '#F5F7FA',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-splash-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-splash-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-splash-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        }
      }
    }
  }
})
