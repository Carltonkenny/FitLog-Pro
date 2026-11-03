// FitLog Pro service worker: lets the app open and log workouts with no connection.
// It only handles same-origin GET requests. API, auth and Google calls are never cached or touched.
const CACHE = 'fitlog-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages: network first so updates arrive, cached app shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((r) => keep('/', r)).catch(() => caches.match('/')));
    return;
  }
  // Built files have hashed names and never change: cache first.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((r) => keep(request, r))));
    return;
  }
  // Everything else (icons, exercise photos): show the cached copy, refresh it in the background.
  event.respondWith(
    caches.match(request).then((hit) => {
      const fresh = fetch(request).then((r) => keep(request, r)).catch(() => hit);
      return hit || fresh;
    })
  );
});
