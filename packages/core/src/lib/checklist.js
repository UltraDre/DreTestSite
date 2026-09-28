/**
 * Evently — complete feature / screen checklist.
 * Single source of truth: rendered in-app at /prd and exported to PRD.md.
 * mvp: true = required for the first release.
 * role: primary role the screen serves.
 */

export const CHECKLIST = [
	{
		id: 'launch',
		title: '1. Splash & launch',
		note: 'Every session starts here. Nothing renders until version + session state are resolved.',
		items: [
			{ id: 'l1', name: 'App logo / launch animation', detail: 'Brand mark, safe-area aware, ≤1.8s', mvp: true },
			{ id: 'l2', name: 'Session restore / auto-login check', detail: 'Refresh token → silent sign-in; fall back to guest', mvp: true },
			{ id: 'l3', name: 'Deep link handling', detail: 'evently://event/<slug>, /t/<code>, /checkout?event=, ?to= for post-login routing', mvp: true },
			{ id: 'l4', name: 'Forced update prompt', detail: 'Min-supported-version gate with store link (?update=1)', mvp: false },
			{ id: 'l5', name: 'Maintenance mode', detail: 'Kill-switch screen with ETA (?maintenance=1)', mvp: false },
			{ id: 'l6', name: 'Version check + changelog', detail: 'Show “what’s new” after an app update', mvp: false },
			{ id: 'l7', name: 'Permission requests', detail: 'Notifications, location, camera (QR), calendar — asked in context, never all at once', mvp: true },
			{ id: 'l8', name: 'Onboarding carousel / value props', detail: '3 slides: discover · tickets · run your own', mvp: true },
			{ id: 'l9', name: 'Interest selection', detail: 'Min 3 picks; seeds the home feed and recommendations', mvp: true },
			{ id: 'l10', name: 'Location selection', detail: 'City picker + “use my location” (geolocation with graceful denial)', mvp: true },
			{ id: 'l11', name: 'Skip / guest mode', detail: 'Full browse + save; auth wall only at checkout', mvp: true }
		]
	},
	{
		id: 'auth',
		title: '2. Create account / login / auth',
		note: 'Auth is the highest-drop-off surface. Every method must reach the same verified session.',
		items: [
			{ id: 'a1', name: 'Sign up: email, phone, Google, Apple, Facebook, SSO', detail: 'OAuth + SAML/OIDC for enterprise', mvp: true },
			{ id: 'a2', name: 'OTP / magic link', detail: 'Email + SMS OTP, 6 digits, 5-min TTL, resend throttle', mvp: true },
			{ id: 'a3', name: 'Password creation + rules', detail: '8+ chars, upper, number; breach-list check (HIBP)', mvp: true },
			{ id: 'a4', name: 'Login / logout', detail: 'Email/password, social, and device-scoped logout', mvp: true },
			{ id: 'a5', name: 'Forgot / reset password', detail: 'Signed, single-use reset link + in-app confirmation', mvp: true },
			{ id: 'a6', name: '2FA / biometric login', detail: 'TOTP authenticator + Face ID / fingerprint (WebAuthn)', mvp: false },
			{ id: 'a7', name: 'Guest browsing', detail: 'Read-only session that upgrades without data loss', mvp: true },
			{ id: 'a8', name: 'Terms & privacy consent', detail: 'Versioned consent captured with timestamp and IP', mvp: true },
			{ id: 'a9', name: 'Age gate', detail: 'DOB or 18+ checkbox; gates alcohol/18+ events', mvp: true },
			{ id: 'a10', name: 'Profile setup after signup', detail: 'Name, photo, city, interests — skippable, prompted later', mvp: true },
			{ id: 'a11', name: 'Email / phone verification', detail: 'Verified badge drives trust ranking and selling rights', mvp: true },
			{ id: 'a12', name: 'Account deletion', detail: 'Self-serve with 30-day grace period + data export', mvp: false },
			{ id: 'a13', name: 'Switch account / multiple accounts', detail: 'Attendee and organiser identities on one device', mvp: false }
		]
	},
	{
		id: 'home',
		title: '3. Home',
		note: 'The feed is the product. Sections are ranked, not chronological.',
		items: [
			{ id: 'h1', name: 'Personalised feed', detail: 'Interest × location × follow graph × recency', mvp: true },
			{ id: 'h2', name: 'Search bar', detail: 'Global search across events, organisers, venues', mvp: true },
			{ id: 'h3', name: 'Categories', detail: 'Music, tech, sports, business, arts, food, health, community', mvp: true },
			{ id: 'h4', name: 'Near me / location-based events', detail: 'Distance-sorted, city switcher', mvp: true },
			{ id: 'h5', name: 'Trending / popular', detail: 'Velocity-ranked by sales in last 48h', mvp: true },
			{ id: 'h6', name: 'Upcoming events', detail: 'Bounded to the user’s city + 60 days', mvp: true },
			{ id: 'h7', name: 'Recommended for you', detail: 'Collaborative filtering over interest + attendance history', mvp: false },
			{ id: 'h8', name: 'Events from followed organizers', detail: 'Push-worthy: new event from a followed organiser', mvp: true },
			{ id: 'h9', name: 'Banners / featured events', detail: 'Editorial + paid placements, capped at 1 per session', mvp: false },
			{ id: 'h10', name: 'Quick actions', detail: 'Scan QR · My ticket · Create event · Calendar', mvp: true },
			{ id: 'h11', name: 'Calendar view', detail: 'Month grid with event density dots', mvp: false },
			{ id: 'h12', name: 'Notifications bell', detail: 'Unread count, deep-links to source', mvp: true },
			{ id: 'h13', name: 'Continue browsing', detail: 'Resume last search context', mvp: false },
			{ id: 'h14', name: 'Recently viewed', detail: 'Last 12 event detail views', mvp: false }
		]
	},
	{
		id: 'discovery',
		title: '4. Events — discovery',
		note: 'Search, filter and sort must all be URL-addressable and shareable.',
		items: [
			{ id: 'd1', name: 'Search by event, organiser, venue, keyword', detail: 'Typo-tolerant, synonym-aware', mvp: true },
			{ id: 'd2', name: 'Filters: date, time, price, category, location', detail: 'All combinable', mvp: true },
			{ id: 'd3', name: 'Filters: online/in-person, language, accessibility, age, capacity', mvp: false },
			{ id: 'd4', name: 'Sort: relevance, date, distance, popularity, price', mvp: true },
			{ id: 'd5', name: 'List view, map view, calendar view', detail: 'Map clusters pins; calendar shows density', mvp: true },
			{ id: 'd6', name: 'Event categories and tags', mvp: true },
			{ id: 'd7', name: 'Free / paid / private / invite-only', detail: 'Private events: unlisted + access code', mvp: false },
			{ id: 'd8', name: 'Recurring / multi-session / hybrid / virtual events', detail: 'Series parent + session children', mvp: false },
			{ id: 'd9', name: 'Empty states + “widen your search” recovery', mvp: true }
		]
	},
	{
		id: 'detail',
		title: '5. Event detail',
		note: 'The conversion surface. Load must feel instant; ticket selector is always one tap away.',
		items: [
			{ id: 'e1', name: 'Hero image / video', mvp: true },
			{ id: 'e2', name: 'Title, description, highlights', mvp: true },
			{ id: 'e3', name: 'Organiser info + follow', mvp: true },
			{ id: 'e4', name: 'Date, time, timezone (shown in viewer’s TZ)', mvp: true },
			{ id: 'e5', name: 'Venue + map + directions', mvp: true },
			{ id: 'e6', name: 'Online event link', detail: 'Revealed to ticket holders only, 60 min before', mvp: true },
			{ id: 'e7', name: 'Agenda / schedule', mvp: true },
			{ id: 'e8', name: 'Sessions / tracks', mvp: false },
			{ id: 'e9', name: 'Speakers / performers', mvp: true },
			{ id: 'e10', name: 'Sponsors / exhibitors', mvp: false },
			{ id: 'e11', name: 'Ticket types and prices', mvp: true },
			{ id: 'e12', name: 'FAQs', mvp: true },
			{ id: 'e13', name: 'Policies: refund, transfer, age, dress code', mvp: true },
			{ id: 'e14', name: 'Reviews / ratings', detail: 'Verified attendees only', mvp: false },
			{ id: 'e15', name: 'Photo gallery', mvp: false },
			{ id: 'e16', name: 'Similar events', mvp: false },
			{ id: 'e17', name: 'Share event (link, message, QR)', mvp: true },
			{ id: 'e18', name: 'Save event', mvp: true },
			{ id: 'e19', name: 'Follow organiser', mvp: true },
			{ id: 'e20', name: 'Report event', detail: 'Trust & safety reasons, 24h SLA', mvp: false },
			{ id: 'e21', name: 'Add to calendar (.ics / native)', mvp: true },
			{ id: 'e22', name: 'Invite friends', detail: 'Share sheet + in-app invite link', mvp: false }
		]
	},
	{
		id: 'saved',
		title: '6. Saved / wishlist',
		items: [
			{ id: 's1', name: 'Saved events', mvp: true },
			{ id: 's2', name: 'Saved organisers', mvp: false },
			{ id: 's3', name: 'Saved searches', detail: 'Alert when a new event matches', mvp: false },
			{ id: 's4', name: 'Wishlist / favourites', mvp: true },
			{ id: 's5', name: 'Reminders', detail: '24h + 2h before doors', mvp: true },
			{ id: 's6', name: 'Calendar sync (Google, Apple, Outlook)', mvp: false },
			{ id: 's7', name: 'Sold-out alerts', mvp: false },
			{ id: 's8', name: 'Price-drop / early-bird alerts', mvp: false },
			{ id: 's9', name: 'Waitlist', detail: 'Join, position, auto-release window', mvp: false },
			{ id: 's10', name: 'Share saved list', mvp: false }
		]
	},
	{
		id: 'tickets',
		title: '7. Tickets',
		note: 'A ticket is a signed object: holder, type, event, code, state machine.',
		items: [
			{ id: 't1', name: 'My tickets (upcoming / past / cancelled)', mvp: true },
			{ id: 't2', name: 'Ticket detail', mvp: true },
			{ id: 't3', name: 'QR code', mvp: true },
			{ id: 't4', name: 'Order info', mvp: true },
			{ id: 't5', name: 'Receipt / invoice (PDF + email)', mvp: true },
			{ id: 't6', name: 'Transfer ticket', detail: 'Re-issues QR, voids the old one', mvp: false },
			{ id: 't7', name: 'Resell / resale marketplace', detail: 'Price caps + organiser approval', mvp: false },
			{ id: 't8', name: 'Refund request', detail: 'Policy-aware, organiser SLA', mvp: false },
			{ id: 't9', name: 'Upgrade ticket', mvp: false },
			{ id: 't10', name: 'Add-ons (merch, food, workshop)', mvp: false },
			{ id: 't11', name: 'Group tickets', detail: 'One buyer, N named holders, per-holder QR', mvp: false },
			{ id: 't12', name: 'Apple Wallet / Google Wallet passes', mvp: false },
			{ id: 't13', name: 'Offline ticket access', detail: 'Cached QR renders with no network', mvp: true },
			{ id: 't14', name: 'Ticket status: valid, used, cancelled, refunded', mvp: true }
		]
	},
	{
		id: 'payment',
		title: '8. Payment / checkout',
		note: 'Checkout is a funnel: fewer fields, fewer steps, no surprises on fees.',
		items: [
			{ id: 'p1', name: 'Cart / order summary', mvp: true },
			{ id: 'p2', name: 'Ticket selection + quantity limits', detail: 'Per-order cap, per-user cap', mvp: true },
			{ id: 'p3', name: 'Promo codes / discounts', mvp: true },
			{ id: 'p4', name: 'Early bird / tiered pricing', detail: 'Time-boxed tiers', mvp: false },
			{ id: 'p5', name: 'Taxes and fees (transparent breakdown)', mvp: true },
			{ id: 'p6', name: 'Currency support (multi-currency display + FX)', mvp: false },
			{ id: 'p7', name: 'Payment methods: card, wallet, bank, mobile money, PayPal, Apple Pay, Google Pay', mvp: true },
			{ id: 'p8', name: 'Billing info', mvp: true },
			{ id: 'p9', name: '3-D Secure / OTP step-up', mvp: true },
			{ id: 'p10', name: 'Payment confirmation screen + email', mvp: true },
			{ id: 'p11', name: 'Failed payment / retry', detail: 'Decline reasons mapped to plain language', mvp: true },
			{ id: 'p12', name: 'Refunds (full, partial, policy-driven)', mvp: false },
			{ id: 'p13', name: 'Invoices / receipts', mvp: true },
			{ id: 'p14', name: 'Organiser payouts (schedule + ledger)', mvp: false },
			{ id: 'p15', name: 'Donations / round-up', mvp: false },
			{ id: 'p16', name: 'Installments / pay later (BNPL)', mvp: false },
			{ id: 'p17', name: 'PCI DSS scope reduction (hosted fields / tokenisation)', mvp: true }
		]
	},
	{
		id: 'checkin',
		title: '9. QR code / check-in',
		note: 'Doors are the moment of truth: it must work offline, in the sun, at speed.',
		items: [
			{ id: 'c1', name: 'Generate QR per ticket', mvp: true },
			{ id: 'c2', name: 'Rotating QR for security', detail: 'HMAC signature, 30s window; screenshots useless', mvp: true },
			{ id: 'c3', name: 'Scan QR at entry', mvp: true },
			{ id: 'c4', name: 'Manual code entry', detail: 'Dead battery / printed ticket path', mvp: true },
			{ id: 'c5', name: 'Offline check-in', detail: 'Local queue + conflict resolution on reconnect', mvp: true },
			{ id: 'c6', name: 'Staff scanner app / mode', detail: 'Scoped role: scan only, no refunds, no payouts', mvp: true },
			{ id: 'c7', name: 'Badge printing', detail: 'Zebra/Brother templates, on-demand at kiosk', mvp: false },
			{ id: 'c8', name: 'Attendee lookup by name / email / phone', mvp: true },
			{ id: 'c9', name: 'Duplicate scan detection', detail: 'Shows original scan time and operator', mvp: true },
			{ id: 'c10', name: 'Access control by ticket type', detail: 'VIP lane, backstage, age-restricted zones', mvp: false },
			{ id: 'c11', name: 'Check-in stats (live rate, no-shows)', mvp: true },
			{ id: 'c12', name: 'ID / age / vaccination check', mvp: false },
			{ id: 'c13', name: 'Walk-in registration', detail: 'Sell at the door, instant QR', mvp: false },
			{ id: 'c14', name: 'Self check-in kiosk', mvp: false }
		]
	},
	{
		id: 'profile',
		title: '10. Profile',
		items: [
			{ id: 'pr1', name: 'Attendee profile: photo, name, bio', mvp: true },
			{ id: 'pr2', name: 'Contact info', mvp: true },
			{ id: 'pr3', name: 'Interests', mvp: true },
			{ id: 'pr4', name: 'Social links', mvp: false },
			{ id: 'pr5', name: 'Verification badges', mvp: false },
			{ id: 'pr6', name: 'Tickets / order history', mvp: true },
			{ id: 'pr7', name: 'Saved events', mvp: true },
			{ id: 'pr8', name: 'Followers / following lists', mvp: true },
			{ id: 'pr9', name: 'Organiser profile: logo, banner, bio', mvp: true },
			{ id: 'pr10', name: 'Verified organiser badge', mvp: false },
			{ id: 'pr11', name: 'Past / upcoming events', mvp: true },
			{ id: 'pr12', name: 'Ratings / reviews', mvp: false },
			{ id: 'pr13', name: 'Contact / website', mvp: false },
			{ id: 'pr14', name: 'Payout info', mvp: false },
			{ id: 'pr15', name: 'Team members + permissions', mvp: false },
			{ id: 'pr16', name: 'Profile picture upload (device or URL)', detail: 'Camera / library / paste a link; downscaled client-side to 480px before it is stored', mvp: true },
			{ id: 'pr17', name: 'Cover photo upload', detail: '16:9; the bottom of the banner fades into the page background in both themes', mvp: false },
			{ id: 'pr18', name: 'Username / handle', detail: 'Unique, editable, shown as @handle everywhere the profile appears', mvp: true },
			{ id: 'pr19', name: 'Profile link', detail: 'One external URL (site, portfolio, ticket page) rendered as a chip on the profile', mvp: false },
			{ id: 'pr20', name: 'Personal calendar on profile', detail: 'Month grid marking days you hold a ticket or saved an event; tap a day for that day’s list', mvp: true }
		]
	},
	{
		id: 'settings',
		title: '11. Settings',
		items: [
			{ id: 'st1', name: 'Account settings', mvp: true },
			{ id: 'st2', name: 'Privacy settings', mvp: true },
			{ id: 'st3', name: 'Security settings (password, 2FA, sessions)', mvp: true },
			{ id: 'st4', name: 'Payment methods', mvp: true },
			{ id: 'st5', name: 'Notification preferences (per channel × per type)', mvp: true },
			{ id: 'st6', name: 'Language', mvp: false },
			{ id: 'st7', name: 'Currency', mvp: false },
			{ id: 'st8', name: 'Accessibility (text size, contrast, reduce motion)', mvp: false },
			{ id: 'st9', name: 'Help / support', mvp: true },
			{ id: 'st10', name: 'Terms & privacy policy', mvp: true },
			{ id: 'st11', name: 'Logout', mvp: true },
			{ id: 'st12', name: 'Delete account', mvp: false },
			{ id: 'st13', name: 'Role switcher (Settings → Role)', detail: 'Account tab links here; admin/moderator is not offered in the consumer app', mvp: true },
			{ id: 'st14', name: 'Appearance (light / dark) inside Accessibility', mvp: false }
		]
	},
	{
		id: 'verified',
		title: '12. Verification & trust',
		items: [
			{ id: 'v1', name: 'Email verification', mvp: true },
			{ id: 'v2', name: 'Phone verification', mvp: true },
			{ id: 'v3', name: 'ID verification', mvp: false },
			{ id: 'v4', name: 'Organiser verification', mvp: false },
			{ id: 'v5', name: 'Business verification (CAC / registration)', mvp: false },
			{ id: 'v6', name: 'Payout verification (KYC / bank)', mvp: false },
			{ id: 'v7', name: 'Age verification', mvp: false },
			{ id: 'v8', name: 'Ticket verification (signature check at door)', mvp: true },
			{ id: 'v9', name: 'Blue check / verified badge', mvp: false },
			{ id: 'v10', name: 'Trust & safety status page', mvp: false }
		]
	},
	{
		id: 'social',
		title: '13. Follow / following & social',
		items: [
			{ id: 'so1', name: 'Follow organisers, venues, speakers, friends', mvp: true },
			{ id: 'so2', name: 'Followers / following lists', mvp: true },
			{ id: 'so3', name: 'Suggestions / people you may know', mvp: false },
			{ id: 'so4', name: 'Mutual connections', mvp: false },
			{ id: 'so5', name: 'Activity feed', mvp: false },
			{ id: 'so6', name: 'Notifications for followed organisers', mvp: true },
			{ id: 'so7', name: 'Share event / invite friends', mvp: true },
			{ id: 'so8', name: 'Chat / direct messages', mvp: false },
			{ id: 'so9', name: 'Event chat / group chat', detail: 'Moderated, opens 24h before, closes 7d after', mvp: false },
			{ id: 'so10', name: 'Networking (attendee directory, opt-in)', mvp: false },
			{ id: 'so11', name: 'Q&A', mvp: false },
			{ id: 'so12', name: 'Polls', mvp: false },
			{ id: 'so13', name: 'Photo wall', mvp: false },
			{ id: 'so14', name: 'Reviews / comments', mvp: false },
			{ id: 'so15', name: 'Report / block user', mvp: false }
		]
	},
	{
		id: 'organizer',
		title: '14. Organizer / event creation',
		note: 'The supply side. Everything here maps to revenue.',
		items: [
			{ id: 'o1', name: 'Organiser dashboard', mvp: true },
			{ id: 'o2', name: 'Create event wizard (basics → date/place → tickets → extras → review)', mvp: true },
			{ id: 'o3', name: 'Draft / save / publish', mvp: true },
			{ id: 'o4', name: 'Edit event', mvp: true },
			{ id: 'o5', name: 'Duplicate event', mvp: false },
			{ id: 'o6', name: 'Cancel event (auto-refund + notify)', mvp: true },
			{ id: 'o7', name: 'Recurring events / series', mvp: false },
			{ id: 'o8', name: 'Co-hosts / team permissions', detail: 'Owner, manager, editor, scanner, viewer', mvp: false },
			{ id: 'o9', name: 'Venue setup (address, map pin, capacity, sections)', mvp: true },
			{ id: 'oo', name: 'Online event setup (Zoom / Meet / Teams link)', mvp: true },
			{ id: 'o11', name: 'Agenda / sessions / tracks', mvp: false },
			{ id: 'o12', name: 'Speakers / performers', mvp: false },
			{ id: 'o13', name: 'Sponsors / exhibitors', mvp: false },
			{ id: 'o14', name: 'Ticket types / pricing / tiers', mvp: true },
			{ id: 'o15', name: 'Promo codes', mvp: false },
			{ id: 'o16', name: 'Capacity / waitlist', mvp: false },
			{ id: 'o17', name: 'Registration questions', mvp: false },
			{ id: 'o18', name: 'Waivers / consent forms', mvp: false },
			{ id: 'o19', name: 'Approval workflow (auto / manual / invite-only)', mvp: false },
			{ id: 'o20', name: 'Attendee messaging (segmented)', mvp: false },
			{ id: 'o21', name: 'Attendee list + CSV export', mvp: true },
			{ id: 'o22', name: 'Check-in tools', mvp: true },
			{ id: 'o23', name: 'Analytics (sales funnel, conversion, traffic sources)', mvp: false },
			{ id: 'o24', name: 'Payouts (balance, schedule, ledger)', mvp: false },
			{ id: 'o25', name: 'Refund management', mvp: false },
			{ id: 'o26', name: 'Marketing tools (email, push, share links)', mvp: false },
			{ id: 'o27', name: 'Embeds / widgets for your own site', mvp: false },
			{ id: 'o28', name: 'API / integrations (webhooks, Zapier)', mvp: false },
			{ id: 'o29', name: 'Event photo / cover image', detail: 'Upload from device or paste a URL; downscaled to 1280px; falls back to generated category art', mvp: true },
			{ id: 'o30', name: 'Change the event photo after publishing', detail: 'Same picker on the manage-event screen; updates cards, search and the public page', mvp: true }
		]
	},
	{
		id: 'journey',
		title: '15. Attendee journey (end to end)',
		note: 'Instrument every step: these are the funnel events that matter.',
		items: [
			{ id: 'j1', name: 'Discover event', mvp: true },
			{ id: 'j2', name: 'View details', mvp: true },
			{ id: 'j3', name: 'Save / follow', mvp: true },
			{ id: 'j4', name: 'Register', mvp: true },
			{ id: 'j5', name: 'Pay', mvp: true },
			{ id: 'j6', name: 'Receive ticket (in-app, email, wallet)', mvp: true },
			{ id: 'j7', name: 'Reminder notifications (24h, 2h)', mvp: true },
			{ id: 'j8', name: 'Add to calendar', mvp: true },
			{ id: 'j9', name: 'Directions', mvp: true },
			{ id: 'j10', name: 'Check-in', mvp: true },
			{ id: 'j11', name: 'View agenda', mvp: true },
			{ id: 'j12', name: 'Network / chat', mvp: false },
			{ id: 'j13', name: 'Q&A / polls', mvp: false },
			{ id: 'j14', name: 'Feedback / rating', mvp: false },
			{ id: 'j15', name: 'Certificate of attendance', mvp: false },
			{ id: 'j16', name: 'Post-event content / replays', mvp: false },
			{ id: 'j17', name: 'Photos / highlights', mvp: false }
		]
	},
	{
		id: 'notifications',
		title: '16. Notifications & communication',
		items: [
			{ id: 'n1', name: 'Push notifications', mvp: true },
			{ id: 'n2', name: 'Email', mvp: true },
			{ id: 'n3', name: 'SMS', mvp: false },
			{ id: 'n4', name: 'In-app notifications + centre', mvp: true },
			{ id: 'n5', name: 'Calendar invites (.ics)', mvp: true },
			{ id: 'n6', name: 'Event reminders', mvp: true },
			{ id: 'n7', name: 'Event updates / changes', mvp: true },
			{ id: 'n8', name: 'Cancellations', mvp: true },
			{ id: 'n9', name: 'Waitlist updates', mvp: false },
			{ id: 'n10', name: 'Payment confirmations', mvp: true },
			{ id: 'n11', name: 'Check-in confirmations', mvp: false },
			{ id: 'n12', name: 'Follow notifications', mvp: false },
			{ id: 'n13', name: 'Messages', mvp: false },
			{ id: 'n14', name: 'Announcements (organiser → attendees)', mvp: true },
			{ id: 'n15', name: 'Marketing campaigns', mvp: false }
		]
	},
	{
		id: 'admin',
		title: '17. Admin / moderation',
		items: [
			{ id: 'ad1', name: 'User management (search, suspend, ban)', mvp: false },
			{ id: 'ad2', name: 'Event approval queue', mvp: false },
			{ id: 'ad3', name: 'Content moderation (text, images, reviews)', mvp: false },
			{ id: 'ad4', name: 'Reports / abuse queue', mvp: false },
			{ id: 'ad5', name: 'Disputes (chargebacks, refund escalations)', mvp: false },
			{ id: 'ad6', name: 'Refunds (force, override policy)', mvp: false },
			{ id: 'ad7', name: 'Fraud detection (velocity, device, ticket resale)', mvp: false },
			{ id: 'ad8', name: 'KYC / verification review', mvp: false },
			{ id: 'ad9', name: 'Analytics (GMV, take rate, cohorts)', mvp: false },
			{ id: 'ad10', name: 'Payouts (approve, hold, clawback)', mvp: false },
			{ id: 'ad11', name: 'Taxes (VAT/WHT handling per region)', mvp: false },
			{ id: 'ad12', name: 'Compliance (GDPR, data requests)', mvp: false },
			{ id: 'ad13', name: 'Audit logs (who did what, when)', mvp: false }
		]
	},
	{
		id: 'technical',
		title: '18. Technical / non-functional',
		note: 'The requirements that decide whether the app survives contact with a real event.',
		items: [
			{ id: 'x1', name: 'Offline support', detail: 'Service worker, cached shell, queued check-ins', mvp: true },
			{ id: 'x2', name: 'Performance', detail: 'LCP < 2.5s on 3G, 60fps scroll, ≤200KB critical JS', mvp: true },
			{ id: 'x3', name: 'Scalability', detail: 'Stateless API, CDN, queue-backed ticket issuance', mvp: false },
			{ id: 'x4', name: 'Security', detail: 'OWASP ASVS, rate limiting, signed QR, secrets rotation', mvp: true },
			{ id: 'x5', name: 'PCI compliance', detail: 'Hosted fields, no card data in app scope', mvp: true },
			{ id: 'x6', name: 'GDPR / privacy', detail: 'Consent, export, deletion, DPA with processors', mvp: true },
			{ id: 'x7', name: 'Accessibility (WCAG 2.2 AA)', detail: 'Contrast, focus order, screen-reader labels, 44px targets', mvp: true },
			{ id: 'x8', name: 'Localization', detail: 'i18n strings, RTL-ready layout, locale dates & currency', mvp: false },
			{ id: 'x9', name: 'Deep links (universal links + app links)', mvp: true },
			{ id: 'x10', name: 'Analytics / product instrumentation', mvp: true },
			{ id: 'x11', name: 'Crash reporting (Sentry / Firebase Crashlytics)', mvp: true },
			{ id: 'x12', name: 'A/B testing + feature flags', mvp: false },
			{ id: 'x13', name: 'Public API + webhooks', mvp: false },
			{ id: 'x14', name: 'Integrations: Stripe / PayPal / Razorpay, Apple Pay / Google Pay, Google Maps', mvp: true },
			{ id: 'x15', name: 'Integrations: Google / Apple / Outlook calendar', mvp: false },
			{ id: 'x16', name: 'Integrations: Zoom / Google Meet / Teams', mvp: false },
			{ id: 'x17', name: 'Integrations: email & SMS providers, CRM, social', mvp: false },
			{ id: 'x18', name: 'Badge printing + wallet passes', mvp: false }
		]
	}
];

export const ALL_ITEMS = CHECKLIST.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })));
export const MVP_ITEMS = ALL_ITEMS.filter((i) => i.mvp);
