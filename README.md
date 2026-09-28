# Invoice Generator — PWA

Your **Invoice Generator ₦** app converted into an installable, offline-capable
Progressive Web App. Everything is plain static files — no build step, no
server code. Drop the folder on any static host (or open it from any local
server) and it works.

## What's in the box

```
invoice-pwa/
├── index.html          ← your app, now PWA-wired (manifest, theme color,
│                          icons, service-worker registration, install prompt)
├── manifest.webmanifest← install metadata: name, colors, icons, display mode
├── sw.js               ← service worker: offline shell + asset caching
├── README.md           ← this file
├── icons/
│   ├── icon.svg              (scalable favicon / any-size icon)
│   ├── icon-192.png          (Android install icon)
│   ├── icon-512.png          (Android install + splash icon)
│   ├── icon-maskable-192.png (Android adaptive icon, safe-zone aware)
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png  (iOS home-screen icon, 180×180)
│   ├── favicon-16.png
│   └── favicon-32.png
├── vendor/             ← local copies of html2pdf + supabase-js so PDF export
│   ├── html2pdf.bundle.min.js   and cloud backup keep working OFFLINE
│   └── supabase.min.js
└── tools/              ← optional dev utilities (safe to delete)
    ├── make_icons.py   regenerates the PNG icon set (needs Pillow)
    ├── serve.py        local server with correct PWA MIME types
    └── pwa_test.py     headless-Chromium offline smoke test (needs Playwright)
```

> `vendor/` and `tools/` are bonuses beyond the five items you asked for —
> `vendor/` exists purely so the two big JS libraries don't vanish when the
> network does. If you'd rather keep the CDN `<script>` tags, delete the folder
> and restore the two original `<script src="https://…">` lines in `index.html`
> (the service worker will simply runtime-cache the CDN copies instead).

## What changed in `index.html`

Your app code is untouched; only the shell around it was wired for PWA:

1. **`<head>`** — added `theme-color`, `description`, `manifest` link, favicon /
   `apple-touch-icon` links, iOS web-app meta tags; the two CDN `<script>` tags
   now point at the local `vendor/` copies; removed the
   `user-scalable=no / maximum-scale` zoom lock (better accessibility, and
   Chrome flags it in PWA audits).
2. **Bottom of `<body>`** — one small bootstrap `<script>` that registers
   `sw.js`, captures `beforeinstallprompt` (exposes a global `installPwa()`
   you can bind to an "Install app" button, plus a `pwa-installable` event),
   and shows toasts when the device goes offline/online and when an update
   activates. It guards everything with `typeof` checks, so removing the block
   leaves the original app fully intact.

## Quick start

A service worker needs a secure context, so serve over HTTPS or `localhost`
(double-clicking the file with `file://` will **not** register it):

```bash
cd invoice-pwa
python3 tools/serve.py 8080        # or: npx serve, nginx, netlify, gh-pages…
# → http://localhost:8080
```

(`tools/serve.py` is just `http.server` with the correct
`application/manifest+json` MIME type; most production hosts already send it.)

Then:

1. Open the app once while online — the service worker installs and pre-caches
   the shell, icons and vendor scripts.
2. **Install it**: Chrome/Edge shows the install icon in the address bar; on
   Android use *Menu → Add to Home screen / Install app*; the page also exposes
   `installPwa()` you can bind to any "Install app" button, and listens for the
   `pwa-installable` event.
3. Go offline (DevTools → Network → Offline, or airplane mode) and reload: the
   app still opens, invoices/history still load (they live in `localStorage`),
   and PDF export still works because html2pdf is cached locally. A toast tells
   you when you go offline/online.

## How offline works

| Resource                          | Strategy                                   |
| --------------------------------- | ------------------------------------------ |
| `index.html`, manifest, icons, `vendor/*.js` | Pre-cached on install; cache-first |
| Page navigations                  | Network-first, falls back to cached shell  |
| Font Awesome + Google Fonts (CDN) | Stale-while-revalidate (cached after 1st visit; icons/fonts degrade gracefully until then) |
| Supabase API (`*.supabase.co`)    | Never intercepted — sync is always live    |
| Invoice data & history            | Untouched — the app's own `localStorage`   |

Cloud backup/restore requires a connection by design; everything local keeps
working without one.

## Shipping an update

1. Edit your files as usual.
2. Bump `const VERSION = 'v1.0.0'` at the top of `sw.js`.
3. Deploy. Returning visitors get the new worker on their next visit; it
   `skipWaiting()`s, purges the old caches, and the page shows an
   "App updated" toast once the new worker takes control.

## Rebranding the icons

The PNG set is generated from code — tweak colors/design in
`tools/make_icons.py` (needs `pip install pillow`) and run:

```bash
python3 tools/make_icons.py
```

or simply overwrite the files in `icons/` with your own artwork, keeping the
same filenames/sizes (192 & 512 regular + maskable, 180 apple-touch, 16/32
favicons). `icons/icon.svg` is hand-editable text.

## Customising

- **App name / description** → `manifest.webmanifest` (`name`, `short_name`,
  `description`) and the `apple-mobile-web-app-title` meta tag in `index.html`.
- **Colors** → `theme_color`/`background_color` in the manifest, the
  `theme-color` meta tag, and the gradient stops in `tools/make_icons.py` /
  `icons/icon.svg`.
- **Supabase** → your `SUPABASE_URL` / `SUPABASE_ANON_KEY` constants inside
  `index.html` are unchanged; nothing else to configure.

## iOS notes

Safari ignores `manifest` install prompts; *Share → Add to Home Screen* uses
`apple-touch-icon.png` and the `apple-mobile-web-app-*` meta tags already set
in `index.html`. iOS also caps service-worker caches, but this app's footprint
(~1.2 MB) is well within it.

## Deploy checklist

- [ ] Serve over HTTPS (Netlify/Vercel/GitHub Pages/Cloudflare Pages all do).
- [ ] Whole folder deployed at a stable path (scope = folder it lives in).
- [ ] `index.html`, `manifest.webmanifest`, `sw.js` and `icons/` all reachable
      (quick check: DevTools → Application → Manifest shows no errors and
      Service Workers shows "activated and running").
