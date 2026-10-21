/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Injected by vite-plugin-pwa at build time
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Cache strategies ──────────────────────────────────────

// Images: cache-first, 7 days
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Poster images → cache first
  if (/\.(png|jpg|jpeg|webp|jfif|svg)(\?.*)?$/i.test(url.pathname)) {
    event.respondWith(
      caches.open('chillz-images-v1').then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        try {
          const res = await fetch(event.request)
          if (res.ok) cache.put(event.request, res.clone())
          return res
        } catch {
          return cached ?? new Response('', { status: 503 })
        }
      })
    )
    return
  }

  // Supabase TMDB API → network first, fall back to cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.open('chillz-api-v1').then(async (cache) => {
        try {
          const res = await fetch(event.request)
          if (res.ok) cache.put(event.request, res.clone())
          return res
        } catch {
          const cached = await cache.match(event.request)
          return cached ?? new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    )
  }
})

// Skip waiting so new SW takes over immediately
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
