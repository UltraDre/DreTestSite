<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { app } from '$shared/lib/state.svelte.js';
	import {
		money,
		dateLong,
		dateShort,
		time,
		timeAgo,
		compact,
		pct,
		ics,
		download,
		copy
	} from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import EventCard from '$comp/EventCard.svelte';
	import Sheet from '$comp/Sheet.svelte';
	import Tabs from '$comp/Tabs.svelte';

	const slug = $derived(page.params.slug);
	const e = $derived(app.eventBySlug(slug));
	const org = $derived(e ? app.organizer(e.organizerId) : null);
	const venue = $derived(e ? app.venue(e.venueId) : null);

	$effect(() => {
		const id = e?.id;
		if (id) untrack(() => app.pushRecent(id));
	});

	let tab = $state('about');
	let ticketsOpen = $state(false);
	let shareOpen = $state(false);
	let reportOpen = $state(false);
	let qty = $state({});
	let scrolled = $state(false);
	let heroEl = $state(null);

	const tabs = $derived([
		{ id: 'about', label: 'About' },
		{ id: 'agenda', label: 'Agenda', count: e?.agenda?.length || 0 },
		{ id: 'speakers', label: 'Speakers', count: e?.speakers?.length || 0 },
		{ id: 'gallery', label: 'Gallery', count: e?.photoCount || 0 },
		{ id: 'faq', label: 'FAQ & policies' },
		{ id: 'reviews', label: 'Reviews', count: e?.reviews?.length || 0 }
	]);

	const soldOut = $derived(e ? e.ticketTypes.every((t) => t.sold >= t.qty) : false);
	const selected = $derived(
		e
			? e.ticketTypes
					.map((t) => ({ t, n: qty[t.id] ?? 0 }))
					.filter((x) => x.n > 0)
			: []
	);
	const selTotal = $derived(selected.reduce((s, x) => s + x.t.price * x.n, 0));
	const selCount = $derived(selected.reduce((s, x) => s + x.n, 0));
	const maxPer = 6;
	const isSaved = $derived(e ? app.isSaved(e.id) : false);
	const onWaitlist = $derived(e ? app.waitlist.includes(e.id) : false);
	const similar = $derived(
		e
			? app.events.filter(
					(x) => x.id !== e.id && x.status === 'published' && x.category === e.category
				).slice(0, 4)
			: []
	);

	function step(id, delta) {
		const t = e.ticketTypes.find((x) => x.id === id);
		const cur = qty[id] ?? 0;
		const left = Math.max(0, t.qty - t.sold);
		qty[id] = Math.max(0, Math.min(maxPer, Math.min(left, cur + delta)));
	}

	function proceed() {
		app.clearCart();
		app.cart.eventId = e.id;
		selected.forEach((x) => app.addToCart(e.id, x.t.id, x.n));
		ticketsOpen = false;
		goto('/checkout?event=' + e.id);
	}

	function addCalendar() {
		download(`${e.slug}.ics`, ics(e, venue));
		app.say('Calendar file downloaded');
	}

	async function share() {
		const url = location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title: e.title, text: e.summary, url });
				return;
			} catch {
				/* fall through */
			}
		}
		shareOpen = true;
	}

	/* scroll shadow */
	$effect(() => {
		const onScroll = () => (scrolled = (window.scrollY || 0) > 180);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

{#if !e}
	<div class="empty">
		<div class="ico"><Icon name="alert" size={24} /></div>
		<p class="b">Event not found</p>
		<a class="btn btn-outline btn-sm" href="/explore">Browse events</a>
	</div>
{:else}
	<div class="detail">
		<!-- floating bar -->
		<div class="floats" class:solid={scrolled}>
			<div class="shell row" style="height:56px">
				<button class="icon-btn glass" onclick={() => history.back()} aria-label="Back">
					<Icon name="arrowLeft" size={19} />
				</button>
				<span class="grow fl-title truncate b">{scrolled ? e.title : ''}</span>
				<button class="icon-btn glass" onclick={share} aria-label="Share">
					<Icon name="share" size={18} />
				</button>
				<button
					class="icon-btn glass"
					onclick={() => app.toggleSave(e.id)}
					aria-label="Save"
				>
					<Icon name="heart" size={18} fill={isSaved ? 'currentColor' : 'none'} />
				</button>
			</div>
		</div>

		<!-- hero -->
		<div class="hero" bind:this={heroEl}>
			<Cover image={e.image} hue={e.hue} glyph="sparkle" radius={0} seed={e.id.length} />
			<div class="hero-bottom">
				<div class="shell">
					<div class="row gap-6 wrap">
						<span class="tag" style="background:rgba(0,0,0,.55);color:#fff;backdrop-filter:blur(4px)">
							{e.category}
						</span>
						{#if e.mode !== 'in-person'}
							<span class="tag" style="background:rgba(0,0,0,.55);color:#fff"
								>{e.mode === 'online' ? 'Online' : 'Hybrid'}</span
							>
						{/if}
						{#if soldOut}<span class="tag bad">Sold out</span>{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="shell">
			<!-- title block -->
			<div class="block">
				<h1 style="font-size:26px">{e.title}</h1>
				<p class="muted" style="margin-top:6px">{e.summary}</p>
				<div class="row gap-10" style="margin-top:12px">
					<div class="rating">
						<Icon name="star" size={14} fill="currentColor" />
						<span class="b small">{e.rating || '—'}</span>
						<span class="tiny muted-2">({compact(e.reviewCount)})</span>
					</div>
					<span class="tiny muted-2">{compact(e.sold)} going</span>
					{#if e.photoCount}<span class="tiny muted-2">· {e.photoCount} photos</span>{/if}
				</div>
			</div>

			<div class="actions">
				<button class="act" onclick={() => app.toggleSave(e.id)}>
					<Icon name="heart" size={18} fill={isSaved ? 'currentColor' : 'none'} />
					{isSaved ? 'Saved' : 'Save'}
				</button>
				<button class="act" onclick={addCalendar}>
					<Icon name="calendar" size={18} /> Add to calendar
				</button>
				<button class="act" onclick={share}><Icon name="share" size={18} /> Share</button>
				<button class="act" onclick={() => (reportOpen = true)}>
					<Icon name="flag" size={18} /> Report
				</button>
			</div>

			<!-- organizer -->
			<a class="orgrow" href="/organizers/{org.id}">
				<Avatar name={org.name} hue={org.hue} size={44} />
				<div class="col grow" style="min-width:0">
					<span class="row gap-6">
						<span class="b truncate">{org.name}</span>
						{#if org.verified}
							<span class="badge-verify"><Icon name="check" size={10} stroke={3.6} /></span>
						{/if}
					</span>
					<span class="tiny muted-2">{compact(org.followers)} followers · {org.city}</span>
				</div>
				<button
					class="btn btn-sm {app.isFollowingOrg(org.id) ? 'btn-outline' : 'btn-primary'}"
					onclick={(ev) => {
						ev.preventDefault();
						app.toggleFollowOrg(org.id);
					}}
				>
					{app.isFollowingOrg(org.id) ? 'Following' : 'Follow'}
				</button>
			</a>

			<!-- info cards -->
			<div class="info">
				<div class="irow">
					<span class="ic"><Icon name="calendar" size={18} /></span>
					<div class="col grow">
						<span class="b small">{dateLong(e.start)}</span>
						<span class="tiny muted-2">
							{time(e.start)} – {time(e.end)} WAT
							{#if e.doors}· Doors {time(e.doors)}{/if}
						</span>
					</div>
					<button class="btn btn-sm btn-outline" onclick={addCalendar}>Add</button>
				</div>

				{#if e.mode !== 'online' && venue}
					<div class="irow">
						<span class="ic"><Icon name="pin" size={18} /></span>
						<div class="col grow">
							<span class="b small">{venue.name}</span>
							<span class="tiny muted-2">{venue.address}, {venue.city}</span>
						</div>
						<a
							class="btn btn-sm btn-outline"
							href="https://www.google.com/maps/dir/?api=1&destination={venue.lat},{venue.lng}"
							target="_blank"
							rel="noreferrer"
						>
							Directions
						</a>
					</div>
					<div class="minimap">
						<svg viewBox="0 0 100 40" preserveAspectRatio="none">
							{#each Array(7) as _, i}
								<line x1={i * 16} y1="0" x2={i * 16} y2="40" />
							{/each}
							{#each Array(4) as _, i}
								<line x1="0" y1={i * 13} x2="100" y2={i * 13} />
							{/each}
						</svg>
						<span class="pinmark"><Icon name="pin" size={16} /></span>
						<span class="tiny muted-2 mlabel">{venue.city} · tap Directions for turn-by-turn</span>
					</div>
				{/if}

				{#if e.mode !== 'in-person' && e.onlineUrl}
					<div class="irow">
						<span class="ic"><Icon name="video" size={18} /></span>
						<div class="col grow">
							<span class="b small">Online event</span>
							<span class="tiny muted-2 truncate">{e.onlineUrl}</span>
						</div>
						<button
							class="btn btn-sm btn-outline"
							onclick={() => {
								copy(e.onlineUrl);
								app.say('Link copied');
							}}
						>
							Copy
						</button>
					</div>
				{/if}

				<div class="irow">
					<span class="ic"><Icon name="shield" size={18} /></span>
					<div class="col grow">
						<span class="b small">{e.ageLimit} · {e.language}</span>
						<span class="tiny muted-2">{e.accessibility.join(' · ')}</span>
					</div>
				</div>
			</div>

			<!-- tabs -->
			<div class="tabs-wrap">
				<Tabs {tabs} bind:value={tab} />
			</div>

			{#if tab === 'about'}
				<div class="block">
					{#if e.highlights?.length}
						<div class="highs">
							{#each e.highlights as h}
								<span class="high"><Icon name="check" size={13} stroke={2.6} /> {h}</span>
							{/each}
						</div>
					{/if}
					<p class="body-text">{e.description}</p>
					<div class="tags">
						{#each e.tags as t}<a class="tag" href="/explore?q={t}">#{t}</a>{/each}
					</div>
					{#if e.sponsors?.length}
						<h3 style="margin-top:20px">Sponsors</h3>
						<div class="sponsors">
							{#each e.sponsors as s}
								<div class="spo">
									<span class="b small">{s.name}</span>
									<span class="tiny muted-2">{s.tier}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if tab === 'agenda'}
				<div class="block">
					{#each e.agenda as a, i}
						<div class="agenda">
							<div class="tl">
								<span class="dot"></span>
								{#if i < e.agenda.length - 1}<span class="line"></span>{/if}
							</div>
							<div class="abody">
								<span class="tiny b" style="color:var(--accent)">{a.time}</span>
								<span class="b small">{a.title}</span>
								{#if a.who}<span class="tiny muted-2">{a.who}</span>{/if}
							</div>
						</div>
					{:else}
						<p class="muted small">The organiser hasn’t published a schedule yet.</p>
					{/each}
				</div>
			{:else if tab === 'speakers'}
				<div class="block">
					{#each e.speakers as s}
						<div class="li">
							<Avatar name={s.name} hue={e.hue + 20} size={44} />
							<div class="col grow">
								<span class="b small">{s.name}</span>
								<span class="tiny muted-2">{s.role}</span>
							</div>
							<button class="btn btn-sm btn-outline" onclick={() => app.say('Following speaker')}>
								Follow
							</button>
						</div>
					{:else}
						<p class="muted small">No speakers listed.</p>
					{/each}
				</div>
			{:else if tab === 'gallery'}
				<div class="block">
					<div class="gal">
						{#each Array(Math.min(9, e.photoCount || 6)) as _, i}
							<div class="ph"><Cover hue={e.hue + i * 12} glyph="camera" radius={10} seed={i} /></div>
						{/each}
					</div>
					{#if !e.photoCount}
						<p class="muted small">Photos from past editions will appear here.</p>
					{/if}
				</div>
			{:else if tab === 'faq'}
				<div class="block">
					{#each e.faqs as f}
						<details class="faq">
							<summary><span class="b small">{f.q}</span><Icon name="chevronDown" size={16} /></summary>
							<p class="muted small">{f.a}</p>
						</details>
					{/each}
					<h3 style="margin:20px 0 10px">Policies</h3>
					<div class="pol">
						<div><span class="eyebrow">Refunds</span><p class="small muted">{e.policies.refund}</p></div>
						<div><span class="eyebrow">Transfers</span><p class="small muted">{e.policies.transfer}</p></div>
						<div><span class="eyebrow">Age</span><p class="small muted">{e.policies.age}</p></div>
						<div><span class="eyebrow">Dress code</span><p class="small muted">{e.policies.dress}</p></div>
					</div>
				</div>
			{:else if tab === 'reviews'}
				<div class="block">
					<div class="row gap-16" style="margin-bottom:14px">
						<div class="col center">
							<span style="font-size:30px;font-weight:750;letter-spacing:-.04em">{e.rating}</span>
							<Icon name="star" size={14} fill="currentColor" />
						</div>
						<div class="col grow gap-6">
							<span class="small muted">{compact(e.reviewCount)} reviews</span>
							<span class="tiny muted-2">Verified attendees only</span>
						</div>
						<button class="btn btn-sm btn-outline" onclick={() => app.say('Thanks for the rating!')}>
							Rate
						</button>
					</div>
					{#each e.reviews as r}
						<div class="rev">
							<Avatar name={r.name} hue={258} size={34} />
							<div class="col grow">
								<span class="row gap-6">
									<span class="b small">{r.name}</span>
									<span class="stars">
										{#each Array(r.rating) as _}<Icon name="star" size={11} fill="currentColor" />{/each}
									</span>
								</span>
								<span class="tiny muted-2">{r.date}</span>
								<p class="small" style="margin-top:4px">{r.text}</p>
							</div>
						</div>
					{:else}
						<p class="muted small">No reviews yet.</p>
					{/each}
				</div>
			{/if}

			<!-- tickets -->
			<section class="section">
				<h2>Tickets</h2>
				<div class="tickets">
					{#each e.ticketTypes as t}
						{@const left = Math.max(0, t.qty - t.sold)}
						<div class="tk" class:out={left === 0}>
							<div class="row-between">
								<span class="b">{t.name}</span>
								<span class="b">{t.price === 0 ? 'Free' : money(t.price, app.currency)}</span>
							</div>
							<p class="tiny muted-2" style="margin-top:3px">{t.perks}</p>
							<div class="row-between" style="margin-top:8px">
								<span class="tiny {left <= 10 ? 'warn-text' : 'muted-2'}">
									{left === 0 ? 'Sold out' : left <= 10 ? `${left} left` : `${left} available`}
								</span>
								<div class="stepper">
									<button
										onclick={() => step(t.id, -1)}
										disabled={!qty[t.id]}
										aria-label="Remove">−</button
									>
									<span>{qty[t.id] ?? 0}</span>
									<button
										onclick={() => step(t.id, 1)}
										disabled={left === 0 || (qty[t.id] ?? 0) >= Math.min(maxPer, left)}
										aria-label="Add">+</button
									>
								</div>
							</div>
							{#if t.salesEnd}
								<span class="tiny warn-text">Sales end {dateShort(t.salesEnd)}</span>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			{#if similar.length}
				<section class="section">
					<div class="section-head"><h2>Similar events</h2></div>
					<div class="rail-h scroll-x">
						{#each similar as s (s.id)}
							<div class="rail-item"><EventCard event={s} compactMode /></div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- sticky CTA -->
		<div class="sticky-cta">
			<div class="inner">
				<div class="col" style="min-width:0">
					<span class="tiny muted-2">
						{selCount ? `${selCount} × selected` : money(Math.min(...e.ticketTypes.map((t) => t.price)), app.currency)}
					</span>
					<span class="b">{selCount ? money(selTotal, app.currency) : 'From ' + money(Math.min(...e.ticketTypes.map((t) => t.price)), app.currency)}</span>
				</div>
				{#if soldOut}
					<button
						class="btn btn-primary grow"
						onclick={() => {
							app.toggleWaitlist(e.id);
						}}
					>
						{onWaitlist ? 'On waitlist' : 'Join waitlist'}
					</button>
				{:else}
					<button class="btn btn-primary grow" disabled={!selCount} onclick={proceed}>
						{selCount ? 'Checkout' : 'Select tickets'}
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- ticket sheet (alternative flow) -->
	<Sheet bind:open={shareOpen} title="Share this event">
		<div class="col gap-8">
			<button
				class="srow"
				onclick={async () => {
					await copy(location.href);
					shareOpen = false;
					app.say('Link copied');
				}}
			>
				<Icon name="link" size={18} /> Copy link
			</button>
			<button class="srow" onclick={() => (shareOpen = false)}>
				<Icon name="message" size={18} /> Send in a message
			</button>
			<button class="srow" onclick={() => (shareOpen = false)}>
				<Icon name="users" size={18} /> Invite friends
			</button>
			<button class="srow" onclick={() => (shareOpen = false)}>
				<Icon name="qr" size={18} /> Show QR code
			</button>
		</div>
	</Sheet>

	<Sheet bind:open={reportOpen} title="Report event">
		<p class="muted small" style="margin-bottom:12px">
			Reports are reviewed by our trust & safety team, usually within 24 hours.
		</p>
		<div class="col gap-8">
			{#each ['Misleading information', 'Scam or fake event', 'Inappropriate content', 'Wrong date or venue', 'Other'] as r}
				<button
					class="srow"
					onclick={() => {
						reportOpen = false;
						app.notify({
							kind: 'update',
							title: 'Report received',
							body: `“${r}” — we’ll review ${e.title}.`,
							href: '/notifications'
						});
						app.say('Report submitted — thank you');
					}}
				>
					<Icon name="flag" size={17} /> {r}
				</button>
			{/each}
		</div>
	</Sheet>
{/if}

<style>
	.detail {
		padding-bottom: 0;
	}
	.floats {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		padding-top: max(var(--safe-t), 8px);
		transition: background 0.2s var(--ease);
	}
	.floats.solid {
		background: color-mix(in srgb, var(--bg) 90%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--line);
	}
	.glass {
		background: rgba(255, 255, 255, 0.9);
		border-color: transparent;
		color: #0b0b0c;
		backdrop-filter: blur(6px);
	}
	:global(html[data-theme='dark']) .glass {
		background: rgba(20, 20, 22, 0.85);
		color: #f4f4f5;
	}
	.fl-title {
		font-size: 15px;
	}
	.hero {
		position: relative;
		height: min(46dvh, 380px);
		margin-top: -56px;
	}
	.hero-bottom {
		position: absolute;
		inset: auto 0 14px 0;
	}
	.block {
		padding: 16px 0;
	}
	.actions {
		display: flex;
		gap: 8px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--line);
	}
	.act {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 10px 4px;
		border-radius: var(--r);
		border: 0;
		background: var(--surface);
		font-size: 11.5px;
		font-weight: 550;
		color: var(--text-2);
		cursor: pointer;
	}
	.act:hover {
		background: var(--surface-2);
	}
	.orgrow {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
	}
	.info {
		padding: 6px 0 4px;
	}
	.irow {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.ic {
		width: 36px;
		height: 36px;
		border-radius: 11px;
		background: var(--surface);
		display: grid;
		place-items: center;
		flex: none;
		color: var(--text-2);
	}
	.minimap {
		position: relative;
		height: 110px;
		border-radius: var(--r);
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--surface);
		margin: 12px 0;
	}
	.minimap svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.minimap line {
		stroke: var(--line);
		stroke-width: 0.5;
	}
	.pinmark {
		position: absolute;
		left: 50%;
		top: 46%;
		transform: translate(-50%, -100%);
		color: var(--accent);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}
	.mlabel {
		position: absolute;
		left: 12px;
		bottom: 8px;
	}
	.tabs-wrap {
		position: sticky;
		top: 56px;
		z-index: 20;
		background: var(--bg);
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
		margin-bottom: 4px;
	}
	.highs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 14px;
	}
	.high {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		background: var(--accent-soft);
		color: var(--accent);
		padding: 6px 11px;
		border-radius: 99px;
		font-weight: 550;
	}
	.body-text {
		line-height: 1.65;
		color: var(--text-2);
		white-space: pre-wrap;
	}
	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-top: 14px;
	}
	.sponsors {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 10px;
	}
	.spo {
		display: flex;
		flex-direction: column;
		padding: 9px 13px;
		border: 1px solid var(--line);
		border-radius: var(--r);
	}
	.agenda {
		display: flex;
		gap: 12px;
	}
	.tl {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 4px;
	}
	.tl .dot {
		width: 9px;
		height: 9px;
		border-radius: 99px;
		background: var(--accent);
		flex: none;
	}
	.tl .line {
		flex: 1;
		width: 1.5px;
		background: var(--line);
		margin: 4px 0;
	}
	.abody {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-bottom: 18px;
	}
	.gal {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}
	.ph {
		aspect-ratio: 1;
	}
	.faq {
		border-bottom: 1px solid var(--line);
		padding: 12px 0;
	}
	.faq summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		cursor: pointer;
		list-style: none;
	}
	.faq summary::-webkit-details-marker {
		display: none;
	}
	.faq p {
		padding-top: 8px;
		line-height: 1.6;
	}
	.pol {
		display: grid;
		gap: 12px;
	}
	.pol p {
		line-height: 1.6;
		margin-top: 2px;
	}
	.rev {
		display: flex;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.stars {
		display: inline-flex;
		color: #f0a500;
	}
	.tickets {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.tk {
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		padding: 14px;
		transition: border-color 0.15s var(--ease);
	}
	.tk:hover {
		border-color: var(--line-strong);
	}
	.tk.out {
		opacity: 0.55;
	}
	.warn-text {
		color: var(--warn);
		font-weight: 600;
	}
	.stepper {
		display: flex;
		align-items: center;
		gap: 2px;
		border: 1px solid var(--line-strong);
		border-radius: 99px;
		padding: 2px;
	}
	.stepper button {
		width: 28px;
		height: 28px;
		border-radius: 99px;
		border: 0;
		background: transparent;
		font-size: 17px;
		cursor: pointer;
		color: var(--text);
	}
	.stepper button:disabled {
		opacity: 0.3;
	}
	.stepper span {
		min-width: 22px;
		text-align: center;
		font-weight: 650;
		font-size: 14px;
	}
	.rail-h {
		display: flex;
		gap: 12px;
		padding: 0 0 4px;
		padding-right: var(--gutter);
		overflow-x: auto;
	}
	.rail-item {
		width: 210px;
		flex: none;
	}
	.srow {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		padding: 12px;
		border-radius: var(--r);
		border: 1px solid var(--line);
		background: var(--bg);
		font-size: 14px;
		font-weight: 550;
		cursor: pointer;
		text-align: left;
	}
	.srow:hover {
		background: var(--surface);
	}
	.rating {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #f0a500;
	}
	.rating .b {
		color: var(--text);
	}
	@media (min-width: 900px) {
		.hero {
			height: 420px;
			border-radius: 0 0 24px 24px;
		}
	}
</style>
