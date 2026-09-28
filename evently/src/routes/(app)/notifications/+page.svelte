<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { timeAgo } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';

	const iconFor = {
		reminder: 'clock',
		payment: 'card',
		checkin: 'checkCircle',
		follow: 'users',
		update: 'megaphone',
		ticket: 'ticket',
		message: 'message',
		waitlist: 'bell'
	};

	let filter = $state('all');
	const list = $derived(
		filter === 'all' ? app.notifications : app.notifications.filter((n) => n.kind === filter)
	);
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<h1 class="page-title">Notifications</h1>
				<button class="btn btn-ghost btn-sm" onclick={app.markAllRead}>Mark all read</button>
			</div>
			<div class="scroll-x row gap-6" style="padding-bottom:10px">
				{#each ['all', 'reminder', 'payment', 'checkin', 'follow', 'update'] as f}
					<button class="chip sm" class:on={filter === f} onclick={() => (filter = f)}>
						{f === 'all' ? 'All' : f}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="shell">
		{#if list.length}
			<div class="list" style="margin-top:6px">
				{#each list as n (n.id)}
					<a class="notif" href={n.href ?? '/notifications'} class:unread={!n.read}>
						<span class="ic" class:unread={!n.read}>
							<Icon name={iconFor[n.kind] ?? 'bell'} size={17} />
						</span>
						<span class="col grow" style="min-width:0">
							<span class="b small">{n.title}</span>
							<span class="small muted clamp-2">{n.body}</span>
							<span class="tiny muted-2">{timeAgo(n.at)}</span>
						</span>
						{#if !n.read}<span class="udot"></span>{/if}
					</a>
				{/each}
			</div>
		{:else}
			<div class="empty">
				<div class="ico"><Icon name="bell" size={24} /></div>
				<p class="b">You’re all caught up</p>
				<p class="small">Reminders, check-ins and organiser updates land here.</p>
			</div>
		{/if}

		<div class="soft pad-16" style="margin-top:20px">
			<span class="b small">Channel preferences</span>
			<div class="col gap-8" style="margin-top:10px">
				{#each [['Push', 'push'], ['Email', 'email'], ['SMS', 'sms']] as [label, key]}
					<div class="li">
						<span class="grow small">{label}</span>
						<span class="tiny muted-2">
							{Object.entries(app.prefs[key])
								.filter(([, v]) => v)
								.map(([k]) => k)
								.join(', ') || 'off'}
						</span>
						<a class="link small" href="/settings">Edit</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.notif {
		display: flex;
		gap: 12px;
		padding: 13px 0;
		border-bottom: 1px solid var(--line);
		position: relative;
	}
	.ic {
		width: 38px;
		height: 38px;
		border-radius: 12px;
		background: var(--surface);
		display: grid;
		place-items: center;
		color: var(--text-2);
		flex: none;
	}
	.ic.unread {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.udot {
		width: 8px;
		height: 8px;
		border-radius: 99px;
		background: var(--accent);
		flex: none;
		align-self: center;
	}
	.link {
		color: var(--accent);
		font-weight: 600;
	}
</style>
