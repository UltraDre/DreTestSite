<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateLong, time, pct, compact, timeAgo, download } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PhotoPicker from '$comp/PhotoPicker.svelte';
	import Tabs from '$comp/Tabs.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import Sheet from '$comp/Sheet.svelte';

	const id = $derived(page.params.id);
	const e = $derived(app.event(id));

	let tab = $state('overview');
	let q = $state('');
	let confirmCancel = $state(false);
	let msgOpen = $state(false);
	let msg = $state('');

	const NAMES = [
		'Tunde Bakare', 'Amaka Obi', 'Ngozi Adeyemi', 'Emeka Nwosu', 'Sade Lawal', 'Femi Ade',
		'Bola Ajayi', 'Kemi Ashade', 'Ijeoma Nwafor', 'Kunle Adeyemi', 'Nkechi Obi', 'Chidi Okafor',
		'Ada Nwankwo', 'Segun Balogun', 'Halima Yusuf', 'Damilola Ade', 'Tobi Fernandez', 'Zainab Ali',
		'Uche Eze', 'Bisi Oni', 'Yemi Adesanya', 'Grace Etim', 'Musa Danjuma', 'Lola Adeyemi'
	];

	const attendees = $derived.by(() => {
		if (!e) return [];
		const real = app.eventTickets(id).map((t) => ({
			id: t.id,
			name: t.attendee ?? 'You',
			type: t.typeName ?? 'General',
			code: t.code,
			in: !!t.checkedInAt,
			at: t.checkedInAt,
			real: true
		}));
		const demo = [];
		const target = Math.min(28, Math.max(0, e.sold - real.length));
		for (let i = 0; i < target; i++) {
			const name = NAMES[(i * 7 + e.id.length * 3) % NAMES.length];
			const type = e.ticketTypes[i % e.ticketTypes.length];
			const idx = i + 1;
			demo.push({
				id: `d${i}`,
				name,
				type: type.name,
				code: `EV-DEMO-${String(idx).padStart(4, '0')}`,
				in: i % 3 !== 0,
				at: i % 3 !== 0 ? new Date(Date.now() - i * 600000).toISOString() : null,
				real: false
			});
		}
		return [...real, ...demo];
	});

	const filtered = $derived(
		attendees.filter((a) => !q || a.name.toLowerCase().includes(q.toLowerCase()))
	);

	const stats = $derived(app.checkInStats(id));
	const gross = $derived(
		e ? e.ticketTypes.reduce((s, t) => s + t.sold * t.price, 0) : 0
	);
	const tabs = $derived([
		{ id: 'overview', label: 'Overview' },
		{ id: 'attendees', label: 'Attendees', count: attendees.length },
		{ id: 'checkin', label: 'Check-in' },
		{ id: 'marketing', label: 'Marketing' },
		{ id: 'settings', label: 'Settings' }
	]);

	function exportCsv() {
		const rows = [
			['name', 'ticket', 'code', 'checked_in'],
			...attendees.map((a) => [a.name, a.type, a.code, a.in ? 'yes' : 'no'])
		];
		download(
			`${e.slug}-attendees.csv`,
			rows.map((r) => r.join(',')).join('\n'),
			'text/csv'
		);
		app.say('Exported ' + attendees.length + ' attendees');
	}

	function toggleCheckIn(a) {
		if (!a.real) {
			app.say('Demo attendee — scan a real ticket to see it update', 'info');
			return;
		}
		if (a.in) {
			const t = app.ticket(a.id);
			t.checkedInAt = null;
			t.status = 'valid';
			app.say('Check-in undone');
		} else {
			const r = app.checkIn(a.code);
			app.say(r.ok ? 'Checked in' : r.message, r.ok ? 'check' : 'alert');
		}
	}
</script>

{#if !e}
	<div class="empty">
		<div class="ico"><Icon name="alert" size={24} /></div>
		<p class="b">Event not found</p>
		<a class="btn btn-sm btn-outline" href="/organizer">Dashboard</a>
	</div>
{:else}
	<div class="page">
		<div class="page-head">
			<div class="shell">
				<div class="row" style="height:56px">
					<button class="icon-btn" onclick={() => goto('/organizer')} aria-label="Back">
						<Icon name="arrowLeft" size={19} />
					</button>
					<h1 class="page-title truncate">{e.title}</h1>
					<a class="icon-btn" href="/events/{e.slug}" aria-label="View public page">
						<Icon name="external" size={18} />
					</a>
				</div>
				<div style="padding-bottom:8px"><Tabs {tabs} bind:value={tab} /></div>
			</div>
		</div>

		<div class="shell">
			{#if tab === 'overview'}
				<div class="card card-pad">
					<PhotoPicker
						value={e?.image ?? null}
						hue={e?.hue ?? 258}
						variant="cover"
						glyph="sparkle"
						label="Event photo"
						hint="Updates everywhere your event appears"
						ratio="16 / 9"
						seed={e?.id?.length ?? 1}
						presets={false}
						onchange={(v) => {
							app.updateEvent(id, { image: v });
							app.say(v ? 'Event photo updated' : 'Event photo removed');
						}}
					/>
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<div class="row-between">
						<div class="col">
							<span class="tiny muted-2">
								{dateLong(e.start)} · {time(e.start)}
							</span>
							<span class="b">{app.venue(e.venueId)?.name ?? 'Online'}</span>
						</div>
						<span class="tag {e.status === 'published' ? 'good' : 'warn'}">{e.status}</span>
					</div>
				</div>

				<div class="stats" style="margin-top:12px">
					<div class="stat">
						<div class="n">{e.ticketTypes.reduce((s, t) => s + t.sold, 0)}</div>
						<div class="k">Sold / {e.capacity}</div>
					</div>
					<div class="stat"><div class="n">{money(gross, app.currency)}</div><div class="k">Gross</div></div>
					<div class="stat">
						<div class="n">{pct(stats.checkedIn, Math.max(stats.total, 1))}%</div>
						<div class="k">Checked in</div>
					</div>
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:10px">Sales by ticket</h3>
					{#each e.ticketTypes as t}
						<div class="col gap-6" style="margin-bottom:12px">
							<div class="row-between">
								<span class="b small">{t.name}</span>
								<span class="small muted">{t.sold}/{t.qty}</span>
							</div>
							<div class="prog"><i style="width:{pct(t.sold, t.qty)}%"></i></div>
							<span class="tiny muted-2">{money(t.sold * t.price, app.currency)}</span>
						</div>
					{/each}
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:8px">Funnel</h3>
					{#each [['Page views', 4820], ['Ticket page', 1240], ['Checkout started', 380], ['Orders', e.ticketTypes.reduce((s, t) => s + t.sold, 0)]] as [l, v], i}
						<div class="fn">
							<span class="small grow">{l}</span>
							<span class="small b">{compact(v)}</span>
							<div class="fbar"><i style="width:{(v / 4820) * 100}%"></i></div>
						</div>
					{/each}
				</div>

				<div class="row gap-8" style="margin-top:12px">
					<a class="btn btn-outline grow" href="/organizer/scan?event={e.id}">
						<Icon name="scan" size={16} /> Scan tickets
					</a>
					<button class="btn btn-outline grow" onclick={() => (msgOpen = true)}>
						<Icon name="megaphone" size={16} /> Message attendees
					</button>
				</div>
			{:else if tab === 'attendees'}
				<div class="search" style="margin-bottom:12px">
					<Icon name="search" size={17} />
					<input placeholder="Search attendees" bind:value={q} />
					<button class="btn btn-sm btn-outline" onclick={exportCsv}>Export</button>
				</div>

				<div class="card card-pad" style="padding:0 16px">
					{#each filtered as a (a.id)}
						<div class="att">
							<Avatar name={a.name} hue={258 + (a.id.length % 5) * 30} size={38} />
							<div class="col grow" style="min-width:0">
								<span class="b small truncate">{a.name}</span>
								<span class="tiny muted-2 truncate">{a.type} · {a.code}</span>
							</div>
							<button
								class="btn btn-sm {a.in ? 'btn-outline' : 'btn-primary'}"
								onclick={() => toggleCheckIn(a)}
							>
								{a.in ? 'Undo' : 'Check in'}
							</button>
						</div>
					{:else}
						<div class="empty"><p class="small">No attendees yet.</p></div>
					{/each}
				</div>
			{:else if tab === 'checkin'}
				<div class="stats">
					<div class="stat"><div class="n">{stats.checkedIn}</div><div class="k">Checked in</div></div>
					<div class="stat"><div class="n">{stats.valid}</div><div class="k">Not yet in</div></div>
					<div class="stat"><div class="n">{stats.refunded}</div><div class="k">Refunded</div></div>
				</div>

				<a class="scanbox" href="/organizer/scan?event={e.id}">
					<Icon name="scan" size={26} />
					<span class="col">
						<span class="b">Open the scanner</span>
						<span class="tiny muted-2">Camera or manual code entry · works offline</span>
					</span>
					<Icon name="chevronRight" size={18} />
				</a>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:8px">Check-in log</h3>
					{#each attendees.filter((a) => a.in).slice(0, 8) as a (a.id)}
						<div class="li">
							<Icon name="checkCircle" size={16} />
							<div class="col grow">
								<span class="b small">{a.name}</span>
								<span class="tiny muted-2">{a.type}</span>
							</div>
							<span class="tiny muted-2">{a.at ? timeAgo(a.at) : ''}</span>
						</div>
					{:else}
						<p class="muted small">No check-ins yet.</p>
					{/each}
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:8px">Entry rules</h3>
					<div class="li">
						<span class="grow small">Allow duplicate scans</span>
						<span class="tag bad">Blocked</span>
					</div>
					<div class="li">
						<span class="grow small">ID check for 18+ events</span>
						<span class="tag">{e.ageLimit === 'All ages' ? 'Not required' : 'Required'}</span>
					</div>
					<div class="li">
						<span class="grow small">Badge printing</span>
						<button class="btn btn-sm btn-outline" onclick={() => app.say('Badge template ready')}>
							<Icon name="printer" size={14} /> Configure
						</button>
					</div>
				</div>
			{:else if tab === 'marketing'}
				<div class="card card-pad">
					<h3 style="margin-bottom:10px">Share</h3>
					<div class="li">
						<span class="grow small">Public event page</span>
						<button class="btn btn-sm btn-outline" onclick={() => app.say('Link copied')}>Copy</button>
					</div>
					<div class="li">
						<span class="grow small">WhatsApp / X / Instagram</span>
						<button class="btn btn-sm btn-outline" onclick={() => app.say('Share sheet opened')}>
							Share
						</button>
					</div>
					<div class="li">
						<span class="grow small">Embed widget on your site</span>
						<button class="btn btn-sm btn-outline" onclick={() => app.say('Snippet copied')}>
							<Icon name="copy" size={14} /> Copy
						</button>
					</div>
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:8px">Campaigns</h3>
					<button class="btn btn-outline btn-block" onclick={() => (msgOpen = true)}>
						<Icon name="mail" size={16} /> Email all attendees
					</button>
					<button
						class="btn btn-outline btn-block"
						style="margin-top:8px"
						onclick={() => app.say('Push sent to followers')}
					>
						<Icon name="bell" size={16} /> Push to {compact(app.organizer(e.organizerId)?.followers ?? 0)} followers
					</button>
					<button
						class="btn btn-outline btn-block"
						style="margin-top:8px"
						onclick={() => app.say('Waitlist notified (12 people)')}
					>
						<Icon name="users" size={16} /> Notify waitlist
					</button>
				</div>

				<div class="card card-pad" style="margin-top:12px">
					<h3 style="margin-bottom:8px">Promo codes</h3>
					<div class="li">
						<div class="col grow">
							<span class="b small">EARLYBIRD</span>
							<span class="tiny muted-2">15% off · 100 uses · 34 redeemed</span>
						</div>
						<span class="tag good">Active</span>
					</div>
					<button class="btn btn-outline btn-block" style="margin-top:10px" onclick={() => app.say('Promo created')}>
						<Icon name="percent" size={15} /> Create promo code
					</button>
				</div>
			{:else}
				<div class="card card-pad">
					<button class="li li-click" style="width:100%;background:none;border:0;text-align:left">
						<Icon name="edit" size={16} />
						<span class="grow b small">Edit event details</span>
						<Icon name="chevronRight" size={16} />
					</button>
					<button
						class="li li-click"
						style="width:100%;background:none;border:0;text-align:left"
						onclick={() => app.duplicateEvent(e.id)}
					>
						<Icon name="copy" size={16} />
						<span class="grow b small">Duplicate event</span>
						<Icon name="chevronRight" size={16} />
					</button>
					<button class="li li-click" style="width:100%;background:none;border:0;text-align:left">
						<Icon name="users" size={16} />
						<span class="grow b small">Co-hosts & permissions</span>
						<Icon name="chevronRight" size={16} />
					</button>
					<button class="li li-click" style="width:100%;background:none;border:0;text-align:left">
						<Icon name="key" size={16} />
						<span class="grow b small">API & webhooks</span>
						<Icon name="chevronRight" size={16} />
					</button>
				</div>

				<div class="col gap-8" style="margin-top:14px">
					<button
						class="btn btn-outline btn-block"
						onclick={() => {
							app.updateEvent(e.id, { status: e.status === 'published' ? 'draft' : 'published' });
							app.say(e.status === 'published' ? 'Moved to drafts' : 'Published');
						}}
					>
						{e.status === 'published' ? 'Unpublish' : 'Publish'}
					</button>
					<button class="btn btn-danger btn-block" onclick={() => (confirmCancel = true)}>
						<Icon name="ban" size={16} /> Cancel event & refund all
					</button>
				</div>
				<p class="hint" style="margin-top:10px">
					Cancelling notifies every attendee and issues automatic refunds within 5 working days.
				</p>
			{/if}
		</div>
	</div>

	<Sheet bind:open={msgOpen} title="Message attendees">
		<div class="col gap-12">
			<div class="field">
				<span class="label">Audience</span>
				<select class="select">
					<option>All attendees ({attendees.length})</option>
					<option>Not checked in yet</option>
					<option>VIP ticket holders</option>
				</select>
			</div>
			<div class="field">
				<span class="label">Message</span>
				<textarea class="textarea" rows="4" bind:value={msg} placeholder="Doors open at 4pm today…"></textarea>
			</div>
			<button
				class="btn btn-primary btn-block"
				onclick={() => {
					msgOpen = false;
					app.say(`Sent to ${attendees.length} attendees`);
				}}
			>
				Send message
			</button>
		</div>
	</Sheet>

	<Sheet bind:open={confirmCancel} title="Cancel this event?" center>
		<p class="muted small" style="margin-bottom:14px">
			All {attendees.length} attendees will be notified and refunded automatically.
		</p>
		<div class="col gap-8">
			<button
				class="btn btn-danger btn-block"
				onclick={() => {
					app.cancelEvent(e.id);
					confirmCancel = false;
					goto('/organizer');
				}}
			>
				Cancel event
			</button>
			<button class="btn btn-ghost btn-block" onclick={() => (confirmCancel = false)}>Keep event</button>
		</div>
	</Sheet>
{/if}

<style>
	.prog {
		height: 6px;
		border-radius: 99px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.prog i {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.att {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 0;
		border-bottom: 1px solid var(--line);
	}
	.att:last-child {
		border-bottom: 0;
	}
	.scanbox {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-top: 12px;
		padding: 18px;
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--text);
	}
	.scanbox:hover {
		background: var(--surface-2);
	}
	.fn {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 4px 12px;
		padding: 8px 0;
		align-items: center;
	}
	.fbar {
		grid-column: 1 / -1;
		height: 5px;
		border-radius: 99px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.fbar i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 40%, #fff));
	}
</style>
