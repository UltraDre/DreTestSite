/* ============================================================
   Seed data — swap these for API calls in production.
   All money is stored in NGN (kobo-safe integers) and converted at display time.
   ============================================================ */

export const CURRENCIES = {
	NGN: { symbol: '₦', rate: 1, dp: 0 },
	USD: { symbol: '$', rate: 1 / 1550, dp: 2 },
	GBP: { symbol: '£', rate: 1 / 1970, dp: 2 },
	EUR: { symbol: '€', rate: 1 / 1680, dp: 2 }
};

export const CATEGORIES = [
	{ id: 'music', name: 'Music', hue: 258 },
	{ id: 'tech', name: 'Tech', hue: 218 },
	{ id: 'business', name: 'Business', hue: 168 },
	{ id: 'sports', name: 'Sports', hue: 12 },
	{ id: 'arts', name: 'Arts', hue: 320 },
	{ id: 'food', name: 'Food', hue: 32 },
	{ id: 'health', name: 'Health', hue: 148 },
	{ id: 'community', name: 'Community', hue: 190 }
];

export const INTERESTS = CATEGORIES.map((c) => ({ id: c.id, name: c.name, hue: c.hue })).concat([
	{ id: 'film', name: 'Film', hue: 274 },
	{ id: 'gaming', name: 'Gaming', hue: 288 },
	{ id: 'fashion', name: 'Fashion', hue: 340 },
	{ id: 'finance', name: 'Finance', hue: 200 },
	{ id: 'kids', name: 'Kids & Family', hue: 48 },
	{ id: 'nightlife', name: 'Nightlife', hue: 252 }
]);

export const ROLES = {
	guest: { id: 'guest', name: 'Guest / visitor', desc: 'Browse without an account' },
	attendee: { id: 'attendee', name: 'Attendee', desc: 'Discover, save, buy tickets, check in' },
	organizer: { id: 'organizer', name: 'Organizer', desc: 'Create and run events' },
	cohost: { id: 'cohost', name: 'Co-host / team', desc: 'Help manage an organizer’s events' },
	staff: { id: 'staff', name: 'Staff / scanner', desc: 'Scan tickets at the door' },
	speaker: { id: 'speaker', name: 'Speaker / performer', desc: 'Appear on agendas' },
	sponsor: { id: 'sponsor', name: 'Sponsor / exhibitor', desc: 'Booth, leads, brand placement' },
	venue: { id: 'venue', name: 'Venue', desc: 'Manage your space & calendar' },
	admin: { id: 'admin', name: 'Admin / moderator', desc: 'Approvals, moderation, payouts' }
};

/* ---------- helpers ---------- */
const DAY = 86400000;
const HOUR = 3600000;
export const now = Date.now();
const at = (days, hour = 18, min = 0) => {
	const d = new Date(now + days * DAY);
	d.setHours(hour, min, 0, 0);
	return d.toISOString();
};

let uid = 1000;
export const newId = (p = 'x') => `${p}_${(uid++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const DEFAULT_POLICIES = {
	refund: 'Full refund up to 7 days before the event. 50% within 7 days. No refunds after doors open.',
	transfer: 'Tickets can be transferred to another person free of charge until check-in.',
	age: 'All ages welcome. Under-16s must be accompanied by an adult.',
	dress: 'Smart casual.',
	accessibility: 'Step-free entry, accessible toilets and reserved seating available.'
};

const DEFAULT_FAQS = [
	{
		q: 'Do I need to print my ticket?',
		a: 'No. Your QR code works straight from the app or your wallet pass, even offline.'
	},
	{
		q: 'Can I transfer my ticket to a friend?',
		a: 'Yes — open the ticket and tap Transfer. The QR is re-issued in their name.'
	},
	{
		q: 'What time should I arrive?',
		a: 'Doors open 45 minutes before the first session. Entry is quicker if you arrive early.'
	}
];

/* ---------- venues ---------- */
export const VENUES = [
	{ id: 'v1', name: 'Eko Convention Centre', address: '1415 Adetokunbo Ademola St, Victoria Island', city: 'Lagos', lat: 6.4281, lng: 3.4219 },
	{ id: 'v2', name: 'Landmark Centre', address: '2-4 Water Corporation Rd, Victoria Island', city: 'Lagos', lat: 6.4269, lng: 3.4158 },
	{ id: 'v3', name: 'Terra Kulture', address: '1376 Tiamiyu Savage St, Victoria Island', city: 'Lagos', lat: 6.4302, lng: 3.4231 },
	{ id: 'v4', name: 'Balmoral Convention Center', address: 'Billings Way, Oregun, Ikeja', city: 'Lagos', lat: 6.5941, lng: 3.3446 },
	{ id: 'v5', name: 'Zone Tech Park', address: 'Plot 9, Gbagada Industrial Scheme', city: 'Lagos', lat: 6.5551, lng: 3.3824 },
	{ id: 'v6', name: 'Freedom Park', address: '1 Hospital Road, Broad Street, Lagos Island', city: 'Lagos', lat: 6.4474, lng: 3.3956 },
	{ id: 'v7', name: 'Alliance Française de Lagos', address: '9 Osborne Rd, Ikoyi', city: 'Lagos', lat: 6.4432, lng: 3.4301 },
	{ id: 'v8', name: 'Muri Okunola Park', address: 'Akin Adesola St, Victoria Island', city: 'Lagos', lat: 6.4319, lng: 3.4187 },
	{ id: 'v9', name: 'Online — Zoom', address: 'Link sent 1 hour before start', city: 'Virtual', lat: null, lng: null }
];

/* ---------- organizers ---------- */
export const ORGANIZERS = [
	{
		id: 'o1', name: 'Lagos Sound Collective', handle: 'lagossound', hue: 258,
		bio: 'We throw the shows that Lagos talks about the next morning. Live music, sound systems, and community first.',
		verified: true, followers: 18420, rating: 4.8, reviewCount: 612, website: 'lagossound.co',
		socials: { ig: '@lagossound', x: '@lagossound' }, city: 'Lagos', joined: '2021',
		badges: ['id', 'business', 'payout']
	},
	{
		id: 'o2', name: 'Techstars Lagos', handle: 'techstarslagos', hue: 218,
		bio: 'Founder-first programming: demo days, deep dives, and operator dinners across West Africa.',
		verified: true, followers: 32100, rating: 4.7, reviewCount: 288, website: 'techstars.com/lagos',
		socials: { ig: '@techstarslagos', x: '@techstarslagos' }, city: 'Lagos', joined: '2019',
		badges: ['id', 'business', 'payout']
	},
	{
		id: 'o3', name: 'Yard & Table', handle: 'yardandtable', hue: 32,
		bio: 'Food festivals, supper clubs and night markets celebrating West African produce.',
		verified: true, followers: 9880, rating: 4.6, reviewCount: 143, website: 'yardandtable.ng',
		socials: { ig: '@yardandtable' }, city: 'Lagos', joined: '2022', badges: ['id', 'payout']
	},
	{
		id: 'o4', name: 'Run Lagos', handle: 'runlagos', hue: 12,
		bio: 'Community runs, marathons and open training sessions for every pace.',
		verified: false, followers: 4310, rating: 4.5, reviewCount: 61, website: 'runlagos.ng',
		socials: { ig: '@runlagos' }, city: 'Lagos', joined: '2023', badges: ['id']
	},
	{
		id: 'o5', name: 'Studio Nine', handle: 'studionine', hue: 320,
		bio: 'Contemporary art, film screenings and design talks in a converted warehouse.',
		verified: true, followers: 7640, rating: 4.9, reviewCount: 97, website: 'studionine.art',
		socials: { ig: '@studionine' }, city: 'Lagos', joined: '2020', badges: ['id', 'business']
	},
	{
		id: 'o6', name: 'Build Space Africa', handle: 'buildspaceafrica', hue: 190,
		bio: 'Hackathons and builder weekends for engineers across the continent.',
		verified: false, followers: 5210, rating: 4.4, reviewCount: 38, website: 'buildspace.africa',
		socials: { x: '@buildspaceafrica' }, city: 'Lagos', joined: '2024', badges: []
	}
];

/* ---------- people ---------- */
export const PEOPLE = [
	{ id: 'p1', name: 'Amaka Obi', handle: 'amaka', hue: 258, role: 'Attendee', bio: 'Live music + design. Currently in my running era.', verified: false, followers: 214, following: 186, city: 'Lagos' },
	{ id: 'p2', name: 'Tunde Bakare', handle: 'tunde', hue: 218, role: 'Attendee', bio: 'PM by day, vinyl collector by night.', verified: false, followers: 903, following: 421, city: 'Lagos' },
	{ id: 'p3', name: 'Ngozi Adeyemi', handle: 'ngozi', hue: 320, role: 'Speaker', bio: 'Creative director. Talks about craft, colour and commerce.', verified: true, followers: 12400, following: 302, city: 'Lagos' },
	{ id: 'p4', name: 'Emeka Nwosu', handle: 'emeka', hue: 168, role: 'Speaker', bio: 'Founder @ Paystack-alumni. Building fintech rails.', verified: true, followers: 22100, following: 214, city: 'Lagos' },
	{ id: 'p5', name: 'Sade Lawal', handle: 'sade', hue: 12, role: 'Attendee', bio: 'Marathoner. 4 sub-4 finishes and counting.', verified: false, followers: 512, following: 233, city: 'Abuja' },
	{ id: 'p6', name: 'Femi Ade', handle: 'femi', hue: 32, role: 'Attendee', bio: 'Eats everything. Reviews everything.', verified: false, followers: 1780, following: 505, city: 'Lagos' }
];

/* ---------- events ---------- */
const mk = (e) => ({
	mode: 'in-person',
	tags: [],
	currency: 'NGN',
	status: 'published',
	rating: 4.6,
	reviewCount: 40,
	highlights: [],
	agenda: [],
	speakers: [],
	sponsors: [],
	faqs: DEFAULT_FAQS,
	policies: DEFAULT_POLICIES,
	accessibility: ['Step-free access', 'Accessible toilets'],
	language: 'English',
	ageLimit: 'All ages',
	sold: 0,
	...e
});

export const EVENTS = [
	mk({
		id: 'e1', slug: 'lagos-sound-festival-2026', organizerId: 'o1', category: 'music',
		title: 'Lagos Sound Festival 2026', venueId: 'v8', hue: 258,
		start: at(6, 16), end: at(6, 23), doors: at(6, 15),
		summary: 'Three stages, one park, twenty artists.',
		description:
			'The city’s biggest day-party-meets-festival returns to Muri Okunola Park. Three stages, a food yard curated by Yard & Table, and a sunset set you will hear about for a year. Expect afrobeats, amapiano, alté, highlife and a soundsystem built for the park.',
		highlights: ['3 stages · 20 artists', 'Sunset headline set', 'Food yard with 18 vendors', 'Free water stations'],
		tags: ['festival', 'afrobeats', 'outdoor'],
		capacity: 5000, sold: 4128,
		ticketTypes: [
			{ id: 't1', name: 'Early Bird', price: 12000, qty: 800, sold: 800, perks: 'All stages · Early entry 2pm', salesEnd: at(2, 23) },
			{ id: 't2', name: 'General Admission', price: 18000, qty: 3200, sold: 2870, perks: 'All stages · Entry from 3pm' },
			{ id: 't3', name: 'VIP — Front & Lounge', price: 65000, qty: 400, sold: 312, perks: 'Front pit · Lounge · Free drinks · Express lane' }
		],
		agenda: [
			{ time: '15:00', title: 'Doors open — warm up set', who: 'DJ TGarbs' },
			{ time: '16:30', title: 'Stage 2: Alté showcase', who: 'Three rising acts' },
			{ time: '18:00', title: 'Main stage opening', who: 'Lagos Sound Allstars' },
			{ time: '19:45', title: 'Sunset set', who: 'Headline artist' },
			{ time: '21:30', title: 'Closing party', who: 'Resident DJs' }
		],
		speakers: [
			{ name: 'DJ TGarbs', role: 'Warm-up set' },
			{ name: 'Lagos Sound Allstars', role: 'Live band' },
			{ name: 'Sunny Ade Jnr.', role: 'Headline' }
		],
		sponsors: [{ name: 'Star Radler', tier: 'Headline' }, { name: 'Bolt', tier: 'Mobility' }, { name: 'Pepper Soup Co.', tier: 'Food' }],
		reviews: [
			{ id: 'r1', by: 'p2', name: 'Tunde Bakare', rating: 5, date: 'Aug 2026', text: 'Sound quality was unreal. Bring a hat.' },
			{ id: 'r2', by: 'p1', name: 'Amaka Obi', rating: 4, date: 'Aug 2026', text: 'VIP lounge worth it. Entry queues were long.' }
		],
		photoCount: 218, featured: true
	}),
	mk({
		id: 'e2', slug: 'africa-fintech-summit', organizerId: 'o2', category: 'business',
		title: 'Africa Fintech Summit', venueId: 'v1', hue: 168,
		start: at(13, 9), end: at(14, 18), doors: at(13, 8),
		summary: 'Payments, credit and regulation — the operators’ summit.',
		description:
			'Two days of unfiltered operator talks on payments infrastructure, credit scoring, cross-border settlement and the new regulatory landscape. Includes the founder-investor matchmaking lounge and the 2026 payments benchmark report.',
		highlights: ['60+ speakers', 'Benchmark report launch', 'Investor matchmaking', 'Regulator fireside chat'],
		tags: ['conference', 'fintech', 'b2b'],
		capacity: 1200, sold: 743,
		ticketTypes: [
			{ id: 't1', name: 'Standard Delegate', price: 85000, qty: 700, sold: 480, perks: 'Both days · Sessions · Lunch' },
			{ id: 't2', name: 'Operator Pass', price: 150000, qty: 250, sold: 190, perks: '+ Workshops · Lounge access' },
			{ id: 't3', name: 'Virtual Attendance', price: 25000, qty: 500, sold: 73, perks: 'Livestream + recordings for 90 days' }
		],
		agenda: [
			{ time: '09:00', title: 'Opening keynote: the next 100M accounts', who: 'Emeka Nwosu' },
			{ time: '10:30', title: 'Panel: Cross-border settlement reality check', who: '4 operators' },
			{ time: '12:00', title: 'Workshop: Credit models that survive a downturn', who: 'Ngozi Adeyemi' },
			{ time: '14:00', title: 'Regulator fireside chat', who: 'CBN liaison' },
			{ time: '16:00', title: 'Demo hour', who: '12 startups' }
		],
		speakers: [
			{ name: 'Emeka Nwosu', role: 'Founder, Kola Pay' },
			{ name: 'Ngozi Adeyemi', role: 'Creative Director' },
			{ name: 'Bisi Oni', role: 'Partner, Verod Capital' }
		],
		sponsors: [{ name: 'Kuda', tier: 'Platinum' }, { name: 'Flutterwave', tier: 'Gold' }],
		reviews: [{ id: 'r3', by: 'p6', name: 'Femi Ade', rating: 5, date: 'Mar 2026', text: 'Best operator content on the continent, no fluff.' }],
		photoCount: 96, mode: 'hybrid', onlineUrl: 'https://zoom.us/j/fintech-summit'
	}),
	mk({
		id: 'e3', slug: 'naija-street-food-night-market', organizerId: 'o3', category: 'food',
		title: 'Naija Street Food Night Market', venueId: 'v6', hue: 32,
		start: at(2, 17), end: at(2, 23), doors: at(2, 17),
		summary: '30 vendors. One night. Bring cash and an empty stomach.',
		description:
			'Freedom Park turns into a night market: suya, abacha, bole, asun, small chops and a dessert row that will ruin your diet. Live cooking demos on the hour and a pepper-eating contest at 9pm.',
		highlights: ['30 vendors', 'Live cooking demos', 'Pepper-eating contest', 'Cashless wristband payments'],
		tags: ['food', 'night market', 'family'],
		capacity: 1500, sold: 1202,
		ticketTypes: [
			{ id: 't1', name: 'Entry', price: 3000, qty: 1200, sold: 1080, perks: 'Entry + tasting map' },
			{ id: 't2', name: 'Tasting Wristband', price: 15000, qty: 300, sold: 122, perks: 'Entry + 8 tastings + 2 drinks' }
		],
		agenda: [
			{ time: '17:00', title: 'Market opens' },
			{ time: '18:00', title: 'Live demo: suya masterclass' },
			{ time: '20:00', title: 'Dessert row tasting flight' },
			{ time: '21:00', title: 'Pepper-eating contest' }
		],
		speakers: [{ name: 'Chef Tolu', role: 'Demo host' }, { name: 'Ada the Baker', role: 'Dessert row' }],
		sponsors: [{ name: 'Maltina', tier: 'Partner' }],
		reviews: [{ id: 'r4', by: 'p1', name: 'Amaka Obi', rating: 5, date: 'Jul 2026', text: 'The asun. That is all I will say.' }],
		photoCount: 341
	}),
	mk({
		id: 'e4', slug: 'build-weekend-ai-hackathon', organizerId: 'o6', category: 'tech',
		title: 'Build Weekend: AI Hackathon', venueId: 'v5', hue: 190,
		start: at(20, 9), end: at(22, 18), doors: at(20, 8),
		summary: '48 hours, 30 teams, one question: what should be automated?',
		description:
			'A weekend hackathon for engineers, designers and PMs. Form a team on Friday or arrive with one. Mentors on site all weekend, cloud credits provided, and a demo session with a ₦5M prize pool.',
		highlights: ['48 hours', '₦5M prize pool', 'Mentors on site', 'Cloud credits + free meals'],
		tags: ['hackathon', 'ai', 'builders'],
		capacity: 300, sold: 288,
		ticketTypes: [
			{ id: 't1', name: 'Builder Ticket', price: 0, qty: 240, sold: 240, perks: 'Free · Meals · Swag' },
			{ id: 't2', name: 'Supporter Ticket', price: 25000, qty: 60, sold: 48, perks: 'Free · Meals · Swag · Mentor dinner' }
		],
		agenda: [
			{ time: '09:00', title: 'Team formation & idea pitches' },
			{ time: '12:00', title: 'Hacking begins' },
			{ time: '15:00', title: 'Workshop: shipping an agent in 4 hours' },
			{ time: '14:00', title: 'Demos & judging (Sunday)' }
		],
		speakers: [{ name: 'Ijeoma Nwafor', role: 'ML engineer' }, { name: 'Kunle Adeyemi', role: 'Staff engineer' }],
		sponsors: [{ name: 'AWS Activate', tier: 'Cloud' }, { name: 'Paystack', tier: 'Prize' }],
		reviews: [{ id: 'r5', by: 'p2', name: 'Tunde Bakare', rating: 5, date: 'Jun 2026', text: 'Met my co-founder in the lunch queue.' }],
		photoCount: 74, ageLimit: '16+'
	}),
	mk({
		id: 'e5', slug: 'lagos-marathon-sunrise-series', organizerId: 'o4', category: 'sports',
		title: 'Sunrise Series: 10K Run', venueId: 'v8', hue: 12,
		start: at(4, 6, 30), end: at(4, 9), doors: at(4, 6),
		summary: '10K through Ikoyi at sunrise. All paces welcome.',
		description:
			'A flat, fast 10K loop starting at Muri Okunola Park. Pace groups from 5:00 to 9:00 min/km, water stations every 2K, and free post-run physio. Chip timing included.',
		highlights: ['Chip timing', 'Pace groups', 'Free post-run physio', 'Medal for all finishers'],
		tags: ['running', '10k', 'outdoor'],
		capacity: 800, sold: 611,
		ticketTypes: [
			{ id: 't1', name: 'Standard Entry', price: 8000, qty: 700, sold: 560, perks: 'Race entry · Medal · Timing' },
			{ id: 't2', name: 'Entry + Kit', price: 18000, qty: 100, sold: 51, perks: 'Entry · Race tee · Breakfast' }
		],
		agenda: [
			{ time: '06:00', title: 'Kit pickup & warm-up' },
			{ time: '06:30', title: 'Start — wave A' },
			{ time: '06:38', title: 'Start — wave B' },
			{ time: '08:30', title: 'Prize giving & breakfast' }
		],
		speakers: [{ name: 'Sade Lawal', role: 'Pace leader, 5:00/km' }],
		sponsors: [{ name: 'Nike Run Club', tier: 'Partner' }],
		reviews: [{ id: 'r6', by: 'p5', name: 'Sade Lawal', rating: 5, date: 'Jul 2026', text: 'Best organised run in Lagos, hands down.' }],
		photoCount: 512
	}),
	mk({
		id: 'e6', slug: 'design-after-dark-studio-nine', organizerId: 'o5', category: 'arts',
		title: 'Design After Dark', venueId: 'v3', hue: 320,
		start: at(9, 19), end: at(9, 22), doors: at(9, 18, 30),
		summary: 'An evening of talks, type and tequila.',
		description:
			'Three designers, twenty minutes each, on the work they almost didn’t ship. Followed by an open studio, a risograph corner and a very informal bar.',
		highlights: ['3 talks', 'Open studio', 'Riso prints to take home', 'Bar by Yard & Table'],
		tags: ['design', 'talks', 'nightlife'],
		capacity: 200, sold: 176,
		ticketTypes: [
			{ id: 't1', name: 'Standard', price: 10000, qty: 180, sold: 164, perks: 'Talks · Open studio · 1 drink' }
		],
		agenda: [
			{ time: '18:30', title: 'Doors & drinks' },
			{ time: '19:00', title: 'Talk 1: The pitch we lost', who: 'Ngozi Adeyemi' },
			{ time: '19:45', title: 'Talk 2: Type as protest' },
			{ time: '20:30', title: 'Open studio & riso corner' }
		],
		speakers: [{ name: 'Ngozi Adeyemi', role: 'Creative Director' }, { name: 'Bayo Etti', role: 'Type designer' }],
		sponsors: [{ name: 'Fedrigoni', tier: 'Paper' }],
		reviews: [{ id: 'r7', by: 'p3', name: 'Ngozi Adeyemi', rating: 5, date: 'May 2026', text: 'Intimate, honest, and the prints were gorgeous.' }],
		photoCount: 63, ageLimit: '18+'
	}),
	mk({
		id: 'e7', slug: 'product-management-office-hours', organizerId: 'o2', category: 'tech',
		title: 'Product Office Hours (Virtual)', venueId: 'v9', hue: 218,
		start: at(1, 19), end: at(1, 21), doors: at(1, 18, 50),
		summary: 'Bring a problem, leave with a plan. Free, online, 20 seats.',
		description:
			'Small-group office hours for PMs and aspiring PMs. Twenty seats, breakout rooms of four, and a shared doc you keep afterwards. Bring one real problem.',
		highlights: ['20 seats only', 'Breakout rooms of 4', 'Shared notes', 'Free'],
		tags: ['virtual', 'product', 'career'],
		mode: 'online', onlineUrl: 'https://meet.google.com/pm-office-hours',
		capacity: 20, sold: 14,
		ticketTypes: [{ id: 't1', name: 'Free Seat', price: 0, qty: 20, sold: 14, perks: 'Zoom room · Notes doc · Recording' }],
		agenda: [
			{ time: '19:00', title: 'Intros & problem pitches' },
			{ time: '19:20', title: 'Breakout round 1' },
			{ time: '20:00', title: 'Breakout round 2' },
			{ time: '20:40', title: 'Share-outs' }
		],
		speakers: [{ name: 'Tunde Bakare', role: 'Host PM' }],
		sponsors: [],
		reviews: [], photoCount: 0
	}),
	mk({
		id: 'e8', slug: 'startup-demo-day-q4', organizerId: 'o2', category: 'business',
		title: 'Demo Day — Q4 Cohort', venueId: 'v2', hue: 218,
		start: at(28, 15), end: at(28, 20), doors: at(28, 14),
		summary: '14 startups, 5 minutes each, then the room opens up.',
		description:
			'The Q4 cohort presents to a room of angels, funds and operators. Each team gets five minutes and two minutes of Q&A. Networking until 8pm.',
		highlights: ['14 startups', 'Investor room', 'Networking hour', 'Cohort booklet'],
		tags: ['demo day', 'startups', 'investors'],
		capacity: 400, sold: 219,
		ticketTypes: [
			{ id: 't1', name: 'Attendee', price: 15000, qty: 300, sold: 186, perks: 'All pitches · Networking' },
			{ id: 't2', name: 'Investor Pass', price: 50000, qty: 100, sold: 33, perks: '+ Data room · Founder intros' }
		],
		agenda: [
			{ time: '15:00', title: 'Welcome & cohort intro' },
			{ time: '15:20', title: 'Pitch block 1 (7 teams)' },
			{ time: '17:00', title: 'Break' },
			{ time: '17:20', title: 'Pitch block 2 (7 teams)' },
			{ time: '18:45', title: 'Networking & drinks' }
		],
		speakers: [{ name: 'Bisi Oni', role: 'Partner, Verod Capital' }],
		sponsors: [{ name: 'Verod Capital', tier: 'Host' }],
		reviews: [], photoCount: 41
	}),
	mk({
		id: 'e9', slug: 'wellness-sunday-yoga-and-sound', organizerId: 'o4', category: 'health',
		title: 'Wellness Sunday: Yoga & Sound Bath', venueId: 'v7', hue: 148,
		start: at(3, 8), end: at(3, 11), doors: at(3, 7, 40),
		summary: 'Vinyasa, breathwork, then a 40-minute sound bath.',
		description:
			'A slow Sunday morning in the Alliance Française garden. One hour of vinyasa for all levels, guided breathwork, then a sound bath with gongs and bowls. Mats provided.',
		highlights: ['All levels', 'Mats provided', 'Sound bath', 'Herbal tea bar'],
		tags: ['yoga', 'wellness', 'morning'],
		capacity: 120, sold: 88,
		ticketTypes: [{ id: 't1', name: 'Mat Space', price: 12000, qty: 120, sold: 88, perks: 'Full session · Mat · Tea' }],
		agenda: [
			{ time: '08:00', title: 'Vinyasa flow' },
			{ time: '09:15', title: 'Breathwork' },
			{ time: '09:45', title: 'Sound bath' },
			{ time: '10:40', title: 'Tea & slow goodbyes' }
		],
		speakers: [{ name: 'Nkechi Obi', role: 'Yoga lead' }],
		sponsors: [], reviews: [], photoCount: 120
	}),
	mk({
		id: 'e10', slug: 'open-mic-at-terra', organizerId: 'o5', category: 'arts',
		title: 'Open Mic at Terra', venueId: 'v3', hue: 320,
		start: at(5, 18), end: at(5, 21), doors: at(5, 17, 30),
		summary: 'Six-minute slots. Sign up at the door.',
		description:
			'Poetry, comedy, acoustic sets and one very confident saxophonist. Six-minute slots, sign-up opens at 5:30pm, and the audience picks the winner.',
		highlights: ['6-minute slots', 'Sign up at door', 'Audience vote', '₦100k prize'],
		tags: ['open mic', 'poetry', 'comedy'],
		capacity: 160, sold: 96,
		ticketTypes: [{ id: 't1', name: 'Audience', price: 5000, qty: 160, sold: 96, perks: 'Entry · Voting slip' }],
		agenda: [
			{ time: '17:30', title: 'Sign-ups open' },
			{ time: '18:00', title: 'Round 1' },
			{ time: '19:30', title: 'Round 2' },
			{ time: '20:30', title: 'Vote & announce' }
		],
		speakers: [{ name: 'Kemi Ashade', role: 'Host' }],
		sponsors: [], reviews: [], photoCount: 88
	}),
	mk({
		id: 'e11', slug: 'sme-growth-clinic', organizerId: 'o6', category: 'business',
		title: 'SME Growth Clinic', venueId: 'v4', hue: 200,
		start: at(11, 10), end: at(11, 16), doors: at(11, 9, 30),
		summary: 'Pricing, cash flow and hiring — clinics for small teams.',
		description:
			'Six 45-minute clinics running twice: pricing, cash flow, hiring your first five, tax basics, getting paid online, and marketing on a ₦0 budget.',
		highlights: ['6 clinics', 'Templates included', '1:1 slots', 'Lunch included'],
		tags: ['sme', 'workshop', 'clinic'],
		capacity: 250, sold: 134,
		ticketTypes: [
			{ id: 't1', name: 'Clinic Pass', price: 20000, qty: 200, sold: 120, perks: 'All clinics · Lunch · Templates' },
			{ id: 't2', name: 'Clinic + 1:1', price: 45000, qty: 50, sold: 14, perks: '+ 30-min 1:1 with an advisor' }
		],
		agenda: [
			{ time: '10:00', title: 'Clinic 1: Pricing for profit' },
			{ time: '11:00', title: 'Clinic 2: Cash flow forecasting' },
			{ time: '12:00', title: 'Lunch & 1:1 slots' },
			{ time: '14:00', title: 'Clinic 5: Getting paid online' }
		],
		speakers: [{ name: 'Bola Ajayi', role: 'SME advisor' }],
		sponsors: [{ name: 'Moniepoint', tier: 'Partner' }], reviews: [], photoCount: 22
	}),
	mk({
		id: 'e12', slug: 'afrobeats-live-and-direct', organizerId: 'o1', category: 'music',
		title: 'Afrobeats Live & Direct', venueId: 'v1', hue: 258,
		start: at(34, 20), end: at(35, 1), doors: at(34, 19),
		summary: 'Full live band arrangements of the songs you know.',
		description:
			'A 14-piece band reworks a decade of afrobeats into something you have to hear in a room. Two sets, no support act, no phones during the first three songs.',
		highlights: ['14-piece live band', 'Two sets', 'Reserved seating', 'No phones set'],
		tags: ['live band', 'afrobeats', 'concert'],
		capacity: 2000, sold: 1504,
		ticketTypes: [
			{ id: 't1', name: 'Regular', price: 25000, qty: 1500, sold: 1200, perks: 'Standing & tiered seating' },
			{ id: 't2', name: 'Front Stalls', price: 60000, qty: 300, sold: 244, perks: 'Front stalls · Cloakroom' },
			{ id: 't3', name: 'Box (4 people)', price: 200000, qty: 200, sold: 60, perks: 'Private box for 4 · Drinks' }
		],
		agenda: [
			{ time: '19:00', title: 'Doors' },
			{ time: '20:00', title: 'Set 1' },
			{ time: '21:30', title: 'Interval' },
			{ time: '22:00', title: 'Set 2' }
		],
		speakers: [{ name: 'The Collective Band', role: 'Live band' }],
		sponsors: [{ name: 'Star Radler', tier: 'Headline' }], reviews: [], photoCount: 0
	})
];

/* ---------- seeded tickets for the demo account ---------- */
export const SEED_TICKETS = [
	{
		id: 'tk1',
		eventId: 'e1',
		typeId: 't2',
		typeName: 'General Admission',
		price: 18000,
		status: 'valid',
		date: at(-6, 12),
		orderRef: 'EV-4KQ82M',
		attendee: 'Amaka Obi',
		email: 'amaka@example.com',
		code: 'EV-7QK2-4M8P-9XRT'
	},
	{
		id: 'tk2',
		eventId: 'e3',
		typeId: 't1',
		typeName: 'Entry',
		price: 3000,
		status: 'valid',
		date: at(-3, 15),
		orderRef: 'EV-9PL41Z',
		attendee: 'Amaka Obi',
		email: 'amaka@example.com',
		code: 'EV-3MZ7-1RQD-5WLK'
	},
	{
		id: 'tk3',
		eventId: 'e5',
		typeId: 't1',
		typeName: 'Standard Entry',
		price: 8000,
		status: 'used',
		date: at(-1, 9),
		orderRef: 'EV-2XN60B',
		attendee: 'Amaka Obi',
		email: 'amaka@example.com',
		code: 'EV-8HT5-6VJC-2YBN',
		checkedInAt: at(-1, 6, 20)
	}
];

export const SEED_NOTIFICATIONS = [
	{ id: 'n1', kind: 'reminder', title: 'Tomorrow: Naija Street Food Night Market', body: 'Freedom Park · Doors 5:00pm. Your tasting wristband is ready.', at: at(-0.2, 9), read: false, href: '/tickets' },
	{ id: 'n2', kind: 'follow', title: 'Lagos Sound Collective posted an update', body: 'Set times are live. The sunset set moved to 7:45pm.', at: at(-0.5, 11), read: false, href: '/events/lagos-sound-festival-2026' },
	{ id: 'n3', kind: 'payment', title: 'Payment confirmed — ₦8,000', body: 'Sunrise Series: 10K Run · 1 Standard Entry', at: at(-1, 9), read: true, href: '/tickets' },
	{ id: 'n4', kind: 'checkin', title: 'You’re checked in', body: 'Sunrise Series: 10K Run · 6:20am', at: at(-1, 6, 20), read: true, href: '/tickets' },
	{ id: 'n5', kind: 'waitlist', title: 'A ticket opened up', body: 'Build Weekend: AI Hackathon has 12 builder seats left.', at: at(-2, 14), read: true, href: '/events/build-weekend-ai-hackathon' }
];

export const ACTIVITY = [
	{ id: 'a1', who: 'p2', what: 'saved', target: 'Africa Fintech Summit', at: at(-0.1, 8) },
	{ id: 'a2', who: 'p5', what: 'is attending', target: 'Sunrise Series: 10K Run', at: at(-0.3, 7) },
	{ id: 'a3', who: 'p3', what: 'is speaking at', target: 'Design After Dark', at: at(-0.6, 12) },
	{ id: 'a4', who: 'p6', what: 'reviewed', target: 'Naija Street Food Night Market', at: at(-1.2, 20) }
];
