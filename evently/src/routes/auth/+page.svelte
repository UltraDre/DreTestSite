<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import Icon from '$comp/Icon.svelte';
	import Sheet from '$comp/Sheet.svelte';

	let mode = $state(page.url.searchParams.get('mode') || 'login');
	let email = $state('amaka@example.com');
	let phone = $state('');
	let name = $state('');
	let pw = $state('');
	let otp = $state(['', '', '', '', '', '']);
	let agreed = $state(false);
	let adult = $state(false);
	let remember = $state(true);
	let loading = $state(false);
	let use2fa = $state(false);
	let showPw = $state(false);

	const rules = $derived([
		{ ok: pw.length >= 8, label: 'At least 8 characters' },
		{ ok: /[A-Z]/.test(pw), label: 'One uppercase letter' },
		{ ok: /[0-9]/.test(pw), label: 'One number' }
	]);
	const pwOk = $derived(rules.every((r) => r.ok));

	async function submit(e) {
		e?.preventDefault();
		loading = true;
		await new Promise((r) => setTimeout(r, 550));
		loading = false;
		if (mode === 'signup' || mode === 'login') {
			if (use2fa || mode === 'signup') {
				mode = 'otp';
				app.say(`Code sent to ${email || 'your email'}`);
			} else {
				done();
			}
		} else if (mode === 'otp') {
			done();
		} else if (mode === 'forgot') {
			mode = 'reset-sent';
		}
	}

	function done() {
		app.signIn({ name: name || 'Amaka Obi', email, phone, role: 'attendee' });
		app.notify({
			kind: 'update',
			title: 'Welcome to Evently 👋',
			body: 'Add interests to tune your feed, or jump straight into Explore.',
			href: '/explore'
		});
		goto('/home');
	}

	function social(provider) {
		loading = true;
		setTimeout(() => {
			loading = false;
			app.signIn({ name: 'Amaka Obi', email: `amaka@${provider}.com`, role: 'attendee' });
			app.say(`Signed in with ${provider}`);
			goto('/home');
		}, 500);
	}

	function guest() {
		app.role = 'guest';
		app.user = null;
		app.onboarded = true;
		app.launched = true;
		goto('/home');
	}

	function setOtp(i, v) {
		otp[i] = v.replace(/\D/g, '').slice(-1);
		if (v && i < 5) document.getElementById(`otp${i + 1}`)?.focus();
	}
</script>

<div class="auth">
	<div class="shell">
		<div class="wrap">
			<div class="head">
				<a class="mark" href="/"><Icon name="ticket" size={22} stroke={2} /></a>
				<h1>
					{mode === 'login'
						? 'Welcome back'
						: mode === 'signup'
							? 'Create your account'
							: mode === 'otp'
								? 'Verify your email'
								: mode === 'forgot'
									? 'Reset password'
									: 'Check your inbox'}
				</h1>
				<p class="muted small">
					{mode === 'login'
						? 'Sign in to sync your tickets, saves and follows.'
						: mode === 'signup'
							? 'Free forever. No card needed to browse.'
							: mode === 'otp'
								? `We sent a 6-digit code to ${email || 'you'}.`
								: mode === 'forgot'
									? 'Enter the email on your account.'
									: `If ${email} has an account, a reset link is on its way.`}
				</p>
			</div>

			{#if mode === 'login' || mode === 'signup'}
				<div class="socials">
					<button class="sbtn" onclick={() => social('google')}>
						<svg width="18" height="18" viewBox="0 0 24 24"
							><path
								fill="#4285F4"
								d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
							/><path
								fill="#34A853"
								d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4H3.1v2.6A10 10 0 0 0 12 22Z"
							/><path
								fill="#FBBC05"
								d="M6.4 14.1a6 6 0 0 1 0-3.8V7.7H3.1a10 10 0 0 0 0 8.8Z"
							/><path
								fill="#EA4335"
								d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.7l3.3 2.6A6 6 0 0 1 12 5.9Z"
							/></svg
						>
						Google
					</button>
					<button class="sbtn" onclick={() => social('apple')}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
							><path
								d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3s1.6-.7 3-.7 1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8ZM14.3 5.3c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3Z"
							/></svg
						>
						Apple
					</button>
					<button class="sbtn" onclick={() => social('facebook')}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"
							><path
								d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"
							/></svg
						>
						Meta
					</button>
				</div>

				<div class="or"><span>or</span></div>
			{/if}

			<form onsubmit={submit} class="form">
				{#if mode === 'signup'}
					<div class="field">
						<label class="label" for="nm">Full name</label>
						<input
							id="nm"
							class="input"
							bind:value={name}
							placeholder="Amaka Obi"
							autocomplete="name"
							required
						/>
					</div>
				{/if}

				{#if mode === 'login' || mode === 'signup' || mode === 'forgot'}
					<div class="field">
						<label class="label" for="em">Email</label>
						<input
							id="em"
							class="input"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							autocomplete="email"
							required
						/>
					</div>
				{/if}

				{#if mode === 'signup'}
					<div class="field">
						<label class="label" for="ph">Phone (optional)</label>
						<input id="ph" class="input" bind:value={phone} placeholder="+234 801 234 5678" />
					</div>
				{/if}

				{#if mode === 'login' || mode === 'signup'}
					<div class="field">
						<div class="row-between">
							<label class="label" for="pw">Password</label>
							{#if mode === 'login'}
								<button type="button" class="link tiny" onclick={() => (mode = 'forgot')}>
									Forgot password?
								</button>
							{/if}
						</div>
						<div class="pw">
							<input
								id="pw"
								class="input"
								type={showPw ? 'text' : 'password'}
								bind:value={pw}
								placeholder="••••••••"
								autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
								required
							/>
							<button type="button" class="eye" onclick={() => (showPw = !showPw)}>
								<Icon name={showPw ? 'eye' : 'eye'} size={17} />
							</button>
						</div>
						{#if mode === 'signup' && pw.length}
							<div class="rules">
								{#each rules as r}
									<span class="tiny" class:ok={r.ok}>
										<Icon name={r.ok ? 'checkCircle' : 'circleDot'} size={13} />
										{r.label}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				{#if mode === 'otp'}
					<div class="otp">
						{#each otp as v, i}
							<input
								id="otp{i}"
								class="otp-in"
								inputmode="numeric"
								maxlength="1"
								value={v}
								oninput={(e) => setOtp(i, e.target.value)}
							/>
						{/each}
					</div>
					<div class="row-between">
						<button type="button" class="link tiny" onclick={() => (mode = 'login')}>
							Use a different email
						</button>
						<button
							type="button"
							class="link tiny"
							onclick={() => app.say('New code sent', 'refresh')}>Resend code</button
						>
					</div>
				{/if}

				{#if mode === 'login'}
					<label class="check">
						<input type="checkbox" bind:checked={remember} />
						<span class="small">Keep me signed in</span>
					</label>
					<label class="check">
						<input type="checkbox" bind:checked={use2fa} />
						<span class="small">Require 2FA code on this device</span>
					</label>
				{/if}

				{#if mode === 'signup'}
					<label class="check">
						<input type="checkbox" bind:checked={adult} />
						<span class="small">I am 18 or older</span>
					</label>
					<label class="check">
						<input type="checkbox" bind:checked={agreed} />
						<span class="small">
							I agree to the <a class="link" href="/legal/terms">Terms</a> and
							<a class="link" href="/legal/privacy">Privacy Policy</a>
						</span>
					</label>
				{/if}

				{#if mode !== 'reset-sent'}
					<button
						class="btn btn-primary btn-lg"
						type="submit"
						disabled={loading ||
							(mode === 'signup' && (!agreed || !adult || !pwOk)) ||
							(mode === 'otp' && otp.join('').length < 6)}
					>
						{loading
							? 'Please wait…'
							: mode === 'login'
								? 'Sign in'
								: mode === 'signup'
									? 'Create account'
									: mode === 'otp'
										? 'Verify & continue'
										: 'Send reset link'}
					</button>
				{:else}
					<button class="btn btn-primary btn-lg" onclick={() => (mode = 'login')}>
						Back to sign in
					</button>
				{/if}

				{#if mode === 'login'}
					<button
						class="btn btn-outline btn-block"
						onclick={() => app.say('Biometric sign-in unavailable in this browser', 'info')}
					>
						<Icon name="fingerprint" size={18} /> Sign in with Face ID
					</button>
				{/if}
			</form>

			<div class="switch small">
				{#if mode === 'login'}
					New to Evently? <button class="link" onclick={() => (mode = 'signup')}>Sign up</button>
				{:else if mode === 'signup'}
					Already have an account?
					<button class="link" onclick={() => (mode = 'login')}>Sign in</button>
				{/if}
			</div>

			<div class="foot">
				<button class="link small" onclick={guest}>Continue as guest</button>
				<span class="muted-2 tiny">·</span>
				<a class="link small" href="/support">Need help?</a>
			</div>
		</div>
	</div>
</div>


<style>
	.auth {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 40px 0;
	}
	.wrap {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}
	.mark {
		width: 40px;
		height: 40px;
		border-radius: 13px;
		background: var(--text);
		color: var(--bg);
		display: grid;
		place-items: center;
		margin-bottom: 6px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.socials {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}
	.sbtn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		height: 44px;
		border-radius: var(--r);
		border: 1px solid var(--line-strong);
		background: var(--bg);
		font-size: 13.5px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.14s var(--ease);
	}
	.sbtn:hover {
		background: var(--surface);
	}
	.or {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--text-3);
		font-size: 12px;
	}
	.or::before,
	.or::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--line);
	}
	.link {
		color: var(--accent);
		font-weight: 600;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		font-size: inherit;
	}
	.pw {
		position: relative;
	}
	.eye {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: 0;
		color: var(--text-3);
		cursor: pointer;
		padding: 8px;
	}
	.rules {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		color: var(--text-3);
	}
	.rules span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.rules span.ok {
		color: var(--good);
	}
	.check {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		cursor: pointer;
	}
	.check input {
		margin-top: 3px;
		accent-color: var(--accent);
		width: 15px;
		height: 15px;
	}
	.otp {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
	}
	.otp-in {
		height: 54px;
		text-align: center;
		font-size: 22px;
		font-weight: 650;
		border-radius: var(--r);
		border: 1px solid var(--line-strong);
		background: var(--bg);
		outline: none;
	}
	.otp-in:focus {
		border-color: var(--text);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
	}
	.switch {
		text-align: center;
		color: var(--text-2);
	}
	.foot {
		display: flex;
		justify-content: center;
		gap: 10px;
		align-items: center;
		padding-top: 4px;
	}
</style>
