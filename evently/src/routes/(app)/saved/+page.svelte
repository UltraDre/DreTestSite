<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { dateShort, time, compact } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import EventCard from '$comp/EventCard.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import Tabs from '$comp/Tabs.svelte';

	let tab = $state('events');
	const tabs = $derived([
		{ id: 'events', label: 'Saved events', count: app.savedEvents.length },
		{ id: 'organizers', label: 'Organizers', count: app.followingOrg.length },
		{ id: 'searches', label: 'Saved searches', count: app.savedSearches.length },
		{ id: 'waitlist', label: 'Waitlist', count: app.waitlist.length }
	]);

	const saved = $derived(
		app.savedEvents.map((id) => app.event(id)).filter(Boolean)
	);
	const orgs = $derived(app.followingOrg.map((id) => app.organizer(id)).filter(Boolean));
	const waits = $derived(app.waitlist.map((id) => app.event(id)).filter(Boolean));
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px"><h1 class="page-title">Saved</h1></div>
			<div style="padding-bottom:8px"><Tabs {tabs} bind:value={tab} /></div>
		</div>
	</div>

	<div class="shell">
		{#if tab === 'events'}
			{#if saved.length}
				<div class="grid" style="margin-top:14px">
					{#each saved as e (e.id)}
						<div class="rel">
							<EventCard event={e} layout="horizontal" />
							<button
								class="rm"
								onclick={() => app.toggleSave(e.id)}
								aria-label="Remove"
							>
								<Icon name="x" size={14} />
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty">
					<div class="ico"><Icon name="heart" size={24} /></div>
					<p class="b">Nothing saved yet</p>
					<p class="small">Tap the heart on any event to keep it here for later.</p>
					<a class="btn btn-primary btn-sm" href="/explore">Find events</a>
				</div>
			{/if}
		{:else if tab === 'organizers'}
			<div class="list" style="margin-top:10px">
				{#each orgs as o (o.id)}
					<a class="li li-click" href="/organizers/{o.id}">
						<Avatar name={o.name} hue={o.hue} size={42} />
						<div class="col grow">
							<span class="b small">{o.name}</span>
							<span class="tiny muted-2">{compact(o.followers)} followers · {app.organizerEvents(o.id).length} upcoming</span>
						</div>
						<button
							class="btn btn-sm btn-outline"
							onclick={(ev) => {
								ev.preventDefault();
								app.toggleFollowOrg(o.id);
							}}
						>
							Following
						</button>
					</a>
				{:else}
					<div class="empty"><p class="small">You’re not following any organizers yet.</p></div>
				{/each}
			</div>
		{:else if tab === 'searches'}
			<div class="list" style="margin-top:10px">
				{#each app.savedSearches as s (s.id)}
					<div class="li">
						<span class="ic"><Icon name="search" size={16} /></span>
						<span class="grow small b">{s.label}</span>
						<label class="rswitch">
							<input type="checkbox" checked />
							<span class="tiny muted-2">Alerts</span>
						</label>
					</div>
				{:else}
					<div class="empty"><p class="small">No saved searches.</p></div>
				{/each}
			</div>
			<p class="hint" style="margin-top:10px">
				Saved searches notify you when new matching events are published.
			</p>
		{:else}
			<div class="grid" style="margin-top:14px">
				{#each waits as e (e.id)}
					<div class="rel">
						<EventCard event={e} layout="horizontal" compactMode />
						<button class="rm" onclick={() => app.toggleWaitlist(e.id)} aria-label="Leave waitlist">
							<Icon name="x" size={14} />
						</button>
					</div>
				{:else}
					<div class="empty">
						<div class="ico"><Icon name="bell" size={24} /></div>
						<p class="b">No waitlists</p>
						<p class="small">Join a waitlist on sold-out events and we’ll alert you.</p>
					</div>
				{/each}
			</div>
		{/if}

		<div class="soft pad-16 row gap-10" style="margin-top:20px">
			<Icon name="calendar" size={17} />
			<div class="col grow">
				<span class="b small">Calendar sync</span>
				<span class="tiny muted-2">Automatically add saved events to Google, Apple or Outlook.</span>
			</div>
			<button class="btn btn-sm btn-outline" onclick={() => app.say('Calendar connected')}>Connect</button>
		</div>
	</div>
</div>

<style>
	.rel {
		position: relative;
	}
	.rm {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 26px;
		height: 26px;
		border-radius: 99px;
		border: 0;
		background: var(--surface-2);
		color: var(--text-2);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.ic {
		width: 34px;
		height: 34px;
		border-radius: 10px;
		background: var(--surface);
		display: grid;
		place-items: center;
	}
	.rswitch {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.rswitch input {
		accent-color: var(--accent);
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
