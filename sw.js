/* ═══════════════════════════════════════════════════════════════
   Invoice Generator ₦ — Service Worker
   Offline-first: precaches the full app shell + self-hosted libs.
   Bump VERSION whenever you change any app file so every installed
   client picks up the update automatically.
   ═══════════════════════════════════════════════════════════════ */

const VERSION = 'v1.0.0';
const CACHE_NAME = `invoice-pwa-${VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',

  // icons
  './icons/favicon-64.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',

  // self-hosted libraries
  './lib/html2pdf.bundle.min.js',
  './lib/supabase.min.js',

  // Font Awesome (woff2 only)
  './lib/fontawesome/css/all.min.css',
  './lib/fontawesome/webfonts/fa-solid-900.woff2',
  './lib/fontawesome/webfonts/fa-regular-400.woff2',
  './lib/fontawesome/webfonts/fa-brands-400.woff2',
  './lib/fontawesome/webfonts/fa-v4compatibility.woff2',

  // Inter font (self-hosted)
  './lib/fonts/inter.css',
  './lib/fonts/inter-0.woff2',
  './lib/fonts/inter-1.woff2',
  './lib/fonts/inter-2.woff2',
  './lib/fonts/inter-3.woff2',
  './lib/fonts/inter-4.woff2',
  './lib/fonts/inter-5.woff2',
  './lib/fonts/inter-6.woff2',
];

/* ── Install: precache everything, activate immediately ───────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean up old caches, take control of clients ───── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Message: allow the page to trigger immediate updates ─────── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') self.skipWaiting();
});

/* ── Fetch strategies ────────────────────────────────────────────
   • navigations  → network-first, fall back to cached shell (offline)
   • same-origin  → stale-while-revalidate (instant loads, fresh in bg)
   • cross-origin (Supabase API, etc.) → network only, never cached
   ─────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // pass through to network

  // App navigations: network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then((cached) =>
            cached || caches.match('./') ||
            new Response('Offline and app shell not cached yet.', { status: 503, headers: { 'Content-Type': 'text/plain' } })
          )
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
