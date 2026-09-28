/**
 * Generates docs/PRD.md from src/lib/checklist.js (single source of truth).
 * Run: node scripts/gen-prd.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { CHECKLIST, ALL_ITEMS, MVP_ITEMS } from '../../packages/core/src/lib/checklist.js';

const total = ALL_ITEMS.length;
const mvp = MVP_ITEMS.length;
const box = (i) => (i.mvp ? '**[MVP]**' : '[ ]');

const sections = CHECKLIST.map((s) => {
	const items = s.items
		.map((i) => {
			const detail = i.detail ? ` — ${i.detail}` : '';
			return `- [ ] **${i.name}**${detail} ${i.mvp ? '`MVP`' : ''}`;
		})
		.join('\n');
	return `### ${s.title}\n${s.note ? `> ${s.note}\n` : ''}\n${items}`;
}).join('\n\n');

const md = `# Evently — Product Requirements Document & Build Checklist

**Version** 1.0 · **Status** Ready to build · **Stack** SvelteKit 2 + Svelte 5 (runes), Vite, PWA (offline-first)
**Scope** Events discovery, ticketing, check-in, organiser console, social graph, admin/moderation
**Checklist size** ${total} items · **MVP** ${mvp} items · **Post-launch** ${total - mvp} items

---

## 0. How to read this document

- Every line item is a shippable unit of work: a screen, a state, or a behaviour. Tick it when it is **in production**, not when the branch is merged.
- \`MVP\` marks what must ship in v1. Everything else is sequenced after launch.
- The checklist lives in **\`packages/core/src/lib/checklist.js\`** and is exported to this document by \`node scripts/gen-prd.mjs\` — edit the source, regenerate the doc.
- Admin/moderator work is deliberately **not** in the public app. It ships as a separate PWA (\`evently-admin\`) with its own manifest, service worker and staff roles.
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

\`\`\`
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
\`\`\`

**Golden path (attendee):** open app → see something local → open event → pick 2 tickets → pay with saved card → ticket appears with QR → reminder 24 h before → scan at door → rate the event.

**Golden path (organiser):** create event (5 steps) → publish → share link → watch sales funnel → message attendees → open scanner on the night → withdraw payout 48 h later.

---

## 4. Screen-by-screen checklist

${sections}

---

## 5. Core objects & states

### Ticket (the most important object in the system)
\`\`\`
Ticket {
  id, code, orderId, eventId, ticketTypeId,
  holder { name, email, phone },
  price, currency, fees,
  status: valid → used → (refunded | cancelled)
  qr: rotating HMAC(code, 30s window)   // screenshots are useless
  checkedInAt?, checkedInBy?, deviceId?
  transfers: [{ from, to, at }]
}
\`\`\`
Rules: a ticket is **single-use**; duplicate scans return the original scan time and operator; transfer voids the old QR and issues a new code; refunds require a policy check before they reach a human.

### Event
\`\`\`
Event { id, slug, organiserId, venueId | onlineUrl, mode: in-person|online|hybrid,
        start, end, doors, tz, capacity, ticketTypes[], agenda[], speakers[],
        sponsors[], faqs[], policies{}, status: draft|pending|published|cancelled,
        visibility: public|unlisted|private, seriesId? }
\`\`\`

### Order
\`\`\`
Order { id, ref, buyer, lines[], subtotal, fees, tax, discount, total,
        currency, paymentMethod, status: pending|paid|failed|refunded|partially_refunded }
\`\`\`

### State machines to implement explicitly
| Object | States | Notes |
| --- | --- | --- |
| Ticket | valid → used · valid → refund-requested → refunded · valid → cancelled | Only \`valid\` scans green |
| Order | pending → paid → (refunded \| partially_refunded) \| failed | Webhooks can arrive out of order — make handlers idempotent |
| Event | draft → pending → published → cancelled | Approval queue only if organiser is unverified |
| Payout | accruing → scheduled → paid \| held | Hold on dispute or KYC gap |
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

**Funnel:** \`app_open → onboarding_complete → event_impression → event_view → ticket_selected → checkout_start → payment_success → ticket_view → reminder_received → event_open → check_in_success → rating_submitted\`

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

The companion build (\`/\`) implements the full MVP slice of this document as a responsive PWA:

- Splash with session restore, deep-link routing, maintenance and forced-update states (\`/?maintenance=1\`, \`/?update=1\`, \`/?to=/tickets\`)
- Onboarding → auth (email/OTP/social/2FA/guest) → personalised home
- Explore with list, map and calendar views + composable filters
- Event detail, ticket selection, checkout with 3-D Secure, decline and pay-later paths
- Ticket wallet with rotating QR, transfer, refund and offline access
- Organiser dashboard, 5-step creation wizard, attendee management and payouts
- Check-in scanner with camera detection, manual entry, duplicate detection and offline queue
- Notifications, settings, verification, help centre (\`/support\`) and real legal pages (\`/legal/terms\`, \`/legal/privacy\`, \`/legal/licenses\`)
- **Pictures everywhere**: profile picture, cover photo and event photos can be uploaded from the
  device or added by URL. Images are downscaled in the browser (480px avatars, 1280px covers) before
  they are stored, and every surface falls back to generated category art when no photo is set.
- **Settings → Role** is the only place a signed-in user switches role; the admin/moderator role is
  not offered and the admin console is never linked from the consumer app.

Two installable PWAs ship from one repository: \`evently\` (this app) and \`evently-admin\`
(approvals, moderation, users, payouts, audit) — separate manifests, service workers and staff roles.
State lives in \`localStorage\` (\`evently.state.v1\` / \`evently.admin.v1\`) so every flow can be
exercised without a backend.

Items marked \`MVP\` in section 4 are the ones implemented in that build; the rest are specified and stubbed.
`;

mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/PRD.md', import.meta.url), md);
console.log(`Wrote docs/PRD.md — ${total} items (${mvp} MVP)`);
