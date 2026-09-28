<script>
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateShort, compact, timeAgo } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import EventCard from '$comp/EventCard.svelte';
	import Tabs from '$comp/Tabs.svelte';

	const id = $derived(page.params.id);
	const o = $derived(app.organizer(id));
	const events = $derived(app.organizerEvents(id));
	const past = $derived(
		app.events.filter((e) => e.organizerId === id && new Date(e.start) < Date.now())
	);
	let tab = $state('events');
	const tabs = $derived([
		{ id: 'events', label: 'Events', count: events.length },
		{ id: 'past', label: 'Past', count: past.length },
		{ id: 'about', label: 'About' }
	]);
	const following = $derived(app.isFollowingOrg(id));
</script>

{#if !o}
	<div class="empty"><p class="b">Organizer not found</p><a class="btn btn-sm btn-outline" href="/explore">Explore</a></div>
{:else}
	<div class="page">
		<div class="page-head">
			<div class="shell row" style="height:56px">
				<button class="icon-btn" onclick={() => history.back()} aria-label="Back">
					<Icon name="arrowLeft" size={19} />
				</button>
				<h1 class="page-title">{o.name}</h1>
				<button class="icon-btn" onclick={() => app.say('Link copied')} aria-label="Share">
					<Icon name="share" size={18} />
				</button>
			</div>
		</div>

		<div class="banner">
			<Cover hue={o.hue} glyph="sparkle" radius={0} seed={o.id.length} />
		</div>

		<div class="shell">
			<div class="head">
				<Avatar name={o.name} hue={o.hue} size={72} />
				<div class="col grow" style="margin-top:8px">
					<span class="row gap-6" style="font-size:20px;font-weight:700;letter-spacing:-.03em">
						{o.name}
						{#if o.verified}
							<span class="badge-verify" style="width:20px;height:20px">
								<Icon name="check" size={12} stroke={3.6} />
							</span>
						{/if}
					</span>
					<span class="small muted-2">@{o.handle} · {o.city} · joined {o.joined}</span>
				</div>
			</div>

			<div class="row gap-8" style="margin:14px 0">
				<button
					class="btn grow {following ? 'btn-outline' : 'btn-primary'}"
					onclick={() => app.toggleFollowOrg(id)}
				>
					{following ? 'Following' : 'Follow'}
				</button>
				<button class="btn btn-outline grow" onclick={() => app.say('Message thread opened')}>
					<Icon name="message" size={16} /> Message
				</button>
			</div>

			<div class="stats">
				<div class="stat"><div class="n">{compact(o.followers)}</div><div class="k">Followers</div></div>
				<div class="stat"><div class="n">{events.length}</div><div class="k">Upcoming</div></div>
				<div class="stat">
					<div class="n">{o.rating}</div>
					<div class="k">Rating ({compact(o.reviewCount)})</div>
				</div>
			</div>

			<div class="row gap-6 wrap" style="margin:12px 0">
				{#each o.badges as b}
					<span class="tag good"><Icon name="shieldCheck" size={11} /> {b} verified</span>
				{/each}
			</div>

			<div class="tabs-wrap"><Tabs {tabs} bind:value={tab} /></div>

			{#if tab === 'events'}
				<div class="grid" style="margin-top:12px">
					{#each events as ev (ev.id)}
						<EventCard event={ev} layout="horizontal" />
					{:else}
						<div class="empty"><p class="small">No upcoming events right now.</p></div>
					{/each}
				</div>
			{:else if tab === 'past'}
				<div class="grid" style="margin-top:12px">
					{#each past as ev (ev.id)}
						<EventCard event={ev} layout="horizontal" compactMode />
					{:else}
						<div class="empty"><p class="small">No past events.</p></div>
					{/each}
				</div>
			{:else}
				<div class="block">
					<p class="muted" style="line-height:1.65">{o.bio}</p>
					<div class="col gap-8" style="margin-top:16px">
						<div class="li">
							<Icon name="globe" size={17} />
							<span class="grow small">{o.website}</span>
							<a class="link small" href="https://{o.website}" target="_blank" rel="noreferrer">Visit</a>
						</div>
						<div class="li">
							<Icon name="message" size={17} />
							<span class="grow small">{o.socials.ig ?? o.socials.x}</span>
							<span class="link small">Follow</span>
						</div>
						<div class="li">
							<Icon name="users" size={17} />
							<span class="grow small">Team members</span>
							<span class="small muted-2">4</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.banner {
		height: 132px;
		opacity: 0.9;
		position: relative;
		z-index: 0;
	}
	.head {
		display: flex;
		align-items: flex-end;
		gap: 14px;
		margin-top: -42px;
		position: relative;
		z-index: 1;
	}
	.tabs-wrap {
		margin-top: 8px;
		border-bottom: 1px solid var(--line);
	}
	.block {
		padding: 14px 0;
	}
	.link {
		color: var(--accent);
		font-weight: 600;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
