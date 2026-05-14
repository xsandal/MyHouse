import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Generates public/firebase-messaging-sw.js from .env at dev/build time.
// The file contains Firebase config (non-secret) but is gitignored to avoid
// accidentally committing project-specific values.
function firebaseSwPlugin(): Plugin {
  return {
    name: 'firebase-messaging-sw',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, 'VITE_')
      if (!env.VITE_FIREBASE_API_KEY) return // skip if .env not set up yet

      const publicDir = path.resolve(config.root, 'public')
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

      const content = `\
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: '${env.VITE_FIREBASE_API_KEY}',
  authDomain: '${env.VITE_FIREBASE_AUTH_DOMAIN}',
  projectId: '${env.VITE_FIREBASE_PROJECT_ID}',
  storageBucket: '${env.VITE_FIREBASE_STORAGE_BUCKET}',
  messagingSenderId: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID}',
  appId: '${env.VITE_FIREBASE_APP_ID}',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification?.title ?? 'MyHouse', {
    body: payload.notification?.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
  })
})
`
      fs.writeFileSync(
        path.resolve(config.root, 'public/firebase-messaging-sw.js'),
        content,
      )
    },
  }
}

export default defineConfig({
  plugins: [
    firebaseSwPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'MyHouse – Have & Hus',
        short_name: 'MyHouse',
        description: 'Din personlige have- og husassistent',
        theme_color: '#1D9E75',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
