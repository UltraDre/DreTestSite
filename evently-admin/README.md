# Evently Admin

Staff console for Evently — a **separate installable PWA** from the public app, sharing the same core
package and (in production) the same API.

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # static SPA in /build
```

## Sign in

Any email + any 6-digit code. Pick a staff role to see capability gating:

| Role | Can do |
| --- | --- |
| Super admin | Everything, including payouts and staff |
| Moderator | Approvals, reports, content, users |
| Support | Users, disputes; read-only payouts |
| Finance | Payouts, refunds, taxes — no content |

## Screens

| Route | What it does |
| --- | --- |
| `/console` | KPIs, 14-day ticket chart, "needs a decision" queue, live events, activity |
| `/console/approvals` | Risk-scored event queue (score, flags, notes) → approve / reject / request info |
| `/console/events` | All events with sales, gross and unpublish actions |
| `/console/users` | Attendees and organisers with KYC status, suspend/reinstate, password reset, audited "view as user" |
| `/console/reports` | Reports and chargebacks by severity → refund / suspend / dismiss |
| `/console/payouts` | Payout batches with KYC gating, hold/release, take rate |
| `/console/audit` | Immutable staff + system activity log (searchable) |
| `/console/settings` | Theme, alerting, linked apps, sign out |

Every mutating action writes to the audit log with the operator's identity.

## PWA

`static/admin.webmanifest` + `static/sw.js` — installable, offline shell, own icon set and cache
(`evently-admin-v1`), completely separate from the public app's service worker.

## Deploy

See the root `README.md`. Vercel: Root Directory `evently-admin`, output `build`, `vercel.json`
already configured. Set `VITE_WEB_URL` to link back to the public app.
