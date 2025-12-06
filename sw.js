// Auto-increment this version number when deploying updates
const APP_VERSION = '2.0.0';
const CACHE_NAME = `profithack-ai-v${APP_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo-spiral-head.svg',
  '/logo-spiral-head-simple.svg'
];

self.addEventListener('install', (event) => {
  console.log(`🔄 SW: Installing version ${APP_VERSION}`);
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`📦 SW: Caching app shell v${APP_VERSION}`);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ SW: Cache installation failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`✅ SW: Activating version ${APP_VERSION}`);
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log(`🗑️ SW: Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
  
  // Notify all clients that a new version is active
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: APP_VERSION
      });
    });
  });
});
