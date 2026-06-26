const CACHE_NAME = 'chandigarh-clinic-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch-first caching or network-only
  // For this pure local app, standard fetching is fine,
  // but registering the SW makes it installable as a PWA!
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
