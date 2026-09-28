<script>
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import { CATEGORIES } from '$shared/lib/data.js';
	import { money, dateShort, time, compact, pct, dayNum, weekday } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import EventCard from '$comp/EventCard.svelte';
	import Sheet from '$comp/Sheet.svelte';
	import Cover from '$comp/Cover.svelte';

	let q = $state(page.url.searchParams.get('q') ?? '');
	let view = $state(page.url.searchParams.get('view') ?? 'list');
	let sort = $state('date');
	let filters = $state({
		category: page.url.searchParams.get('category') ?? '',
		when: '',
		price: '', // free | under10k | under50k | paid
		mode: '', // in-person | online | hybrid
		distance: 0,
		accessible: false,
		familyFriendly: false
	});
	let filtersOpen = $state(false);
	let dayPick = $state(null);
	let mapPick = $state(null);

	const ALL = $derived(app.events.filter((e) => e.status === 'published'));

	const results = $derived.by(() => {
		let list = ALL.filter((e) => {
			if (filters.category && e.category !== filters.category) return false;
			if (filters.mode && e.mode !== filters.mode) return false;
			if (filters.accessible && !e.accessibility?.length) return false;
			if (q) {
				const t = `${e.title} ${e.summary ?? ''} ${app.organizer(e.organizerId)?.name ?? ''} ${app
					.venue(e.venueId)
					?.name ?? ''} ${e.tags.join(' ')}`.toLowerCase();
				if (!t.includes(q.toLowerCase())) return false;
			}
			const d = new Date(e.start) - Date.now();
			if (filters.when === 'today' && d > 86400000) return false;
			if (filters.when === 'week' && d > 7 * 86400000) return false;
			if (filters.when === 'month' && d > 30 * 86400000) return false;
			if (filters.when === 'weekend') {
				const day = new Date(e.start).getDay();
				if (day !== 0 && day !== 6) return false;
			}
			const from = Math.min(...e.ticketTypes.map((t) => t.price));
			if (filters.price === 'free' && from > 0) return false;
			if (filters.price === 'paid' && from === 0) return false;
			if (filters.price === 'under10k' && from > 10000) return false;
			if (filters.price === 'under50k' && from > 50000) return false;
			if (dayPick && new Date(e.start).toDateString() !== dayPick.toDateString()) return false;
			return true;
		});
		if (sort === 'date') list = [...list].sort((a, b) => new Date(a.start) - new Date(b.start));
		if (sort === 'popular') list = [...list].sort((a, b) => b.sold / b.capacity - a.sold / a.capacity);
		if (sort === 'price')
			list = [...list].sort(
				(a, b) =>
					Math.min(...a.ticketTypes.map((t) => t.price)) -
					Math.min(...b.ticketTypes.map((t) => t.price))
			);
		if (sort === 'distance') list = [...list].sort((a, b) => (a.venueId > b.venueId ? 1 : -1));
		return list;
	});

	const activeChips = $derived(
		[
			filters.category && {
				k: 'category',
				label: CATEGORIES.find((c) => c.id === filters.category)?.name
			},
			filters.mode && { k: 'mode', label: filters.mode },
			filters.when && { k: 'when', label: filters.when },
			filters.price && { k: 'price', label: filters.price },
			filters.accessible && { k: 'accessible', label: 'Accessible' },
			dayPick && { k: 'dayPick', label: dateShort(dayPick) }
		].filter(Boolean)
	);

	function clearFilter(k) {
		if (k === 'dayPick') dayPick = null;
		else if (k === 'accessible') filters.accessible = false;
		else filters[k] = '';
	}

	function saveSearch() {
		app.savedSearches = [
			...app.savedSearches,
			{
				id: 's' + Date.now(),
				label:
					activeChips.map((c) => c.label).join(' · ') || q || `All ${app.city} events`
			}
		];
		app.say('Search saved — we’ll alert you on new matches');
	}

	/* ---- calendar ---- */
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	const grid = $derived.by(() => {
		const first = new Date(monthStart);
		const offset = first.getDay();
		const cells = [];
		for (let i = 0; i < 42; i++) {
			const d = new Date(first.getTime() + (i - offset) * 86400000);
			cells.push({
				d,
				inMonth: d.getMonth() === first.getMonth(),
				n: ALL.filter((e) => new Date(e.start).toDateString() === d.toDateString()).length
			});
		}
		return cells;
	});

	/* ---- map ---- */
	const BBOX = { minLat: 6.38, maxLat: 6.63, minLng: 3.28, maxLng: 3.5 };
	const plot = (v) => {
		if (!v || v.lat == null) return null;
		const x = ((v.lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100;
		const y = 100 - ((v.lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * 100;
		return { x: Math.max(6, Math.min(94, x)), y: Math.max(8, Math.min(92, y)) };
	};
	const pins = $derived(
		results
			.map((e) => ({ e, v: app.venue(e.venueId), p: plot(app.venue(e.venueId)) }))
			.filter((x) => x.p)
	);
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<div class="search grow">
					<Icon name="search" size={17} />
					<input placeholder="Search events, organizers, venues" bind:value={q} />
					{#if q}
						<button class="icon-btn" style="width:26px;height:26px;border:0" onclick={() => (q = '')}>
							<Icon name="x" size={15} />
						</button>
					{/if}
				</div>
				<button class="icon-btn" onclick={() => (filtersOpen = true)} aria-label="Filters">
					<Icon name="sliders" size={18} />
					{#if activeChips.length}<i class="fdot"></i>{/if}
				</button>
			</div>

			<div class="row gap-8" style="padding-bottom:10px">
				<div class="seg">
					{#each ['list', 'map', 'calendar'] as v}
						<button class:on={view === v} onclick={() => (view = v)}>
							<Icon name={v === 'list' ? 'list' : v === 'map' ? 'pin' : 'calendar'} size={15} />
							{v[0].toUpperCase() + v.slice(1)}
						</button>
					{/each}
				</div>
				<div class="grow"></div>
				<select class="select sort" bind:value={sort}>
					<option value="date">Soonest</option>
					<option value="popular">Most popular</option>
					<option value="price">Lowest price</option>
					<option value="distance">Nearest</option>
					<option value="relevance">Relevance</option>
				</select>
			</div>

			{#if activeChips.length || q}
				<div class="chips scroll-x">
					{#each activeChips as c}
						<button class="chip sm on" onclick={() => clearFilter(c.k)}>
							{c.label} <Icon name="x" size={12} />
						</button>
					{/each}
					<button class="chip sm" onclick={saveSearch}><Icon name="bookmark" size={13} /> Save</button>
					<button class="chip sm" onclick={() => (filtersOpen = true)}>
						<Icon name="plus" size={13} /> More
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="shell">
		<div class="count">
			<span class="b">{results.length}</span>
			<span class="muted small">events{filters.category ? ` in ${filters.category}` : ''}</span>
		</div>

		{#if view === 'list'}
			{#if results.length}
				<div class="grid" style="margin-top:12px">
					{#each results as e (e.id)}
						<EventCard event={e} layout="horizontal" />
					{/each}
				</div>
			{:else}
				<div class="empty">
					<div class="ico"><Icon name="search" size={24} /></div>
					<p class="b">No events match that</p>
					<p class="small">Try widening your filters or clearing the search.</p>
					<button class="btn btn-outline btn-sm" onclick={() => (filters = { category: '', when: '', price: '', mode: '', distance: 0, accessible: false, familyFriendly: false }) || (q = '')}>
						Clear filters
					</button>
				</div>
			{/if}
		{:else if view === 'map'}
			<div class="map">
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="grid-lines">
					{#each Array(9) as _, i}
						<line x1={i * 12.5} y1="0" x2={i * 12.5} y2="100" />
						<line x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} />
					{/each}
					<path
						d="M0 62 C 18 55, 26 68, 42 66 C 58 64, 66 78, 100 72 L100 100 L0 100 Z"
						class="water"
					/>
				</svg>
				{#each pins as { e, p } (e.id)}
					<button
						class="pinb"
						class:sel={mapPick === e.id}
						style="left:{p.x}%;top:{p.y}%;--c:hsl({e.hue ?? 258} 62% 52%)"
						onclick={() => (mapPick = e.id)}
						aria-label={e.title}
					>
						<span class="dotp"></span>
						<span class="lbl">{e.title}</span>
					</button>
				{/each}
				{#if !pins.length}
					<div class="map-empty small muted">No in-person events match these filters.</div>
				{/if}
			</div>

			{#if mapPick}
				{@const e = app.event(mapPick)}
				<a class="map-card card" href="/events/{e.slug}">
					<div class="mmedia"><Cover image={e.image} hue={e.hue} glyph="pin" radius={12} seed={e.id.length} /></div>
					<div class="col grow" style="min-width:0">
						<span class="b truncate">{e.title}</span>
						<span class="tiny muted-2 truncate">
							{app.venue(e.venueId)?.name} · {dateShort(e.start)} {time(e.start)}
						</span>
					</div>
					<span class="btn btn-sm btn-primary">Open</span>
				</a>
			{:else}
				<div class="grid" style="margin-top:14px">
					{#each results.slice(0, 3) as e (e.id)}
						<EventCard event={e} layout="horizontal" compactMode />
					{/each}
				</div>
			{/if}
		{:else}
			<div class="cal">
				<div class="cal-head">
					<h3>{monthStart.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</h3>
					<span class="tiny muted-2">Tap a day to filter</span>
				</div>
				<div class="cal-grid">
					{#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as d}
						<span class="dow tiny">{d}</span>
					{/each}
					{#each grid as c, i}
						<button
							class="cell"
							class:dim={!c.inMonth}
							class:on={dayPick && c.d.toDateString() === dayPick.toDateString()}
							class:has={c.n > 0}
							onclick={() => (dayPick = c.n ? c.d : null)}
						>
							<span class="n">{c.d.getDate()}</span>
							{#if c.n}<span class="dots">{#each Array(Math.min(3, c.n)) as _}<i></i>{/each}</span>{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid" style="margin-top:14px">
				{#each results as e (e.id)}
					<EventCard event={e} layout="horizontal" />
				{/each}
			</div>
		{/if}
	</div>
</div>

<Sheet bind:open={filtersOpen} title="Filters">
	<div class="col gap-20">
		<div class="field">
			<span class="label">Category</span>
			<div class="wrap row gap-8">
				{#each CATEGORIES as c}
					<button
						class="chip"
						class:on={filters.category === c.id}
						onclick={() => (filters.category = filters.category === c.id ? '' : c.id)}
					>
						{c.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="field">
			<span class="label">When</span>
			<div class="wrap row gap-8">
				{#each [['', 'Any time'], ['today', 'Today'], ['week', 'This week'], ['weekend', 'Weekend'], ['month', 'This month']] as [v, l]}
					<button class="chip" class:on={filters.when === v} onclick={() => (filters.when = v)}>
						{l}
					</button>
				{/each}
			</div>
		</div>

		<div class="field">
			<span class="label">Price</span>
			<div class="wrap row gap-8">
				{#each [['', 'Any'], ['free', 'Free'], ['paid', 'Paid'], ['under10k', 'Under ₦10k'], ['under50k', 'Under ₦50k']] as [v, l]}
					<button class="chip" class:on={filters.price === v} onclick={() => (filters.price = v)}>
						{l}
					</button>
				{/each}
			</div>
		</div>

		<div class="field">
			<span class="label">Format</span>
			<div class="wrap row gap-8">
				{#each [['', 'Any'], ['in-person', 'In person'], ['online', 'Online'], ['hybrid', 'Hybrid']] as [v, l]}
					<button class="chip" class:on={filters.mode === v} onclick={() => (filters.mode = v)}>
						{l}
					</button>
				{/each}
			</div>
		</div>

		<div class="field">
			<span class="label">Distance</span>
			<input type="range" min="0" max="50" step="5" bind:value={filters.distance} />
			<span class="hint">
				{filters.distance === 0 ? 'Anywhere' : `Within ${filters.distance} km of ${app.city}`}
			</span>
		</div>

		<div class="field">
			<span class="label">Access & audience</span>
			<label class="cbox">
				<input type="checkbox" bind:checked={filters.accessible} /> Step-free / accessible venue
			</label>
			<label class="cbox">
				<input type="checkbox" bind:checked={filters.familyFriendly} /> Family friendly
			</label>
			<label class="cbox"><input type="checkbox" /> Age 18+ only</label>
			<label class="cbox"><input type="checkbox" /> Sign-language interpretation</label>
		</div>

		<div class="row gap-8">
			<button
				class="btn btn-outline grow"
				onclick={() =>
					(filters = {
						category: '',
						when: '',
						price: '',
						mode: '',
						distance: 0,
						accessible: false,
						familyFriendly: false
					})}
			>
				Reset
			</button>
			<button class="btn btn-primary grow" onclick={() => (filtersOpen = false)}>
				Show {results.length} events
			</button>
		</div>
	</div>
</Sheet>

<style>
	.seg {
		display: flex;
		background: var(--surface);
		border-radius: 99px;
		padding: 3px;
		gap: 2px;
		flex: 1 1 auto;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.seg button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 0;
		background: transparent;
		padding: 6px 12px;
		border-radius: 99px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-2);
		cursor: pointer;
	}
	.seg button.on {
		background: var(--bg);
		color: var(--text);
		box-shadow: var(--shadow-sm);
	}
	.sort {
		height: 36px;
		width: auto;
		flex: 0 0 auto;
		max-width: 46vw;
		font-size: 13px;
		border-radius: 99px;
		padding: 0 30px 0 12px;
		background-position: right 10px center;
		background-color: var(--surface);
		border-color: transparent;
	}
	.icon-btn {
		position: relative;
	}
	.fdot {
		position: absolute;
		top: 7px;
		right: 8px;
		width: 6px;
		height: 6px;
		border-radius: 99px;
		background: var(--accent);
	}
	.chips {
		display: flex;
		gap: 6px;
		padding-bottom: 10px;
	}
	.count {
		padding: 12px 0 0;
		display: flex;
		gap: 5px;
		align-items: baseline;
	}
	.map {
		position: relative;
		height: 380px;
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
		background: var(--surface);
		overflow: hidden;
		margin-top: 12px;
	}
	.grid-lines {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.grid-lines line {
		stroke: var(--line);
		stroke-width: 0.3;
	}
	.water {
		fill: color-mix(in srgb, var(--accent) 12%, transparent);
	}
	.pinb {
		position: absolute;
		transform: translate(-50%, -100%);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}
	.dotp {
		width: 15px;
		height: 15px;
		border-radius: 99px;
		background: var(--c);
		border: 2.5px solid var(--bg);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
		transition: transform 0.16s var(--ease);
	}
	.pinb:hover .dotp,
	.pinb.sel .dotp {
		transform: scale(1.45);
	}
	.lbl {
		font-size: 10px;
		font-weight: 650;
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 2px 6px;
		border-radius: 6px;
		white-space: nowrap;
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0;
		transition: opacity 0.15s var(--ease);
	}
	.pinb.sel .lbl,
	.pinb:hover .lbl {
		opacity: 1;
	}
	.map-empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.map-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		margin-top: 12px;
	}
	.mmedia {
		width: 52px;
		height: 52px;
		flex: none;
	}
	.cal {
		margin-top: 12px;
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		padding: 14px;
	}
	.cal-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.cal-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
	}
	.dow {
		text-align: center;
		color: var(--text-3);
		font-weight: 700;
		padding-bottom: 4px;
	}
	.cell {
		aspect-ratio: 1;
		border: 0;
		background: transparent;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 550;
	}
	.cell.dim {
		color: var(--text-3);
		opacity: 0.5;
	}
	.cell.has {
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 700;
	}
	.cell.on {
		background: var(--text);
		color: var(--bg);
	}
	.dots {
		display: flex;
		gap: 2px;
	}
	.dots i {
		width: 4px;
		height: 4px;
		border-radius: 99px;
		background: currentColor;
		opacity: 0.75;
	}
	.cbox {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 0;
		font-size: 14px;
		cursor: pointer;
	}
	.cbox input {
		accent-color: var(--accent);
		width: 16px;
		height: 16px;
	}
	input[type='range'] {
		accent-color: var(--accent);
		width: 100%;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
