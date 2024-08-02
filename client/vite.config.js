import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },
  plugins: [react(),
    VitePWA({
      manifest: {
        name: 'ChatPlus',
        short_name: 'ChatPlus',
        description: 'This is a messaging and file sharing website',
        icons: [
          {
            src: '/images/logo144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/images/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/images/logo256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/images/logo384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/images/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: '.',
        theme_color: '#fff',
        background_color: '#fff'
      },
      registerType: 'autoUpdate'
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000
  }
})
