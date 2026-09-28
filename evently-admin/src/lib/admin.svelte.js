/**
 * Admin console state.
 * Reads the shared event catalogue from the core package (in production: the same API),
 * and owns everything only staff can touch — queues, moderation, payouts, audit.
 */
import { browser } from '$app/environment';
import { app as core } from '$shared/lib/state.svelte.js';

const KEY = 'evently.admin.v1';

export const STAFF_ROLES = {
	super: { id: 'super', name: 'Super admin', desc: 'Everything, including payouts and staff' },
	moderator: { id: 'moderator', name: 'Moderator', desc: 'Approvals, reports, content' },
	support: { id: 'support', name: 'Support', desc: 'Users, disputes, read-only payouts' },
	finance: { id: 'finance', name: 'Finance', desc: 'Payouts, refunds, taxes — no content' }
};

const PERSIST = ['session', 'queue', 'reports', 'payouts', 'audit', 'suspended', 'theme'];

class AdminStore {
	session = $state(null);
	theme = $state('light');
	toast = $state(null);

	queue = $state([
		{
			id: 'q1',
			title: 'Lagos Crypto Mixer Night',
			org: 'Unverified Host',
			orgId: 'new-1',
			category: 'nightlife',
			tickets: 1,
			price: 25000,
			at: new Date(Date.now() - 3600000).toISOString(),
			risk: 'high',
			score: 82,
			flags: ['New organiser', 'No business documents', 'High-risk keywords'],
			notes: 'Auto-flagged by the risk engine.'
		},
		{
			id: 'q2',
			title: 'Warehouse Rave — Ikoyi',
			org: 'Night Shift Co',
			orgId: 'o1',
			category: 'music',
			tickets: 2,
			price: 12000,
			at: new Date(Date.now() - 7200000).toISOString(),
			risk: 'medium',
			score: 44,
			flags: ['Alcohol served at a 16+ event'],
			notes: 'Organiser asked to change the age limit.'
		},
		{
			id: 'q3',
			title: 'Free iPad Giveaway Live',
			org: 'Prize Hub',
			orgId: 'new-2',
			category: 'community',
			tickets: 1,
			price: 0,
			at: new Date(Date.now() - 14400000).toISOString(),
			risk: 'high',
			score: 96,
			flags: ['Giveaway pattern', '10 duplicate events', 'Account created today'],
			notes: '4 user reports in the last hour.'
		},
		{
			id: 'q4',
			title: 'Sunday Supper Club',
			org: 'Yard & Table',
			orgId: 'o3',
			category: 'food',
			tickets: 3,
			price: 15000,
			at: new Date(Date.now() - 20000000).toISOString(),
			risk: 'low',
			score: 8,
			flags: [],
			notes: 'Verified organiser, 9 previous events.'
		}
	]);

	reports = $state([
		{
			id: 'r1',
			kind: 'Scam / fake event',
			target: 'Free iPad Giveaway Live',
			by: '4 reporters',
			at: new Date(Date.now() - 1800000).toISOString(),
			sev: 'high',
			body: 'Reported as a giveaway scam. Asks for a “processing fee” after signup.'
		},
		{
			id: 'r2',
			kind: 'Wrong date or venue',
			target: 'Warehouse Rave — Ikoyi',
			by: 'Tunde Bakare',
			at: new Date(Date.now() - 9000000).toISOString(),
			sev: 'low',
			body: 'Listing says Ikoyi, organiser’s story says Lekki Phase 1.'
		},
		{
			id: 'r3',
			kind: 'Harassment in event chat',
			target: 'Design After Dark',
			by: 'Anonymous attendee',
			at: new Date(Date.now() - 20000000).toISOString(),
			sev: 'medium',
			body: 'Direct messages from another attendee after the event.'
		},
		{
			id: 'r4',
			kind: 'Chargeback — card not present',
			target: 'Afrobeats Live & Direct',
			by: 'Issuing bank',
			at: new Date(Date.now() - 40000000).toISOString(),
			sev: 'high',
			body: 'Cardholder disputes two VIP tickets. Respond before the 7-day deadline.'
		}
	]);

	users = $state([
		{ id: 'u1', name: 'Amaka Obi', handle: 'amaka', role: 'attendee', tickets: 3, joined: '2024', status: 'active', kyc: 'none' },
		{ id: 'u2', name: 'Tunde Bakare', handle: 'tunde', role: 'attendee', tickets: 12, joined: '2023', status: 'active', kyc: 'none' },
		{ id: 'o1', name: 'Lagos Sound Collective', handle: 'lagossound', role: 'organizer', events: 4, joined: '2021', status: 'active', kyc: 'verified' },
		{ id: 'o3', name: 'Yard & Table', handle: 'yardandtable', role: 'organizer', events: 2, joined: '2022', status: 'active', kyc: 'verified' },
		{ id: 'x1', name: 'Prize Hub', handle: 'prizehub', role: 'organizer', events: 10, joined: '2026', status: 'suspended', kyc: 'rejected' },
		{ id: 'u3', name: 'Sade Lawal', handle: 'sade', role: 'attendee', tickets: 7, joined: '2024', status: 'active', kyc: 'none' }
	]);

	payouts = $state([
		{ id: 'p1', org: 'Lagos Sound Collective', amount: 4820000, status: 'Pending', date: 'In 2 days', kyc: 'verified' },
		{ id: 'p2', org: 'Techstars Lagos', amount: 12400000, status: 'Paid', date: 'Paid 3 days ago', kyc: 'verified' },
		{ id: 'p3', org: 'Studio Nine', amount: 890000, status: 'On hold', date: 'KYC review', kyc: 'pending' },
		{ id: 'p4', org: 'Build Space Africa', amount: 340000, status: 'Pending', date: 'In 2 days', kyc: 'pending' }
	]);

	audit = $state([
		{ id: 'a1', who: 'admin@evently', what: 'Rejected event “Free iPad Giveaway”', at: new Date(Date.now() - 120000).toISOString() },
		{ id: 'a2', who: 'system', what: 'Flagged 10 duplicate events from one device', at: new Date(Date.now() - 1080000).toISOString() },
		{ id: 'a3', who: 'admin@evently', what: 'Refunded order EV-8KD92', at: new Date(Date.now() - 3600000).toISOString() },
		{ id: 'a4', who: 'system', what: 'Payout batch #482 completed (₦18.4M)', at: new Date(Date.now() - 10800000).toISOString() },
		{ id: 'a5', who: 'admin@evently', what: 'Suspended @prizehub', at: new Date(Date.now() - 14400000).toISOString() }
	]);

	suspended = $state(['x1']);

	/* ---------- derived ---------- */
	get me() {
		return this.session;
	}
	get roleName() {
		return STAFF_ROLES[this.session?.role]?.name ?? 'Staff';
	}
	get can() {
		const r = this.session?.role ?? 'support';
		return {
			approve: ['super', 'moderator'].includes(r),
			moderate: ['super', 'moderator'].includes(r),
			users: ['super', 'moderator', 'support'].includes(r),
			payouts: ['super', 'finance'].includes(r),
			staff: r === 'super',
			refunds: ['super', 'finance', 'support'].includes(r)
		};
	}
	get events() {
		return core.events;
	}
	get liveEvents() {
		return core.events.filter((e) => e.status === 'published');
	}
	get gmv30d() {
		return core.events.reduce(
			(s, e) => s + e.ticketTypes.reduce((x, t) => x + t.sold * t.price, 0),
			0
		);
	}
	get pendingPayouts() {
		return this.payouts.filter((p) => p.status === 'Pending');
	}

	/* ---------- actions ---------- */
	say(message, icon = 'check') {
		this.toast = { id: Math.random().toString(36).slice(2), message, icon };
		setTimeout(() => {
			if (this.toast?.message === message) this.toast = null;
		}, 2600);
	}

	log(what) {
		this.audit = [
			{ id: 'a' + Math.random().toString(36).slice(2), who: this.session?.email ?? 'admin@evently', what, at: new Date().toISOString() },
			...this.audit
		].slice(0, 100);
	}

	signIn(email, role = 'moderator') {
		this.session = { email, role, name: email.split('@')[0], at: new Date().toISOString() };
		this.log(`${STAFF_ROLES[role].name} signed in`);
	}
	signOut() {
		this.log('Signed out');
		this.session = null;
	}

	approve(id) {
		const q = this.queue.find((x) => x.id === id);
		this.queue = this.queue.filter((x) => x.id !== id);
		this.log(`Approved event “${q?.title}”`);
		this.say('Event approved and published');
	}
	reject(id, reason = 'policy') {
		const q = this.queue.find((x) => x.id === id);
		this.queue = this.queue.filter((x) => x.id !== id);
		this.log(`Rejected event “${q?.title}” (${reason})`);
		this.say('Event rejected — organiser notified');
	}
	requestInfo(id) {
		this.log(`Requested more information on “${this.queue.find((x) => x.id === id)?.title}”`);
		this.say('Information request sent');
	}

	resolveReport(id, action = 'dismissed') {
		const r = this.reports.find((x) => x.id === id);
		this.reports = this.reports.filter((x) => x.id !== id);
		this.log(`Report ${id} ${action} — ${r?.kind}`);
		this.say(action === 'dismissed' ? 'Report dismissed' : 'Action taken and logged');
	}

	setUserStatus(id, status) {
		this.users = this.users.map((u) => (u.id === id ? { ...u, status } : u));
		this.suspended = status === 'suspended' ? [...new Set([...this.suspended, id])] : this.suspended.filter((x) => x !== id);
		this.log(`${status === 'suspended' ? 'Suspended' : 'Reinstated'} user ${id}`);
		this.say(status === 'suspended' ? 'User suspended' : 'User reinstated');
	}

	setKyc(id, kyc) {
		this.users = this.users.map((u) => (u.id === id ? { ...u, kyc } : u));
		this.log(`KYC set to ${kyc} for ${id}`);
		this.say(`KYC marked ${kyc}`);
	}

	payout(id, status) {
		this.payouts = this.payouts.map((p) => (p.id === id ? { ...p, status } : p));
		this.log(`Payout ${id} → ${status}`);
		this.say(status === 'Paid' ? 'Payout released' : 'Payout status updated');
	}

	/* ---------- persistence ---------- */
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
		} catch {
			/* quota */
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
		for (const k of PERSIST) if (raw[k] !== undefined) this[k] = raw[k];
	}
}

export const admin = new AdminStore();
if (browser) admin.load();

if (browser) {
	let timer;
	$effect.root(() => {
		$effect(() => {
			for (const k of PERSIST) void admin[k];
			clearTimeout(timer);
			timer = setTimeout(() => admin.save(), 220);
		});
	});
}
