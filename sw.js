// Cache the complete local app shell for offline launches.
const CACHE = 'onesecond-v3';
const FILES = [
  './', './index.html', './styles.css', './manifest.webmanifest', './sw.js',
  './js/main.js', './js/game.js', './js/render.js', './js/audio.js',
  './js/storage.js', './js/input.js', './icons/icon.svg',
  './icons/favicon-32.png', './icons/icon-180.png', './icons/icon-192.png',
  './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png',
  './splash/splash-1170x2532.png', './splash/splash-1179x2556.png',
  './splash/splash-1290x2796.png', './splash/splash-1284x2778.png',
  './splash/splash-1125x2436.png', './splash/splash-750x1334.png',
  './splash/splash-828x1792.png'
];

// Install the new shell before replacing the previous cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Remove old versions and take control of open clients.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Serve cached files first and cache same-origin responses as they are used.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request)
      .then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match('./index.html')))
  );
});
