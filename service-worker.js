
const CACHE = 'debt-pwa-shell-v2';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('debt-pwa-shell-') && key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  const allowedFiles = new Set([
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icon-192.png',
    '/icon-512.png'
  ]);

  const base = new URL(self.registration.scope).pathname;
  const relative = url.pathname.startsWith(base)
    ? '/' + url.pathname.slice(base.length)
    : null;

  if (!relative || !allowedFiles.has(relative)) return;

  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && !url.search) {
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE).then(cache => cache.put(request, copy))
        );
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
