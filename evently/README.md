# Evently — public web app + PWA

Event discovery, ticketing, check-in and event management, built with **SvelteKit 2 + Svelte 5 (runes)**.

This is one of two apps in the repo. The staff console lives in `../evently-admin` (separate PWA);
shared data, state, design system and components live in `../packages/core`.

The build covers the MVP slice of [`docs/PRD.md`](./docs/PRD.md) — a 276-item feature/screen checklist (147 marked MVP).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static SPA output in /build
npm run preview
```

Everything runs client-side against a local store — no server, database or API keys required. State persists to `localStorage` under `evently.state.v1`.

## Try these paths

| Route | What it shows |
| --- | --- |
| `/` | Splash — session restore, deep links, plus `?maintenance=1`, `?update=1`, `?to=/tickets` |
| `/onboarding` → `/auth` | Interests, location, permissions, then email/OTP/social/2FA/guest sign-in |
| `/home` | Personalised feed: categories, featured, near you, recommended, trending, follows |
| `/explore` | Search + composable filters, list / map / calendar views |
| `/events/:slug` | Full detail, agenda, speakers, FAQ, policies, ticket selector, waitlist |
| `/checkout?event=e1` | Cart, promo codes, 7 payment methods, 3-D Secure, decline, pay-later |
| `/tickets` · `/tickets/:id` | Wallet with **rotating QR** (30 s HMAC window), transfer, refund, offline |
| `/organizer` | Dashboard, funnel, payouts, team |
| `/organizer/create` | 5-step creation wizard |
| `/organizer/events/:id` | Attendees, check-in log, orders, messaging, settings |
| `/organizer/scan` | Camera QR scanner (BarcodeDetector), manual entry, duplicate detection, offline queue |
| `/profile` | Banner + picture, name/@username, bio, link, tickets/following/followers popups, **your calendar** |
| `/settings` · `/notifications` · `/saved` | Account, role, verification, preferences, comms |
| `/support` · `/legal/terms` · `/legal/privacy` · `/legal/licenses` | Help centre, contact form, safety reports, organiser guide, legal pages |

**Roles:** Settings → *Role* — guest, attendee, organiser, co-host, staff scanner, speaker, sponsor,
venue. Navigation and permissions change per role. Settings → *Account* → **Switch** jumps straight to
the Role tab. Admin/moderator is not offered here — it lives in the separate admin app, which this
build never links to.

**Pictures:** Edit profile → *Profile picture* / *Cover photo*; event photo on `/organizer/create` and
`/organizer/events/:id`. Each picker accepts a file from the device (downscaled in the browser — 480px
avatars, 1280px covers) or an image URL, and can be removed again. With no photo set, surfaces fall
back to generated category art. The profile banner fades into the page background, so it blends in
both light and dark themes.

**Payment test scenarios:** on the payment step, switch between *Approve*, *Require 3-D Secure* and *Decline*.

**Scanner without a camera:** tap *Simulate a scan*, or type a ticket code (e.g. `EV-7QK2-4M8P-9XRT`) into the manual field. Scanning the same code twice returns *already checked in*.

## Architecture

```
../packages/core/src/      shared with the admin app (aliased as $shared / $comp)
├─ app.css                 design system (tokens, light/dark, primitives)
└─ lib/
   ├─ state.svelte.js      runes store: session, content, cart, tickets, notifications, persistence
   ├─ data.js              seed events, organisers, venues, people, tickets
   ├─ checklist.js         the 276-item PRD checklist (source of truth for docs/PRD.md)
   ├─ util.js              money, dates, countdowns, .ics export, hashing
   ├─ media.js             picture picking, client-side downscale, URL validation
   └─ components/          Icon, Cover, Avatar, EventCard, PhotoPicker, Sheet, Tabs, Qr, Toggle, PageHead…

src/
├─ lib/components/Nav.svelte   app-specific navigation (rail + tab bar)
└─ routes/
   ├─ +page.svelte         splash / launch gate
   ├─ +error.svelte        friendly 404
   ├─ onboarding/ auth/
   └─ (app)/               shell: home, explore, events, tickets, checkout, organizer,
                           profile, settings, support, legal, notifications, saved
```

- **State**: one `AppStore` class using `$state` / `$derived` getters, auto-persisted (debounced) to `localStorage`.
- **Money**: stored in NGN, converted at render time via `CURRENCIES` (NGN/USD/GBP/EUR).
- **QR**: generated locally with `qrcode`; payload is `evently://t/<code>?s=<hmac-30s-window>`, so screenshots expire.
- **Pictures**: `PhotoPicker` writes data URLs into the store; `media.js` downscales on a canvas and
  reduces quality until the result fits the storage budget. If `localStorage` is full, the store drops
  the pictures, keeps everything else and tells the user.
- **PWA**: `manifest.webmanifest` + `sw.js` (cache-first assets, network-first navigation), installable and offline-capable.

## Deploying

`vercel.json` is pre-configured: static SPA output from `build/`, SPA rewrites for deep links,
`Cache-Control: no-cache` on the service worker, Node 20 (`.nvmrc`). Create a Vercel project with
**Root Directory = `evently`**. See the root `../README.md` for the two-project setup and the list of
SvelteKit-on-Vercel errors this config avoids.

## Swapping in a real backend

Replace the in-memory methods in `packages/core/src/lib/state.svelte.js` with fetch calls — the component layer only touches store methods (`app.checkout()`, `app.checkIn()`, `app.createEvent()`), so no screen changes are needed. Move QR signing, price maths and the ticket state machine server-side before going live (a client-side signature is a demo convenience, not a security boundary).

## Known demo shortcuts

- Ticket QR signatures are computed in the browser (should be server-side HMAC).
- Camera scanning uses `BarcodeDetector` where available; otherwise use manual entry.
- Seed data, "demo attendees" and payment outcomes are simulated.

## Regenerate the PRD

```bash
node scripts/gen-prd.mjs   # writes docs/PRD.md from src/lib/checklist.js
```
