<script>
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import { app } from '$shared/lib/state.svelte.js';
	import { time, compact } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import Avatar from '$comp/Avatar.svelte';

	const preset = $derived(page.url.searchParams.get('event') ?? '');
	let eventId = $state('');
	let video = $state(null);
	let stream = $state(null);
	let scanning = $state(false);
	let unsupported = $state(false);
	let error = $state('');
	let torch = $state(false);
	let manual = $state('');
	let result = $state(null);
	let log = $state([]);
	let online = $state(true);
	let detector = null;
	let raf = null;

	const events = $derived(app.myEvents.filter((e) => e.status === 'published'));
	const e = $derived(app.event(eventId) ?? events[0] ?? null);
	const stats = $derived(e ? app.checkInStats(e.id) : { total: 0, checkedIn: 0, valid: 0 });

	$effect(() => {
		if (!eventId && events.length) untrack(() => (eventId = preset || events[0].id));
	});

	onMount(() => {
		online = navigator.onLine;
		const on = () => (online = navigator.onLine);
		window.addEventListener('online', on);
		window.addEventListener('offline', on);
		return () => {
			window.removeEventListener('online', on);
			window.removeEventListener('offline', on);
			stop();
		};
	});

	async function start() {
		error = '';
		result = null;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1280 } }
			});
			video.srcObject = stream;
			await video.play();
			scanning = true;
			if ('BarcodeDetector' in window) {
				detector = new window.BarcodeDetector({ formats: ['qr_code'] });
				loop();
			} else {
				unsupported = true;
			}
		} catch (err) {
			error = 'Camera unavailable — use manual entry below.';
			scanning = false;
		}
	}

	function loop() {
		raf = setTimeout(async () => {
			if (!scanning || !detector) return;
			try {
				const codes = await detector.detect(video);
				if (codes?.length) handle(codes[0].rawValue);
			} catch {
				/* ignore */
			}
			if (scanning) loop();
		}, 450);
	}

	function stop() {
		scanning = false;
		clearTimeout(raf);
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		if (video) video.srcObject = null;
	}

	async function toggleTorch() {
		try {
			const track = stream?.getVideoTracks?.()[0];
			await track?.applyConstraints({ advanced: [{ torch: !torch }] });
			torch = !torch;
		} catch {
			app.say('Torch not supported on this device', 'info');
		}
	}

	function normalize(raw) {
		const s = String(raw ?? '');
		const m = /evently:\/\/t\/([^?]+)/.exec(s);
		return (m ? m[1] : s).trim().toUpperCase();
	}

	function handle(raw) {
		const code = normalize(raw);
		if (!code) return;
		if (result && result.code === code) return;
		const res = app.checkIn(code, { by: app.roleName });
		result = { ...res, code, at: new Date() };
		log = [
			{ code, ok: res.ok, name: res.ticket?.attendee ?? 'Unknown', msg: res.message, at: new Date() },
			...log
		].slice(0, 20);
		navigator.vibrate?.(res.ok ? 40 : [60, 40, 60]);
		if (res.ok) beep();
	}

	function beep() {
		try {
			const ctx = new (window.AudioContext || window.webkitAudioContext)();
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.connect(g);
			g.connect(ctx.destination);
			o.frequency.value = 880;
			o.start();
			g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
			o.stop(ctx.currentTime + 0.2);
		} catch {
			/* ignore */
		}
	}

	function submitManual(ev) {
		ev?.preventDefault();
		if (!manual.trim()) return;
		handle(manual.trim());
		manual = '';
	}

	function simulate() {
		const codes = e
			? app
					.eventTickets(e.id)
					.filter((t) => !t.checkedInAt && t.status === 'valid')
					.map((t) => t.code)
			: [];
		if (codes.length) {
			handle(codes[0]);
		} else {
			// no real ticket available — show a demo outcome
			result = {
				ok: true,
				code: 'EV-DEMO-0001',
				message: 'Checked in — enjoy the event',
				ticket: { attendee: 'Tunde Bakare', typeName: 'General admission', code: 'EV-DEMO-0001' }
			};
			log = [
				{ code: 'EV-DEMO-0001', ok: true, name: 'Tunde Bakare', msg: 'Checked in', at: new Date() },
				...log
			].slice(0, 20);
			beep();
		}
	}
</script>

<div class="page">
	<div class="page-head">
		<div class="shell row" style="height:56px">
			<button class="icon-btn" onclick={() => history.back()} aria-label="Back">
				<Icon name="arrowLeft" size={19} />
			</button>
			<h1 class="page-title">Check-in scanner</h1>
			<span class="tag {online ? 'good' : 'warn'}">
				<Icon name={online ? 'globe' : 'offline'} size={11} />
				{online ? 'Online' : 'Offline mode'}
			</span>
		</div>
	</div>

	<div class="shell">
		<div class="field">
			<label class="label" for="evsel">Event</label>
			<select id="evsel" class="select" bind:value={eventId}>
				{#each events as ev}
					<option value={ev.id}>{ev.title}</option>
				{/each}
			</select>
		</div>

		{#if e}
			<div class="stats" style="margin-top:12px">
				<div class="stat"><div class="n">{stats.checkedIn}</div><div class="k">Checked in</div></div>
				<div class="stat"><div class="n">{stats.valid}</div><div class="k">Expected</div></div>
				<div class="stat">
					<div class="n">{Math.round((stats.checkedIn / Math.max(stats.total, 1)) * 100)}%</div>
					<div class="k">Rate</div>
				</div>
			</div>
		{/if}

		<div class="cam" class:live={scanning}>
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={video} playsinline muted></video>

			{#if !scanning}
				<div class="cam-idle">
					<div class="ico"><Icon name="scan" size={30} /></div>
					<p class="b">Point at the ticket QR</p>
					<p class="tiny muted-2">Camera stays on your device — codes are verified locally</p>
					<button class="btn btn-primary" onclick={start}>
						<Icon name="camera" size={17} /> Start scanning
					</button>
					<button class="btn btn-ghost btn-sm" onclick={simulate}>Simulate a scan</button>
				</div>
			{:else}
				<div class="frame">
					<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span
						class="c br"
					></span>
					<span class="laser"></span>
				</div>
				<div class="cam-actions">
					<button class="icon-btn glass" onclick={toggleTorch} aria-label="Torch">
						<Icon name={torch ? 'zap' : 'sun'} size={17} />
					</button>
					<button class="btn btn-danger btn-sm" onclick={stop}>Stop</button>
				</div>
			{/if}

			{#if unsupported}
				<div class="warnbar">
					<Icon name="alert" size={14} /> Live QR detection isn’t supported in this browser — use manual
					entry.
				</div>
			{/if}
			{#if error}
				<div class="warnbar"><Icon name="alert" size={14} /> {error}</div>
			{/if}
		</div>

		<form class="manual" onsubmit={submitManual}>
			<input
				class="input"
				placeholder="Enter ticket code manually"
				bind:value={manual}
				autocomplete="off"
			/>
			<button class="btn btn-primary" type="submit">Check in</button>
		</form>
		<p class="hint">
			Works for guests with a dead battery, a printed ticket, or a wallet pass.
		</p>

		{#if log.length}
			<h3 style="margin:20px 0 6px">This session · {log.length} scans</h3>
			<div class="card card-pad" style="padding:0 16px">
				{#each log as l, i (i)}
					<div class="li">
						<span class="ic" class:ok={l.ok} class:bad={!l.ok}>
							<Icon name={l.ok ? 'check' : 'x'} size={14} stroke={2.6} />
						</span>
						<div class="col grow" style="min-width:0">
							<span class="b small truncate">{l.name}</span>
							<span class="tiny muted-2 truncate">{l.msg} · {l.code}</span>
						</div>
						<span class="tiny muted-2">{time(l.at.toISOString())}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="soft pad-16" style="margin-top:18px">
			<div class="row gap-10">
				<Icon name="info" size={17} />
				<div class="col grow">
					<span class="b small">Offline check-in</span>
					<span class="tiny muted-2">Scans queue locally and sync when you’re back online.</span>
				</div>
				<span class="tag good">{app.prefs.offline ? 'Enabled' : 'Off'}</span>
			</div>
		</div>
	</div>
</div>

{#if result}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="overlay {result.ok ? 'ok' : 'bad'}" onclick={() => (result = null)}>
		<div class="rescard">
			<div class="ricon"><Icon name={result.ok ? 'check' : result.reason === 'duplicate' ? 'clock' : 'x'} size={40} stroke={2.6} /></div>
			<h2>{result.ok ? 'Checked in' : result.reason === 'duplicate' ? 'Already scanned' : 'Cannot check in'}</h2>
			{#if result.ticket}
				<div class="who">
					<Avatar name={result.ticket.attendee ?? 'Guest'} hue={258} size={42} />
					<div class="col">
						<span class="b">{result.ticket.attendee ?? 'Guest'}</span>
						<span class="tiny muted-2">{result.ticket.typeName ?? 'General admission'}</span>
					</div>
				</div>
			{/if}
			<p class="small muted">{result.message}</p>
			<div class="row gap-8" style="margin-top:14px">
				<button class="btn btn-outline grow" onclick={() => (result = null)}>Dismiss</button>
				<button
					class="btn btn-primary grow"
					onclick={() => {
						result = null;
						if (scanning) loop();
					}}
				>
					Next scan
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cam {
		position: relative;
		margin-top: 14px;
		height: 320px;
		border-radius: var(--r-xl);
		overflow: hidden;
		background: #0b0b0c;
		border: 1px solid var(--line);
	}
	.cam video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.cam.live video {
		opacity: 1;
	}
	.cam:not(.live) video {
		opacity: 0;
	}
	.cam-idle {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 20px;
		text-align: center;
		color: #fff;
		background: radial-gradient(circle at 50% 30%, #23232a, #0b0b0c);
	}
	.cam-idle .ico {
		width: 64px;
		height: 64px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.1);
		display: grid;
		place-items: center;
		margin-bottom: 6px;
	}
	.cam-idle .muted-2 {
		color: rgba(255, 255, 255, 0.6) !important;
	}
	.cam-idle .btn {
		margin-top: 10px;
	}
	.frame {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 210px;
		height: 210px;
	}
	.c {
		position: absolute;
		width: 26px;
		height: 26px;
		border: 3px solid #fff;
	}
	.tl {
		top: 0;
		left: 0;
		border-right: 0;
		border-bottom: 0;
		border-radius: 8px 0 0 0;
	}
	.tr {
		top: 0;
		right: 0;
		border-left: 0;
		border-bottom: 0;
		border-radius: 0 8px 0 0;
	}
	.bl {
		bottom: 0;
		left: 0;
		border-right: 0;
		border-top: 0;
		border-radius: 0 0 0 8px;
	}
	.br {
		bottom: 0;
		right: 0;
		border-left: 0;
		border-top: 0;
		border-radius: 0 0 8px 0;
	}
	.laser {
		position: absolute;
		left: 6px;
		right: 6px;
		height: 2px;
		background: var(--accent);
		box-shadow: 0 0 12px var(--accent);
		animation: sweep 2.2s ease-in-out infinite;
	}
	@keyframes sweep {
		0%,
		100% {
			top: 10px;
		}
		50% {
			top: 194px;
		}
	}
	.cam-actions {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 14px;
		display: flex;
		justify-content: center;
		gap: 10px;
	}
	.glass {
		background: rgba(255, 255, 255, 0.92);
		color: #0b0b0c;
		border-color: transparent;
	}
	.warnbar {
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 12px;
		background: var(--warn-soft);
		color: var(--warn);
		font-size: 12.5px;
		font-weight: 550;
		padding: 8px 12px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.manual {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}
	.ic {
		width: 26px;
		height: 26px;
		border-radius: 99px;
		display: grid;
		place-items: center;
		background: var(--surface);
		flex: none;
	}
	.ic.ok {
		background: var(--good-soft);
		color: var(--good);
	}
	.ic.bad {
		background: var(--bad-soft);
		color: var(--bad);
	}
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: grid;
		place-items: center;
		padding: 20px;
		animation: fade-in 0.18s var(--ease) both;
	}
	.overlay.ok {
		background: rgba(15, 123, 82, 0.94);
	}
	.overlay.bad {
		background: rgba(192, 44, 44, 0.94);
	}
	.rescard {
		width: 100%;
		max-width: 340px;
		background: var(--bg);
		border-radius: 24px;
		padding: 24px 20px;
		text-align: center;
		animation: pop 0.25s var(--ease) both;
	}
	.ricon {
		width: 76px;
		height: 76px;
		border-radius: 99px;
		margin: 0 auto 12px;
		display: grid;
		place-items: center;
	}
	.ok .ricon {
		background: var(--good-soft);
		color: var(--good);
	}
	.bad .ricon {
		background: var(--bad-soft);
		color: var(--bad);
	}
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		justify-content: center;
		margin: 12px 0 8px;
	}
</style>
