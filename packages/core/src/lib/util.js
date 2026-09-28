import { CURRENCIES } from './data.js';

export const money = (ngn, currency = 'NGN') => {
	const c = CURRENCIES[currency] || CURRENCIES.NGN;
	const v = ngn * c.rate;
	const n =
		c.dp === 0
			? Math.round(v).toLocaleString('en-US')
			: v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	return `${c.symbol}${n}`;
};

export const moneyCompact = (ngn, currency = 'NGN') => {
	const c = CURRENCIES[currency] || CURRENCIES.NGN;
	const v = ngn * c.rate;
	if (Math.abs(v) >= 1000) return `${c.symbol}${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
	return money(ngn, currency);
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const d = (iso) => (iso instanceof Date ? iso : new Date(iso));

export const weekday = (iso) => DAYS[d(iso).getDay()];
export const dayNum = (iso) => d(iso).getDate();
export const monthShort = (iso) => MONTHS[d(iso).getMonth()];
export const time = (iso) =>
	d(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

export const dateLong = (iso) =>
	`${weekday(iso)}, ${dayNum(iso)} ${monthShort(iso)} ${d(iso).getFullYear()}`;

export const dateShort = (iso) => `${weekday(iso)} ${dayNum(iso)} ${monthShort(iso)}`;

export const dateRange = (start, end) => {
	const a = d(start);
	const b = d(end);
	if (a.toDateString() === b.toDateString())
		return `${dateLong(start)} · ${time(start)}–${time(end)}`;
	return `${dateShort(start)} ${time(start)} → ${dateShort(end)} ${time(end)}`;
};

export const countdown = (iso) => {
	const diff = d(iso).getTime() - Date.now();
	if (diff <= 0) return { past: true, label: 'Started' };
	const days = Math.floor(diff / 86400000);
	const hrs = Math.floor((diff % 86400000) / 3600000);
	const mins = Math.floor((diff % 3600000) / 60000);
	if (days > 0) return { past: false, label: `in ${days} day${days > 1 ? 's' : ''}`, days };
	if (hrs > 0) return { past: false, label: `in ${hrs}h ${mins}m`, soon: hrs < 24 };
	return { past: false, label: `in ${mins} min`, soon: true };
};

export const timeAgo = (iso) => {
	const diff = Date.now() - d(iso).getTime();
	const mins = Math.round(diff / 60000);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.round(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.round(hrs / 24);
	if (days < 7) return `${days}d ago`;
	const wks = Math.round(days / 7);
	if (wks < 5) return `${wks}w ago`;
	return dateShort(iso);
};

export const isSameDay = (a, b) => d(a).toDateString() === d(b).toDateString();

export const compact = (n) => {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
	return String(n);
};

export const pct = (a, b) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);

export const initials = (name = '') =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join('');

export const slugify = (s = '') =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 60) || 'event';

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/* deterministic-ish hash used for rotating QR payloads */
export const hash = (str = '') => {
	let h = 5381;
	for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
	return h.toString(36).toUpperCase();
};

export const rand = (n = 8) =>
	Array.from({ length: n }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 33)]).join('');

export const copy = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
};

export const cx = (...args) => args.filter(Boolean).join(' ');

const icsDate = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

export const ics = (event, venue) => {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Evently//Event//EN',
		'BEGIN:VEVENT',
		`UID:${event.id}@evently.app`,
		`DTSTAMP:${icsDate(new Date().toISOString())}`,
		`DTSTART:${icsDate(event.start)}`,
		`DTEND:${icsDate(event.end ?? event.start)}`,
		`SUMMARY:${event.title}`,
		`LOCATION:${venue?.name ? venue.name + ', ' + (venue.address ?? '') : 'Online'}`,
		`DESCRIPTION:${(event.summary ?? '').replace(/,/g, '\\,')}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.join('\r\n');
};

export function download(filename, content, type = 'text/calendar') {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 2000);
}
