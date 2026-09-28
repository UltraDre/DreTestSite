import { browser } from '$app/environment';
import {
	EVENTS,
	ORGANIZERS,
	PEOPLE,
	VENUES,
	SEED_TICKETS,
	SEED_NOTIFICATIONS,
	newId,
	now
} from './data.js';
import { hash, rand } from './util.js';

const KEY = 'evently.state.v1';
const PERSIST = [
	'user',
	'role',
	'onboarded',
	'launched',
	'savedEvents',
	'savedSearches',
	'savedOrganizers',
	'followingOrg',
	'followingPeople',
	'interests',
	'city',
	'currency',
	'theme',
	'tickets',
	'events',
	'notifications',
	'orders',
	'waitlist',
	'prefs',
	'lastRoute',
	'recent',
	'prdDone'
];

const DEFAULT_USER = {
	id: 'u1',
	name: 'Amaka Obi',
	handle: 'amaka',
	hue: 258,
	email: 'amaka@example.com',
	phone: '+234 801 234 5678',
	bio: 'Live music + design. Currently in my running era.',
	city: 'Lagos',
	interests: ['music', 'tech', 'food'],
	organizerId: 'o1',
	verified: { email: true, phone: true, id: false, business: false, payout: false, age: true },
	followers: 214,
	following: 186,
	/* pictures — data URL (device upload) or https URL (link). null = generated art */
	avatar: null,
	banner: null,
	link: '',
	socials: { ig: '@amaka.obi', x: '@amakaobi' }
};

class AppStore {
	/* ---------- session ---------- */
	user = $state(null);
	role = $state('attendee'); // guest | attendee | organizer | cohost | staff | speaker | sponsor | venue | admin
	onboarded = $state(false);
	launched = $state(false);
	lastRoute = $state('/home');
	theme = $state('light');
	currency = $state('NGN');
	city = $state('Lagos');
	interests = $state(['music', 'tech', 'food']);

	/* ---------- content ---------- */
	events = $state(EVENTS.map((e) => ({ ...e })));
	organizers = $state(ORGANIZERS.map((o) => ({ ...o })));
	people = $state(PEOPLE.map((p) => ({ ...p })));
	venues = $state(VENUES.map((v) => ({ ...v })));

	/* ---------- user graph ---------- */
	savedEvents = $state(['e2', 'e7']);
	savedSearches = $state([{ id: 's1', label: 'Lagos · Music · This month' }]);
	savedOrganizers = $state(['o5']);
	followingOrg = $state(['o1', 'o3']);
	followingPeople = $state(['p2', 'p3']);
	waitlist = $state([]);
	recent = $state([]);
	prdDone = $state([]);

	/* ---------- commerce ---------- */
	tickets = $state(SEED_TICKETS.map((t) => ({ ...t })));
	orders = $state([]);
	cart = $state({ eventId: null, items: [], promo: null, attendee: null });

	/* ---------- notifications / ui ---------- */
	notifications = $state(SEED_NOTIFICATIONS.map((n) => ({ ...n })));
	toast = $state(null);
	prefs = $state({
		push: { reminders: true, updates: true, messages: true, marketing: false },
		email: { reminders: true, updates: true, messages: false, marketing: false },
		sms: { reminders: true, updates: false, messages: false, marketing: false },
		biometric: true,
		offline: true
	});

	/* ================= derived ================= */
	get unread() {
		return this.notifications.filter((n) => !n.read).length;
	}
	get isAuthed() {
		return !!this.user;
	}
	get myOrganizerId() {
		return this.user?.organizerId ?? 'o1';
	}
	get myEvents() {
		return this.events.filter((e) => e.organizerId === this.myOrganizerId);
	}
	get upcoming() {
		return this.tickets
			.map((t) => ({ t, e: this.event(t.eventId) }))
			.filter((x) => x.e && new Date(x.e.start) > Date.now() && x.t.status !== 'cancelled')
			.sort((a, b) => new Date(a.e.start) - new Date(b.e.start));
	}
	get pastTickets() {
		return this.tickets
			.map((t) => ({ t, e: this.event(t.eventId) }))
			.filter((x) => x.e && (new Date(x.e.start) <= Date.now() || x.t.status === 'cancelled'))
			.sort((a, b) => new Date(b.e.start) - new Date(a.e.start));
	}
	get roleName() {
		return (
			{
				guest: 'Guest',
				attendee: 'Attendee',
				organizer: 'Organizer',
				cohost: 'Co-host',
				staff: 'Check-in staff',
				speaker: 'Speaker',
				sponsor: 'Sponsor',
				venue: 'Venue',
				admin: 'Admin'
			}[this.role] || 'Attendee'
		);
	}

	/* ================= lookups ================= */
	event(id) {
		return this.events.find((e) => e.id === id);
	}
	eventBySlug(slug) {
		return this.events.find((e) => e.slug === slug);
	}
	organizer(id) {
		return this.organizers.find((o) => o.id === id);
	}
	person(id) {
		return this.people.find((p) => p.id === id);
	}
	venue(id) {
		return this.venues.find((v) => v.id === id);
	}
	ticket(id) {
		return this.tickets.find((t) => t.id === id);
	}
	ticketByCode(code) {
		return this.tickets.find((t) => t.code === code);
	}
	eventTickets(eventId) {
		return this.tickets.filter((t) => t.eventId === eventId);
	}
	priceFrom(eventId) {
		const e = this.event(eventId);
		if (!e) return 0;
		return Math.min(...e.ticketTypes.map((t) => t.price));
	}
	organizerEvents(orgId) {
		return this.events.filter((e) => e.organizerId === orgId && e.status === 'published');
	}
	ticketsLeft(t) {
		return Math.max(0, t.qty - t.sold);
	}
	interested() {
		return this.interests;
	}

	/* ================= actions ================= */
	say(message, icon = 'check') {
		this.toast = { id: newId('t'), message, icon };
		setTimeout(() => {
			if (this.toast?.message === message) this.toast = null;
		}, 2600);
	}

	notify(n) {
		this.notifications = [
			{ id: newId('n'), at: new Date().toISOString(), read: false, ...n },
			...this.notifications
		];
	}

	markAllRead() {
		this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
	}

	toggleSave(eventId) {
		const on = this.savedEvents.includes(eventId);
		this.savedEvents = on
			? this.savedEvents.filter((x) => x !== eventId)
			: [eventId, ...this.savedEvents];
		this.say(on ? 'Removed from saved' : 'Saved to your list', on ? 'trash' : 'heart');
		return !on;
	}
	isSaved(id) {
		return this.savedEvents.includes(id);
	}

	toggleFollowOrg(id) {
		const on = this.followingOrg.includes(id);
		if (on) {
			this.followingOrg = this.followingOrg.filter((x) => x !== id);
			const o = this.organizer(id);
			if (o) o.followers = Math.max(0, o.followers - 1);
		} else {
			this.followingOrg = [id, ...this.followingOrg];
			const o = this.organizer(id);
			if (o) o.followers += 1;
			this.notify({
				kind: 'follow',
				title: `Following ${o?.name ?? 'organizer'}`,
				body: 'You’ll get notified about their new events.',
				href: `/organizers/${id}`
			});
		}
		this.say(on ? 'Unfollowed' : 'Following — new events will show in your feed', on ? 'minus' : 'plus');
	}
	toggleFollowPerson(id) {
		const on = this.followingPeople.includes(id);
		this.followingPeople = on
			? this.followingPeople.filter((x) => x !== id)
			: [id, ...this.followingPeople];
		this.say(on ? 'Unfollowed' : 'Following', on ? 'minus' : 'plus');
	}
	isFollowingOrg(id) {
		return this.followingOrg.includes(id);
	}
	isFollowingPerson(id) {
		return this.followingPeople.includes(id);
	}
	toggleWaitlist(eventId) {
		const on = this.waitlist.includes(eventId);
		this.waitlist = on ? this.waitlist.filter((x) => x !== eventId) : [eventId, ...this.waitlist];
		this.say(on ? 'Left the waitlist' : 'Joined the waitlist — we’ll ping you', on ? 'minus' : 'bell');
	}

	pushRecent(id) {
		this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, 12);
	}

	toggleInterest(id) {
		this.interests = this.interests.includes(id)
			? this.interests.filter((x) => x !== id)
			: [...this.interests, id];
	}

	/* ---------- cart & checkout ---------- */
	addToCart(eventId, typeId, qty = 1) {
		this.cart = { ...this.cart, eventId };
		const existing = this.cart.items.find((i) => i.typeId === typeId);
		this.cart.items = existing
			? this.cart.items.map((i) => (i.typeId === typeId ? { ...i, qty: i.qty + qty } : i))
			: [...this.cart.items, { typeId, qty }];
	}
	setQty(typeId, qty) {
		this.cart.items = this.cart.items
			.map((i) => (i.typeId === typeId ? { ...i, qty: Math.max(0, qty) } : i))
			.filter((i) => i.qty > 0);
	}
	clearCart() {
		this.cart = { eventId: null, items: [], promo: null, attendee: null };
	}
	cartLines(eventId) {
		const e = this.event(eventId);
		if (!e) return [];
		return this.cart.items
			.map((i) => {
				const t = e.ticketTypes.find((x) => x.id === i.typeId);
				return t ? { ...i, type: t, subtotal: t.price * i.qty } : null;
			})
			.filter(Boolean);
	}
	cartTotal(eventId) {
		return this.cartLines(eventId).reduce((s, l) => s + l.subtotal, 0);
	}

	checkout(eventId, attendee, payments) {
		const e = this.event(eventId);
		const lines = this.cartLines(eventId);
		const subtotal = this.cartTotal(eventId);
		const fees = Math.round(subtotal * 0.015) + (subtotal > 0 ? 200 : 0);
		const total = subtotal + fees;
		const ref = `EV-${rand(6)}`;
		const issued = [];

		lines.forEach((line) => {
			for (let i = 0; i < line.qty; i++) {
				const ticket = {
					id: newId('tk'),
					eventId,
					typeId: line.type.id,
					typeName: line.type.name,
					price: line.type.price,
					status: 'valid',
					date: new Date().toISOString(),
					orderRef: ref,
					attendee: attendee.name,
					email: attendee.email,
					code: `EV-${rand(4)}-${rand(4)}-${rand(4)}`
				};
				issued.push(ticket);
				this.tickets = [ticket, ...this.tickets];
			}
			const t = e.ticketTypes.find((x) => x.id === line.type.id);
			if (t) t.sold = Math.min(t.qty, t.sold + line.qty);
		});

		const order = {
			id: newId('or'),
			ref,
			eventId,
			lines: lines.map((l) => ({ name: l.type.name, qty: l.qty, price: l.type.price })),
			subtotal,
			fees,
			total,
			buyer: attendee.name,
			email: attendee.email,
			at: new Date().toISOString(),
			method: payments?.method ?? 'card',
			status: 'paid',
			ticketIds: issued.map((t) => t.id)
		};
		this.orders = [order, ...this.orders];

		this.notify({
			kind: 'payment',
			title: subtotal === 0 ? 'You’re registered' : `Payment confirmed — ${total.toLocaleString()}`,
			body: `${e.title} · ${issued.length} ticket${issued.length > 1 ? 's' : ''}. Ref ${ref}`,
			href: '/tickets'
		});
		this.notify({
			kind: 'reminder',
			title: 'Reminder set',
			body: `We’ll remind you 24 hours before ${e.title}.`,
			href: '/tickets'
		});
		this.clearCart();
		return order;
	}

	/* ---------- ticket lifecycle ---------- */
	qrPayload(ticket) {
		if (!ticket) return '';
		const bucket = Math.floor(Date.now() / 30000);
		const sig = hash(`${ticket.code}:${bucket}`);
		return `evently://t/${ticket.code}?s=${sig}`;
	}
	transferTicket(id, toName, toEmail) {
		const t = this.ticket(id);
		if (!t) return;
		t.attendee = toName;
		t.email = toEmail;
		t.code = `EV-${rand(4)}-${rand(4)}-${rand(4)}`;
		t.transferred = true;
		this.notify({
			kind: 'ticket',
			title: 'Ticket transferred',
			body: `${toName} now holds this ticket. Your old QR is void.`,
			href: `/tickets/${id}`
		});
		this.say('Ticket transferred — a new QR was issued');
	}
	requestRefund(id) {
		const t = this.ticket(id);
		if (!t) return;
		t.status = 'refund-requested';
		this.say('Refund requested — organizer has 5 days to respond', 'info');
		this.notify({
			kind: 'payment',
			title: 'Refund requested',
			body: `${this.event(t.eventId)?.title} · review in progress.`,
			href: `/tickets/${id}`
		});
	}
	cancelTicket(id) {
		const t = this.ticket(id);
		if (!t) return;
		t.status = 'cancelled';
		this.say('Ticket cancelled');
	}

	/* ---------- check-in ---------- */
	checkIn(code, opts = {}) {
		const t = this.tickets.find((x) => x.code === code || x.id === code);
		if (!t) return { ok: false, reason: 'not-found', message: 'Ticket not recognised' };
		if (t.status === 'cancelled')
			return { ok: false, reason: 'cancelled', message: 'This ticket was cancelled', ticket: t };
		if (t.status === 'refunded')
			return { ok: false, reason: 'refunded', message: 'This ticket was refunded', ticket: t };
		if (t.checkedInAt)
			return {
				ok: false,
				reason: 'duplicate',
				message: `Already checked in at ${new Date(t.checkedInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
				ticket: t
			};
		t.checkedInAt = new Date().toISOString();
		t.status = 'used';
		t.checkedInBy = opts.by ?? 'Door staff';
		this.notify({
			kind: 'checkin',
			title: 'You’re checked in',
			body: `${this.event(t.eventId)?.title} · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
			href: `/tickets/${t.id}`
		});
		return { ok: true, ticket: t, message: 'Checked in — enjoy the event' };
	}

	checkInStats(eventId) {
		const all = this.eventTickets(eventId);
		return {
			total: all.length,
			checkedIn: all.filter((t) => t.checkedInAt).length,
			valid: all.filter((t) => t.status === 'valid').length,
			refunded: all.filter((t) => t.status === 'refunded' || t.status === 'refund-requested').length
		};
	}

	/* ---------- organizer ---------- */
	createEvent(payload) {
		const ev = {
			id: newId('e'),
			slug: payload.slug,
			organizerId: this.myOrganizerId,
			status: 'published',
			sold: 0,
			rating: 0,
			reviewCount: 0,
			highlights: [],
			agenda: [],
			speakers: [],
			sponsors: [],
			faqs: [],
			policies: {},
			accessibility: [],
			reviews: [],
			photoCount: 0,
			...payload
		};
		this.events = [ev, ...this.events];
		this.notify({
			kind: 'update',
			title: 'Event published',
			body: `${ev.title} is live. Share the link to start selling.`,
			href: `/events/${ev.slug}`
		});
		return ev;
	}
	updateEvent(id, patch) {
		const e = this.event(id);
		if (e) Object.assign(e, patch);
	}
	publishEvent(id) {
		this.updateEvent(id, { status: 'published' });
		this.say('Event published');
	}
	cancelEvent(id) {
		this.updateEvent(id, { status: 'cancelled' });
		this.say('Event cancelled — attendees were notified', 'info');
	}
	duplicateEvent(id) {
		const e = this.event(id);
		if (!e) return;
		const copy = {
			...structuredClone(e),
			id: newId('e'),
			slug: `${e.slug}-copy`,
			title: `${e.title} (copy)`,
			status: 'draft',
			sold: 0
		};
		this.events = [copy, ...this.events];
		this.say('Duplicated as draft');
		return copy;
	}
	approveEvent(id) {
		this.updateEvent(id, { status: 'published' });
		this.say('Event approved and published', 'check');
	}
	rejectEvent(id) {
		this.updateEvent(id, { status: 'rejected' });
		this.say('Event rejected', 'info');
	}

	/* ---------- session ---------- */
	signIn({ name, email, phone, role = 'attendee', organizer } = {}) {
		this.user = {
			...DEFAULT_USER,
			id: newId('u'),
			name: name || DEFAULT_USER.name,
			handle: (name || DEFAULT_USER.name).toLowerCase().replace(/\s+/g, '.'),
			email: email || DEFAULT_USER.email,
			phone: phone || DEFAULT_USER.phone,
			organizerId: organizer || DEFAULT_USER.organizerId,
			verified: { ...DEFAULT_USER.verified },
			followers: 12,
			following: 40
		};
		this.role = role;
		this.onboarded = true;
	}

	signInAsDemo(role = 'attendee') {
		this.role = role;
		if (role === 'guest') {
			this.user = null;
			return;
		}
		this.user = { ...DEFAULT_USER, verified: { ...DEFAULT_USER.verified } };
		this.onboarded = true;
	}

	switchRole(role) {
		this.role = role;
		if (role === 'guest') this.user = null;
		else if (!this.user) this.signInAsDemo(role);
		this.say(`Viewing as ${this.roleName}`, 'user');
	}

	signOut() {
		this.user = null;
		this.role = 'guest';
		this.onboarded = false;
		this.launched = false;
		this.say('Signed out');
	}

	completeOnboarding({ interests = [], city = 'Lagos' } = {}) {
		this.interests = interests.length ? interests : this.interests;
		this.city = city;
		this.onboarded = true;
	}

	/* ================= persistence ================= */
	save() {
		if (!browser) return;
		const snap = {};
		for (const k of PERSIST) {
			try {
				snap[k] = $state.snapshot(this[k]);
			} catch {
				snap[k] = this[k];
			}
		}
		try {
			localStorage.setItem(KEY, JSON.stringify(snap));
			return true;
		} catch (e) {
			/* Quota exceeded — usually a big picture. Retry once without pictures so the
			   rest of the state still survives, then tell the user. */
			try {
				const light = { ...snap };
				if (light.user && typeof light.user === 'object')
					light.user = { ...light.user, avatar: null, banner: null };
				if (Array.isArray(light.events))
					light.events = light.events.map((e) => ({ ...e, image: null }));
				localStorage.setItem(KEY, JSON.stringify(light));
				light.user && (this.user.avatar = null);
				light.user && (this.user.banner = null);
			} catch {
				/* still too big or storage disabled — nothing more we can do */
			}
			this.toast = {
				id: newId('t'),
				message: 'Storage is full — your pictures were not saved',
				icon: 'alert'
			};
			return false;
		}
	}

	load() {
		if (!browser) return;
		let raw;
		try {
			raw = JSON.parse(localStorage.getItem(KEY) || 'null');
		} catch {
			raw = null;
		}
		if (!raw) return;
		for (const k of PERSIST) {
			if (raw[k] === undefined) continue;
			try {
				this[k] = raw[k];
			} catch {
				/* read-only — ignore */
			}
		}
	}

	resetData() {
		this.events = EVENTS.map((e) => ({ ...e }));
		this.organizers = ORGANIZERS.map((o) => ({ ...o }));
		this.people = PEOPLE.map((p) => ({ ...p }));
		this.tickets = SEED_TICKETS.map((t) => ({ ...t }));
		this.notifications = SEED_NOTIFICATIONS.map((n) => ({ ...n }));
		this.orders = [];
		this.savedEvents = ['e2', 'e7'];
		this.followingOrg = ['o1', 'o3'];
		this.waitlist = [];
		this.say('Demo data restored', 'check');
	}
}

export const app = new AppStore();
if (browser) app.load();

/* autopersist — debounced */
if (browser) {
	/* Reading only `app[k]` tracks the top-level field, so a nested write such as
	   `app.user.avatar = …` would never re-run the effect. Walk the value instead so
	   every nested source is subscribed to. */
	const deepTouch = (v, seen = new Set()) => {
		if (!v || typeof v !== 'object' || seen.has(v)) return;
		seen.add(v);
		if (Array.isArray(v)) for (let i = 0; i < v.length; i++) deepTouch(v[i], seen);
		else for (const k in v) deepTouch(v[k], seen);
	};

	let timer;
	$effect.root(() => {
		$effect(() => {
			// touch every persisted field so this effect re-runs on any change
			for (const k of PERSIST) deepTouch(app[k]);
			clearTimeout(timer);
			timer = setTimeout(() => app.save(), 220);
		});
	});
}

export { now };
