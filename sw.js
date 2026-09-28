/*
 * Service worker — Invoice Generator PWA
 *
 * Caching strategy
 * ────────────────
 * • App shell (index.html, manifest, icons, vendor JS): pre-cached on install.
 * • Navigations: network-first, falling back to the cached shell when offline.
 * • Same-origin static files: cache-first, then fetch-and-store.
 * • CDN assets (Font Awesome CSS/webfonts, Google Fonts): stale-while-revalidate.
 * • Supabase API (*.supabase.co): never intercepted — invoices/sync always hit
 *   the live network; local data lives in the app's own localStorage.
 *
 * Bump VERSION whenever you ship a change so old caches are purged.
 */
'use strict';

const VERSION = 'v1.0.0';
const CORE_CACHE = 'invoice-core-' + VERSION;
const RUNTIME_CACHE = 'invoice-runtime-' + VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/html2pdf.bundle.min.js',
  './vendor/supabase.min.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CORE_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return; // let POSTs (e.g. Supabase writes) pass through untouched

  const url = new URL(request.url);

  // Navigations: try the network so users get fresh HTML, fall back to the
  // cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CORE_CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Supabase REST/Auth API: always live — never serve stale business data.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Same-origin static files (vendor scripts, icons, manifest):
  // serve from cache, otherwise fetch and remember.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CORE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
      )
    );
    return;
  }

  // Cross-origin CDN assets (Font Awesome, Google Fonts): use the cached copy
  // immediately and refresh it in the background.
  event.respondWith(staleWhileRevalidate(request));
});

function staleWhileRevalidate(request) {
  return caches.open(RUNTIME_CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) return cached; // stale hit; refresh keeps running in background

      return refresh.then((response) =>
        response || new Response('', { status: 504, statusText: 'Offline' })
      );
    })
  );
}
