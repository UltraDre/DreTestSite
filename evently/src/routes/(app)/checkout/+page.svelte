<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { app } from '$shared/lib/state.svelte.js';
	import { money, dateLong, time, ics, download } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Avatar from '$comp/Avatar.svelte';
	import Sheet from '$comp/Sheet.svelte';

	const eventId = $derived(page.url.searchParams.get('event'));
	const e = $derived(app.event(eventId));
	const lines = $derived(e ? app.cartLines(e.id) : []);
	const subtotal = $derived(lines.reduce((s, l) => s + l.subtotal, 0));
	const feesRate = 0.015;
	const fees = $derived(Math.round(subtotal * feesRate) + (subtotal > 0 ? 200 : 0));
	let donation = $state(0);
	const promo = $derived(app.cart.promo);
	const discount = $derived(promo ? Math.round(subtotal * (promo.off ?? 0.1)) : 0);
	const total = $derived(Math.max(0, subtotal + fees - discount + donation));

	let step = $state('details'); // details | payment | 3ds | done | failed
	let method = $state('card');
	let attendee = $state({ name: app.user?.name ?? '', email: app.user?.email ?? '', phone: app.user?.phone ?? '' });
	let card = $state({ no: '4242 4242 4242 4242', exp: '12/28', cvc: '123', name: '' });
	let promoCode = $state('');
	let promoOpen = $state(false);
	let processing = $state(false);
	let otpCode = $state('');
	let order = $state(null);
	let scenario = $state('success');
	let saveCard = $state(true);

	const methods = [
		{ id: 'card', label: 'Debit / credit card', icon: 'card', note: 'Visa, Mastercard, Verve' },
		{ id: 'apple', label: 'Apple Pay', icon: 'mobile', note: 'Pay with Face ID' },
		{ id: 'google', label: 'Google Pay', icon: 'mobile', note: 'Pay with one tap' },
		{ id: 'paypal', label: 'PayPal', icon: 'wallet', note: 'Balance or linked card' },
		{ id: 'transfer', label: 'Bank transfer', icon: 'banknote', note: 'Instant, no fees' },
		{ id: 'momo', label: 'Mobile money', icon: 'mobile', note: 'MTN, Airtel, Glo' },
		{ id: 'later', label: 'Pay in 4 (no interest)', icon: 'zap', note: 'Split into 4 payments' }
	];

	const PROMOS = { EVENTLY10: 0.1, FIRST50: 0.5, STUDENT: 0.2 };

	function applyPromo() {
		const code = promoCode.trim().toUpperCase();
		if (PROMOS[code]) {
			app.cart.promo = { code, off: PROMOS[code] };
			promoOpen = false;
			app.say(`${code} applied — ${PROMOS[code] * 100}% off`);
		} else {
			app.say('That code isn’t valid', 'alert');
		}
	}

	async function pay() {
		processing = true;
		await new Promise((r) => setTimeout(r, 700));
		processing = false;
		if (scenario === '3ds') {
			step = '3ds';
			return;
		}
		if (scenario === 'declined') {
			step = 'failed';
			return;
		}
		complete();
	}

	function complete() {
		order = app.checkout(e.id, attendee, { method });
		step = 'done';
	}

	$effect(() => {
		if (e && !lines.length && step !== 'done' && step !== 'failed') {
			// nothing selected — send back to the event
			goto('/events/' + e.slug);
		}
	});
</script>

{#if !e}
	<div class="empty"><p class="b">No event selected</p><a class="btn btn-sm btn-outline" href="/explore">Browse events</a></div>
{:else}
	<div class="page">
		<div class="page-head">
			<div class="shell row" style="height:56px">
				<button class="icon-btn" onclick={() => (step === 'details' ? history.back() : (step = 'details'))}>
					<Icon name="arrowLeft" size={19} />
				</button>
				<h1 class="page-title">
					{step === 'done' ? 'You’re in' : step === 'failed' ? 'Payment failed' : 'Checkout'}
				</h1>
				{#if step === 'details' || step === 'payment'}
					<span class="tiny muted-2">Step {step === 'details' ? 1 : 2} of 2</span>
				{/if}
			</div>
		</div>

		<div class="shell">
			{#if step === 'done'}
				<div class="done">
					<div class="tick"><Icon name="check" size={34} stroke={2.6} /></div>
					<h1 style="font-size:26px">See you there!</h1>
					<p class="muted small">
						{order.lines.reduce((s, l) => s + l.qty, 0)} ticket{order.lines.reduce((s, l) => s + l.qty, 0) >
						1
							? 's'
							: ''} for {e.title} · Ref {order.ref}
					</p>

					<div class="card card-pad" style="margin:18px 0;text-align:left">
						<div class="row-between">
							<span class="muted small">Total paid</span>
							<span class="b">{money(order.total, app.currency)}</span>
						</div>
						<div class="row-between" style="margin-top:6px">
							<span class="muted small">Method</span>
							<span class="small b">{methods.find((m) => m.id === order.method)?.label}</span>
						</div>
						<div class="row-between" style="margin-top:6px">
							<span class="muted small">Receipt</span>
							<span class="small b">{attendee.email}</span>
						</div>
					</div>

					<div class="col gap-8">
						<a class="btn btn-primary btn-lg" href="/tickets/{order.ticketIds[0]}">View my ticket</a>
						<a class="btn btn-outline btn-block" href="/tickets">All tickets</a>
						<button
							class="btn btn-ghost btn-block"
							onclick={() => {
								download(`${e.slug}.ics`, ics(e, app.venue(e.venueId)));
								app.say('Calendar invite downloaded');
							}}
						>
							<Icon name="calendar" size={17} /> Add to calendar
						</button>
					</div>
				</div>
			{:else if step === 'failed'}
				<div class="done">
					<div class="tick bad"><Icon name="x" size={30} stroke={2.6} /></div>
					<h1 style="font-size:24px">Card declined</h1>
					<p class="muted small">
						Your bank declined this payment. Nothing was charged — try another method.
					</p>
					<div class="col gap-8" style="margin-top:18px">
						<button class="btn btn-primary btn-lg" onclick={() => (step = 'payment')}>
							Try another method
						</button>
						<button
							class="btn btn-outline btn-block"
							onclick={() => {
								scenario = 'success';
								pay();
							}}
						>
							Retry this card
						</button>
						<a class="btn btn-ghost btn-block" href="/events/{e.slug}">Back to event</a>
					</div>
				</div>
			{:else if step === '3ds'}
				<div class="done">
					<div class="tick soft"><Icon name="lock" size={28} /></div>
					<h1 style="font-size:24px">Verify it’s you</h1>
					<p class="muted small">Enter the 6-digit code sent to your bank app or phone.</p>
					<div class="otp">
						{#each Array(6) as _, i}
							<input
								class="otp-in"
								maxlength="1"
								inputmode="numeric"
								value={otpCode[i] ?? ''}
								oninput={(ev) => {
									const v = ev.target.value.replace(/\D/g, '').slice(-1);
									otpCode = otpCode.padEnd(6, ' ').split('');
									otpCode[i] = v || ' ';
									otpCode = otpCode.join('');
									if (v && ev.target.nextElementSibling) ev.target.nextElementSibling.focus();
								}}
							/>
						{/each}
					</div>
					<button class="btn btn-primary btn-lg" style="margin-top:16px" onclick={complete}>
						Confirm payment
					</button>
					<button class="btn btn-ghost btn-block" onclick={() => (step = 'payment')}>Cancel</button>
				</div>
			{:else}
				<!-- event summary -->
				<div class="ev">
					<Avatar name={app.organizer(e.organizerId)?.name} hue={e.hue} size={40} />
					<div class="col grow" style="min-width:0">
						<span class="b truncate">{e.title}</span>
						<span class="tiny muted-2 truncate">{dateLong(e.start)} · {time(e.start)}</span>
					</div>
				</div>

				{#if step === 'details'}
					<div class="card card-pad sec">
						<h3 style="margin-bottom:10px">Attendee details</h3>
						<div class="col gap-12">
							<div class="field">
								<label class="label" for="an">Full name</label>
								<input id="an" class="input" bind:value={attendee.name} placeholder="Name on ticket" />
							</div>
							<div class="field">
								<label class="label" for="ae">Email</label>
								<input
									id="ae"
									class="input"
									type="email"
									bind:value={attendee.email}
									placeholder="for your ticket & receipt"
								/>
							</div>
							<div class="field">
								<label class="label" for="ap">Phone</label>
								<input id="ap" class="input" bind:value={attendee.phone} placeholder="+234…" />
							</div>
						</div>
						<p class="hint" style="margin-top:10px">
							Tickets are issued to this name. You can transfer them later for free.
						</p>
					</div>

					<div class="card card-pad sec">
						<div class="row-between" style="margin-bottom:8px">
							<h3>Order summary</h3>
							<button class="link small" onclick={() => (promoOpen = true)}>
								{promo ? promo.code : 'Add promo code'}
							</button>
						</div>
						{#each lines as l}
							<div class="li">
								<div class="col grow">
									<span class="b small">{l.type.name}</span>
									<span class="tiny muted-2">
										{l.qty} × {money(l.type.price, app.currency)}
									</span>
								</div>
								<span class="b small">{money(l.subtotal, app.currency)}</span>
							</div>
						{/each}
						<div class="totals">
							<div class="row-between"><span class="muted small">Subtotal</span><span class="small">{money(subtotal, app.currency)}</span></div>
							<div class="row-between"><span class="muted small">Service fee</span><span class="small">{money(fees, app.currency)}</span></div>
							{#if discount}
								<div class="row-between" style="color:var(--good)">
									<span class="small">Promo {promo.code}</span>
									<span class="small">−{money(discount, app.currency)}</span>
								</div>
							{/if}
							<div class="row-between" style="margin-top:8px">
								<span class="b">Total</span><span class="b" style="font-size:17px">{money(total, app.currency)}</span>
							</div>
						</div>

						<label class="donate">
							<input type="checkbox" onchange={(ev) => (donation = ev.target.checked ? 2000 : 0)} />
							<span class="small">Add ₦2,000 to support the organisers</span>
						</label>
					</div>

					<button
						class="btn btn-primary btn-lg"
						disabled={!attendee.name || !attendee.email}
						onclick={() => (step = 'payment')}
					>
						Continue to payment
					</button>
				{:else}
					<div class="card card-pad sec">
						<h3 style="margin-bottom:10px">Pay with</h3>
						<div class="methods">
							{#each methods as m}
								<button class="method" class:on={method === m.id} onclick={() => (method = m.id)}>
									<Icon name={m.icon} size={18} />
									<span class="col grow">
										<span class="b small">{m.label}</span>
										<span class="tiny muted-2">{m.note}</span>
									</span>
									<span class="radio" class:on={method === m.id}></span>
								</button>
							{/each}
						</div>

						{#if method === 'card'}
							<div class="col gap-12" style="margin-top:14px">
								<div class="field">
									<label class="label" for="cn">Card number</label>
									<input id="cn" class="input" bind:value={card.no} inputmode="numeric" />
								</div>
								<div class="row gap-8">
									<div class="field grow">
										<label class="label" for="ce">Expiry</label>
										<input id="ce" class="input" bind:value={card.exp} placeholder="MM/YY" />
									</div>
									<div class="field grow">
										<label class="label" for="cc">CVC</label>
										<input id="cc" class="input" bind:value={card.cvc} placeholder="123" />
									</div>
								</div>
								<label class="check">
									<input type="checkbox" bind:checked={saveCard} />
									<span class="small">Save this card for faster checkout</span>
								</label>
							</div>
						{:else if method === 'transfer'}
							<div class="bank">
								<span class="tiny muted-2">Transfer to</span>
								<span class="b">Evently Escrow · 0123456789 · GTBank</span>
								<span class="tiny muted-2">Reference: EV-{e.id.toUpperCase()}</span>
							</div>
						{:else if method === 'momo'}
							<div class="field" style="margin-top:12px">
								<label class="label" for="mm">Mobile number</label>
								<input id="mm" class="input" placeholder="0801 234 5678" value={attendee.phone} />
							</div>
						{:else if method === 'later'}
							<div class="bank">
								<span class="b">4 payments of {money(Math.round(total / 4), app.currency)}</span>
								<span class="tiny muted-2">
									Today, then every 2 weeks. No interest, no fees.
								</span>
							</div>
						{:else}
							<div class="bank">
								<Icon name="lock" size={16} />
								<span class="small">
									You’ll be redirected to {methods.find((m) => m.id === method)?.label} to approve
									{money(total, app.currency)}
								</span>
							</div>
						{/if}
					</div>

					<div class="card card-pad sec">
						<div class="row-between">
							<span class="muted small">Total</span>
							<span class="b" style="font-size:18px">{money(total, app.currency)}</span>
						</div>
						<div class="hint">Secured with 3-D Secure · PCI DSS compliant</div>
					</div>

					<button class="btn btn-primary btn-lg" onclick={pay} disabled={processing}>
						{#if processing}Processing…{:else}Pay {money(total, app.currency)}{/if}
					</button>
					<button class="btn btn-ghost btn-block" onclick={() => (step = 'details')}>
						Back to details
					</button>

					<!-- test scenarios -->
					<div class="tests">
						<span class="eyebrow">Test scenarios</span>
						<div class="row gap-6 wrap" style="margin-top:6px">
							{#each [['success', 'Approve'], ['3ds', 'Require 3-D Secure'], ['declined', 'Decline']] as [v, l]}
								<button class="chip sm" class:on={scenario === v} onclick={() => (scenario = v)}>
									{l}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<Sheet bind:open={promoOpen} title="Promo code">
		<div class="row gap-8">
			<input class="input" placeholder="e.g. EVENTLY10" bind:value={promoCode} />
			<button class="btn btn-primary" onclick={applyPromo}>Apply</button>
		</div>
		<p class="hint" style="margin-top:10px">Try EVENTLY10, FIRST50 or STUDENT.</p>
	</Sheet>
{/if}

<style>
	.sec {
		margin-bottom: 14px;
	}
	.ev {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 0 16px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 16px;
	}
	.totals {
		border-top: 1px solid var(--line);
		margin-top: 10px;
		padding-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.donate {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--line);
		cursor: pointer;
	}
	.donate input {
		accent-color: var(--accent);
		width: 16px;
		height: 16px;
	}
	.methods {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.method {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		padding: 12px;
		border-radius: var(--r);
		border: 1px solid var(--line);
		background: var(--bg);
		cursor: pointer;
		transition: all 0.14s var(--ease);
	}
	.method.on {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.radio {
		width: 18px;
		height: 18px;
		border-radius: 99px;
		border: 1.5px solid var(--line-strong);
		flex: none;
	}
	.radio.on {
		border-color: var(--accent);
		background: var(--accent);
		box-shadow: inset 0 0 0 3.5px var(--bg);
	}
	.bank {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
		margin-top: 14px;
		padding: 14px;
		border-radius: var(--r);
		background: var(--surface);
	}
	.check {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.check input {
		accent-color: var(--accent);
		width: 16px;
		height: 16px;
	}
	.done {
		text-align: center;
		padding: 30px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		animation: pop 0.3s var(--ease) both;
	}
	.tick {
		width: 76px;
		height: 76px;
		border-radius: 99px;
		background: var(--good-soft);
		color: var(--good);
		display: grid;
		place-items: center;
		margin-bottom: 8px;
		animation: pulse-ring 1.6s var(--ease) infinite;
	}
	.tick.bad {
		background: var(--bad-soft);
		color: var(--bad);
		animation: none;
	}
	.tick.soft {
		background: var(--accent-soft);
		color: var(--accent);
		animation: none;
	}
	.otp {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
		margin-top: 18px;
		width: 100%;
		max-width: 340px;
	}
	.otp-in {
		height: 52px;
		text-align: center;
		font-size: 20px;
		font-weight: 650;
		border-radius: var(--r);
		border: 1px solid var(--line-strong);
		background: var(--bg);
		outline: none;
	}
	.otp-in:focus {
		border-color: var(--text);
	}
	.tests {
		margin-top: 18px;
		padding: 12px 14px;
		border: 1px dashed var(--line-strong);
		border-radius: var(--r);
	}
	.link {
		color: var(--accent);
		font-weight: 600;
		background: none;
		border: 0;
		cursor: pointer;
	}
</style>
