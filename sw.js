// Service Worker for Offline support
const CACHE_NAME = 'lich-van-nien-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - Network first for API, Cache fallback for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If it's an API call (to Gemini) or external CDN, go network only
  if (url.hostname.includes('googleapis') || url.hostname.includes('cdn')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, else fetch from network
      return response || fetch(event.request);
    })
  );
});