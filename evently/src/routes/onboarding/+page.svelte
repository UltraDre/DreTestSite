<script>
	import { goto } from '$app/navigation';
	import { app } from '$shared/lib/state.svelte.js';
	import { INTERESTS } from '$shared/lib/data.js';
	import Icon from '$comp/Icon.svelte';
	import Cover from '$comp/Cover.svelte';

	let step = $state(0);
	let slide = $state(0);
	let picked = $state([...app.interests]);
	let city = $state(app.city);
	let locating = $state(false);
	let perms = $state({ notifications: false, location: false, camera: false, calendar: false });

	const slides = [
		{
			hue: 258,
			glyph: 'headphones',
			title: 'Find what’s on near you',
			body: 'Concerts, hackathons, run clubs and supper clubs — filtered to what you actually like.'
		},
		{
			hue: 218,
			glyph: 'ticket',
			title: 'One ticket, one QR',
			body: 'Buy in seconds, store in your wallet, and scan at the door — even with no signal.'
		},
		{
			hue: 168,
			glyph: 'chart',
			title: 'Run your own event',
			body: 'Publish in minutes, sell tickets, scan guests at the door and get paid out fast.'
		}
	];

	function toggle(id) {
		picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
	}

	async function useMyLocation() {
		locating = true;
		const done = () => (locating = false);
		if (!navigator.geolocation) {
			setTimeout(done, 600);
			app.say('Location unavailable — pick a city manually', 'info');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			() => {
				perms.location = true;
				city = 'Lagos';
				done();
				app.say('Using your current location');
			},
			() => {
				done();
				app.say('Location blocked — choose a city instead', 'info');
			},
			{ timeout: 6000 }
		);
	}

	async function askNotifications() {
		if (!('Notification' in window)) {
			app.say('This browser has no push support', 'info');
			return;
		}
		const r = await Notification.requestPermission().catch(() => 'denied');
		perms.notifications = r === 'granted';
		app.say(perms.notifications ? 'Notifications enabled' : 'Notifications blocked', 'info');
	}

	function finish() {
		app.completeOnboarding({ interests: picked, city });
		app.launched = true;
		goto('/auth?mode=signup');
	}
</script>

<div class="ob">
	<div class="shell inner">
		<div class="top row-between">
			<div class="dots">
				{#each [0, 1, 2] as i}
					<span class="dot" class:on={i === step}></span>
				{/each}
			</div>
			{#if step < 2}
				<button class="btn btn-ghost btn-sm" onclick={finish}>Skip</button>
			{/if}
		</div>

		{#if step === 0}
			<div class="stage">
				<div class="art">
					<Cover hue={slides[slide].hue} glyph={slides[slide].glyph} radius={26} seed={slide} />
				</div>
				<div class="txt">
					<h1 style="font-size:27px">{slides[slide].title}</h1>
					<p class="muted">{slides[slide].body}</p>
				</div>
				<div class="dots center-dots">
					{#each slides as s, i}
						<button
							class="dot"
							class:on={i === slide}
							aria-label="Slide {i + 1}"
							onclick={() => (slide = i)}
						></button>
					{/each}
				</div>
				<button class="btn btn-primary btn-lg" onclick={() => (step = 1)}>Get started</button>
				<button class="btn btn-ghost btn-block" onclick={finish}>Browse as guest</button>
			</div>
		{:else if step === 1}
			<div class="stage">
				<div class="txt">
					<span class="eyebrow">Step 1 of 2</span>
					<h1>What are you into?</h1>
					<p class="muted small">Pick at least 3. We use this to order your home feed.</p>
				</div>
				<div class="grid-chips">
					{#each INTERESTS as c}
						<button
							class="chip"
							class:on={picked.includes(c.id)}
							style={picked.includes(c.id) ? '' : `--h:${c.hue}`}
							onclick={() => toggle(c.id)}
						>
							<span class="swatch" style="background:hsl({c.hue} 62% 56%)"></span>
							{c.name}
							{#if picked.includes(c.id)}<Icon name="check" size={14} stroke={2.6} />{/if}
						</button>
					{/each}
				</div>
				<button
					class="btn btn-primary btn-lg"
					disabled={picked.length < 1}
					onclick={() => (step = 2)}
				>
					Continue · {picked.length} picked
				</button>
			</div>
		{:else}
			<div class="stage">
				<div class="txt">
					<span class="eyebrow">Step 2 of 2</span>
					<h1>Where should we look?</h1>
					<p class="muted small">We’ll show events near you first.</p>
				</div>

				<div class="field">
					<label class="label" for="city">City</label>
					<select id="city" class="select" bind:value={city}>
						<option>Lagos</option>
						<option>Abuja</option>
						<option>Port Harcourt</option>
						<option>Kigali</option>
						<option>Nairobi</option>
						<option>Accra</option>
						<option>London</option>
						<option>Online only</option>
					</select>
				</div>
				<button class="btn btn-outline btn-block" onclick={useMyLocation} disabled={locating}>
					<Icon name="pin" size={17} />
					{locating ? 'Locating…' : 'Use my current location'}
				</button>

				<div class="perms">
					<div class="eyebrow" style="margin-bottom:8px">Permissions</div>
					<button class="perm" class:on={perms.notifications} onclick={askNotifications}>
						<Icon name="bell" size={19} />
						<span class="col grow">
							<span class="b small">Push notifications</span>
							<span class="tiny muted-2">Reminders, check-in and event updates</span>
						</span>
						<span class="tiny b" style="color:var(--accent)"
							>{perms.notifications ? 'Allowed' : 'Allow'}</span
						>
					</button>
					<button class="perm" class:on={perms.location} onclick={useMyLocation}>
						<Icon name="pin" size={19} />
						<span class="col grow">
							<span class="b small">Location</span>
							<span class="tiny muted-2">Events near you, map view, directions</span>
						</span>
						<span class="tiny b" style="color:var(--accent)"
							>{perms.location ? 'Allowed' : 'Allow'}</span
						>
					</button>
					<button
						class="perm"
						class:on={perms.camera}
						onclick={() => {
							perms.camera = true;
							app.say('Camera will be used for QR scanning');
						}}
					>
						<Icon name="camera" size={19} />
						<span class="col grow">
							<span class="b small">Camera</span>
							<span class="tiny muted-2">Scan tickets and upload event photos</span>
						</span>
						<span class="tiny b" style="color:var(--accent)"
							>{perms.camera ? 'Allowed' : 'Allow'}</span
						>
					</button>
					<button
						class="perm"
						class:on={perms.calendar}
						onclick={() => {
							perms.calendar = true;
							app.say('Calendar sync on — events you save get added');
						}}
					>
						<Icon name="calendar" size={19} />
						<span class="col grow">
							<span class="b small">Calendar</span>
							<span class="tiny muted-2">Add saved events with one tap</span>
						</span>
						<span class="tiny b" style="color:var(--accent)"
							>{perms.calendar ? 'Allowed' : 'Allow'}</span
						>
					</button>
				</div>

				<button class="btn btn-primary btn-lg" onclick={finish}>Continue</button>
				<button class="btn btn-ghost btn-block" onclick={finish}>Skip for now</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.ob {
		min-height: 100dvh;
		display: flex;
		padding: max(var(--safe-t), 16px) 0 28px;
	}
	.inner {
		display: flex;
		flex-direction: column;
		gap: 18px;
		flex: 1;
		max-width: 520px;
	}
	.dots {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 99px;
		background: var(--line-strong);
		border: 0;
		padding: 0;
		transition: all 0.2s var(--ease);
		cursor: pointer;
	}
	.dot.on {
		width: 20px;
		background: var(--text);
	}
	.stage {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex: 1;
		animation: fade-up 0.3s var(--ease) both;
	}
	.art {
		height: min(38dvh, 300px);
	}
	.txt {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}
	.center-dots {
		justify-content: center;
		padding: 4px 0 2px;
	}
	.grid-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.swatch {
		width: 10px;
		height: 10px;
		border-radius: 3px;
		display: inline-block;
	}
	.perms {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top: 1px solid var(--line);
		padding-top: 14px;
	}
	.perm {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		background: var(--surface);
		border: 1px solid transparent;
		border-radius: var(--r);
		padding: 11px 13px;
		cursor: pointer;
		transition: all 0.15s var(--ease);
	}
	.perm:hover {
		border-color: var(--line-strong);
	}
	.perm.on {
		background: var(--accent-soft);
		border-color: var(--accent-line);
	}
	.stage :global(.btn-ghost) {
		margin-top: -6px;
	}
</style>
