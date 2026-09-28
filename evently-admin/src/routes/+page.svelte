<script>
	import { goto } from '$app/navigation';
	import { admin, STAFF_ROLES } from '$lib/admin.svelte.js';
	import Icon from '$comp/Icon.svelte';

	let email = $state('admin@evently.app');
	let code = $state('');
	let role = $state('moderator');
	let step = $state('email');
	let loading = $state(false);
	let err = $state('');

	const WEB = import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173';

	async function send(e) {
		e?.preventDefault();
		err = '';
		loading = true;
		await new Promise((r) => setTimeout(r, 500));
		loading = false;
		step = 'code';
		admin.say('2FA code sent to your authenticator');
	}

	function verify(e) {
		e?.preventDefault();
		if (code.length < 6) {
			err = 'Enter the 6-digit code from your authenticator app.';
			return;
		}
		admin.signIn(email, role);
		goto('/console');
	}

	$effect(() => {
		if (admin.session) goto('/console', { replaceState: true });
	});
</script>

<div class="gate">
	<div class="card">
		<div class="head">
			<span class="mark"><Icon name="shield" size={22} /></span>
			<div class="col">
				<span class="b" style="font-size:17px">Evently Admin</span>
				<span class="tiny muted-2">Staff console · restricted access</span>
			</div>
		</div>

		{#if step === 'email'}
			<form onsubmit={send} class="col gap-14">
				<div class="field">
					<label class="label" for="em">Work email</label>
					<input
						id="em"
						class="input"
						type="email"
						bind:value={email}
						autocomplete="username"
						required
					/>
				</div>
				<div class="field">
					<span class="label">Sign in as</span>
					{#each Object.values(STAFF_ROLES) as r}
						<button
							type="button"
							class="role"
							class:on={role === r.id}
							onclick={() => (role = r.id)}
						>
							<span class="col grow">
								<span class="b small">{r.name}</span>
								<span class="tiny muted-2">{r.desc}</span>
							</span>
							<span class="radio" class:on={role === r.id}></span>
						</button>
					{/each}
				</div>
				<button class="btn btn-primary btn-lg" disabled={loading}>
					{loading ? 'Checking…' : 'Continue'}
				</button>
			</form>
		{:else}
			<form onsubmit={verify} class="col gap-14">
				<div class="field">
					<label class="label" for="cd">Two-factor code</label>
					<input
						id="cd"
						class="input"
						inputmode="numeric"
						maxlength="6"
						placeholder="••••••"
						bind:value={code}
						autocomplete="one-time-code"
					/>
					{#if err}<span class="hint" style="color:var(--bad)">{err}</span>{/if}
					<span class="hint">Demo: enter any 6 digits.</span>
				</div>
				<button class="btn btn-primary btn-lg">Verify & open console</button>
				<button type="button" class="btn btn-ghost btn-block" onclick={() => (step = 'email')}>
					Back
				</button>
			</form>
		{/if}

		<hr style="margin:18px 0 14px" />
		<a class="link small" href={WEB} target="_blank" rel="noreferrer">
			<Icon name="external" size={13} /> Open the public Evently app
		</a>
	</div>
</div>

<style>
	.gate {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 32px 16px;
		background:
			radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
			var(--bg);
	}
	.card {
		width: 100%;
		max-width: 380px;
		background: var(--bg-elev);
		border: 1px solid var(--line);
		border-radius: 20px;
		padding: 22px;
		box-shadow: var(--shadow-md);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 18px;
	}
	.mark {
		width: 42px;
		height: 42px;
		border-radius: 13px;
		background: var(--text);
		color: var(--bg);
		display: grid;
		place-items: center;
	}
	.gap-14 {
		gap: 14px;
	}
	.role {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		padding: 10px 12px;
		border-radius: var(--r);
		border: 1px solid var(--line);
		background: var(--bg);
		cursor: pointer;
		margin-bottom: 6px;
	}
	.role.on {
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
	.link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--accent);
		font-weight: 600;
	}
</style>
