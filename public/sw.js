const CACHE = 'mindsieve-v2'
const STATIC_CACHE = 'mindsieve-static-v2'
const API_CACHE = 'mindsieve-api-v2'

const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.svg', '/icon.svg', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE && k !== STATIC_CACHE && k !== API_CACHE).map((k) => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Navigation — network first, fallback to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Static assets — cache first
  if (ASSETS.includes(url.pathname) || /\.(css|js|woff2?|ttf|png|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // API calls — stale-while-revalidate
  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(API_CACHE).then((cache) => cache.put(request, clone))
          return res
        }).catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
