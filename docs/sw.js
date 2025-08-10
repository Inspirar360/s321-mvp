const CACHE_NAME = 's321-mvp-v6';

const ASSETS = [
  '',                    // raíz del scope (equivale a /s321-mvp/)
  'index.html',
  'manifest.json',
  'pwa-icons/icon-192.png',
  'pwa-icons/icon-512.png',
  'pwa-icons/maskable-512.png'
];

const abs = (p) => new URL(p, self.registration.scope).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS.map(abs)))
  );
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

  const url = new URL(event.request.url);

  // Solo mismo origen y dentro del scope del SW (GitHub Pages: /<repo>/...)
  if (url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        return resp;
      }).catch(() => caches.match(abs('index.html')))
    )
  );
});
