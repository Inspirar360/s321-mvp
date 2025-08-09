const CACHE_NAME = 's321-mvp-v1';
const ASSETS = [
  '/s321-mvp/',
  '/s321-mvp/index.html',
  '/s321-mvp/icons/icon-192.png',
  '/s321-mvp/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        return resp;
      }).catch(() => caches.match('/s321-mvp/index.html'))
    )
  );
});
