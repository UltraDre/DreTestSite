<script>
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateLong, time, timeAgo, ics, download, copy } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Qr from '$comp/Qr.svelte';
	import Cover from '$comp/Cover.svelte';
	import Sheet from '$comp/Sheet.svelte';

	const id = $derived(page.params.id);
	const t = $derived(app.ticket(id));
	const e = $derived(t ? app.event(t.eventId) : null);
	const venue = $derived(e ? app.venue(e.venueId) : null);

	/* rotating QR — new signature every 30s */
	let bucket = $state(0);
	$effect(() => {
		const i = setInterval(() => bucket++, 1000);
		return () => clearInterval(i);
	});
	const payload = $derived(
		t ? `evently://t/${t.code ?? t.id}?s=${Math.floor(Date.now() / 30000).toString(36).toUpperCase()}` : ''
	);
	const secsLeft = $derived(30 - (Math.floor(Date.now() / 1000) % 30));
	const ringPct = $derived(Math.round((secsLeft / 30) * 100));

	let transferOpen = $state(false);
	let refundOpen = $state(false);
	let to = $state({ name: '', email: '' });
	let brightness = $state(false);

	function wallet(kind) {
		app.say(`${kind} pass generated — check your wallet app`);
	}
</script>

{#if !t}
	<div class="empty">
		<div class="ico"><Icon name="alert" size={24} /></div>
		<p class="b">Ticket not found</p>
		<a class="btn btn-sm btn-outline" href="/tickets">My tickets</a>
	</div>
{:else}
	<div class="page" class:bright={brightness}>
		<div class="page-head">
			<div class="shell row" style="height:56px">
				<button class="icon-btn" onclick={() => history.back()} aria-label="Back">
					<Icon name="arrowLeft" size={19} />
				</button>
				<h1 class="page-title">Ticket</h1>
				<button class="icon-btn" onclick={() => (brightness = !brightness)} aria-label="Brightness">
					<Icon name="sun" size={18} />
				</button>
			</div>
		</div>

		<div class="shell">
			<div class="ticket">
				<div class="t-top">
					<div class="row gap-10">
						<Cover image={e.image} hue={e.hue} glyph="ticket" radius={10} seed={e.id.length} />
						<div class="col grow" style="min-width:0;height:100%;justify-content:center">
							<span class="eyebrow">{t.typeName ?? 'General admission'}</span>
							<span class="b truncate" style="font-size:16px">{e.title}</span>
						</div>
					</div>
				</div>

				<div class="qr-zone">
					{#if t.status === 'used'}
						<div class="used">
							<Icon name="checkCircle" size={44} />
							<span class="b">Checked in</span>
							<span class="tiny muted-2">
								{t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('en-GB') : ''}
							</span>
						</div>
					{:else if t.status === 'cancelled'}
						<div class="used bad">
							<Icon name="ban" size={44} />
							<span class="b">Cancelled</span>
							<span class="tiny muted-2">This ticket can no longer be scanned</span>
						</div>
					{:else}
						<Qr {payload} size={214} />
						<div class="rot">
							<svg viewBox="0 0 36 36" width="18" height="18">
								<circle cx="18" cy="18" r="15" fill="none" stroke="var(--line-strong)" stroke-width="3" />
								<circle
									cx="18"
									cy="18"
									r="15"
									fill="none"
									stroke="var(--accent)"
									stroke-width="3"
									stroke-linecap="round"
									stroke-dasharray="{ringPct} 100"
									transform="rotate(-90 18 18)"
								/>
							</svg>
							<span class="tiny muted-2">Rotates in {secsLeft}s</span>
						</div>
					{/if}
				</div>

				<div class="perforations">
					<span class="notch left"></span>
					<span class="dash"></span>
					<span class="notch right"></span>
				</div>

				<div class="t-body">
					<div class="row-between">
						<div class="col">
							<span class="eyebrow">When</span>
							<span class="b small">{dateLong(e.start)}</span>
							<span class="tiny muted-2">{time(e.start)} – {time(e.end)}</span>
						</div>
						<div class="col right">
							<span class="eyebrow">Where</span>
							<span class="b small">{venue?.name ?? 'Online'}</span>
							<span class="tiny muted-2">{venue?.city ?? 'Virtual'}</span>
						</div>
					</div>

					<hr style="margin:14px 0" />

					<div class="grid-2">
						<div class="col">
							<span class="eyebrow">Attendee</span>
							<span class="small b">{t.attendee ?? app.user?.name ?? 'Guest'}</span>
						</div>
						<div class="col">
							<span class="eyebrow">Order</span>
							<span class="small b mono">{t.orderRef ?? '—'}</span>
						</div>
						<div class="col">
							<span class="eyebrow">Ticket code</span>
							<span class="small b mono">{t.code ?? '—'}</span>
						</div>
						<div class="col">
							<span class="eyebrow">Paid</span>
							<span class="small b">{money(t.price ?? 0, app.currency)}</span>
						</div>
					</div>

					{#if t.transferred}
						<div class="notice">
							<Icon name="info" size={15} /> Transferred — a new QR was issued to the holder
						</div>
					{/if}
				</div>
			</div>

			<div class="acts">
				<button class="act" onclick={() => wallet('Apple Wallet')}>
					<Icon name="wallet" size={17} /> Apple Wallet
				</button>
				<button class="act" onclick={() => wallet('Google Wallet')}>
					<Icon name="wallet" size={17} /> Google Wallet
				</button>
				<button
					class="act"
					onclick={() => {
						download(`${e.slug}.ics`, ics(e, venue));
						app.say('Added to calendar');
					}}
				>
					<Icon name="calendar" size={17} /> Calendar
				</button>
				<button class="act" onclick={() => (transferOpen = true)}>
					<Icon name="share" size={17} /> Transfer
				</button>
				<button class="act" onclick={() => (refundOpen = true)}>
					<Icon name="refresh" size={17} /> Refund
				</button>
				<button
					class="act"
					onclick={async () => {
						await copy(t.code ?? '');
						app.say('Ticket code copied');
					}}
				>
					<Icon name="copy" size={17} /> Copy code
				</button>
			</div>

			<div class="soft pad-16 row gap-10" style="margin-top:14px">
				<Icon name="shield" size={17} />
				<div class="col grow">
					<span class="b small">Ticket verification</span>
					<span class="tiny muted-2">
						Rotating QR + unique code. Screenshots won’t work at the door.
					</span>
				</div>
			</div>

			<div class="col gap-8" style="margin-top:16px">
				<a class="btn btn-outline btn-block" href="/events/{e.slug}">View event details</a>
				<a class="btn btn-ghost btn-block" href="/tickets">All my tickets</a>
			</div>
		</div>
	</div>

	<Sheet bind:open={transferOpen} title="Transfer ticket">
		<p class="muted small" style="margin-bottom:12px">
			The ticket moves to the new holder and your QR becomes invalid immediately.
		</p>
		<div class="col gap-12">
			<div class="field">
				<label class="label" for="tn">Recipient name</label>
				<input id="tn" class="input" bind:value={to.name} placeholder="Full name" />
			</div>
			<div class="field">
				<label class="label" for="te">Recipient email</label>
				<input id="te" class="input" type="email" bind:value={to.email} placeholder="name@example.com" />
			</div>
			<button
				class="btn btn-primary btn-block"
				disabled={!to.name || !to.email}
				onclick={() => {
					app.transferTicket(t.id, to.name, to.email);
					transferOpen = false;
				}}
			>
				Send ticket
			</button>
		</div>
	</Sheet>

	<Sheet bind:open={refundOpen} title="Request a refund">
		<div class="col gap-12">
			<div class="soft pad-16">
				<span class="b small">{t.typeName ?? 'Ticket'} · {money(t.price ?? 0, app.currency)}</span>
				<p class="tiny muted-2" style="margin-top:6px">
					{e.policies?.refund ?? 'Refunds are handled by the organiser within 5 working days.'}
				</p>
			</div>
			{#each ['Plans changed', 'Event details changed', 'Duplicate purchase', 'Other'] as r}
				<button
					class="srow"
					onclick={() => {
						app.requestRefund(t.id);
						refundOpen = false;
					}}
				>
					<Icon name="chevronRight" size={16} /> {r}
				</button>
			{/each}
			<button
				class="btn btn-danger btn-block"
				onclick={() => {
					app.cancelTicket(t.id);
					refundOpen = false;
				}}
			>
				Cancel ticket
			</button>
		</div>
	</Sheet>
{/if}

<style>
	.ticket {
		background: var(--bg-elev);
		border: 1px solid var(--line);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	.t-top {
		padding: 14px;
		border-bottom: 1px dashed var(--line-strong);
	}
	.t-top :global(.cover) {
		width: 54px;
		height: 54px;
	}
	.qr-zone {
		padding: 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		background: var(--surface);
	}
	.rot {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.used {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 30px 0;
		color: var(--good);
	}
	.used.bad {
		color: var(--bad);
	}
	.perforations {
		position: relative;
		height: 20px;
		background: var(--surface);
		display: flex;
		align-items: center;
	}
	.notch {
		position: absolute;
		width: 22px;
		height: 22px;
		border-radius: 99px;
		background: var(--bg);
		border: 1px solid var(--line);
	}
	.notch.left {
		left: -12px;
	}
	.notch.right {
		right: -12px;
	}
	.dash {
		flex: 1;
		border-top: 1.5px dashed var(--line-strong);
		margin: 0 16px;
	}
	.t-body {
		padding: 16px;
	}
	.grid-2 {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.notice {
		margin-top: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: var(--r);
		background: var(--warn-soft);
		color: var(--warn);
		font-size: 13px;
		font-weight: 550;
	}
	.acts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-top: 14px;
	}
	.act {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		border-radius: var(--r);
		border: 1px solid var(--line);
		background: var(--bg);
		font-size: 13.5px;
		font-weight: 550;
		cursor: pointer;
	}
	.act:hover {
		background: var(--surface);
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
	.bright .ticket {
		filter: brightness(1.35);
	}
</style>
