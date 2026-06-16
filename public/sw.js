/* CoupleSpace service worker — app-shell + offline fallback.
   Network-first for navigations (so fresh content wins) with an offline page
   fallback; cache-first for static assets. */
const VERSION = 'cs-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = '/offline';

const PRECACHE = ['/offline', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never cache API / socket / cross-origin (Cloudinary, Google, etc.).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // Navigations: network-first, fall back to cache, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: cache-first.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
  }
});

// Focus/open the app when a push notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      return self.clients.openWindow(link);
    })
  );
});
