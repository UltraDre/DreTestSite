<script>
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';
	import Sheet from '$comp/Sheet.svelte';
	import Tabs from '$comp/Tabs.svelte';

	const tabs = [
		{ id: 'help', label: 'Help centre' },
		{ id: 'contact', label: 'Contact support' },
		{ id: 'safety', label: 'Safety' },
		{ id: 'guide', label: 'Organiser guide' }
	];
	let tab = $state(page.url.searchParams.get('tab') ?? 'help');
	let q = $state('');
	let safetyOpen = $state(false);
	let sent = $state(false);
	let form = $state({ email: app.user?.email ?? '', topic: 'A ticket or order', message: '' });

	const FAQS = [
		{
			cat: 'Tickets & payments',
			items: [
				{
					q: 'Where is my ticket?',
					a: 'Tickets live in Tickets → the event. Open the ticket to show its QR. You also get a copy by email and can add it to Apple or Google Wallet.'
				},
				{
					q: 'Why does my QR code keep changing?',
					a: 'The code rotates every 30 seconds so screenshots can’t be shared. It works offline — the rotation is generated on your device.'
				},
				{
					q: 'Can I get a refund?',
					a: 'Open the ticket → Refund and pick a reason. Refunds follow the event’s policy and are usually reviewed within 5 working days.'
				},
				{
					q: 'My payment was declined',
					a: 'Check the card details and available balance, then retry. If it fails twice, try another method — nothing is charged on a decline.'
				}
			]
		},
		{
			cat: 'Check-in & entry',
			items: [
				{
					q: 'My phone battery died — can I still get in?',
					a: 'Yes. Door staff can look you up by name or enter your ticket code manually.'
				},
				{
					q: 'My ticket says already checked in',
					a: 'Someone scanned it already. Ask staff to check the log; if it wasn’t you, contact support with the order reference.'
				},
				{
					q: 'Can I bring a friend using my ticket?',
					a: 'Only if you transfer it to them first — each ticket admits one person under the name on it. Transfers are free until check-in.'
				}
			]
		},
		{
			cat: 'Account & privacy',
			items: [
				{
					q: 'How do I delete my account?',
					a: 'Settings → Account → Delete account. You have 30 days to change your mind by signing back in.'
				},
				{
					q: 'Can I export my data?',
					a: 'Settings → Privacy → Download my data. We email a machine-readable export within 24 hours.'
				},
				{
					q: 'How do I stop marketing emails?',
					a: 'Settings → Notifications → switch off Marketing for email, push or SMS independently.'
				}
			]
		}
	];

	const filtered = $derived(
		FAQS.map((g) => ({
			...g,
			items: g.items.filter(
				(i) => !q || (i.q + i.a).toLowerCase().includes(q.toLowerCase())
			)
		})).filter((g) => g.items.length)
	);

	const SAFETY_REASONS = [
		'Fraudulent or fake event',
		'Harassment or abuse',
		'Counterfeit or resold ticket',
		'Unsafe venue or illegal activity',
		'Underage sales or ID concerns',
		'Copyright or impersonation'
	];

	function submit(e) {
		e?.preventDefault();
		if (!form.message.trim()) return;
		sent = true;
		app.notify({
			kind: 'update',
			title: 'Support request received',
			body: `“${form.topic}” — we reply within 24 hours.`,
			href: '/notifications'
		});
		app.say('Message sent — we reply within 24 hours');
	}
</script>

<div class="page">
	<PageHead title="Help & support" back />

	<div class="shell">
		<div style="margin:4px 0 12px"><Tabs {tabs} bind:value={tab} /></div>

		{#if tab === 'help'}
			<div class="search" style="margin-bottom:14px">
				<Icon name="search" size={17} />
				<input placeholder="Search help articles" bind:value={q} />
			</div>

			{#each filtered as g (g.cat)}
				<section class="grp">
					<span class="eyebrow">{g.cat}</span>
					<div class="card card-pad" style="padding:0 16px;margin-top:8px">
						{#each g.items as i, k (k)}
							<details class="faq">
								<summary>
									<span class="b small">{i.q}</span>
									<span class="chev"><Icon name="chevronDown" size={16} /></span>
								</summary>
								<p class="muted small">{i.a}</p>
							</details>
						{/each}
					</div>
				</section>
			{:else}
				<div class="empty">
					<div class="ico"><Icon name="search" size={24} /></div>
					<p class="b">No articles match “{q}”</p>
					<button class="btn btn-sm btn-outline" onclick={() => (tab = 'contact')}>
						Ask support instead
					</button>
				</div>
			{/each}

			<div class="grid-two" style="margin-top:16px">
				<a class="qa" href="/legal/terms">
					<Icon name="shield" size={17} /> Terms of service
				</a>
				<a class="qa" href="/legal/privacy">
					<Icon name="lock" size={17} /> Privacy policy
				</a>
			</div>
		{:else if tab === 'contact'}
			{#if sent}
				<div class="card card-pad center" style="padding:32px 20px">
					<div class="tick"><Icon name="check" size={28} stroke={2.6} /></div>
					<p class="b" style="margin-top:12px">Thanks — we’ve got it</p>
					<p class="small muted" style="margin-top:4px">
						A human replies within 24 hours. Reference #{Math.random().toString(36).slice(2, 7).toUpperCase()}
					</p>
					<button class="btn btn-outline btn-sm" style="margin-top:14px" onclick={() => (sent = false)}>
						Send another message
					</button>
				</div>
			{:else}
				<form class="card card-pad col gap-14" onsubmit={submit}>
					<div class="field">
						<label class="label" for="ce2">Your email</label>
						<input id="ce2" class="input" type="email" bind:value={form.email} required />
					</div>
					<div class="field">
						<label class="label" for="ct">Topic</label>
						<select id="ct" class="select" bind:value={form.topic}>
							<option>A ticket or order</option>
							<option>A payment or refund</option>
							<option>Check-in problem</option>
							<option>Running an event</option>
							<option>Account or verification</option>
							<option>Something else</option>
						</select>
					</div>
					<div class="field">
						<label class="label" for="cm">How can we help?</label>
						<textarea id="cm" class="textarea" rows="5" bind:value={form.message} required></textarea>
					</div>
					<button class="btn btn-primary btn-block" disabled={!form.message.trim()}>
						Send message
					</button>
					<p class="hint">
						Support hours: 08:00–20:00 WAT, 7 days. For anything urgent on event day, use the
						organiser’s contact on the event page.
					</p>
				</form>
			{/if}
		{:else if tab === 'safety'}
			<div class="card card-pad">
				<h3 style="margin-bottom:8px">Report a safety issue</h3>
				<p class="small muted" style="line-height:1.6">
					Reports go to our trust & safety team, not to the organiser. We review urgent reports
					(fake events, unsafe venues, fraud) within 2 hours, everything else within 24 hours.
				</p>
				<button class="btn btn-primary btn-block" style="margin-top:14px" onclick={() => (safetyOpen = true)}>
					<Icon name="flag" size={16} /> Start a report
				</button>
			</div>

			<div class="card card-pad" style="margin-top:12px">
				<h3 style="margin-bottom:8px">How we keep events safe</h3>
				<div class="li">
					<span class="ic"><Icon name="shieldCheck" size={16} /></span>
					<div class="col grow">
						<span class="b small">Organiser verification</span>
						<span class="tiny muted-2">ID and business checks before the first payout.</span>
					</div>
				</div>
				<div class="li">
					<span class="ic"><Icon name="alert" size={16} /></span>
					<div class="col grow">
						<span class="b small">Risk scoring</span>
						<span class="tiny muted-2">Every new event is scored before it goes live.</span>
					</div>
				</div>
				<div class="li">
					<span class="ic"><Icon name="ticket" size={16} /></span>
					<div class="col grow">
						<span class="b small">Rotating QR tickets</span>
						<span class="tiny muted-2">Screenshots and copied codes cannot be reused.</span>
					</div>
				</div>
				<div class="li">
					<span class="ic"><Icon name="ban" size={16} /></span>
					<div class="col grow">
						<span class="b small">Payout holds</span>
						<span class="tiny muted-2">Funds can be held while a dispute is investigated.</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="card card-pad">
				<h3 style="margin-bottom:4px">Organiser guide</h3>
				<p class="small muted">
					Everything you need to publish an event and get paid — about ten minutes end to end.
				</p>
			</div>

			{#each [['1', 'Create the event', 'Basics, date and place, tickets, extras, review. Save as a draft any time and come back to it.'], ['2', 'Publish and share', 'Hit publish, then copy the public link or drop the embed widget on your own site.'], ['3', 'Sell tickets', 'Watch the sales funnel, push a promo code, or message attendees who haven’t completed checkout.'], ['4', 'On the night', 'Open the scanner, add staff, and check people in. It works offline and reconciles automatically.'], ['5', 'Get paid', 'Payouts run every 48 hours to your verified bank account. Hold or track any payout from the dashboard.']] as [n, title, body]}
				<div class="step">
					<span class="n">{n}</span>
					<div class="col grow">
						<span class="b small">{title}</span>
						<span class="small muted" style="line-height:1.6">{body}</span>
					</div>
				</div>
			{/each}

			<a class="btn btn-primary btn-block" style="margin-top:14px" href="/organizer/create">
				Create your event
			</a>
		{/if}
	</div>
</div>

<Sheet bind:open={safetyOpen} title="Report a safety issue">
	<div class="col gap-8">
		{#each SAFETY_REASONS as r}
			<button
				class="srow"
				onclick={() => {
					safetyOpen = false;
					app.notify({
						kind: 'update',
						title: 'Safety report received',
						body: `“${r}” — our trust & safety team will review it shortly.`,
						href: '/notifications'
					});
					app.say('Report submitted — thank you');
				}}
			>
				<Icon name="flag" size={16} /> {r}
			</button>
		{/each}
		<p class="hint" style="margin-top:6px">
			If someone is in immediate danger, contact local emergency services first.
		</p>
	</div>
</Sheet>

<style>
	.grp {
		margin-bottom: 16px;
	}
	.faq {
		border-bottom: 1px solid var(--line);
		padding: 12px 0;
	}
	.faq:last-child {
		border-bottom: 0;
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
	.faq[open] .chev {
		transform: rotate(180deg);
	}
	.faq p {
		padding-top: 8px;
		line-height: 1.6;
	}
	.grid-two {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.qa {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px;
		border-radius: var(--r-lg);
		border: 1px solid var(--line);
		font-size: 13.5px;
		font-weight: 600;
	}
	.qa:hover {
		background: var(--surface);
	}
	.ic {
		width: 34px;
		height: 34px;
		border-radius: 10px;
		background: var(--surface);
		display: grid;
		place-items: center;
		color: var(--text-2);
	}
	.step {
		display: flex;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.step .n {
		width: 26px;
		height: 26px;
		border-radius: 99px;
		background: var(--accent-soft);
		color: var(--accent);
		display: grid;
		place-items: center;
		font-size: 12.5px;
		font-weight: 750;
		flex: none;
	}
	.tick {
		width: 60px;
		height: 60px;
		border-radius: 99px;
		background: var(--good-soft);
		color: var(--good);
		display: grid;
		place-items: center;
		margin: 0 auto;
	}
	.gap-14 {
		gap: 14px;
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
</style>
