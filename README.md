# Invoice Generator ₦ — PWA

Your invoice generator, converted into a fully installable, offline-capable
**Progressive Web App**. Same app, same data — now it works with no internet,
installs to your phone/desktop home screen, and updates itself silently.

---

## What was added

| File | Purpose |
|---|---|
| `manifest.json` | App identity: name, icons, colors, standalone display, shortcuts (long-press the app icon on Android). |
| `sw.js` | Service worker — precaches the entire app shell for offline use; network-first for pages, stale-while-revalidate for assets. |
| `icons/` | Full icon set: 192/512 px, **maskable** variants (proper safe zone), Apple touch icon, favicon. |
| `lib/` | All CDN dependencies are now **self-hosted**: html2pdf.js, Supabase JS, Font Awesome (woff2), Inter font. No external requests — the app works 100% offline. |
| `index.html` | PWA meta tags, manifest link, service-worker registration, an **Install** button (appears in the header when the browser allows install), offline/online toasts, and `?tab=…` deep-link support for app shortcuts. |

Your Supabase config, localStorage keys (`invoiceState`, `invoiceHistory`),
and all existing logic are **unchanged** — data saved in the browser before
the conversion is still there (as long as the app is served from the same
origin).

## Run it locally

Service workers require **HTTPS or localhost** — opening `index.html`
directly from the file system won't register one.

```bash
cd invoice-pwa
python3 -m http.server 8080
# → open http://localhost:8080
```

(or `npx serve .`)

## Deploy

Upload the whole `invoice-pwa` folder to any static host:

- **Netlify** — drag & drop the folder at app.netlify.com/drop
- **Vercel** — `vercel` in this folder
- **GitHub Pages** — push the folder contents to a repo, enable Pages
- Cloudflare Pages, Firebase Hosting, your own Nginx/Apache…

Every host serving files over HTTPS will make the app installable.

## Installing on a device

- **Android / Chrome** — open the site → “Install app” banner, or the
  **Install** button in the app header, or menu → *Add to Home screen*.
- **iOS Safari** — Share → **Add to Home Screen** (the Install button
  doesn't appear on iOS; that's a platform limitation).
- **Desktop Chrome/Edge** — install icon in the address bar or the header
  button. Opens in its own window.

## Offline behaviour

- Everything (editing, preview, history, PDF generation, local backup) works
  offline — all libraries and fonts are cached locally.
- **Cloud backup (Supabase)** needs a connection; uploads/loads simply show
  an error while offline, everything else keeps working.
- Data keeps saving to `localStorage` as you type.

## Shipping updates

Whenever you change any file in this folder, bump `VERSION` at the top of
`sw.js` (e.g. `v1.0.1`). Installed clients detect the new service worker,
activate it, and refresh once — no manual uninstall needed.

## Folder structure

```
invoice-pwa/
├── index.html                  # the app (PWA-ready)
├── manifest.json               # PWA manifest
├── sw.js                       # service worker (offline cache)
├── icons/                      # app icons (any + maskable + iOS)
└── lib/                        # self-hosted dependencies
    ├── html2pdf.bundle.min.js
    ├── supabase.min.js
    ├── fontawesome/            # css + woff2 fonts
    └── fonts/                  # Inter (woff2, subsetted)
```

> **Supabase note:** `SUPABASE_URL` / `SUPABASE_ANON_KEY` are still defined at
> the top of the `<script>` in `index.html` — edit them there if you change
> projects.
