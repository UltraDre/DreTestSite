/* Evently Admin service worker — separate cache from the public app */
const CACHE = 'evently-admin-v1';
const SHELL = ['/console', '/admin.webmanifest', '/icon.svg', '/icon-192.png'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => null)).then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

const isDevAsset = (url) =>
	url.pathname.startsWith('/@') ||
	url.pathname.includes('node_modules') ||
	url.pathname.includes('/@fs') ||
	url.search.includes('t=');

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);
	if (url.origin !== self.location.origin || isDevAsset(url)) return;

	if (req.mode === 'navigate') {
		event.respondWith(
			fetch(req)
				.then((res) => {
					const copy = res.clone();
					caches.open(CACHE).then((c) => c.put('/console', copy));
					return res;
				})
				.catch(() => caches.match('/console'))
		);
		return;
	}

	event.respondWith(
		caches.match(req).then(
			(cached) =>
				cached ||
				fetch(req)
					.then((res) => {
						if (res.ok && res.type === 'basic') {
							const copy = res.clone();
							caches.open(CACHE).then((c) => c.put(req, copy));
						}
						return res;
					})
					.catch(() => cached)
		)
	);
});
