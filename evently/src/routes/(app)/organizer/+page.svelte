<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateShort, compact, pct, timeAgo } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import Tabs from '$comp/Tabs.svelte';

	const org = $derived(app.organizer(app.myOrganizerId));
	let tab = $state('live');

	const mine = $derived(app.myEvents);
	const live = $derived(mine.filter((e) => e.status === 'published' && new Date(e.start) > Date.now()));
	const drafts = $derived(mine.filter((e) => e.status === 'draft'));
	const past = $derived(mine.filter((e) => new Date(e.start) <= Date.now() || e.status === 'cancelled'));

	const tabs = $derived([
		{ id: 'live', label: 'Live & upcoming', count: live.length },
		{ id: 'drafts', label: 'Drafts', count: drafts.length },
		{ id: 'past', label: 'Past', count: past.length }
	]);
	const list = $derived(tab === 'live' ? live : tab === 'drafts' ? drafts : past);

	const totalSold = $derived(
		mine.reduce((s, e) => s + e.ticketTypes.reduce((x, t) => x + t.sold, 0), 0)
	);
	const gross = $derived(
		mine.reduce((s, e) => s + e.ticketTypes.reduce((x, t) => x + t.sold * t.price, 0), 0)
	);
	const net = $derived(Math.round(gross * 0.94));
	const totalCheckedIn = $derived(
		app.tickets.filter((t) => mine.some((e) => e.id === t.eventId) && t.checkedInAt).length
	);

	/* 7-day sales series derived from event data (demo) */
	const series = $derived.by(() => {
		const base = Math.max(1, Math.round(gross / 40000));
		return Array.from({ length: 14 }, (_, i) => {
			const wave = Math.sin(i / 2.1) * 0.35 + Math.cos(i / 3.3) * 0.2;
			return Math.max(2, Math.round(base * (0.4 + (i / 14) * 0.9 + wave)));
		});
	});
	const maxS = $derived(Math.max(...series));

	const recentOrders = $derived(
		app.orders.slice(0, 4).map((o) => ({ ...o, event: app.event(o.eventId) }))
	);
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<div class="row gap-10 grow" style="min-width:0">
					{#if org}<Avatar name={org.name} hue={org.hue} size={34} />{/if}
					<div class="col" style="min-width:0">
						<span class="tiny muted-2">Organizer</span>
						<span class="b truncate">{org?.name ?? 'Your organization'}</span>
					</div>
				</div>
				<a class="btn btn-sm btn-primary" href="/organizer/create">
					<Icon name="plus" size={16} /> Create
				</a>
			</div>
		</div>
	</div>

	<div class="shell">
		<div class="kpis">
			<div class="kpi">
				<span class="k">Tickets sold</span>
				<span class="v">{compact(totalSold)}</span>
				<span class="d good">+18% vs last month</span>
			</div>
			<div class="kpi">
				<span class="k">Gross revenue</span>
				<span class="v">{money(gross, app.currency)}</span>
				<span class="d good">+12%</span>
			</div>
			<div class="kpi">
				<span class="k">Check-in rate</span>
				<span class="v">{pct(totalCheckedIn, Math.max(totalSold, 1))}%</span>
				<span class="d muted-2">{totalCheckedIn} scanned</span>
			</div>
			<div class="kpi">
				<span class="k">Followers</span>
				<span class="v">{compact(org?.followers ?? 0)}</span>
				<span class="d good">+244 this week</span>
			</div>
		</div>

		<div class="card card-pad chart">
			<div class="row-between" style="margin-bottom:12px">
				<div>
					<span class="eyebrow">Sales · last 14 days</span>
					<div class="b" style="font-size:18px">{money(gross, app.currency)}</div>
				</div>
				<div class="row gap-6">
					<span class="chip sm on">Tickets</span>
					<span class="chip sm">Revenue</span>
				</div>
			</div>
			<div class="bars">
				{#each series as v, i}
					<div class="bar-wrap" title="{v} tickets">
						<div class="bar" style="height:{(v / maxS) * 100}%;--d:{i * 40}ms"></div>
					</div>
				{/each}
			</div>
			<div class="row-between tiny muted-2" style="margin-top:8px">
				<span>14 days ago</span><span>Today</span>
			</div>
		</div>

		<div class="row gap-8" style="margin:14px 0">
			<a class="qa grow" href="/organizer/scan">
				<Icon name="scan" size={18} /> Check-in
			</a>
			<a class="qa grow" href="/organizer/events/{live[0]?.id ?? ''}">
				<Icon name="users" size={18} /> Attendees
			</a>
			<button class="qa grow" onclick={() => app.say('Payout requested — arrives in 48h')}>
				<Icon name="banknote" size={18} /> Payouts
			</button>
		</div>

		<div class="payout">
			<div class="col grow">
				<span class="tiny muted-2">Available for payout</span>
				<span class="b" style="font-size:20px">{money(net, app.currency)}</span>
				<span class="tiny muted-2">Next payout in 2 days · GTBank ••••6789</span>
			</div>
			<button class="btn btn-primary btn-sm" onclick={() => app.say('Payout requested')}>
				Withdraw
			</button>
		</div>

		<h2 style="margin:22px 0 4px">Your events</h2>
		<div class="tabs-wrap"><Tabs {tabs} bind:value={tab} /></div>

		<div class="col gap-10" style="margin-top:12px">
			{#each list as e (e.id)}
				<a class="ev card" href="/organizer/events/{e.id}">
					<div class="media"><Cover image={e.image} hue={e.hue} glyph="sparkle" radius={0} seed={e.id.length} /></div>
					<div class="col grow" style="min-width:0;padding:11px 13px">
						<div class="row gap-6">
							<span class="b small truncate">{e.title}</span>
							{#if e.status === 'draft'}<span class="tag warn">Draft</span>{/if}
							{#if e.status === 'cancelled'}<span class="tag bad">Cancelled</span>{/if}
						</div>
						<span class="tiny muted-2">{dateShort(e.start)} · {app.venue(e.venueId)?.name}</span>
						<div class="row gap-12" style="margin-top:6px">
							<span class="tiny">
								<b>{e.ticketTypes.reduce((s, t) => s + t.sold, 0)}</b> sold
							</span>
							<span class="tiny muted-2">
								{money(
									e.ticketTypes.reduce((s, t) => s + t.sold * t.price, 0),
									app.currency
								)}
							</span>
						</div>
						<div class="prog"><i style="width:{pct(e.ticketTypes.reduce((s, t) => s + t.sold, 0), e.capacity)}%"></i></div>
					</div>
				</a>
			{:else}
				<div class="empty">
					<div class="ico"><Icon name="calendar" size={24} /></div>
					<p class="b">{tab === 'drafts' ? 'No drafts' : 'No events here'}</p>
					<p class="small">Create your first event — it takes about three minutes.</p>
					<a class="btn btn-primary btn-sm" href="/organizer/create">Create event</a>
				</div>
			{/each}
		</div>

		{#if recentOrders.length}
			<h2 style="margin:24px 0 8px">Recent orders</h2>
			<div class="card card-pad">
				{#each recentOrders as o}
					<div class="li">
						<div class="col grow" style="min-width:0">
							<span class="b small truncate">{o.buyer}</span>
							<span class="tiny muted-2 truncate">
								{o.event?.title} · {o.lines.map((l) => `${l.qty}× ${l.name}`).join(', ')}
							</span>
						</div>
						<div class="right">
							<div class="b small">{money(o.total, app.currency)}</div>
							<div class="tiny muted-2">{timeAgo(o.at)}</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<h2 style="margin:24px 0 8px">Team</h2>
		<div class="card card-pad">
			{#each [['Tunde Bakare', 'Co-host · full access'], ['Sade Lawal', 'Check-in staff'], ['Femi Ade', 'Editor']] as [n, r], i}
				<div class="li">
					<Avatar name={n} hue={[258, 12, 32][i]} size={36} />
					<div class="col grow">
						<span class="b small">{n}</span>
						<span class="tiny muted-2">{r}</span>
					</div>
					<button class="btn btn-sm btn-ghost" onclick={() => app.say('Permissions opened')}>
						Manage
					</button>
				</div>
			{/each}
			<button class="btn btn-outline btn-block" style="margin-top:10px" onclick={() => app.say('Invite sent')}>
				<Icon name="plus" size={15} /> Invite team member
			</button>
		</div>
	</div>
</div>

<style>
	.kpis {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
	.kpi {
		background: var(--surface);
		border-radius: var(--r-lg);
		padding: 13px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.kpi .k {
		font-size: 11.5px;
		color: var(--text-3);
		font-weight: 600;
	}
	.kpi .v {
		font-size: 20px;
		font-weight: 720;
		letter-spacing: -0.03em;
	}
	.kpi .d {
		font-size: 11.5px;
		font-weight: 600;
	}
	.d.good {
		color: var(--good);
	}
	.chart {
		margin-top: 12px;
	}
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		height: 110px;
	}
	.bar-wrap {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}
	.bar {
		width: 100%;
		border-radius: 5px 5px 2px 2px;
		background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #fff));
		animation: grow 0.5s var(--ease) both;
		animation-delay: var(--d);
		min-height: 3px;
	}
	@keyframes grow {
		from {
			height: 0;
		}
	}
	.qa {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 6px;
		border-radius: var(--r-lg);
		background: var(--surface);
		font-size: 12px;
		font-weight: 550;
		color: var(--text-2);
	}
	.qa:hover {
		background: var(--surface-2);
	}
	.payout {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-radius: var(--r-lg);
		background: linear-gradient(120deg, hsl(258 60% 56%), hsl(218 60% 46%));
		color: #fff;
	}
	.payout .muted-2,
	.payout .tiny {
		color: rgba(255, 255, 255, 0.82) !important;
	}
	.payout :global(.btn-primary) {
		background: #fff;
		color: #0b0b0c;
	}
	.ev {
		display: flex;
		text-decoration: none;
	}
	.media {
		width: 84px;
		flex: none;
	}
	.prog {
		height: 3px;
		border-radius: 99px;
		background: var(--surface-2);
		margin-top: 7px;
		overflow: hidden;
	}
	.prog i {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.tabs-wrap {
		border-bottom: 1px solid var(--line);
	}
	@media (min-width: 900px) {
		.kpis {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
