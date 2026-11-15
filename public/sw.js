/* HeartSYNC service worker - app-shell + offline fallback.
   Network-first for navigations (so fresh content wins) with an offline page
   fallback; cache-first for static assets. A new worker waits until the page
   sends SKIP_WAITING, so the user sees the "Update available" prompt first. */
const VERSION = 'cs-v4'; // v4: robust offline fallback, update prompt
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = '/offline';

const PRECACHE = ['/offline', '/manifest.webmanifest', '/icons/pwa/icon-192.png', '/brand/mark-160.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      // One unavailable asset must not fail the whole install.
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u))))
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
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

// Always resolves to a Response so the browser never shows its own error page.
function offlineResponse() {
  return caches.match(OFFLINE_URL).then(
    (res) =>
      res ||
      new Response(
        '<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;text-align:center;padding:4rem 1rem"><h1>You are offline</h1><p>Reconnect and try again.</p><a href="/dashboard">Retry</a>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
  );
}

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
          // Keep only plain successful pages (never redirects/errors).
          if (res.ok && res.type === 'basic' && !res.redirected) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || offlineResponse())
            .catch(offlineResponse)
        )
    );
    return;
  }

  // Static assets: cache-first.
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons') || url.pathname.startsWith('/brand')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
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
