<script>
	import { admin, STAFF_ROLES } from '$lib/admin.svelte.js';
	import { goto } from '$app/navigation';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';
	import Toggle from '$comp/Toggle.svelte';

	const WEB = import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173';
	let roleOpen = $state(false);
	let confirmOut = $state(false);
	let alertPrefs = $state({ approvals: true, reports: true, payouts: false, fraud: true });
</script>

<div class="page">
	<PageHead title="Settings" />

	<div class="shell">
		<div class="card card-pad">
			<div class="li">
				<div class="col grow">
					<span class="b small">{admin.session?.email}</span>
					<span class="tiny muted-2">Signed in {new Date(admin.session?.at).toLocaleString('en-GB')}</span>
				</div>
				<button class="btn btn-sm btn-outline" onclick={() => (roleOpen = true)}>
					{admin.roleName}
				</button>
			</div>
			<div class="li">
				<div class="col grow">
					<span class="b small">Permissions</span>
					<span class="tiny muted-2">
						{Object.entries(admin.can)
							.filter(([, v]) => v)
							.map(([k]) => k)
							.join(', ')}
					</span>
				</div>
			</div>
		</div>

		<h3 style="margin:20px 0 8px">Appearance</h3>
		<div class="card card-pad">
			<div class="row-between">
				<div class="col">
					<span class="b small">Theme</span>
					<span class="tiny muted-2">Light or dark for this console</span>
				</div>
				<div class="seg">
					<button class:on={admin.theme === 'light'} onclick={() => (admin.theme = 'light')}>
						Light
					</button>
					<button class:on={admin.theme === 'dark'} onclick={() => (admin.theme = 'dark')}>Dark</button>
				</div>
			</div>
		</div>

		<h3 style="margin:20px 0 8px">Alerting</h3>
		<div class="card card-pad">
			<Toggle bind:checked={alertPrefs.approvals} label="New approval in queue" hint="Push + email" />
			<Toggle bind:checked={alertPrefs.reports} label="High-severity report" hint="Push immediately" />
			<Toggle bind:checked={alertPrefs.fraud} label="Fraud signal detected" hint="Risk score above 80" />
			<Toggle bind:checked={alertPrefs.payouts} label="Payout batch completed" hint="Daily digest" />
		</div>

		<h3 style="margin:20px 0 8px">Linked apps</h3>
		<div class="card card-pad">
			<a class="li li-click" href={WEB} target="_blank" rel="noreferrer">
				<span class="ic"><Icon name="external" size={16} /></span>
				<span class="col grow">
					<span class="b small">Public Evently app</span>
					<span class="tiny muted-2">{WEB} · separate PWA, same data</span>
				</span>
				<Icon name="chevronRight" size={16} />
			</a>
			<div class="li">
				<span class="ic"><Icon name="key" size={16} /></span>
				<span class="col grow">
					<span class="b small">Shared API</span>
					<span class="tiny muted-2">Both apps read the same catalogue and ticket ledger</span>
				</span>
				<span class="tag good">Connected</span>
			</div>
		</div>

		<div class="col gap-8" style="margin-top:18px">
			<button class="btn btn-outline btn-block" onclick={() => (confirmOut = true)}>
				<Icon name="logout" size={16} /> Sign out
			</button>
		</div>
		<p class="hint" style="margin-top:10px">
			Evently Admin v1.0 · separate deployment from the public app
		</p>
	</div>
</div>

{#if roleOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="scrim" onclick={() => (roleOpen = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="sheet" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="sheet-handle"></div>
			<h3 style="margin-bottom:12px">Switch staff role</h3>
			<div class="col gap-8">
				{#each Object.values(STAFF_ROLES) as r}
					<button
						class="demo-row"
						class:on={admin.session?.role === r.id}
						onclick={() => {
							admin.signIn(admin.session.email, r.id);
							roleOpen = false;
						}}
					>
						<Icon name="shield" size={17} />
						<span class="col grow">
							<span class="b small">{r.name}</span>
							<span class="tiny muted-2">{r.desc}</span>
						</span>
						{#if admin.session?.role === r.id}<Icon name="check" size={16} />{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

{#if confirmOut}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="scrim" onclick={() => (confirmOut = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="sheet center-modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<h3 style="margin-bottom:10px">Sign out of the console?</h3>
			<p class="muted small" style="margin-bottom:14px">
				Any unresolved queue items stay assigned to the team.
			</p>
			<div class="col gap-8">
				<button
					class="btn btn-primary btn-block"
					onclick={() => {
						admin.signOut();
						confirmOut = false;
						goto('/');
					}}
				>
					Sign out
				</button>
				<button class="btn btn-ghost btn-block" onclick={() => (confirmOut = false)}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.seg {
		display: flex;
		background: var(--surface);
		border-radius: 99px;
		padding: 3px;
	}
	.seg button {
		border: 0;
		background: transparent;
		padding: 6px 14px;
		border-radius: 99px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-2);
		cursor: pointer;
	}
	.seg button.on {
		background: var(--bg);
		color: var(--text);
		box-shadow: var(--shadow-sm);
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
	.demo-row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		padding: 11px 12px;
		border-radius: var(--r);
		border: 1px solid var(--line);
		background: var(--bg);
		cursor: pointer;
	}
	.demo-row.on {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
</style>
