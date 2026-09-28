<script>
	import { goto } from '$app/navigation';
	import { app } from '$shared/lib/state.svelte.js';
	import { CATEGORIES, VENUES } from '$shared/lib/data.js';
	import { money, slugify, dateLong, time } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';
	import PhotoPicker from '$comp/PhotoPicker.svelte';

	let step = $state(0);
	const steps = ['Basics', 'Date & place', 'Tickets', 'Extras', 'Review'];

	let ev = $state({
		title: '',
		category: 'music',
		summary: '',
		description: '',
		tags: '',
		hue: 258,
		image: null,
		start: '',
		end: '',
		doors: '',
		mode: 'in-person',
		venueId: 'v1',
		onlineUrl: '',
		capacity: 300,
		ageLimit: 'All ages',
		language: 'English',
		accessibility: ['Step-free access']
	});

	let tickets = $state([
		{ id: 't1', name: 'General admission', price: 10000, qty: 200, perks: 'Entry + welcome drink' }
	]);
	let agenda = $state([{ time: '18:00', title: 'Doors open', who: '' }]);
	let speakers = $state([{ name: '', role: '' }]);
	let questions = $state([{ q: '', required: false }]);
	let faqs = $state([{ q: '', a: '' }]);
	let waiver = $state('');
	let promo = $state({ code: '', off: 10 });
	let recurring = $state('none');
	let approval = $state('auto');

	const hueFor = $derived(CATEGORIES.find((c) => c.id === ev.category)?.hue ?? 258);
	$effect(() => {
		ev.hue = hueFor;
	});

	const progress = $derived(
		[ev.title && ev.summary, ev.start && ev.end, tickets.length > 0, true, true].filter(Boolean).length
	);

	function addTicket() {
		tickets = [
			...tickets,
			{ id: 't' + (tickets.length + 1), name: 'New ticket', price: 0, qty: 50, perks: '' }
		];
	}
	function removeTicket(i) {
		tickets = tickets.filter((_, x) => x !== i);
	}

	function publish(status = 'published') {
		const slug = (slugify(ev.title) || 'event') + '-' + Math.random().toString(36).slice(2, 5);
		/* date guards — the wizard lets you skip ahead, so never publish an invalid date */
		const startMs = ev.start ? Date.parse(ev.start) : Date.now() + 7 * 86400000;
		const endMs = ev.end ? Date.parse(ev.end) : startMs + 3 * 3600000;
		const startISO = new Date(startMs).toISOString();
		const endISO = new Date(endMs > startMs ? endMs : startMs + 3 * 3600000).toISOString();
		const created = app.createEvent({
			slug,
			title: ev.title,
			category: ev.category,
			hue: hueFor,
			image: ev.image,
			summary: ev.summary,
			description: ev.description,
			tags: ev.tags.split(',').map((t) => t.trim()).filter(Boolean),
			start: startISO,
			end: endISO,
			doors: ev.doors && Date.parse(ev.doors) ? new Date(ev.doors).toISOString() : null,
			mode: ev.mode,
			venueId: ev.mode === 'online' ? 'v9' : ev.venueId,
			onlineUrl: ev.onlineUrl,
			capacity: Number(ev.capacity) || 100,
			ageLimit: ev.ageLimit,
			language: ev.language,
			accessibility: ev.accessibility,
			ticketTypes: tickets.map((t) => ({
				id: t.id,
				name: t.name,
				price: Number(t.price),
				qty: Number(t.qty),
				sold: 0,
				perks: t.perks
			})),
			agenda: agenda.filter((a) => a.title),
			speakers: speakers.filter((s) => s.name),
			faqs: faqs.filter((f) => f.q),
			status
		});
		if (status === 'published') app.say('Event published 🎉');
		goto('/organizer/events/' + created.id);
	}
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<button
					class="icon-btn"
					onclick={() => (step === 0 ? history.back() : step--)}
					aria-label="Back"
				>
					<Icon name="arrowLeft" size={19} />
				</button>
				<h1 class="page-title">Create event</h1>
				<button class="btn btn-ghost btn-sm" onclick={() => app.say('Draft saved')}>Save draft</button>
			</div>
			<div class="steps">
				{#each steps as s, i}
					<button class="step" class:on={i === step} class:done={i < step} onclick={() => (step = i)}>
						<span class="n">{i < step ? '✓' : i + 1}</span>{s}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="shell">
		{#if step === 0}
			<div class="card card-pad col gap-14">
				<div class="field">
					<label class="label" for="t">Event title</label>
					<input id="t" class="input" bind:value={ev.title} placeholder="e.g. Lagos Sound Festival" />
				</div>
				<div class="field">
					<span class="label">Category</span>
					<div class="wrap row gap-8">
						{#each CATEGORIES as c}
							<button
								class="chip"
								class:on={ev.category === c.id}
								onclick={() => (ev.category = c.id)}
							>
								{c.name}
							</button>
						{/each}
					</div>
				</div>
				<div class="field">
					<label class="label" for="s">Short summary</label>
					<input id="s" class="input" bind:value={ev.summary} placeholder="One line people will remember" />
				</div>
				<div class="field">
					<label class="label" for="d">Description</label>
					<textarea id="d" class="textarea" bind:value={ev.description} rows="5"></textarea>
				</div>
				<div class="field">
					<label class="label" for="tg">Tags (comma separated)</label>
					<input id="tg" class="input" bind:value={ev.tags} placeholder="music, outdoor, festival" />
				</div>
				<div class="field">
					<PhotoPicker
						bind:value={ev.image}
						hue={hueFor}
						variant="cover"
						glyph="sparkle"
						label="Event photo"
						hint="Shown on cards, search and the event page"
						ratio="16 / 9"
						seed={7}
						presets={false}
					/>
				</div>
				<div class="field">
					<span class="label">Preview</span>
					<div class="preview">
						<Cover image={ev.image} hue={hueFor} glyph="sparkle" radius={14} seed={7} />
						<div class="pbody">
							<span class="b truncate">{ev.title || 'Your event title'}</span>
							<span class="tiny muted-2">{ev.summary || 'Short summary goes here'}</span>
						</div>
					</div>
				</div>
			</div>
		{:else if step === 1}
			<div class="card card-pad col gap-14">
				<div class="field">
					<span class="label">Format</span>
					<div class="row gap-8">
						{#each [['in-person', 'In person'], ['online', 'Online'], ['hybrid', 'Hybrid']] as [v, l]}
							<button class="chip grow" class:on={ev.mode === v} onclick={() => (ev.mode = v)}>
								{l}
							</button>
						{/each}
					</div>
				</div>

				<div class="grid-2">
					<div class="field">
						<label class="label" for="st">Starts</label>
						<input id="st" class="input" type="datetime-local" bind:value={ev.start} />
					</div>
					<div class="field">
						<label class="label" for="en">Ends</label>
						<input id="en" class="input" type="datetime-local" bind:value={ev.end} />
					</div>
				</div>

				<div class="grid-2">
					<div class="field">
						<label class="label" for="dr">Doors open</label>
						<input id="dr" class="input" type="datetime-local" bind:value={ev.doors} />
					</div>
					<div class="field">
						<label class="label" for="tz">Time zone</label>
						<select id="tz" class="select" value="wat">
							<option value="wat">West Africa Time (WAT)</option>
							<option value="gmt">GMT</option>
						</select>
					</div>
				</div>

				{#if ev.mode !== 'online'}
					<div class="field">
						<label class="label" for="vn">Venue</label>
						<select id="vn" class="select" bind:value={ev.venueId}>
							{#each VENUES.filter((v) => v.id !== 'v9') as v}
								<option value={v.id}>{v.name} — {v.city}</option>
							{/each}
						</select>
						<span class="hint">{VENUES.find((v) => v.id === ev.venueId)?.address}</span>
					</div>
				{/if}
				{#if ev.mode !== 'in-person'}
					<div class="field">
						<label class="label" for="ou">Online link</label>
						<input id="ou" class="input" bind:value={ev.onlineUrl} placeholder="https://zoom.us/j/…" />
					</div>
				{/if}

				<div class="grid-2">
					<div class="field">
						<label class="label" for="cap">Capacity</label>
						<input id="cap" class="input" type="number" bind:value={ev.capacity} />
					</div>
					<div class="field">
						<label class="label" for="age">Age limit</label>
						<select id="age" class="select" bind:value={ev.ageLimit}>
							<option>All ages</option>
							<option>16+</option>
							<option>18+</option>
							<option>21+</option>
						</select>
					</div>
				</div>

				<div class="field">
					<span class="label">Recurrence</span>
					<div class="wrap row gap-8">
						{#each [['none', 'One-off'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['series', 'Multi-session']] as [v, l]}
							<button class="chip" class:on={recurring === v} onclick={() => (recurring = v)}>
								{l}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else if step === 2}
			<div class="col gap-12">
				{#each tickets as t, i (i)}
					<div class="card card-pad">
						<div class="row-between" style="margin-bottom:10px">
							<span class="b small">Ticket {i + 1}</span>
							{#if tickets.length > 1}
								<button class="btn btn-sm btn-ghost" onclick={() => removeTicket(i)}>
									<Icon name="trash" size={14} />
								</button>
							{/if}
						</div>
						<div class="field">
							<span class="label">Name</span>
							<input class="input" bind:value={t.name} />
						</div>
						<div class="grid-2" style="margin-top:10px">
							<div class="field">
								<span class="label">Price (₦)</span>
								<input class="input" type="number" bind:value={t.price} />
							</div>
							<div class="field">
								<span class="label">Quantity</span>
								<input class="input" type="number" bind:value={t.qty} />
							</div>
						</div>
						<div class="field" style="margin-top:10px">
							<span class="label">What’s included</span>
							<input class="input" bind:value={t.perks} placeholder="Entry + welcome drink" />
						</div>
						<div class="row gap-8" style="margin-top:10px">
							<label class="check grow">
								<input type="checkbox" /> Hide when sold out
							</label>
							<label class="check grow">
								<input type="checkbox" /> Approval required
							</label>
						</div>
					</div>
				{/each}

				<button class="btn btn-outline btn-block" onclick={addTicket}>
					<Icon name="plus" size={16} /> Add ticket type
				</button>

				<div class="card card-pad">
					<h3 style="margin-bottom:10px">Promo codes</h3>
					<div class="row gap-8">
						<input class="input" placeholder="Code" bind:value={promo.code} />
						<input
							class="input"
							type="number"
							style="max-width:110px"
							bind:value={promo.off}
							placeholder="% off"
						/>
						<button class="btn btn-primary" onclick={() => app.say('Promo code created')}>Add</button>
					</div>
					<div class="li" style="margin-top:8px">
						<span class="grow small">EARLYBIRD · 15% off · 100 uses</span>
						<span class="tag good">Active</span>
					</div>
				</div>

				<div class="card card-pad">
					<h3 style="margin-bottom:6px">Registration questions</h3>
					{#each questions as q, i}
						<div class="row gap-8" style="margin-top:8px">
							<input class="input grow" placeholder="e.g. Dietary requirements" bind:value={q.q} />
							<label class="check" style="white-space:nowrap">
								<input type="checkbox" bind:checked={q.required} /> Required
							</label>
						</div>
					{/each}
					<button
						class="btn btn-ghost btn-sm"
						style="margin-top:8px"
						onclick={() => (questions = [...questions, { q: '', required: false }])}
					>
						<Icon name="plus" size={14} /> Add question
					</button>
					<div class="field" style="margin-top:14px">
						<span class="label">Waiver / consent (optional)</span>
						<textarea class="textarea" bind:value={waiver} placeholder="I accept the event terms…"></textarea>
					</div>
				</div>
			</div>
		{:else if step === 3}
			<div class="card card-pad col gap-14">
				<div>
					<div class="row-between" style="margin-bottom:8px">
						<span class="label">Agenda</span>
						<button
							class="btn btn-ghost btn-sm"
							onclick={() => (agenda = [...agenda, { time: '', title: '', who: '' }])}
						>
							<Icon name="plus" size={14} />
						</button>
					</div>
					{#each agenda as a, i}
						<div class="row gap-8" style="margin-bottom:8px">
							<input class="input" style="max-width:96px" placeholder="18:00" bind:value={a.time} />
							<input class="input grow" placeholder="Session title" bind:value={a.title} />
							<input class="input" style="max-width:140px" placeholder="Speaker" bind:value={a.who} />
						</div>
					{/each}
				</div>

				<div>
					<div class="row-between" style="margin-bottom:8px">
						<span class="label">Speakers / performers</span>
						<button
							class="btn btn-ghost btn-sm"
							onclick={() => (speakers = [...speakers, { name: '', role: '' }])}
						>
							<Icon name="plus" size={14} />
						</button>
					</div>
					{#each speakers as s, i}
						<div class="row gap-8" style="margin-bottom:8px">
							<input class="input grow" placeholder="Name" bind:value={s.name} />
							<input class="input grow" placeholder="Role / title" bind:value={s.role} />
						</div>
					{/each}
				</div>

				<div>
					<div class="row-between" style="margin-bottom:8px">
						<span class="label">FAQs</span>
						<button class="btn btn-ghost btn-sm" onclick={() => (faqs = [...faqs, { q: '', a: '' }])}>
							<Icon name="plus" size={14} />
						</button>
					</div>
					{#each faqs as f, i}
						<div class="col gap-8" style="margin-bottom:8px">
							<input class="input" placeholder="Question" bind:value={f.q} />
							<input class="input" placeholder="Answer" bind:value={f.a} />
						</div>
					{/each}
				</div>

				<div class="field">
					<span class="label">Accessibility</span>
					<div class="wrap row gap-8">
						{#each ['Step-free access', 'Accessible toilets', 'Reserved seating', 'Sign-language interpreter', 'Quiet room'] as a}
							<button
								class="chip sm"
								class:on={ev.accessibility.includes(a)}
								onclick={() =>
									(ev.accessibility = ev.accessibility.includes(a)
										? ev.accessibility.filter((x) => x !== a)
										: [...ev.accessibility, a])}
							>
								{a}
							</button>
						{/each}
					</div>
				</div>

				<div class="field">
					<span class="label">Approval workflow</span>
					<div class="wrap row gap-8">
						{#each [['auto', 'Auto-approve all'], ['manual', 'Manual review'], ['invite', 'Invite only']] as [v, l]}
							<button class="chip" class:on={approval === v} onclick={() => (approval = v)}>
								{l}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="card" style="overflow:hidden">
				<div class="rhero"><Cover image={ev.image} hue={hueFor} glyph="sparkle" radius={0} seed={9} /></div>
				<div class="card-pad col gap-10">
					<h2 style="font-size:22px">{ev.title || 'Untitled event'}</h2>
					<p class="muted small">{ev.summary}</p>
					<div class="row gap-8 wrap">
						<span class="tag">{CATEGORIES.find((c) => c.id === ev.category)?.name}</span>
						<span class="tag">{ev.mode}</span>
						<span class="tag">{ev.capacity} capacity</span>
						<span class="tag">{ev.ageLimit}</span>
					</div>
					<hr />
					<div class="row-between">
						<span class="muted small">When</span>
						<span class="small b">
							{ev.start ? dateLong(new Date(ev.start).toISOString()) : 'Not set'}
							{ev.start ? ' · ' + time(new Date(ev.start).toISOString()) : ''}
						</span>
					</div>
					<div class="row-between">
						<span class="muted small">Where</span>
						<span class="small b">
							{ev.mode === 'online' ? 'Online' : (VENUES.find((v) => v.id === ev.venueId)?.name ?? '—')}
						</span>
					</div>
					<hr />
					{#each tickets as t}
						<div class="row-between">
							<span class="small">{t.name} · {t.qty} available</span>
							<span class="b small">{t.price ? money(t.price, app.currency) : 'Free'}</span>
						</div>
					{/each}
					<div class="row-between" style="margin-top:6px">
						<span class="b">Potential revenue</span>
						<span class="b">
							{money(tickets.reduce((s, t) => s + t.price * t.qty, 0), app.currency)}
						</span>
					</div>
				</div>
			</div>

			<div class="col gap-8" style="margin-top:14px">
				<button class="btn btn-primary btn-lg" onclick={() => publish('published')}>
					Publish event
				</button>
				<button class="btn btn-outline btn-block" onclick={() => publish('draft')}>
					Save as draft
				</button>
			</div>
		{/if}

		<div class="row gap-8" style="margin:18px 0 8px">
			{#if step > 0}
				<button class="btn btn-outline grow" onclick={() => step--}>Back</button>
			{/if}
			{#if step < 4}
				<button class="btn btn-primary grow" onclick={() => step++}>Continue</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.steps {
		display: flex;
		gap: 6px;
		padding-bottom: 10px;
		overflow-x: auto;
	}
	.step {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 0;
		background: transparent;
		padding: 6px 10px;
		border-radius: 99px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-3);
		white-space: nowrap;
		cursor: pointer;
	}
	.step .n {
		width: 20px;
		height: 20px;
		border-radius: 99px;
		background: var(--surface-2);
		display: grid;
		place-items: center;
		font-size: 11px;
	}
	.step.on {
		background: var(--surface);
		color: var(--text);
	}
	.step.on .n {
		background: var(--text);
		color: var(--bg);
	}
	.step.done .n {
		background: var(--good-soft);
		color: var(--good);
	}
	.gap-14 {
		gap: 14px;
	}
	.preview {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: var(--r);
	}
	.preview :global(.cover) {
		width: 64px;
		height: 64px;
		flex: none;
	}
	.pbody {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.rhero {
		height: 130px;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 13px;
	}
	.check input {
		accent-color: var(--accent);
	}
	.grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
</style>
