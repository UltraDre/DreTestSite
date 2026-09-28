<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateShort, time, countdown } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Tabs from '$comp/Tabs.svelte';

	let tab = $state('upcoming');

	const tabs = $derived([
		{ id: 'upcoming', label: 'Upcoming', count: app.upcoming.length },
		{ id: 'past', label: 'Past', count: app.pastTickets.length },
		{
			id: 'cancelled',
			label: 'Cancelled',
			count: app.tickets.filter((t) => t.status === 'cancelled' || t.status === 'refund-requested').length
		}
	]);

	const list = $derived(
		tab === 'upcoming'
			? app.upcoming
			: tab === 'past'
				? app.pastTickets
				: app.tickets
						.filter((t) => t.status === 'cancelled' || t.status === 'refund-requested')
						.map((t) => ({ t, e: app.event(t.eventId) }))
	);
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<h1 class="page-title">My tickets</h1>
				<a class="icon-btn" href="/explore" aria-label="Find events"><Icon name="search" size={18} /></a>
			</div>
			<div style="padding-bottom:8px"><Tabs {tabs} bind:value={tab} /></div>
		</div>
	</div>

	<div class="shell">
		{#if !app.user}
			<div class="soft pad-16 row gap-12" style="margin-top:12px">
				<Icon name="info" size={18} />
				<span class="small grow">Browsing as guest — tickets you buy won’t sync across devices.</span>
				<a class="btn btn-sm btn-primary" href="/auth">Sign in</a>
			</div>
		{/if}

		{#if list.length}
			<div class="col gap-12" style="margin-top:14px">
				{#each list as { t, e } (t.id)}
					<a class="tk card" href="/tickets/{t.id}">
						<div class="media">
							<Cover image={e.image} hue={e.hue} glyph="ticket" radius={0} seed={e.id.length} />
						</div>
						<div class="body">
							<div class="row-between">
								<span class="tiny muted-2">
									{dateShort(e.start)} · {time(e.start)}
								</span>
								<span
									class="tag {t.status === 'valid'
										? 'good'
										: t.status === 'used'
											? ''
											: t.status === 'cancelled'
												? 'bad'
												: 'warn'}"
								>
									{t.status === 'valid'
										? countdown(e.start).label
										: t.status === 'used'
											? 'Checked in'
											: t.status === 'cancelled'
												? 'Cancelled'
												: 'Refund pending'}
								</span>
							</div>
							<span class="b truncate">{e.title}</span>
							<span class="tiny muted-2 truncate">
								{t.typeName ?? 'General admission'} · {t.attendee ?? 'You'}
							</span>
							<div class="row-between" style="margin-top:6px">
								<span class="tiny mono muted-2">{t.code ?? 'EV-••••-••••'}</span>
								<span class="row gap-4 tiny" style="color:var(--accent);font-weight:650">
									<Icon name="qr" size={13} />
									{t.status === 'used' ? 'View' : 'Show QR'}
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="empty">
				<div class="ico"><Icon name="ticket" size={24} /></div>
				<p class="b">{tab === 'upcoming' ? 'No upcoming tickets' : 'Nothing here yet'}</p>
				<p class="small">
					{tab === 'upcoming'
						? 'Find something to do — your tickets will show up here with a scannable QR.'
						: 'Past and cancelled tickets are archived for 12 months.'}
				</p>
				<a class="btn btn-primary btn-sm" href="/explore">Explore events</a>
			</div>
		{/if}

		<div class="soft pad-16" style="margin-top:20px">
			<div class="row gap-10">
				<Icon name="offline" size={18} />
				<div class="col grow">
					<span class="b small">Offline tickets</span>
					<span class="tiny muted-2">Your QR works with no signal. Enable in Settings → Offline.</span>
				</div>
				<a class="btn btn-sm btn-outline" href="/settings">Open</a>
			</div>
		</div>
	</div>
</div>

<style>
	.tk {
		display: flex;
		align-items: stretch;
		text-decoration: none;
		transition: box-shadow 0.16s var(--ease), border-color 0.16s var(--ease);
	}
	.tk:hover {
		box-shadow: var(--shadow-md);
	}
	.media {
		width: 92px;
		flex: none;
		position: relative;
	}
	.body {
		flex: 1;
		min-width: 0;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		justify-content: center;
	}
</style>
