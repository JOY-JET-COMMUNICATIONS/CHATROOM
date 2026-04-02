const CACHE_NAME = 'joyjet-v2';
const urlsToCache = [
  '/',
  '/css/design-system.css',
  '/css/components.css',
  '/css/layouts.css',
  '/js/safety.js',
  '/js/chat.js',
  '/js/webrtc.js',
  '/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
