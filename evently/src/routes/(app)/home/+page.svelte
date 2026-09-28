<script>
	import { goto } from '$app/navigation';
	import { app } from '$shared/lib/state.svelte.js';
	import { CATEGORIES } from '$shared/lib/data.js';
	import { money, dateShort, time, countdown, compact } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import EventCard from '$comp/EventCard.svelte';

	const hour = new Date().getHours();
	const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	const published = $derived(
		app.events.filter((e) => e.status === 'published' && new Date(e.start) > Date.now())
	);
	const featured = $derived(published.filter((e) => e.featured)[0] ?? published[0]);
	const nearYou = $derived(
		[...published].sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 6)
	);
	const forYou = $derived(
		published
			.filter((e) => app.interests.includes(e.category))
			.sort((a, b) => b.sold / b.capacity - a.sold / a.capacity)
	);
	const trending = $derived(
		[...published].sort((a, b) => b.sold / b.capacity - a.sold / a.capacity).slice(0, 5)
	);
	const fromFollowing = $derived(
		published.filter((e) => app.followingOrg.includes(e.organizerId)).slice(0, 6)
	);
	const recent = $derived(app.recent.map((id) => app.event(id)).filter(Boolean).slice(0, 4));
	const nextTicket = $derived(app.upcoming[0]);
	const thisMonth = $derived(
		published.filter((e) => new Date(e.start) - Date.now() < 30 * 86400000).length
	);
</script>

<div class="page">
	<!-- header -->
	<div class="shell">
		<div class="top row-between">
			<div class="row gap-10">
				{#if app.user}
					<a href="/profile"><Avatar name={app.user.name} hue={app.user.hue} size={38} /></a>
				{:else}
					<a href="/auth" class="guest-avatar"><Icon name="user" size={18} /></a>
				{/if}
				<div class="col">
					<span class="tiny muted-2">{greet}{app.user ? `, ${app.user.name.split(' ')[0]}` : ''}</span>
					<button class="loc" onclick={() => goto('/explore?view=map')}>
						<Icon name="pin" size={13} />
						<span class="b small">{app.city}</span>
						<Icon name="chevronDown" size={13} />
					</button>
				</div>
			</div>
			<div class="row gap-8">
				<a class="icon-btn" href="/notifications" aria-label="Notifications">
					<Icon name="bell" size={19} />
					{#if app.unread}<i class="dot"></i>{/if}
				</a>
				{#if !app.user}
					<a class="btn btn-sm btn-primary" href="/auth">Sign in</a>
				{/if}
			</div>
		</div>

		<!-- search -->
		<a class="search" href="/explore" style="margin:12px 0 14px">
			<Icon name="search" size={18} />
			<span class="muted-2">Search events, organizers, venues…</span>
			<span class="kbd"><Icon name="sliders" size={16} /></span>
		</a>

		<!-- next ticket strip -->
		{#if nextTicket}
			<a class="next" href="/tickets/{nextTicket.t.id}">
				<div class="nt-media">
					<Cover
						image={nextTicket.e.image}
						hue={nextTicket.e.hue}
						glyph="ticket"
						radius={12}
						seed={nextTicket.e.id.length}
					/>
				</div>
				<div class="col grow" style="min-width:0">
					<span class="eyebrow">Next up · {countdown(nextTicket.e.start).label}</span>
					<span class="b truncate">{nextTicket.e.title}</span>
					<span class="tiny muted-2 truncate">
						{dateShort(nextTicket.e.start)} · {time(nextTicket.e.start)} · {nextTicket.t.typeName ??
							'General'}
					</span>
				</div>
				<span class="btn btn-sm btn-primary">View QR</span>
			</a>
		{/if}
	</div>

	<!-- categories -->
	<div class="shell">
		<div class="cats scroll-x">
			<a class="cat" href="/explore">
				<span class="ci" style="background:hsl(258 62% 56%)"><Icon name="sparkle" size={16} /></span>
				All
			</a>
			{#each CATEGORIES as c}
				<a class="cat" href="/explore?category={c.id}">
					<span class="ci" style="background:hsl({c.hue} 62% 56%)">
						<Icon
							name={{ music: 'headphones', tech: 'zap', business: 'briefcase', sports: 'dumbbell', arts: 'palette', food: 'utensils', health: 'pulse', community: 'users' }[
								c.id
							]}
							size={16}
						/>
					</span>
					{c.name}
				</a>
			{/each}
		</div>
	</div>

	<!-- featured -->
	{#if featured}
		<div class="shell">
			<a class="hero" href="/events/{featured.slug}">
				<Cover image={featured.image} hue={featured.hue} glyph="sparkle" radius={20} seed={featured.id.length} />
				<div class="hero-body">
					<span class="tag" style="background:rgba(255,255,255,.2);color:#fff;backdrop-filter:blur(4px)">
						<Icon name="zap" size={11} /> Featured
					</span>
					<h2 style="color:#fff">{featured.title}</h2>
					<p class="small" style="color:rgba(255,255,255,.82)">{featured.summary}</p>
					<div class="row gap-8" style="margin-top:6px">
						<span class="tiny" style="color:rgba(255,255,255,.9)">
							{dateShort(featured.start)} · {compact(featured.sold)} going
						</span>
					</div>
				</div>
			</a>
		</div>
	{/if}

	<!-- near you -->
	<section class="shell section">
		<div class="section-head">
			<div>
				<span class="eyebrow">Near you</span>
				<h2>{thisMonth} events in {app.city} this month</h2>
			</div>
			<a class="link small" href="/explore">See all</a>
		</div>
		<div class="rail-scroll-h scroll-x">
			{#each nearYou as e (e.id)}
				<div class="rail-item"><EventCard event={e} /></div>
			{/each}
		</div>
	</section>

	<!-- recommended -->
	{#if forYou.length}
		<section class="shell section">
			<div class="section-head">
				<div>
					<span class="eyebrow">Recommended</span>
					<h2>Because you picked {app.interests.slice(0, 2).join(' & ')}</h2>
				</div>
			</div>
			<div class="grid grid-2" style="--min:1">
				{#each forYou.slice(0, 4) as e (e.id)}
					<EventCard event={e} layout="horizontal" compactMode />
				{/each}
			</div>
		</section>
	{/if}

	<!-- followed organizers -->
	{#if fromFollowing.length}
		<section class="shell section">
			<div class="section-head">
				<div>
					<span class="eyebrow">Following</span>
					<h2>New from organizers you follow</h2>
				</div>
			</div>
			<div class="rail-scroll-h scroll-x">
				{#each fromFollowing as e (e.id)}
					<div class="rail-item"><EventCard event={e} /></div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- trending -->
	<section class="shell section">
		<div class="section-head">
			<div>
				<span class="eyebrow">Trending</span>
				<h2>Selling fast</h2>
			</div>
		</div>
		<div class="card card-pad" style="padding:6px 16px">
			{#each trending as e, i (e.id)}
				<a class="li li-click" href="/events/{e.slug}">
					<span class="rank">{i + 1}</span>
					<div class="col grow" style="min-width:0">
						<span class="b small truncate">{e.title}</span>
						<span class="tiny muted-2 truncate">
							{dateShort(e.start)} · {app.organizer(e.organizerId)?.name}
						</span>
					</div>
					<div class="right">
						<div class="b small">{Math.round((e.sold / e.capacity) * 100)}%</div>
						<div class="tiny muted-2">sold</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- organizers to follow -->
	<section class="shell section">
		<div class="section-head">
			<div>
				<span class="eyebrow">People to follow</span>
				<h2>Organizers you might like</h2>
			</div>
		</div>
		<div class="rail-scroll-h scroll-x">
			{#each app.organizers.filter((o) => !app.followingOrg.includes(o.id)).slice(0, 5) as o (o.id)}
				<div class="org-card card card-pad">
					<div class="col gap-6 center">
						<Avatar name={o.name} hue={o.hue} size={46} />
						<span class="b small truncate" style="max-width:120px">{o.name}</span>
						<span class="tiny muted-2">{compact(o.followers)} followers</span>
					</div>
					<button class="btn btn-sm btn-outline" onclick={() => app.toggleFollowOrg(o.id)}>
						Follow
					</button>
				</div>
			{/each}
		</div>
	</section>

	{#if recent.length}
		<section class="shell section">
			<div class="section-head"><h2>Recently viewed</h2></div>
			<div class="rail-scroll-h scroll-x">
				{#each recent as e (e.id)}
					<div class="rail-item"><EventCard event={e} compactMode /></div>
				{/each}
			</div>
		</section>
	{/if}

	<div class="shell">
		<div class="soft pad-16 row gap-12">
			<span class="qi"><Icon name="megaphone" size={18} /></span>
			<div class="col grow">
				<span class="b small">Running an event?</span>
				<span class="tiny muted-2">Publish in minutes and get paid out in 48 hours.</span>
			</div>
			<a class="btn btn-sm btn-primary" href="/organizer/create">Start</a>
		</div>
	</div>
</div>

<style>
	.top {
		padding: 6px 0 2px;
	}
	.loc {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		color: var(--text);
	}
	.guest-avatar {
		width: 38px;
		height: 38px;
		border-radius: 99px;
		background: var(--surface-2);
		display: grid;
		place-items: center;
		color: var(--text-2);
	}
	.icon-btn {
		position: relative;
	}
	.icon-btn .dot {
		position: absolute;
		top: 8px;
		right: 9px;
		width: 7px;
		height: 7px;
		border-radius: 99px;
		background: var(--bad);
		border: 1.5px solid var(--bg);
	}
	.kbd {
		color: var(--text-3);
		display: grid;
		place-items: center;
	}
	.next {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 14px;
		padding: 12px;
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
		background: var(--bg-elev);
	}
	.nt-media {
		width: 46px;
		height: 46px;
		flex: none;
	}
	.cats {
		display: flex;
		gap: 8px;
		padding: 18px 0 6px;
	}
	.cat {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 7px 13px 7px 8px;
		border-radius: 99px;
		border: 1px solid var(--line);
		font-size: 13.5px;
		font-weight: 550;
		white-space: nowrap;
	}
	.cat:hover {
		background: var(--surface);
	}
	.ci {
		width: 26px;
		height: 26px;
		border-radius: 99px;
		display: grid;
		place-items: center;
		color: #fff;
	}
	.hero {
		position: relative;
		display: block;
		height: 260px;
		border-radius: 20px;
		overflow: hidden;
		margin-top: 14px;
	}
	.hero-body {
		position: absolute;
		inset: auto 0 0 0;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: flex-start;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.78));
	}
	.rail-scroll-h {
		display: flex;
		gap: 12px;
		padding-bottom: 4px;
		padding-right: var(--gutter);
		overflow-x: auto;
		scroll-snap-type: x proximity;
	}
	.rail-scroll-h > * {
		scroll-snap-align: start;
	}
	.rail-item {
		width: 232px;
		flex: none;
	}
	.rank {
		width: 24px;
		height: 24px;
		border-radius: 8px;
		background: var(--surface-2);
		display: grid;
		place-items: center;
		font-size: 12px;
		font-weight: 700;
		flex: none;
	}
	.org-card {
		width: 152px;
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		padding: 14px 12px;
	}
	.org-card :global(.col) {
		align-items: center;
	}
	.org-card :global(.btn) {
		width: 100%;
	}
	.link {
		color: var(--accent);
		font-weight: 600;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.hero {
			height: 320px;
		}
	}
</style>
