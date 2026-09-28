<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { INTERESTS } from '$shared/lib/data.js';
	import { compact, dateShort, time, dayNum, monthShort } from '$shared/lib/util.js';
	import { prettyUrl, normaliseUrl } from '$shared/lib/media.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import EventCard from '$comp/EventCard.svelte';
	import Sheet from '$comp/Sheet.svelte';
	import Tabs from '$comp/Tabs.svelte';
	import PhotoPicker from '$comp/PhotoPicker.svelte';

	let tab = $state('activity');
	let editOpen = $state(false);
	let followingOpen = $state(false);
	let followersOpen = $state(false);
	let form = $state({ name: '', handle: '', bio: '', city: '', link: '' });

	/* refill the form every time the sheet opens so it never shows stale values */
	$effect(() => {
		if (editOpen && app.user) {
			form = {
				name: app.user.name,
				handle: app.user.handle ?? '',
				bio: app.user.bio ?? '',
				city: app.user.city ?? 'Lagos',
				link: app.user.link ?? ''
			};
		}
	});

	const tabs = $derived([
		{ id: 'activity', label: 'Activity' },
		{ id: 'tickets', label: 'Tickets', count: app.tickets.length },
		{ id: 'saved', label: 'Saved', count: app.savedEvents.length },
		{
			id: 'following',
			label: 'Following',
			count: app.followingOrg.length + app.followingPeople.length
		}
	]);

	const saved = $derived(app.savedEvents.map((id) => app.event(id)).filter(Boolean));
	const followsOrg = $derived(app.followingOrg.map((id) => app.organizer(id)).filter(Boolean));
	const followsPeople = $derived(app.followingPeople.map((id) => app.person(id)).filter(Boolean));

	function saveProfile() {
		if (!app.user) return;
		app.user.name = form.name.trim() || app.user.name;
		const h = String(form.handle)
			.trim()
			.replace(/^@/, '')
			.replace(/[^a-z0-9._-]/gi, '')
			.toLowerCase();
		if (h) app.user.handle = h;
		app.user.bio = form.bio;
		app.user.city = form.city;
		app.user.link = normaliseUrl(form.link);
		editOpen = false;
		app.say('Profile updated');
	}

	/* ================= your calendar ================= */
	let cursor = $state(new Date());
	let picked = $state(null);

	/* every day that has something on it: a ticket you hold or an event you saved */
	const dayMap = $derived.by(() => {
		const m = new Map();
		const add = (e, kind) => {
			if (!e) return;
			const k = new Date(e.start).toDateString();
			if (!m.has(k)) m.set(k, []);
			if (!m.get(k).some((x) => x.id === e.id)) m.get(k).push({ ...e, _kind: kind });
		};
		app.tickets.forEach((t) => add(app.event(t.eventId), 'ticket'));
		app.savedEvents.forEach((id) => add(app.event(id), 'saved'));
		return m;
	});

	const first = $derived.by(() => {
		const d = new Date(cursor);
		d.setDate(1);
		d.setHours(0, 0, 0, 0);
		return d;
	});

	const calCells = $derived.by(() => {
		const f = first;
		const offset = f.getDay();
		const cells = [];
		for (let i = 0; i < 42; i++) {
			const d = new Date(f.getTime() + (i - offset) * 86400000);
			cells.push({
				d,
				inMonth: d.getMonth() === f.getMonth(),
				today: d.toDateString() === new Date().toDateString(),
				n: (dayMap.get(d.toDateString()) ?? []).length
			});
		}
		return cells;
	});

	const monthLabel = $derived(
		first.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
	);
	const pickedList = $derived(picked ? (dayMap.get(picked.toDateString()) ?? []) : []);

	const nextUp = $derived(
		[...dayMap.values()]
			.flat()
			.filter((e) => new Date(e.start) > Date.now())
			.sort((a, b) => new Date(a.start) - new Date(b.start))
			.slice(0, 3)
	);

	function shiftMonth(n) {
		const d = new Date(first);
		d.setMonth(d.getMonth() + n);
		cursor = d;
	}
	function goToday() {
		cursor = new Date();
		picked = new Date();
	}
	function pickDay(c) {
		picked = picked && picked.toDateString() === c.d.toDateString() ? null : c.d;
	}
</script>

<div class="page">
	<div class="page-head">
		<div class="shell row" style="height:56px">
			<h1 class="page-title">Profile</h1>
			<a class="icon-btn" href="/settings" aria-label="Settings"><Icon name="sliders" size={18} /></a>
		</div>
	</div>

	{#if !app.user}
		<div class="shell">
			<div class="soft pad-16 center" style="margin-top:20px;padding:32px 20px">
				<div class="ico"><Icon name="user" size={26} /></div>
				<p class="b" style="margin-top:10px">You’re browsing as a guest</p>
				<p class="small muted" style="margin-top:4px">
					Sign in to save events, follow organisers and keep your tickets in one place.
				</p>
				<div class="col gap-8" style="margin-top:16px">
					<a class="btn btn-primary btn-block" href="/auth">Sign in</a>
					<a class="btn btn-outline btn-block" href="/auth?mode=signup">Create account</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- banner fades into whatever the app background is (light or dark) -->
		<div class="banner">
			<Cover
				image={app.user.banner}
				hue={app.user.hue}
				glyph="sparkle"
				radius={0}
				seed={3}
				blend={78}
			/>
		</div>

		<div class="shell">
			<div class="head row">
				<Avatar name={app.user.name} hue={app.user.hue} size={76} image={app.user.avatar} />
				<div class="col grow" style="margin-top:14px">
					<span class="row gap-6" style="font-size:20px;font-weight:700;letter-spacing:-.03em">
						{app.user.name}
						{#if app.user.verified?.phone}
							<span class="badge-verify"><Icon name="check" size={10} stroke={3.6} /></span>
						{/if}
					</span>
					<span class="small muted-2">@{app.user.handle} · {app.user.city}</span>
				</div>
				<button class="btn btn-sm btn-outline" onclick={() => (editOpen = true)}>Edit</button>
			</div>

			<p class="muted small" style="margin-top:10px">{app.user.bio}</p>

			{#if app.user.link}
				<a class="plink" href={app.user.link} target="_blank" rel="noreferrer noopener">
					<Icon name="link" size={14} />
					<span class="truncate">{prettyUrl(app.user.link)}</span>
					<Icon name="arrowUpRight" size={13} />
				</a>
			{/if}

			<div class="stats" style="margin-top:14px">
				<a class="stat" href="/tickets">
					<div class="n">{app.tickets.length}</div>
					<div class="k">Tickets</div>
				</a>
				<button class="stat" onclick={() => (followingOpen = true)}>
					<div class="n">{app.followingOrg.length + app.followingPeople.length}</div>
					<div class="k">Following</div>
				</button>
				<button class="stat" onclick={() => (followersOpen = true)}>
					<div class="n">{compact(app.user.followers)}</div>
					<div class="k">Followers</div>
				</button>
			</div>

			<div class="interests">
				{#each app.interests as i}
					<span class="chip sm">
						<span
							class="swatch"
							style="background:hsl({INTERESTS.find((x) => x.id === i)?.hue ?? 258} 62% 56%)"
						></span>
						{INTERESTS.find((x) => x.id === i)?.name ?? i}
					</span>
				{/each}
				<button class="chip sm" onclick={() => (editOpen = true)}>
					<Icon name="plus" size={12} /> Edit
				</button>
			</div>

			<!-- your calendar -->
			<section class="cal">
				<div class="cal-head">
					<div class="row gap-6">
						<span class="ic"><Icon name="calendar" size={15} /></span>
						<span class="b small">Your calendar</span>
					</div>
					<div class="row gap-4">
						<button class="navb" onclick={() => shiftMonth(-1)} aria-label="Previous month">
							<Icon name="chevronLeft" size={16} />
						</button>
						<span class="tiny b">{monthLabel}</span>
						<button class="navb" onclick={() => shiftMonth(1)} aria-label="Next month">
							<Icon name="chevronRight" size={16} />
						</button>
					</div>
				</div>

				<div class="cal-grid">
					{#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as d}
						<span class="dow tiny">{d}</span>
					{/each}
					{#each calCells as c}
						<button
							class="cell"
							class:dim={!c.inMonth}
							class:has={c.n > 0}
							class:today={c.today}
							class:on={picked && picked.toDateString() === c.d.toDateString()}
							onclick={() => pickDay(c)}
							disabled={!c.n}
						>
							<span class="n">{c.d.getDate()}</span>
							{#if c.n}
								<span class="dots">
									{#each Array(Math.min(3, c.n)) as _}<i></i>{/each}
								</span>
							{/if}
						</button>
					{/each}
				</div>

				<div class="cal-body">
					{#if picked}
						<div class="row-between" style="margin-bottom:6px">
							<span class="tiny b">
								{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][picked.getDay()]}
								{dayNum(picked)} {monthShort(picked)}
							</span>
							<button class="link tiny" onclick={() => (picked = null)}>Clear</button>
						</div>
						{#each pickedList as e (e.id)}
							<a class="crow" href="/events/{e.slug}">
								<span class="cwhen">
									<span class="tiny b">{time(e.start)}</span>
								</span>
								<span class="col grow" style="min-width:0">
									<span class="small b truncate">{e.title}</span>
									<span class="tiny muted-2 truncate">
										{e._kind === 'ticket' ? 'You have a ticket' : 'Saved'} · {app.venue(e.venueId)
											?.name ?? 'Online'}
									</span>
								</span>
								<Icon name="chevronRight" size={15} />
							</a>
						{/each}
					{:else if nextUp.length}
						<span class="eyebrow">Next on your calendar</span>
						{#each nextUp as e (e.id)}
							<a class="crow" href="/events/{e.slug}">
								<span class="cwhen">
									<span class="tiny b">{dayNum(e.start)}</span>
									<span class="tiny muted-2">{monthShort(e.start)}</span>
								</span>
								<span class="col grow" style="min-width:0">
									<span class="small b truncate">{e.title}</span>
									<span class="tiny muted-2 truncate">
										{e._kind === 'ticket' ? 'You have a ticket' : 'Saved'} · {time(e.start)}
									</span>
								</span>
								<Icon name="chevronRight" size={15} />
							</a>
						{/each}
					{:else}
						<p class="tiny muted-2" style="text-align:center;padding:6px 0">
							Nothing on your calendar yet — save an event or grab a ticket and it shows up here.
						</p>
					{/if}
					<button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px" onclick={goToday}>
						Jump to today
					</button>
				</div>
			</section>

			<div class="tabs-wrap"><Tabs {tabs} bind:value={tab} /></div>

			{#if tab === 'activity'}
				<div class="col gap-10" style="margin-top:12px">
					{#each app.tickets.slice(0, 3) as t (t.id)}
						{@const e = app.event(t.eventId)}
						<a class="act-row" href="/tickets/{t.id}">
							<Icon name="ticket" size={16} />
							<span class="small grow truncate">You’re going to {e?.title}</span>
							<span class="tiny muted-2">{dateShort(e?.start)}</span>
						</a>
					{/each}
					{#each app.savedEvents.slice(0, 3) as id (id)}
						<a class="act-row" href="/events/{app.event(id)?.slug}">
							<Icon name="heart" size={16} />
							<span class="small grow truncate">You saved {app.event(id)?.title}</span>
							<span class="tiny muted-2">saved</span>
						</a>
					{/each}
					{#each app.followingOrg.slice(0, 3) as id (id)}
						<a class="act-row" href="/organizers/{id}">
							<Icon name="users" size={16} />
							<span class="small grow truncate">Following {app.organizer(id)?.name}</span>
							<span class="tiny muted-2">organizer</span>
						</a>
					{/each}
				</div>
			{:else if tab === 'tickets'}
				<div class="grid" style="margin-top:12px">
					{#each app.tickets as t (t.id)}
						{@const e = app.event(t.eventId)}
						<a class="mini" href="/tickets/{t.id}">
							<div class="mmedia">
								<Cover image={e?.image} hue={e?.hue} glyph="ticket" radius={10} seed={2} />
							</div>
							<div class="col grow" style="min-width:0">
								<span class="b small truncate">{e?.title}</span>
								<span class="tiny muted-2">{t.typeName ?? 'General'} · {t.status}</span>
							</div>
							<Icon name="chevronRight" size={16} />
						</a>
					{/each}
				</div>
			{:else if tab === 'saved'}
				<div class="grid" style="margin-top:12px">
					{#each saved as e (e.id)}
						<EventCard event={e} layout="horizontal" compactMode />
					{/each}
				</div>
			{:else}
				<div class="list" style="margin-top:8px">
					{#each followsOrg as o (o.id)}
						<a class="li li-click" href="/organizers/{o.id}">
							<Avatar name={o.name} hue={o.hue} size={40} />
							<div class="col grow">
								<span class="b small">{o.name}</span>
								<span class="tiny muted-2">Organizer · {compact(o.followers)} followers</span>
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
					{/each}
					{#each followsPeople as p (p.id)}
						<div class="li">
							<Avatar name={p.name} hue={p.hue} size={40} />
							<div class="col grow">
								<span class="b small">{p.name}</span>
								<span class="tiny muted-2">{p.role} · {compact(p.followers)} followers</span>
							</div>
							<button class="btn btn-sm btn-outline" onclick={() => app.toggleFollowPerson(p.id)}>
								Following
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if app.user}
	<Sheet bind:open={editOpen} title="Edit profile">
		<div class="col gap-16">
		<PhotoPicker
			bind:value={app.user.avatar}
			bind:hue={app.user.hue}
			variant="avatar"
			label="Profile picture"
			name={app.user?.name ?? 'You'}
			size={96}
			presets={false}
		/>

		<PhotoPicker
			bind:value={app.user.banner}
			bind:hue={app.user.hue}
			variant="cover"
			glyph="sparkle"
			label="Cover photo"
			ratio="16 / 7"
			seed={3}
		/>

		<div class="field">
			<label class="label" for="pn">Name</label>
			<input id="pn" class="input" bind:value={form.name} />
		</div>
		<div class="field">
			<label class="label" for="pu">Username</label>
			<div class="handle-wrap">
				<span class="at">@</span>
				<input
					id="pu"
					class="input with-at"
					bind:value={form.handle}
					placeholder="yourname"
					autocomplete="off"
					spellcheck="false"
				/>
			</div>
			<p class="hint">evently.app/@{form.handle || 'yourname'}</p>
		</div>
		<div class="field">
			<label class="label" for="pb">Bio</label>
			<textarea id="pb" class="textarea" bind:value={form.bio}></textarea>
		</div>
		<div class="field">
			<label class="label" for="pc">City</label>
			<input id="pc" class="input" bind:value={form.city} />
		</div>
		<div class="field">
			<label class="label" for="pl">Link</label>
			<input id="pl" class="input" bind:value={form.link} placeholder="yourwebsite.com" />
			<p class="hint">One link on your profile — your site, portfolio or ticket page.</p>
		</div>
		<div class="field">
			<span class="label">Interests</span>
			<div class="wrap row gap-8">
				{#each INTERESTS as i}
					<button
						class="chip sm"
						class:on={app.interests.includes(i.id)}
						onclick={() => app.toggleInterest(i.id)}
					>
						{i.name}
					</button>
				{/each}
			</div>
		</div>
		<button class="btn btn-primary btn-block" onclick={saveProfile}>Save changes</button>
	</div>
</Sheet>

<Sheet bind:open={followingOpen} title="Following">
	<div class="col gap-10">
		{#each followsOrg as o (o.id)}
			<a class="prow" href="/organizers/{o.id}">
				<Avatar name={o.name} hue={o.hue} size={42} />
				<div class="col grow" style="min-width:0">
					<span class="b small truncate">{o.name}</span>
					<span class="tiny muted-2">Organizer · {compact(o.followers)} followers</span>
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
		{/each}
		{#each followsPeople as p2 (p2.id)}
			<div class="prow">
				<Avatar name={p2.name} hue={p2.hue} size={42} />
				<div class="col grow" style="min-width:0">
					<span class="b small truncate">{p2.name}</span>
					<span class="tiny muted-2">{p2.role} · {compact(p2.followers)} followers</span>
				</div>
				<button class="btn btn-sm btn-outline" onclick={() => app.toggleFollowPerson(p2.id)}>
					Following
				</button>
			</div>
		{/each}
		{#if !followsOrg.length && !followsPeople.length}
			<p class="muted small">You’re not following anyone yet.</p>
		{/if}
	</div>
</Sheet>

<Sheet bind:open={followersOpen} title="Followers">
	<div class="col gap-10">
		{#each app.people as p2 (p2.id)}
			<div class="prow">
				<Avatar name={p2.name} hue={p2.hue} size={42} />
				<div class="col grow" style="min-width:0">
					<span class="b small truncate">{p2.name}</span>
					<span class="tiny muted-2 truncate">{p2.bio}</span>
				</div>
				<button
					class="btn btn-sm {app.isFollowingPerson(p2.id) ? 'btn-outline' : 'btn-primary'}"
					onclick={() => app.toggleFollowPerson(p2.id)}
				>
					{app.isFollowingPerson(p2.id) ? 'Following' : 'Follow back'}
				</button>
			</div>
		{/each}
		<p class="hint">{compact(app.user?.followers ?? 0)} people follow you.</p>
	</div>
</Sheet>
{/if}

<style>
	.banner {
		height: 116px;
		position: relative;
		z-index: 0;
	}
	.head {
		align-items: flex-end;
		gap: 14px;
		margin-top: -46px;
		position: relative;
		z-index: 1;
	}
	.plink {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 8px;
		max-width: 100%;
		padding: 5px 10px;
		border-radius: 99px;
		background: var(--surface);
		color: var(--accent);
		font-size: 12.5px;
		font-weight: 600;
	}
	.interests {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}
	.swatch {
		width: 8px;
		height: 8px;
		border-radius: 3px;
	}
	.tabs-wrap {
		margin-top: 16px;
		border-bottom: 1px solid var(--line);
	}
	.act-row {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 12px 14px;
		border-radius: var(--r);
		background: var(--surface);
	}
	.mini {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 9px;
		border: 1px solid var(--line);
		border-radius: var(--r);
	}
	.mmedia {
		width: 44px;
		height: 44px;
		flex: none;
	}
	.prow {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* calendar */
	.cal {
		margin-top: 18px;
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		background: var(--bg-elev);
		padding: 14px;
	}
	.cal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 10px;
	}
	.ic {
		width: 26px;
		height: 26px;
		border-radius: 8px;
		background: var(--surface);
		display: grid;
		place-items: center;
		color: var(--text-2);
	}
	.navb {
		width: 26px;
		height: 26px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--bg);
		display: grid;
		place-items: center;
		color: var(--text-2);
		cursor: pointer;
	}
	.navb:hover {
		background: var(--surface);
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
		font-size: 13px;
		font-weight: 550;
		color: var(--text);
	}
	.cell.dim {
		color: var(--text-3);
		opacity: 0.45;
	}
	.cell:disabled {
		cursor: default;
	}
	.cell.has {
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 700;
		cursor: pointer;
	}
	.cell.has:hover {
		background: var(--accent-line);
	}
	.cell.today {
		box-shadow: inset 0 0 0 1.5px var(--line-strong);
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
	.cal-body {
		margin-top: 10px;
		border-top: 1px solid var(--line);
		padding-top: 10px;
	}
	.crow {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 6px;
		border-radius: var(--r);
	}
	.crow:hover {
		background: var(--surface);
	}
	.cwhen {
		width: 38px;
		flex: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 0;
		border-radius: 9px;
		background: var(--surface);
	}

	/* edit sheet */
	.gap-16 {
		gap: 16px;
	}
	.gap-4 {
		gap: 4px;
	}
	.handle-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}
	.at {
		position: absolute;
		left: 13px;
		color: var(--text-3);
		font-size: 14.5px;
		font-weight: 600;
		pointer-events: none;
	}
	.input.with-at {
		padding-left: 27px;
	}
	.ico {
		width: 56px;
		height: 56px;
		border-radius: 99px;
		background: var(--surface);
		display: grid;
		place-items: center;
		margin: 0 auto;
	}
	.link {
		color: var(--accent);
		font-weight: 600;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		font-size: 12px;
	}
	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
