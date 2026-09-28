<script>
	let { name, size = 20, stroke = 1.8, fill = 'none', class: klass = '', style = '' } = $props();

	const P = {
		home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.6V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.6"/>',
		compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.2-5.2 2.1 2.1-5.2z"/>',
		ticket:
			'<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2.4 2.4 0 0 0 0 4.6V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2.4 2.4 0 0 0 0-4.6z"/><path d="M13.5 6.5v11" stroke-dasharray="2 2.6"/>',
		heart:
			'<path d="M19.5 5.9a5 5 0 0 0-7.07 0L12 6.3l-.43-.4a5 5 0 1 0-7.07 7.07l7.5 7.5 7.5-7.5a5 5 0 0 0 0-7.07Z"/>',
		user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
		bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M13.7 20.5a2 2 0 0 1-3.4 0"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		minus: '<path d="M5 12h14"/>',
		search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/>',
		scan: '<path d="M3 8.5V5.5A2 2 0 0 1 5 3.5h3M16 3.5h3a2 2 0 0 1 2 2v3M20.5 15.5v3a2 2 0 0 1-2 2h-3M8 20.5H5a2 2 0 0 1-2-2v-3"/><path d="M3.5 12h17"/>',
		calendar:
			'<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10.5h17"/>',
		pin: '<path d="M20 10.2c0 5.8-8 11.8-8 11.8s-8-6-8-11.8a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
		share:
			'<circle cx="17.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="m8.7 13.3 6.6 3.7M15.3 7 8.7 10.7"/>',
		arrowLeft: '<path d="M19 12H5.5"/><path d="m11.5 5.5-6 6.5 6 6.5"/>',
		arrowRight: '<path d="M5 12h13.5"/><path d="m12.5 5.5 6 6.5-6 6.5"/>',
		arrowUpRight: '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
		check: '<path d="m20 6.5-11 11-5-5"/>',
		checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
		x: '<path d="M18 6 6 18M6 6l12 12"/>',
		xCircle: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
		chevronRight: '<path d="m9.5 18 6-6-6-6"/>',
		chevronLeft: '<path d="m14.5 18-6-6 6-6"/>',
		chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
		sliders:
			'<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
		filter: '<path d="M3.5 5.5h17l-6.5 7.5v6l-4-2.2v-3.8z"/>',
		star: '<path d="m12 3.5 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.7l-5.6 3 1.1-6.2L3 10.1l6.2-.9z"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
		users:
			'<circle cx="9.5" cy="8" r="3.4"/><path d="M3 20.5a6.5 6.5 0 0 1 13 0"/><path d="M16 5.3a3.4 3.4 0 0 1 0 6.5"/><path d="M18.4 20.5a6.4 6.4 0 0 0-1.9-4.5"/>',
		wallet:
			'<path d="M3.5 8.5A2 2 0 0 1 5.5 6.5H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z"/><path d="M3.5 10.5h17"/><path d="M15.5 14.5h2.5"/>',
		card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 14.5h3"/>',
		shield: '<path d="M12 3.2 5 6v5.8c0 4.3 2.9 7.4 7 8.9 4.1-1.5 7-4.6 7-8.9V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
		shieldCheck:
			'<path d="M12 3.2 5 6v5.8c0 4.3 2.9 7.4 7 8.9 4.1-1.5 7-4.6 7-8.9V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
		logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
		trash:
			'<path d="M4 7h16"/><path d="M10 11.5v6M14 11.5v6"/><path d="M6.5 7l1 12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-12"/><path d="M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/>',
		edit: '<path d="M12.5 20.5H21"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5l-4 1 1-4z"/>',
		message:
			'<path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.8l1.8-5.4A8.4 8.4 0 0 1 4 11.6 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.6Z"/>',
		camera:
			'<path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h2.2L9.2 4h5.6l1.5 2.5h2.2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.4"/>',
		download: '<path d="M12 3.5v12"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4.5 20.5h15"/>',
		upload: '<path d="M12 20.5v-12"/><path d="m7.5 13 4.5-4.5L16.5 13"/><path d="M4.5 3.5h15"/>',
		image:
			'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17.5 4.6-4.3a1.8 1.8 0 0 1 2.4 0l3.1 2.9"/><path d="m13.2 14.3 2.2-2a1.8 1.8 0 0 1 2.4 0l2.2 2.2"/>',
		alert: '<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10.5v4M12 17.2h.01"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11.2v5M12 8h.01"/>',
		lock: '<rect x="4.5" y="10" width="15" height="10" rx="2.2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
		globe:
			'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18Z"/>',
		link: '<path d="M10.2 13.8a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1"/><path d="M13.8 10.2a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1-1"/>',
		mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.8 8.2 6 8.2-6"/>',
		phone:
			'<path d="M5 3h4l2 5-2.5 1.5a12.5 12.5 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
		grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
		chart: '<path d="M3.5 20.5h17"/><rect x="5.5" y="12" width="3.6" height="7" rx="1.2"/><rect x="10.7" y="7" width="3.6" height="12" rx="1.2"/><rect x="15.9" y="14" width="3.6" height="5" rx="1.2"/>',
		printer: '<path d="M7 8.5V3.5h10v5"/><rect x="3.5" y="8.5" width="17" height="7.5" rx="2"/><path d="M7 16h10v4.5H7z"/>',
		more: '<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>',
		refresh: '<path d="M20 11.5A8 8 0 1 0 17.8 17"/><path d="M20 5v6.5h-6.5"/>',
		copy: '<rect x="9" y="9" width="12" height="12" rx="2.2"/><path d="M5.2 15H4.5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5v.7"/>',
		sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
		moon: '<path d="M20.8 13.2A9 9 0 1 1 10.8 3.2a7 7 0 0 0 10 10Z"/>',
		menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
		flag: '<path d="M5 21V3.8M5 4h11.5l-2.2 4 2.2 4H5"/>',
		video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 12 6-3.4v10.8l-6-3.4z"/>',
		mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11.5a7 7 0 0 0 14 0"/><path d="M12 18.5v2.5"/>',
		award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.6-2 7.9 5.4-2.7 5.4 2.7-2-7.9"/>',
		qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.6"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.6"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.6"/><path d="M14 14h3v3h-3zM20 14h.5M14 20h.5M20 20h.5M17.5 17.5h.5"/>',
		zap: '<path d="M13 2.5 4.5 13.5H10l-1 8 8.5-11.5H12z"/>',
		sparkle:
			'<path d="M11 3.5l1.7 4.3 4.3 1.7-4.3 1.7L11 15.5l-1.7-4.3L5 9.5l4.3-1.7z"/><path d="M17.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
		trending: '<path d="m3.5 17 6-6 4 4 7.5-7.5"/><path d="M21 7.5h-5M21 7.5v5"/>',
		layers: '<path d="m12 3 9 4.8-9 4.8-9-4.8z"/><path d="m3 13 9 4.8L21 13"/>',
		headphones:
			'<path d="M4 14.5v-2.7a8 8 0 0 1 16 0v2.7"/><rect x="2.5" y="14" width="5" height="6.5" rx="2.2"/><rect x="16.5" y="14" width="5" height="6.5" rx="2.2"/>',
		briefcase:
			'<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.2A2.2 2.2 0 0 1 11.2 3h1.6A2.2 2.2 0 0 1 15 5.2V7"/><path d="M3 12h18"/>',
		palette:
			'<path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.7 3.4-3.6 3.4h-1.2a2 2 0 0 0-1.4 3.4A1.9 1.9 0 0 1 12 21Z"/><circle cx="7.6" cy="11.5" r="1.1"/><circle cx="10.6" cy="7.6" r="1.1"/><circle cx="15.2" cy="8.6" r="1.1"/>',
		dumbbell: '<path d="M6.5 8v8M3.5 10v4M17.5 8v8M20.5 10v4M6.5 12h11"/>',
		pulse:
			'<path d="M20.6 6.8a5 5 0 0 0-8.7-1.7L12 5.2l-.1.1A5 5 0 0 0 3.4 6.8c-1.6 4 1.2 8.3 5.2 10.7L12 20l3.4-2.5c4-2.4 6.8-6.7 5.2-10.7Z"/><path d="M8.4 12.2h2l1-2 1.5 3.4 1-1.4h1.6"/>',
		utensils:
			'<path d="M6.5 3v7.5a2.3 2.3 0 0 0 4.6 0V3"/><path d="M8.8 12.5V21"/><path d="M16 3c-1.4 1.6-2 3.6-2 5.6s.8 3.4 2 3.4 2-1.4 2-3.4S17.4 4.6 16 3Z"/><path d="M16 12v9"/>',
		building:
			'<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-4.5h4V21"/>',
		eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
		send: '<path d="M21 3.5 3 10.6l7.4 2.8 2.8 7.4z"/><path d="m10.4 13.4 6.2-6.2"/>',
		bookmark: '<path d="M6.5 4h11v16.5l-5.5-4-5.5 4z"/>',
		percent: '<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
		list: '<path d="M8.5 6.5H21M8.5 12H21M8.5 17.5H21"/><path d="M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
		folder: '<path d="M3 7.5A2 2 0 0 1 5 5.5h3.5L10.5 8H19a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
		megaphone: '<path d="M3 11v2a1.8 1.8 0 0 0 1.8 1.8h1L15 19V5L5.8 9.2h-1A1.8 1.8 0 0 0 3 11Z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>',
		ban: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
		external:
			'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18.5 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
		offline:
			'<path d="m2.5 3.5 19 17"/><path d="M5.5 12.6a9.5 9.5 0 0 1 3.6-2.2M10 15.8a5 5 0 0 1 2-.5"/><path d="M8.6 8.7A15 15 0 0 1 12 8.2c2.8 0 5.4.9 7.5 2.5"/><path d="M2.3 8.9A15 15 0 0 1 6 6.4"/><path d="M12 19.5h.01"/>',
		fingerprint:
			'<path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5"/><path d="M4.5 12A7.5 7.5 0 0 1 9 5.1"/><path d="M12 8.5a3.5 3.5 0 0 1 3.5 3.5c0 2.5.8 3.5 1.8 4.6"/><path d="M8.5 12a3.5 3.5 0 0 1 3.5-3.5"/><path d="M12 12c0 3 1 4.5 2.5 6"/><path d="M6.5 15.5A8 8 0 0 0 7 20"/>',
		target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
		chat: '<path d="M20.5 11.6a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.8l1.8-5.4A8.4 8.4 0 0 1 4 11.6 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 20.5 11.6Z"/>',
		circleDot: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
		banknote:
			'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6 10v4M18 10v4"/>',
		mobile: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
		handshake:
			'<path d="m3 10.5 4.5-4.5 4 3.5 3-3 6.5 6"/><path d="M3 10.5 7.5 18h9l4.5-7.5"/><path d="M11.5 9.5 7.5 18"/>',
		key: '<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M16 16l-2 2M19 19l-2 2"/>',
		inbox:
			'<path d="M3.5 13.5h4l1.5 2.5h6l1.5-2.5h4"/><path d="M5.5 4.5h13l2 9v6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-6z"/>'
	};

	let d = $derived(P[name] ?? P.circleDot);
	let isMore = $derived(name === 'more');
</script>

<svg
	class={klass}
	{style}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={isMore ? 'currentColor' : fill}
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{@html d}
</svg>
