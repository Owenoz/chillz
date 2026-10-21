import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Polyfill globalThis.crypto for Node 18 (required by workbox-build → serialize-javascript)
import { webcrypto } from 'node:crypto'
if (!globalThis.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).crypto = webcrypto
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest = we supply our own sw.ts; plugin only injects the precache list
      // This avoids the workbox generateSW path that uses @rollup/plugin-terser (broken on Node 18)
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      includeAssets: [
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png',
        'favicon-32.png',
        'favicon-16.png',
      ],

      manifest: {
        name: 'Chillz — Watch. Chill. Repeat.',
        short_name: 'Chillz',
        description: 'Live TV, sports, movies and world cinema — free, no login needed.',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['entertainment', 'lifestyle'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Live TV',
            short_name: 'TV',
            description: 'Browse live TV channels',
            url: '/tv',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Sports',
            short_name: 'Sports',
            description: 'Live sports & fixtures',
            url: '/sports',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Movies',
            short_name: 'Movies',
            description: 'Free movies & TV shows',
            url: '/movies',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
        ],
      },

      injectManifest: {
        // Only precache app shell assets — skip large JSON data files
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        globIgnores: [
          '**/tv_channels.json',
          '**/sports_fixtures.json',
          '**/sports_teams.json',
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
})
