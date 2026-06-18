/**
 * PWA Service Worker
 * Caches essential files for offline use.
 */

const CACHE_NAME = 'thirty-recipes-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './assets/icon.svg',
  './Thirty Logo.jpeg',
  './recipes_with_heat.json',
  './js/app.js',
  './js/data.js',
  './js/ui.js',
  './js/views/browse.js',
  './js/views/detail.js',
  './js/views/cook.js',
  './js/views/grocery.js',
  './js/views/lists.js',
  './js/views/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return cached version
        }
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Optional: Clone the response and add it to cache dynamically
            // (Skipping for now to stick strictly to ASSETS_TO_CACHE)

            return response;
          }
        );
      })
  );
});
