<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dayNum, monthShort, countdown, time, compact, pct } from '$shared/lib/util.js';
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';
	import Avatar from './Avatar.svelte';

	let { event: e, layout = 'vertical', compactMode = false } = $props();

	const org = $derived(app.organizer(e.organizerId));
	const venue = $derived(app.venue(e.venueId));
	const from = $derived(Math.min(...e.ticketTypes.map((t) => t.price)));
	const soldOut = $derived(e.ticketTypes.every((t) => t.sold >= t.qty));
	const cd = $derived(countdown(e.start));
	const saved = $derived(app.isSaved(e.id));
	const totalSold = $derived(e.ticketTypes.reduce((s, t) => s + t.sold, 0));
	const glyph = $derived(
		{
			music: 'headphones',
			tech: 'zap',
			business: 'briefcase',
			sports: 'dumbbell',
			arts: 'palette',
			food: 'utensils',
			health: 'pulse',
			community: 'users'
		}[e.category] ?? 'ticket'
	);
</script>

<a class="card ec {layout}" href="/events/{e.slug}">
	<div class="media" class:short={compactMode}>
		<Cover image={e.image} hue={e.hue ?? 258} {glyph} radius={0} seed={e.id.length} dim={soldOut} />
		{#if soldOut}
			<div class="soldout">Sold out</div>
		{/if}
		<div class="date">
			<span class="d">{dayNum(e.start)}</span>
			<span class="m">{monthShort(e.start)}</span>
		</div>
		<button
			class="save"
			class:on={saved}
			aria-label="Save event"
			onclick={(ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				app.toggleSave(e.id);
			}}
		>
			<Icon name="heart" size={17} fill={saved ? 'currentColor' : 'none'} />
		</button>
		{#if e.mode !== 'in-person'}
			<span class="tag mode">{e.mode === 'online' ? 'Online' : 'Hybrid'}</span>
		{/if}
	</div>

	<div class="body">
		<h3 class="title clamp-2">{e.title}</h3>
		{#if !compactMode}
			<p class="meta muted small truncate">
				{time(e.start)} · {venue?.name ?? 'Online'}{venue?.city ? ', ' + venue.city : ''}
			</p>
		{/if}

		{#if !compactMode}
			<div class="org row gap-6">
				<Avatar name={org?.name ?? '?'} hue={org?.hue ?? 258} size={18} />
				<span class="xs muted truncate">{org?.name}</span>
				{#if org?.verified}<span class="badge-verify" title="Verified organizer"
						><Icon name="check" size={10} stroke={3.4} /></span
					>{/if}
			</div>
		{/if}

		<div class="foot">
			<span class="price b">{from === 0 ? 'Free' : `From ${money(from, app.currency)}`}</span>
			<span class="xs muted-2">{cd.label}</span>
		</div>

		{#if !compactMode && e.capacity}
			<div class="bar"><i style="width:{pct(totalSold, e.capacity)}%"></i></div>
		{/if}
	</div>
</a>

<style>
	.ec {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		transition:
			transform 0.18s var(--ease),
			box-shadow 0.18s var(--ease),
			border-color 0.18s var(--ease);
		height: 100%;
	}
	.ec:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--line-strong);
	}
	.media {
		position: relative;
		aspect-ratio: 16 / 10;
	}
	.media.short {
		aspect-ratio: 16 / 9;
	}
	.body {
		padding: 12px 13px 13px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.title {
		font-size: 15px;
		font-weight: 640;
		line-height: 1.28;
	}
	.meta {
		margin-top: -2px;
	}
	.foot {
		margin-top: auto;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		padding-top: 4px;
	}
	.price {
		font-size: 13.5px;
	}
	.date {
		position: absolute;
		top: 10px;
		left: 10px;
		background: rgba(255, 255, 255, 0.95);
		color: #0b0b0c;
		border-radius: 10px;
		padding: 4px 8px 5px;
		text-align: center;
		line-height: 1;
		box-shadow: var(--shadow-sm);
	}
	.date .d {
		display: block;
		font-size: 15px;
		font-weight: 750;
		letter-spacing: -0.04em;
	}
	.date .m {
		display: block;
		font-size: 9.5px;
		font-weight: 700;
		text-transform: uppercase;
		color: #6b6b73;
		margin-top: 1px;
	}
	.save {
		position: absolute;
		top: 9px;
		right: 9px;
		width: 32px;
		height: 32px;
		border-radius: 99px;
		border: 0;
		background: rgba(255, 255, 255, 0.92);
		color: #0b0b0c;
		display: grid;
		place-items: center;
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		transition: transform 0.14s var(--ease);
	}
	.save:active {
		transform: scale(0.9);
	}
	.save.on {
		color: #e0245e;
	}
	.tag.mode {
		position: absolute;
		left: 10px;
		bottom: 10px;
		background: rgba(11, 11, 12, 0.72);
		color: #fff;
		backdrop-filter: blur(4px);
	}
	.soldout {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: #fff;
		font-weight: 700;
		font-size: 15px;
		letter-spacing: 0.02em;
	}
	.bar {
		height: 3px;
		border-radius: 99px;
		background: var(--surface-2);
		overflow: hidden;
		margin-top: 2px;
	}
	.bar i {
		display: block;
		height: 100%;
		background: var(--accent);
		border-radius: 99px;
	}

	/* horizontal layout */
	.horizontal {
		flex-direction: row;
	}
	.horizontal .media {
		width: 118px;
		flex: none;
		aspect-ratio: auto;
	}
	.horizontal .body {
		padding: 11px 13px;
		min-width: 0;
	}
</style>
