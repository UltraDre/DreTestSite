<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import Icon from '$comp/Icon.svelte';

	/* Launch sequence: session restore → version check → route.
	   Add ?maintenance=1 or ?update=1 to the URL to preview those launch states. */
	let step = $state(0);
	const steps = ['Restoring session', 'Checking for updates', 'Syncing your tickets'];
	let maintenance = $state(false);
	let forceUpdate = $state(false);
	let deepLink = $state('');

	$effect(() => {
		maintenance = page.url.searchParams.get('maintenance') === '1';
		forceUpdate = page.url.searchParams.get('update') === '1';
		deepLink = page.url.searchParams.get('to') || '';
	});

	$effect(() => {
		if (maintenance || forceUpdate) return;
		const timers = [
			setTimeout(() => (step = 1), 520),
			setTimeout(() => (step = 2), 1020),
			setTimeout(finish, 1620)
		];
		return () => timers.forEach(clearTimeout);
	});

	function finish() {
		app.launched = true;
		const target = deepLink || (app.onboarded ? app.lastRoute || '/home' : '/onboarding');
		goto(target, { replaceState: true });
	}

	function enterGuest() {
		app.role = 'guest';
		app.user = null;
		app.launched = true;
		app.onboarded = true;
		goto('/home', { replaceState: true });
	}
</script>

<div class="splash">
	<div class="glow"></div>

	{#if maintenance}
		<div class="state">
			<div class="ico warn"><Icon name="alert" size={26} /></div>
			<h2>Under maintenance</h2>
			<p class="muted small">
				We’re upgrading the ticketing engine. Everything will be back by 04:00 WAT. Your tickets
				are safe.
			</p>
			<button class="btn btn-outline" onclick={() => (maintenance = false)}>Try anyway</button>
		</div>
	{:else if forceUpdate}
		<div class="state">
			<div class="ico accent"><Icon name="download" size={26} /></div>
			<h2>Update required</h2>
			<p class="muted small">
				Version 2.4 adds rotating QR codes and offline check-in. Update to keep using Evently.
			</p>
			<button class="btn btn-primary btn-block" onclick={() => (forceUpdate = false)}>
				Update now
			</button>
			<button class="btn btn-ghost btn-block" onclick={enterGuest}>Skip</button>
		</div>
	{:else}
		<div class="brand">
			<div class="mark">
				<Icon name="ticket" size={40} stroke={1.9} />
			</div>
			<h1 class="word">Evently</h1>
			<p class="muted-2 small">Everything happening around you.</p>
		</div>

		<div class="seq">
			<div class="bar"><i style="width:{((step + 1) / 3) * 100}%"></i></div>
			<div class="tiny muted-2 step">{steps[step]}…</div>
		</div>

		<button class="btn btn-ghost tiny skip" onclick={enterGuest}>Skip · browse as guest</button>
	{/if}
</div>

<style>
	.splash {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		padding: 32px;
		background: var(--bg);
		overflow: hidden;
	}
	.glow {
		position: absolute;
		width: 520px;
		height: 520px;
		border-radius: 50%;
		background: radial-gradient(circle, hsl(258 80% 60% / 0.16), transparent 62%);
		filter: blur(20px);
		animation: breathe 5s ease-in-out infinite;
	}
	@keyframes breathe {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.12);
			opacity: 1;
		}
	}
	.brand {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		animation: fade-up 0.6s var(--ease) both;
	}
	.mark {
		width: 82px;
		height: 82px;
		border-radius: 26px;
		background: var(--text);
		color: var(--bg);
		display: grid;
		place-items: center;
		box-shadow: var(--shadow-lg);
		animation: pop-in 0.7s var(--ease) both;
	}
	@keyframes pop-in {
		from {
			transform: scale(0.7) rotate(-8deg);
			opacity: 0;
		}
		to {
			transform: none;
			opacity: 1;
		}
	}
	.word {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.05em;
	}
	.seq {
		position: relative;
		width: min(240px, 70vw);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.bar {
		width: 100%;
		height: 3px;
		border-radius: 99px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.bar i {
		display: block;
		height: 100%;
		background: var(--text);
		border-radius: 99px;
		transition: width 0.5s var(--ease);
	}
	.skip {
		position: absolute;
		bottom: 42px;
	}
	.state {
		position: relative;
		text-align: center;
		max-width: 340px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		animation: fade-up 0.4s var(--ease) both;
	}
	.ico {
		width: 62px;
		height: 62px;
		border-radius: 20px;
		display: grid;
		place-items: center;
		margin-bottom: 4px;
	}
	.ico.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.ico.accent {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.state .btn {
		width: 100%;
	}
</style>
