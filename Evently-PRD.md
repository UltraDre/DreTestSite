# Evently — Product Requirements Document & Build Checklist

**Version** 1.0 · **Status** Ready to build · **Stack** SvelteKit 2 + Svelte 5 (runes), Vite, PWA (offline-first)
**Scope** Events discovery, ticketing, check-in, organiser console, social graph, admin/moderation
**Checklist size** 276 items · **MVP** 147 items · **Post-launch** 129 items

---

## 0. How to read this document

- Every line item is a shippable unit of work: a screen, a state, or a behaviour. Tick it when it is **in production**, not when the branch is merged.
- `MVP` marks what must ship in v1. Everything else is sequenced after launch.
- The checklist lives in **`packages/core/src/lib/checklist.js`** and is exported to this document by `node scripts/gen-prd.mjs` — edit the source, regenerate the doc.
- Admin/moderator work is deliberately **not** in the public app. It ships as a separate PWA (`evently-admin`) with its own manifest, service worker and staff roles.
- Section numbers are stable — quote them in tickets (e.g. *"7.p9 3-D Secure"*).

---

## 1. Problem, users, outcome

**Problem.** Discovering events, buying tickets and getting through the door are three different products stitched together by screenshots, PDFs and WhatsApp messages. Organisers have no idea who is coming until someone scans a spreadsheet at the door.

**Outcome we're betting on.** One identity and one ticket object carry a person from discovery → purchase → the door → the memory, and give the organiser a live view of their room the whole way.

| Metric | Why it matters | v1 target |
| --- | --- | --- |
| Checkout completion | The whole business | ≥ 68% of checkout starts |
| Door throughput | Events live or die at entry | < 4 s per attendee, ≤ 0.5% duplicate scans |
| Offline check-in success | Venues have bad signal | 100% of scans queue and reconcile |
| Organiser time-to-first-event | Supply-side activation | < 10 min from signup to published |
| Ticket→attendee conversion | Real demand, not vanity | ≥ 82% check-in rate |

---

## 2. Roles

Nine roles, one identity graph. A single human can hold several roles and switch without logging out.

| Role | Primary job | Unlocks | Typical entry point |
| --- | --- | --- | --- |
| **Guest / visitor** | Browse before committing | Search, event detail, save locally, follow | Splash → Skip |
| **Attendee** | Find, buy, attend | Tickets, QR, wallet, transfer, refunds, feed, social | Home |
| **Organiser / creator** | Run an event | Creation wizard, dashboard, attendee list, payouts, analytics | Organiser dashboard |
| **Co-host / team** | Help run someone's event | Scoped event access (edit / message / scan / view-only) | Shared event |
| **Staff / scanner** | Get people through the door | Scanner mode only: scan, manual entry, lookup, stats | Scanner (no refunds, no payouts) |
| **Speaker / performer** | Appear and be discovered | Session on the agenda, speaker profile, Q&A moderation | Event agenda |
| **Sponsor / exhibitor** | Get brand + leads | Booth listing, lead capture, scanned-badge export | Event page → sponsors |
| **Venue** | Fill the space | Venue profile, calendar of bookings, capacity conflicts | Venue dashboard |
| **Admin / moderator** | Keep the marketplace safe | Approvals, moderation, disputes, KYC, payout holds, audit | **Separate admin PWA** |

**Where each role lives.** Guest → venue roles are served by the public app. Admin/moderator is served by the **admin PWA** — a separate installable app on its own subdomain, sharing the same API and design system. Keeping them apart means staff tooling, audit surfaces and payout controls are never reachable from the consumer build, and the two apps can ship independently.

**Permission matrix** (✅ full · 🔵 scoped · — none)

| Capability | Guest | Attendee | Organiser | Co-host | Staff | Speaker | Sponsor | Venue | Admin |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Browse / search | ✅ | ✅ | ✅ | 🔵 | 🔵 | ✅ | ✅ | ✅ | ✅ |
| Save / follow | 🔵 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Buy ticket | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create event | — | — | ✅ | 🔵 | — | — | — | — | ✅ |
| Edit event | — | — | ✅ | 🔵 | — | 🔵 | — | 🔵 | ✅ |
| See attendee list | — | — | ✅ | 🔵 | 🔵 | — | 🔵 | 🔵 | ✅ |
| Scan / check in | — | — | ✅ | 🔵 | ✅ | — | 🔵 | 🔵 | ✅ |
| Issue refund | — | 🔵 | ✅ | — | — | — | — | — | ✅ |
| Receive payout | — | — | ✅ | — | — | 🔵 | — | 🔵 | — |
| Moderate / approve | — | — | — | — | — | — | — | — | ✅ (admin app) |

---

## 3. End-to-end flow

```
Splash ──► Onboarding ──► Sign up / Login ──► Home ──► Explore ──► Event detail
   │            │                │              │         │             │
   │            │                │              │         │             ├─► Save / Follow
   │            │                │              │         │             ├─► Add to calendar
   │            │                │              │         │             └─► Select tickets
   │            │                │              │         │                        │
   │            │                │              │         └─► Map / Calendar view  │
   │            │                │              │                                  ▼
   │            │                │              └─► Notifications ◄──────── Checkout / Payment
   │            │                │                                                 │
   │            │                └─► Profile ◄─────────────────────────────────────┤ (ticket issued)
   │            │                                                                  ▼
   │            └─► Interests + location ──► personalised feed          Ticket + rotating QR
   │                                                                              │
   └─► Maintenance / forced update / deep link                                     ▼
                                                                            Check-in (door)
                                                                                  │
                        Organiser dashboard ◄─── analytics / payouts ◄─────────────┤
                                                                                  ▼
                                                                    Profile · Social · Follow
```

**Golden path (attendee):** open app → see something local → open event → pick 2 tickets → pay with saved card → ticket appears with QR → reminder 24 h before → scan at door → rate the event.

**Golden path (organiser):** create event (5 steps) → publish → share link → watch sales funnel → message attendees → open scanner on the night → withdraw payout 48 h later.

---

## 4. Screen-by-screen checklist

### 1. Splash & launch
> Every session starts here. Nothing renders until version + session state are resolved.

- [ ] **App logo / launch animation** — Brand mark, safe-area aware, ≤1.8s `MVP`
- [ ] **Session restore / auto-login check** — Refresh token → silent sign-in; fall back to guest `MVP`
- [ ] **Deep link handling** — evently://event/<slug>, /t/<code>, /checkout?event=, ?to= for post-login routing `MVP`
- [ ] **Forced update prompt** — Min-supported-version gate with store link (?update=1) 
- [ ] **Maintenance mode** — Kill-switch screen with ETA (?maintenance=1) 
- [ ] **Version check + changelog** — Show “what’s new” after an app update 
- [ ] **Permission requests** — Notifications, location, camera (QR), calendar — asked in context, never all at once `MVP`
- [ ] **Onboarding carousel / value props** — 3 slides: discover · tickets · run your own `MVP`
- [ ] **Interest selection** — Min 3 picks; seeds the home feed and recommendations `MVP`
- [ ] **Location selection** — City picker + “use my location” (geolocation with graceful denial) `MVP`
- [ ] **Skip / guest mode** — Full browse + save; auth wall only at checkout `MVP`

### 2. Create account / login / auth
> Auth is the highest-drop-off surface. Every method must reach the same verified session.

- [ ] **Sign up: email, phone, Google, Apple, Facebook, SSO** — OAuth + SAML/OIDC for enterprise `MVP`
- [ ] **OTP / magic link** — Email + SMS OTP, 6 digits, 5-min TTL, resend throttle `MVP`
- [ ] **Password creation + rules** — 8+ chars, upper, number; breach-list check (HIBP) `MVP`
- [ ] **Login / logout** — Email/password, social, and device-scoped logout `MVP`
- [ ] **Forgot / reset password** — Signed, single-use reset link + in-app confirmation `MVP`
- [ ] **2FA / biometric login** — TOTP authenticator + Face ID / fingerprint (WebAuthn) 
- [ ] **Guest browsing** — Read-only session that upgrades without data loss `MVP`
- [ ] **Terms & privacy consent** — Versioned consent captured with timestamp and IP `MVP`
- [ ] **Age gate** — DOB or 18+ checkbox; gates alcohol/18+ events `MVP`
- [ ] **Profile setup after signup** — Name, photo, city, interests — skippable, prompted later `MVP`
- [ ] **Email / phone verification** — Verified badge drives trust ranking and selling rights `MVP`
- [ ] **Account deletion** — Self-serve with 30-day grace period + data export 
- [ ] **Switch account / multiple accounts** — Attendee and organiser identities on one device 

### 3. Home
> The feed is the product. Sections are ranked, not chronological.

- [ ] **Personalised feed** — Interest × location × follow graph × recency `MVP`
- [ ] **Search bar** — Global search across events, organisers, venues `MVP`
- [ ] **Categories** — Music, tech, sports, business, arts, food, health, community `MVP`
- [ ] **Near me / location-based events** — Distance-sorted, city switcher `MVP`
- [ ] **Trending / popular** — Velocity-ranked by sales in last 48h `MVP`
- [ ] **Upcoming events** — Bounded to the user’s city + 60 days `MVP`
- [ ] **Recommended for you** — Collaborative filtering over interest + attendance history 
- [ ] **Events from followed organizers** — Push-worthy: new event from a followed organiser `MVP`
- [ ] **Banners / featured events** — Editorial + paid placements, capped at 1 per session 
- [ ] **Quick actions** — Scan QR · My ticket · Create event · Calendar `MVP`
- [ ] **Calendar view** — Month grid with event density dots 
- [ ] **Notifications bell** — Unread count, deep-links to source `MVP`
- [ ] **Continue browsing** — Resume last search context 
- [ ] **Recently viewed** — Last 12 event detail views 

### 4. Events — discovery
> Search, filter and sort must all be URL-addressable and shareable.

- [ ] **Search by event, organiser, venue, keyword** — Typo-tolerant, synonym-aware `MVP`
- [ ] **Filters: date, time, price, category, location** — All combinable `MVP`
- [ ] **Filters: online/in-person, language, accessibility, age, capacity** 
- [ ] **Sort: relevance, date, distance, popularity, price** `MVP`
- [ ] **List view, map view, calendar view** — Map clusters pins; calendar shows density `MVP`
- [ ] **Event categories and tags** `MVP`
- [ ] **Free / paid / private / invite-only** — Private events: unlisted + access code 
- [ ] **Recurring / multi-session / hybrid / virtual events** — Series parent + session children 
- [ ] **Empty states + “widen your search” recovery** `MVP`

### 5. Event detail
> The conversion surface. Load must feel instant; ticket selector is always one tap away.

- [ ] **Hero image / video** `MVP`
- [ ] **Title, description, highlights** `MVP`
- [ ] **Organiser info + follow** `MVP`
- [ ] **Date, time, timezone (shown in viewer’s TZ)** `MVP`
- [ ] **Venue + map + directions** `MVP`
- [ ] **Online event link** — Revealed to ticket holders only, 60 min before `MVP`
- [ ] **Agenda / schedule** `MVP`
- [ ] **Sessions / tracks** 
- [ ] **Speakers / performers** `MVP`
- [ ] **Sponsors / exhibitors** 
- [ ] **Ticket types and prices** `MVP`
- [ ] **FAQs** `MVP`
- [ ] **Policies: refund, transfer, age, dress code** `MVP`
- [ ] **Reviews / ratings** — Verified attendees only 
- [ ] **Photo gallery** 
- [ ] **Similar events** 
- [ ] **Share event (link, message, QR)** `MVP`
- [ ] **Save event** `MVP`
- [ ] **Follow organiser** `MVP`
- [ ] **Report event** — Trust & safety reasons, 24h SLA 
- [ ] **Add to calendar (.ics / native)** `MVP`
- [ ] **Invite friends** — Share sheet + in-app invite link 

### 6. Saved / wishlist

- [ ] **Saved events** `MVP`
- [ ] **Saved organisers** 
- [ ] **Saved searches** — Alert when a new event matches 
- [ ] **Wishlist / favourites** `MVP`
- [ ] **Reminders** — 24h + 2h before doors `MVP`
- [ ] **Calendar sync (Google, Apple, Outlook)** 
- [ ] **Sold-out alerts** 
- [ ] **Price-drop / early-bird alerts** 
- [ ] **Waitlist** — Join, position, auto-release window 
- [ ] **Share saved list** 

### 7. Tickets
> A ticket is a signed object: holder, type, event, code, state machine.

- [ ] **My tickets (upcoming / past / cancelled)** `MVP`
- [ ] **Ticket detail** `MVP`
- [ ] **QR code** `MVP`
- [ ] **Order info** `MVP`
- [ ] **Receipt / invoice (PDF + email)** `MVP`
- [ ] **Transfer ticket** — Re-issues QR, voids the old one 
- [ ] **Resell / resale marketplace** — Price caps + organiser approval 
- [ ] **Refund request** — Policy-aware, organiser SLA 
- [ ] **Upgrade ticket** 
- [ ] **Add-ons (merch, food, workshop)** 
- [ ] **Group tickets** — One buyer, N named holders, per-holder QR 
- [ ] **Apple Wallet / Google Wallet passes** 
- [ ] **Offline ticket access** — Cached QR renders with no network `MVP`
- [ ] **Ticket status: valid, used, cancelled, refunded** `MVP`

### 8. Payment / checkout
> Checkout is a funnel: fewer fields, fewer steps, no surprises on fees.

- [ ] **Cart / order summary** `MVP`
- [ ] **Ticket selection + quantity limits** — Per-order cap, per-user cap `MVP`
- [ ] **Promo codes / discounts** `MVP`
- [ ] **Early bird / tiered pricing** — Time-boxed tiers 
- [ ] **Taxes and fees (transparent breakdown)** `MVP`
- [ ] **Currency support (multi-currency display + FX)** 
- [ ] **Payment methods: card, wallet, bank, mobile money, PayPal, Apple Pay, Google Pay** `MVP`
- [ ] **Billing info** `MVP`
- [ ] **3-D Secure / OTP step-up** `MVP`
- [ ] **Payment confirmation screen + email** `MVP`
- [ ] **Failed payment / retry** — Decline reasons mapped to plain language `MVP`
- [ ] **Refunds (full, partial, policy-driven)** 
- [ ] **Invoices / receipts** `MVP`
- [ ] **Organiser payouts (schedule + ledger)** 
- [ ] **Donations / round-up** 
- [ ] **Installments / pay later (BNPL)** 
- [ ] **PCI DSS scope reduction (hosted fields / tokenisation)** `MVP`

### 9. QR code / check-in
> Doors are the moment of truth: it must work offline, in the sun, at speed.

- [ ] **Generate QR per ticket** `MVP`
- [ ] **Rotating QR for security** — HMAC signature, 30s window; screenshots useless `MVP`
- [ ] **Scan QR at entry** `MVP`
- [ ] **Manual code entry** — Dead battery / printed ticket path `MVP`
- [ ] **Offline check-in** — Local queue + conflict resolution on reconnect `MVP`
- [ ] **Staff scanner app / mode** — Scoped role: scan only, no refunds, no payouts `MVP`
- [ ] **Badge printing** — Zebra/Brother templates, on-demand at kiosk 
- [ ] **Attendee lookup by name / email / phone** `MVP`
- [ ] **Duplicate scan detection** — Shows original scan time and operator `MVP`
- [ ] **Access control by ticket type** — VIP lane, backstage, age-restricted zones 
- [ ] **Check-in stats (live rate, no-shows)** `MVP`
- [ ] **ID / age / vaccination check** 
- [ ] **Walk-in registration** — Sell at the door, instant QR 
- [ ] **Self check-in kiosk** 

### 10. Profile

- [ ] **Attendee profile: photo, name, bio** `MVP`
- [ ] **Contact info** `MVP`
- [ ] **Interests** `MVP`
- [ ] **Social links** 
- [ ] **Verification badges** 
- [ ] **Tickets / order history** `MVP`
- [ ] **Saved events** `MVP`
- [ ] **Followers / following lists** `MVP`
- [ ] **Organiser profile: logo, banner, bio** `MVP`
- [ ] **Verified organiser badge** 
- [ ] **Past / upcoming events** `MVP`
- [ ] **Ratings / reviews** 
- [ ] **Contact / website** 
- [ ] **Payout info** 
- [ ] **Team members + permissions** 
- [ ] **Profile picture upload (device or URL)** — Camera / library / paste a link; downscaled client-side to 480px before it is stored `MVP`
- [ ] **Cover photo upload** — 16:9; the bottom of the banner fades into the page background in both themes 
- [ ] **Username / handle** — Unique, editable, shown as @handle everywhere the profile appears `MVP`
- [ ] **Profile link** — One external URL (site, portfolio, ticket page) rendered as a chip on the profile 
- [ ] **Personal calendar on profile** — Month grid marking days you hold a ticket or saved an event; tap a day for that day’s list `MVP`

### 11. Settings

- [ ] **Account settings** `MVP`
- [ ] **Privacy settings** `MVP`
- [ ] **Security settings (password, 2FA, sessions)** `MVP`
- [ ] **Payment methods** `MVP`
- [ ] **Notification preferences (per channel × per type)** `MVP`
- [ ] **Language** 
- [ ] **Currency** 
- [ ] **Accessibility (text size, contrast, reduce motion)** 
- [ ] **Help / support** `MVP`
- [ ] **Terms & privacy policy** `MVP`
- [ ] **Logout** `MVP`
- [ ] **Delete account** 
- [ ] **Role switcher (Settings → Role)** — Account tab links here; admin/moderator is not offered in the consumer app `MVP`
- [ ] **Appearance (light / dark) inside Accessibility** 

### 12. Verification & trust

- [ ] **Email verification** `MVP`
- [ ] **Phone verification** `MVP`
- [ ] **ID verification** 
- [ ] **Organiser verification** 
- [ ] **Business verification (CAC / registration)** 
- [ ] **Payout verification (KYC / bank)** 
- [ ] **Age verification** 
- [ ] **Ticket verification (signature check at door)** `MVP`
- [ ] **Blue check / verified badge** 
- [ ] **Trust & safety status page** 

### 13. Follow / following & social

- [ ] **Follow organisers, venues, speakers, friends** `MVP`
- [ ] **Followers / following lists** `MVP`
- [ ] **Suggestions / people you may know** 
- [ ] **Mutual connections** 
- [ ] **Activity feed** 
- [ ] **Notifications for followed organisers** `MVP`
- [ ] **Share event / invite friends** `MVP`
- [ ] **Chat / direct messages** 
- [ ] **Event chat / group chat** — Moderated, opens 24h before, closes 7d after 
- [ ] **Networking (attendee directory, opt-in)** 
- [ ] **Q&A** 
- [ ] **Polls** 
- [ ] **Photo wall** 
- [ ] **Reviews / comments** 
- [ ] **Report / block user** 

### 14. Organizer / event creation
> The supply side. Everything here maps to revenue.

- [ ] **Organiser dashboard** `MVP`
- [ ] **Create event wizard (basics → date/place → tickets → extras → review)** `MVP`
- [ ] **Draft / save / publish** `MVP`
- [ ] **Edit event** `MVP`
- [ ] **Duplicate event** 
- [ ] **Cancel event (auto-refund + notify)** `MVP`
- [ ] **Recurring events / series** 
- [ ] **Co-hosts / team permissions** — Owner, manager, editor, scanner, viewer 
- [ ] **Venue setup (address, map pin, capacity, sections)** `MVP`
- [ ] **Online event setup (Zoom / Meet / Teams link)** `MVP`
- [ ] **Agenda / sessions / tracks** 
- [ ] **Speakers / performers** 
- [ ] **Sponsors / exhibitors** 
- [ ] **Ticket types / pricing / tiers** `MVP`
- [ ] **Promo codes** 
- [ ] **Capacity / waitlist** 
- [ ] **Registration questions** 
- [ ] **Waivers / consent forms** 
- [ ] **Approval workflow (auto / manual / invite-only)** 
- [ ] **Attendee messaging (segmented)** 
- [ ] **Attendee list + CSV export** `MVP`
- [ ] **Check-in tools** `MVP`
- [ ] **Analytics (sales funnel, conversion, traffic sources)** 
- [ ] **Payouts (balance, schedule, ledger)** 
- [ ] **Refund management** 
- [ ] **Marketing tools (email, push, share links)** 
- [ ] **Embeds / widgets for your own site** 
- [ ] **API / integrations (webhooks, Zapier)** 
- [ ] **Event photo / cover image** — Upload from device or paste a URL; downscaled to 1280px; falls back to generated category art `MVP`
- [ ] **Change the event photo after publishing** — Same picker on the manage-event screen; updates cards, search and the public page `MVP`

### 15. Attendee journey (end to end)
> Instrument every step: these are the funnel events that matter.

- [ ] **Discover event** `MVP`
- [ ] **View details** `MVP`
- [ ] **Save / follow** `MVP`
- [ ] **Register** `MVP`
- [ ] **Pay** `MVP`
- [ ] **Receive ticket (in-app, email, wallet)** `MVP`
- [ ] **Reminder notifications (24h, 2h)** `MVP`
- [ ] **Add to calendar** `MVP`
- [ ] **Directions** `MVP`
- [ ] **Check-in** `MVP`
- [ ] **View agenda** `MVP`
- [ ] **Network / chat** 
- [ ] **Q&A / polls** 
- [ ] **Feedback / rating** 
- [ ] **Certificate of attendance** 
- [ ] **Post-event content / replays** 
- [ ] **Photos / highlights** 

### 16. Notifications & communication

- [ ] **Push notifications** `MVP`
- [ ] **Email** `MVP`
- [ ] **SMS** 
- [ ] **In-app notifications + centre** `MVP`
- [ ] **Calendar invites (.ics)** `MVP`
- [ ] **Event reminders** `MVP`
- [ ] **Event updates / changes** `MVP`
- [ ] **Cancellations** `MVP`
- [ ] **Waitlist updates** 
- [ ] **Payment confirmations** `MVP`
- [ ] **Check-in confirmations** 
- [ ] **Follow notifications** 
- [ ] **Messages** 
- [ ] **Announcements (organiser → attendees)** `MVP`
- [ ] **Marketing campaigns** 

### 17. Admin / moderation

- [ ] **User management (search, suspend, ban)** 
- [ ] **Event approval queue** 
- [ ] **Content moderation (text, images, reviews)** 
- [ ] **Reports / abuse queue** 
- [ ] **Disputes (chargebacks, refund escalations)** 
- [ ] **Refunds (force, override policy)** 
- [ ] **Fraud detection (velocity, device, ticket resale)** 
- [ ] **KYC / verification review** 
- [ ] **Analytics (GMV, take rate, cohorts)** 
- [ ] **Payouts (approve, hold, clawback)** 
- [ ] **Taxes (VAT/WHT handling per region)** 
- [ ] **Compliance (GDPR, data requests)** 
- [ ] **Audit logs (who did what, when)** 

### 18. Technical / non-functional
> The requirements that decide whether the app survives contact with a real event.

- [ ] **Offline support** — Service worker, cached shell, queued check-ins `MVP`
- [ ] **Performance** — LCP < 2.5s on 3G, 60fps scroll, ≤200KB critical JS `MVP`
- [ ] **Scalability** — Stateless API, CDN, queue-backed ticket issuance 
- [ ] **Security** — OWASP ASVS, rate limiting, signed QR, secrets rotation `MVP`
- [ ] **PCI compliance** — Hosted fields, no card data in app scope `MVP`
- [ ] **GDPR / privacy** — Consent, export, deletion, DPA with processors `MVP`
- [ ] **Accessibility (WCAG 2.2 AA)** — Contrast, focus order, screen-reader labels, 44px targets `MVP`
- [ ] **Localization** — i18n strings, RTL-ready layout, locale dates & currency 
- [ ] **Deep links (universal links + app links)** `MVP`
- [ ] **Analytics / product instrumentation** `MVP`
- [ ] **Crash reporting (Sentry / Firebase Crashlytics)** `MVP`
- [ ] **A/B testing + feature flags** 
- [ ] **Public API + webhooks** 
- [ ] **Integrations: Stripe / PayPal / Razorpay, Apple Pay / Google Pay, Google Maps** `MVP`
- [ ] **Integrations: Google / Apple / Outlook calendar** 
- [ ] **Integrations: Zoom / Google Meet / Teams** 
- [ ] **Integrations: email & SMS providers, CRM, social** 
- [ ] **Badge printing + wallet passes** 

---

## 5. Core objects & states

### Ticket (the most important object in the system)
```
Ticket {
  id, code, orderId, eventId, ticketTypeId,
  holder { name, email, phone },
  price, currency, fees,
  status: valid → used → (refunded | cancelled)
  qr: rotating HMAC(code, 30s window)   // screenshots are useless
  checkedInAt?, checkedInBy?, deviceId?
  transfers: [{ from, to, at }]
}
```
Rules: a ticket is **single-use**; duplicate scans return the original scan time and operator; transfer voids the old QR and issues a new code; refunds require a policy check before they reach a human.

### Event
```
Event { id, slug, organiserId, venueId | onlineUrl, mode: in-person|online|hybrid,
        start, end, doors, tz, capacity, ticketTypes[], agenda[], speakers[],
        sponsors[], faqs[], policies{}, status: draft|pending|published|cancelled,
        visibility: public|unlisted|private, seriesId? }
```

### Order
```
Order { id, ref, buyer, lines[], subtotal, fees, tax, discount, total,
        currency, paymentMethod, status: pending|paid|failed|refunded|partially_refunded }
```

### State machines to implement explicitly
| Object | States | Notes |
| --- | --- | --- |
| Ticket | valid → used · valid → refund-requested → refunded · valid → cancelled | Only `valid` scans green |
| Order | pending → paid → (refunded | partially_refunded) | failed | Webhooks can arrive out of order — make handlers idempotent |
| Event | draft → pending → published → cancelled | Approval queue only if organiser is unverified |
| Payout | accruing → scheduled → paid | held | Hold on dispute or KYC gap |
| Check-in sync | local → queued → synced → conflict | Conflicts resolve to first-scan-wins |

---

## 6. Non-functional requirements (the ones that decide if it survives contact with a real event)

| Requirement | Target | Notes |
| --- | --- | --- |
| Offline check-in | 100% of scans captured without network | Local queue, monotonic clock, first-scan-wins reconciliation |
| Offline ticket | QR renders with no network | Cache ticket + signed payload in IndexedDB |
| Performance | LCP < 2.5 s on 3G, TTI < 3.5 s | Route-level code splitting, images pre-sized, critical CSS inline |
| Door throughput | < 4 s per attendee | Big scan target, haptic + audio feedback, no modal on success |
| Security | OWASP ASVS L2 | Signed QR, rate limits, no PII in URLs, rotation of secrets |
| PCI | SAQ-A scope | Hosted card fields only; never touch PAN |
| Privacy | GDPR + NDPA | Consent capture, export, deletion with 30-day grace |
| Accessibility | WCAG 2.2 AA | 44 px targets, 4.5:1 contrast, focus order, screen-reader labels |
| Reliability | 99.9% on event day | Ticket issuance behind a queue; read replicas for attendee lists |
| Observability | 100% of funnel events | See §7 |

---

## 7. Instrumentation (don't ship without it)

**Funnel:** `app_open → onboarding_complete → event_impression → event_view → ticket_selected → checkout_start → payment_success → ticket_view → reminder_received → event_open → check_in_success → rating_submitted`

**Per event, capture:** impressions, detail views, checkout starts, orders, refunds, check-in rate, no-show rate, revenue, acquisition source.
**Per scan, capture:** latency, outcome (ok / duplicate / invalid), operator, device, online state.
**Guardrails:** crash-free sessions ≥ 99.5%, payment failure rate, duplicate scan rate, notification opt-out rate.

---

## 8. Release plan

| Phase | Ships | Exit criteria |
| --- | --- | --- |
| **P0 — MVP** | Splash, onboarding, auth, home, list + detail, save, checkout, ticket + QR, profile, follow organiser, organiser creation, scanner, notifications | A real event is run end-to-end on the app with ≥ 200 attendees |
| **P1 — Retention** | Search filters, map/calendar views, wallet passes, transfers & refunds, promo codes, waitlist, calendar sync, reviews | Repeat-attendee rate ≥ 30% within 60 days |
| **P2 — Organiser depth** | Team permissions, analytics, payouts, embeds, API/webhooks, badge printing, marketing tools | ≥ 30% of organisers publish a second event |
| **P3 — Social & scale** | Chat, Q&A, polls, photo wall, networking, resale marketplace, hybrid/series events, localisation | Engagement/session + 25% |

---

## 9. Acceptance criteria (MVP)

1. A guest can browse and reach checkout without an account, and sign up **without losing** their cart.
2. A ticket renders a scannable QR within 2 s of opening, and the code rotates every 30 s.
3. Scanner checks in a valid ticket in < 4 s; a second scan of the same ticket shows *"already checked in at HH:MM"* and never succeeds.
4. Check-in works with the device in airplane mode and reconciles when back online.
5. Organiser publishes an event in ≤ 10 minutes with at least one paid ticket type.
6. Every paid order produces a receipt email, an in-app ticket, and a ledger line.
7. Push reminder lands 24 h and 2 h before doors; tapping it opens the ticket QR.
8. Lighthouse PWA: installable, works offline, performance ≥ 90 on mobile.

---

## 10. Open questions

1. **Resale:** do we own the secondary market at launch, or just allow free transfers?
2. **Fees:** absorbed by organiser, or passed to attendee? (Affects checkout conversion and payout logic.)
3. **Payout schedule:** T+48 h vs instant for verified organisers — which wins supply?
4. **KYC depth for first payout:** what is the minimum that keeps fraud under control without stalling supply?
5. **Offline conflict policy:** first-scan-wins vs last-write-wins when two devices scan the same ticket offline.
6. **Series events:** parent/child tickets or one ticket for all sessions?
7. **Age/ID checks:** self-declared attestation or document verification?

---

## 11. Reference implementation

The companion build (`/`) implements the full MVP slice of this document as a responsive PWA:

- Splash with session restore, deep-link routing, maintenance and forced-update states (`/?maintenance=1`, `/?update=1`, `/?to=/tickets`)
- Onboarding → auth (email/OTP/social/2FA/guest) → personalised home
- Explore with list, map and calendar views + composable filters
- Event detail, ticket selection, checkout with 3-D Secure, decline and pay-later paths
- Ticket wallet with rotating QR, transfer, refund and offline access
- Organiser dashboard, 5-step creation wizard, attendee management and payouts
- Check-in scanner with camera detection, manual entry, duplicate detection and offline queue
- Notifications, settings, verification, help centre (`/support`) and real legal pages (`/legal/terms`, `/legal/privacy`, `/legal/licenses`)
- **Pictures everywhere**: profile picture, cover photo and event photos can be uploaded from the
  device or added by URL. Images are downscaled in the browser (480px avatars, 1280px covers) before
  they are stored, and every surface falls back to generated category art when no photo is set.
- **Settings → Role** is the only place a signed-in user switches role; the admin/moderator role is
  not offered and the admin console is never linked from the consumer app.

Two installable PWAs ship from one repository: `evently` (this app) and `evently-admin`
(approvals, moderation, users, payouts, audit) — separate manifests, service workers and staff roles.
State lives in `localStorage` (`evently.state.v1` / `evently.admin.v1`) so every flow can be
exercised without a backend.

Items marked `MVP` in section 4 are the ones implemented in that build; the rest are specified and stubbed.
