# Evently — monorepo

Two installable PWAs that share one core package.

```
packages/core/     shared design system, seed data, reactive store, components, PRD checklist
evently/           public web app + PWA  (discovery, tickets, check-in, organiser tools)
evently-admin/     staff console + PWA   (approvals, moderation, payouts, audit)
```

| App | Local URL | Installable as | Deploys to |
| --- | --- | --- | --- |
| Public app | http://localhost:5173 | Evently | Vercel project #1 |
| Admin console | http://localhost:5174 | Evently Admin | Vercel project #2 |

## Run locally

```bash
cd evently        && npm install && npm run dev     # public app  → :5173
cd evently-admin  && npm install && npm run dev     # admin app   → :5174
```

Both apps resolve `$shared` / `$comp` to `packages/core/src` through a SvelteKit alias, so a single
source of truth drives both UIs. Each app bundles its own copy at build time — no runtime dependency
between the two deployments.

## Deploy to Vercel

Create **two** Vercel projects from the same repo:

| Setting | Public app | Admin app |
| --- | --- | --- |
| Root Directory | `evently` | `evently-admin` |
| Framework Preset | Other (or leave as-is) | Other |
| Build Command | `npm run build` | `npm run build` |
| Output Directory | `build` | `build` |
| Install Command | `npm install` | `npm install` |
| Node Version | 20.x (`.nvmrc`) | 20.x (`.nvmrc`) |

Each app ships a `vercel.json` that:

- sets `"framework": null` so Vercel does **not** try to run the SvelteKit adapter detection
- outputs the static SPA from `build/` (`@sveltejs/adapter-static` + `fallback: index.html`)
- rewrites every extension-less path to `/index.html` so deep links (`/events/my-event`) work on refresh
- sets `Cache-Control: no-cache` on `sw.js` and immutable caching for icons

**Common Vercel errors this config avoids**

| Symptom | Cause | Fix (already applied) |
| --- | --- | --- |
| `No adapter specified` / adapter-auto failure | adapter-auto can't detect the target | `@sveltejs/adapter-static` |
| 404 on refresh for `/events/…` | static host without SPA rewrite | `rewrites` in `vercel.json` |
| `ERESOLVE unable to resolve dependency tree` | `@sveltejs/kit` peer-picks `vite-plugin-svelte@7` (needs Vite 8) while the app uses Vite 7 | pin `@sveltejs/vite-plugin-svelte@^6.2.1` in devDependencies |
| Wrong Node version | Vercel default | `engines.node >= 20.19` + `.nvmrc` |
| Stale service worker after deploy | long-cache on SW | `Cache-Control: no-cache` header for `sw.js` |

Optional env vars (defaults are the local ports):

- `VITE_ADMIN_URL` — link to the admin console from public-app settings
- `VITE_WEB_URL` — link to the public app from the admin console

## Docs

- `Evently-PRD.md` (and `evently/docs/PRD.md`) — 276-item feature/screen checklist + PRD, generated from `packages/core/src/lib/checklist.js`
- `evently/README.md` — public app guide
- `evently-admin/README.md` — admin console guide

Regenerate the PRD after editing the checklist:

```bash
cd evently && node scripts/gen-prd.mjs
```
