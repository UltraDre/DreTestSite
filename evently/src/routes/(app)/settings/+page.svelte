<script>
	import { app } from '$shared/lib/state.svelte.js';
	import { CURRENCIES, ROLES } from '$shared/lib/data.js';

	/* Roles an account holder can switch between in this app. */
	const SWITCHABLE = Object.values(ROLES).filter((r) => r.id !== 'admin');
	const ROLE_ICON = {
		guest: 'user',
		attendee: 'user',
		organizer: 'chart',
		cohost: 'users',
		staff: 'scan',
		speaker: 'mic',
		sponsor: 'handshake',
		venue: 'building'
	};
	import Icon from '$comp/Icon.svelte';
	import Toggle from '$comp/Toggle.svelte';
	import Sheet from '$comp/Sheet.svelte';

	let section = $state('account');
	let confirmDelete = $state(false);
	let confirmLogout = $state(false);
	let cookiesOpen = $state(false);
	let safetyOpen = $state(false);
	let cookies = $state({ essential: true, analytics: true, personalisation: true, marketing: false });

	const sections = [
		{ id: 'account', label: 'Account', icon: 'user' },
		{ id: 'role', label: 'Role', icon: 'grid' },
		{ id: 'verification', label: 'Verification', icon: 'shieldCheck' },
		{ id: 'notify', label: 'Notifications', icon: 'bell' },
		{ id: 'privacy', label: 'Privacy', icon: 'lock' },
		{ id: 'security', label: 'Security', icon: 'shield' },
		{ id: 'payments', label: 'Payments', icon: 'card' },
		{ id: 'prefs', label: 'Language & region', icon: 'globe' },
		{ id: 'a11y', label: 'Accessibility', icon: 'eye' },
		{ id: 'data', label: 'Storage & offline', icon: 'download' },
		{ id: 'support', label: 'Help & legal', icon: 'info' }
	];

	const channels = [
		['reminders', 'Event reminders', '24h and 2h before an event you hold a ticket for'],
		['updates', 'Event updates', 'Time changes, cancellations, organiser announcements'],
		['messages', 'Messages & chat', 'Direct messages and event group chats'],
		['marketing', 'Marketing', 'Newsletter, recommendations and offers']
	];

	let cacheSize = $state(24.6);

	const verification = $derived(
		app.user
			? [
					{ k: 'email', label: 'Email', done: app.user.verified.email, note: app.user.email },
					{ k: 'phone', label: 'Phone', done: app.user.verified.phone, note: app.user.phone },
					{ k: 'id', label: 'Government ID', done: app.user.verified.id, note: 'Required to sell tickets' },
					{ k: 'business', label: 'Business documents', done: app.user.verified.business, note: 'CAC / registration' },
					{ k: 'payout', label: 'Payout account', done: app.user.verified.payout, note: 'Bank account for payouts' },
					{ k: 'age', label: 'Age', done: app.user.verified.age, note: '18+ confirmed' }
				]
			: []
	);
</script>

<div class="page">
	<div class="page-head">
		<div class="shell">
			<div class="row" style="height:56px">
				<button class="icon-btn" onclick={() => history.back()} aria-label="Back">
					<Icon name="arrowLeft" size={19} />
				</button>
				<h1 class="page-title">Settings</h1>
			</div>
			<div class="scroll-x row gap-6" style="padding-bottom:10px">
				{#each sections as s}
					<button class="chip sm" class:on={section === s.id} onclick={() => (section = s.id)}>
						{s.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="shell">
		{#if section === 'account'}
			<div class="card card-pad">
				<div class="li">
					<div class="col grow">
						<span class="b small">Name</span>
						<span class="tiny muted-2">{app.user?.name ?? 'Guest'}</span>
					</div>
					<a class="link small" href="/profile">Edit</a>
				</div>
				<div class="li">
					<div class="col grow">
						<span class="b small">Email</span>
						<span class="tiny muted-2">{app.user?.email ?? '—'}</span>
					</div>
					<span class="tag good">Verified</span>
				</div>
				<div class="li">
					<div class="col grow">
						<span class="b small">Phone</span>
						<span class="tiny muted-2">{app.user?.phone ?? '—'}</span>
					</div>
					<span class="tag good">Verified</span>
				</div>
					<div class="li">
						<div class="col grow">
							<span class="b small">Active role</span>
							<span class="tiny muted-2">{app.roleName}</span>
						</div>
						<button class="link small" onclick={() => (section = 'role')}>Switch</button>
					</div>
				<div class="li">
					<div class="col grow">
						<span class="b small">Connected accounts</span>
						<span class="tiny muted-2">Google, Apple</span>
					</div>
					<span class="link small">Manage</span>
				</div>
			</div>

			<div class="col gap-8" style="margin-top:14px">
				<button class="btn btn-outline btn-block" onclick={() => (confirmLogout = true)}>
					<Icon name="logout" size={16} /> Sign out
				</button>
				<button class="btn btn-danger btn-block" onclick={() => (confirmDelete = true)}>
					<Icon name="trash" size={16} /> Delete account
				</button>
			</div>
			<p class="hint" style="margin-top:10px">
				Deleting removes your tickets, follows and saved events after a 30-day grace period.
			</p>
		{:else if section === 'role'}
			<div class="card card-pad">
				<p class="small muted" style="margin-bottom:12px">
					Switch how the app behaves for you. Your tickets, saved events and follows stay exactly
					as they are.
				</p>
				{#each SWITCHABLE as r}
					<button
						class="role-row"
						class:on={app.role === r.id}
						onclick={() => app.switchRole(r.id)}
					>
						<span class="ic"><Icon name={ROLE_ICON[r.id]} size={16} /></span>
						<span class="col grow" style="min-width:0">
							<span class="b small">{r.name}</span>
							<span class="tiny muted-2">{r.desc}</span>
						</span>
						{#if app.role === r.id}<Icon name="check" size={16} />{/if}
					</button>
				{/each}
			</div>
		{:else if section === 'verification'}
			<div class="card card-pad">
				{#each verification as v}
					<div class="vrow">
						<span class="ic" class:ok={v.done}>
							<Icon name={v.done ? 'check' : 'shield'} size={16} />
						</span>
						<div class="col grow" style="min-width:0">
							<span class="b small">{v.label}</span>
							<span class="tiny muted-2 truncate">{v.note}</span>
						</div>
						{#if v.done}
							<span class="tag good">Verified</span>
						{:else}
							<button
								class="btn btn-sm btn-primary"
								onclick={() => {
									app.user.verified[v.k] = true;
									app.say(`${v.label} verified`);
								}}
							>
								Verify
							</button>
						{/if}
					</div>
				{/each}
				<p class="hint" style="margin-top:10px">
					Verified organisers get a blue check, higher trust ranking and faster payouts.
				</p>
			</div>
		{:else if section === 'notify'}
			<h3 style="margin:4px 0 6px">Channels</h3>
			<div class="card card-pad">
				{#each channels as [key, label, hint]}
					<div class="prow">
						<div class="col grow">
							<span class="b small">{label}</span>
							<span class="tiny muted-2">{hint}</span>
						</div>
						<div class="chans">
							{#each ['push', 'email', 'sms'] as c}
								<label class="chan" title={c}>
									<input type="checkbox" bind:checked={app.prefs[c][key]} />
									<span class="tiny">{c === 'push' ? 'Push' : c === 'email' ? 'Email' : 'SMS'}</span>
								</label>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<div class="card card-pad" style="margin-top:12px">
				<Toggle label="Quiet hours" hint="No push between 22:00 and 08:00" />
				<Toggle label="Digest instead of instant" hint="Bundle non-urgent notifications daily" />
			</div>
		{:else if section === 'privacy'}
			<div class="card card-pad">
				<Toggle label="Private profile" hint="Only followers can see your activity" />
				<Toggle label="Show events I attend" hint="Appears on your public profile" />
				<Toggle label="Allow organiser messages" hint="Organisers can message you about their events" />
				<Toggle label="Personalised ads" hint="Uses your interests and event history" />
			</div>
			<div class="col gap-8" style="margin-top:14px">
				<button class="btn btn-outline btn-block" onclick={() => app.say('Data export emailed to you')}>
					<Icon name="download" size={16} /> Download my data (GDPR)
				</button>
				<a class="btn btn-ghost btn-block" href="/legal/privacy">Privacy policy</a>
			</div>
		{:else if section === 'security'}
			<div class="card card-pad">
				<div class="li">
					<div class="col grow">
						<span class="b small">Password</span>
						<span class="tiny muted-2">Last changed 3 months ago</span>
					</div>
					<button class="btn btn-sm btn-outline" onclick={() => app.say('Reset link sent')}>Change</button>
				</div>
				<Toggle bind:checked={app.prefs.biometric} label="Biometric login" hint="Face ID / fingerprint on this device" />
				<div class="li">
					<div class="col grow">
						<span class="b small">Two-factor authentication</span>
						<span class="tiny muted-2">Authenticator app or SMS code at sign-in</span>
					</div>
					<button class="btn btn-sm btn-primary" onclick={() => app.say('2FA enabled')}>Enable</button>
				</div>
				<div class="li">
					<div class="col grow">
						<span class="b small">Active sessions</span>
						<span class="tiny muted-2">2 devices signed in</span>
					</div>
					<span class="link small">Revoke all</span>
				</div>
			</div>
		{:else if section === 'payments'}
			<h3 style="margin:4px 0 8px">Saved methods</h3>
			<div class="card card-pad">
				{#each [['•••• 4242', 'Visa · expires 12/28', 'card'], ['Apple Pay', 'Linked to your Apple ID', 'mobile'], ['GTBank ••••6789', 'For payouts', 'banknote']] as [title, sub, ic]}
					<div class="li">
						<span class="ic"><Icon name={ic} size={16} /></span>
						<div class="col grow">
							<span class="b small">{title}</span>
							<span class="tiny muted-2">{sub}</span>
						</div>
						<button class="btn btn-sm btn-ghost" onclick={() => app.say('Method removed')}>Remove</button>
					</div>
				{/each}
			</div>
			<button class="btn btn-outline btn-block" style="margin-top:12px" onclick={() => app.say('Card added')}>
				<Icon name="plus" size={16} /> Add payment method
			</button>
			<h3 style="margin:20px 0 8px">Payouts</h3>
			<div class="card card-pad">
				<div class="li">
					<div class="col grow">
						<span class="b small">Organiser payouts</span>
						<span class="tiny muted-2">Every 48 hours · GTBank ••••6789</span>
					</div>
					<span class="tag good">Active</span>
				</div>
			</div>
		{:else if section === 'prefs'}
			<div class="card card-pad">
				<div class="field">
					<label class="label" for="cur">Currency</label>
					<select id="cur" class="select" bind:value={app.currency}>
						{#each Object.keys(CURRENCIES) as c}
							<option value={c}>{c} ({CURRENCIES[c].symbol})</option>
						{/each}
					</select>
				</div>
				<div class="field" style="margin-top:14px">
					<label class="label" for="lang">Language</label>
					<select id="lang" class="select" value="en">
						<option value="en">English</option>
						<option value="fr">Français</option>
						<option value="pt">Português</option>
						<option value="ha">Hausa</option>
						<option value="yo">Yorùbá</option>
					</select>
				</div>
				<div class="field" style="margin-top:14px">
					<label class="label" for="reg">Region</label>
					<select id="reg" class="select" bind:value={app.city}>
						<option>Lagos</option>
						<option>Abuja</option>
						<option>Accra</option>
						<option>Nairobi</option>
						<option>London</option>
					</select>
				</div>
				<div class="field" style="margin-top:14px">
					<label class="label" for="tz">Time zone</label>
					<select id="tz" class="select" value="wat">
						<option value="wat">West Africa Time (WAT)</option>
						<option value="gmt">GMT</option>
						<option value="cet">Central European Time</option>
					</select>
				</div>
			</div>
		{:else if section === 'a11y'}
			<div class="card card-pad">
				<div class="row-between" style="padding-bottom:12px;border-bottom:1px solid var(--line)">
					<div class="col">
						<span class="b small">Appearance</span>
						<span class="tiny muted-2">Light or dark theme</span>
					</div>
					<div class="seg">
						<button class:on={app.theme === 'light'} onclick={() => (app.theme = 'light')}>Light</button>
						<button class:on={app.theme === 'dark'} onclick={() => (app.theme = 'dark')}>Dark</button>
					</div>
				</div>
				<Toggle label="Larger text" hint="Increase base font size by 15%" />
				<Toggle label="High contrast" hint="Stronger borders and text contrast" />
				<Toggle label="Reduce motion" hint="Disable animations and parallax" />
				<Toggle label="Screen-reader friendly labels" hint="Adds descriptions to all controls" />
			</div>
			<div class="card card-pad" style="margin-top:12px">
				<div class="row-between">
					<span class="b small">Text size</span>
					<input type="range" min="90" max="130" value="100" style="width:140px" />
				</div>
			</div>
		{:else if section === 'data'}
			<div class="card card-pad">
				<Toggle bind:checked={app.prefs.offline} label="Offline mode" hint="Cache tickets, QR codes and agendas" />
				<div class="li">
					<div class="col grow">
						<span class="b small">Cache size</span>
						<span class="tiny muted-2">{cacheSize} MB · images, event pages, tickets</span>
					</div>
					<button
						class="btn btn-sm btn-outline"
						onclick={() => {
							cacheSize = 0.2;
							app.say('Cache cleared');
						}}
					>
						Clear
					</button>
				</div>
				<div class="li">
					<div class="col grow">
						<span class="b small">Auto-download tickets</span>
						<span class="tiny muted-2">Makes every purchased ticket available offline</span>
					</div>
					<span class="tag good">On</span>
				</div>
			</div>
			<div class="soft pad-16" style="margin-top:12px">
				<span class="b small">Developer</span>
				<p class="tiny muted-2" style="margin-top:4px">
					This build stores everything in localStorage — no server required.
				</p>
				<button class="btn btn-sm btn-outline" style="margin-top:10px" onclick={app.resetData}>
					<Icon name="refresh" size={15} /> Reset demo data
				</button>
			</div>
		{:else}
			<div class="card card-pad" style="padding:0 16px">
				<a class="li li-click" href="/support">
					<span class="ic"><Icon name="info" size={16} /></span>
					<span class="grow b small">Help centre</span>
					<Icon name="chevronRight" size={16} />
				</a>
				<a class="li li-click" href="/support?tab=contact">
					<span class="ic"><Icon name="message" size={16} /></span>
					<span class="grow b small">Contact support</span>
					<Icon name="chevronRight" size={16} />
				</a>
				<button class="li li-click" style="width:100%;background:none;border:0" onclick={() => (safetyOpen = true)}>
					<span class="ic bad"><Icon name="flag" size={16} /></span>
					<span class="grow b small" style="text-align:left">Report a safety issue</span>
					<Icon name="chevronRight" size={16} />
				</button>
				<a class="li li-click" href="/support?tab=guide">
					<span class="ic"><Icon name="calendar" size={16} /></span>
					<span class="grow b small">Organiser guide</span>
					<Icon name="chevronRight" size={16} />
				</a>
			</div>

			<h3 style="margin:20px 0 8px">Legal</h3>
			<div class="card card-pad" style="padding:0 16px">
				<a class="li li-click" href="/legal/terms">
					<span class="grow b small">Terms of service</span>
					<Icon name="chevronRight" size={16} />
				</a>
				<a class="li li-click" href="/legal/privacy">
					<span class="grow b small">Privacy policy</span>
					<Icon name="chevronRight" size={16} />
				</a>
				<a class="li li-click" href="/legal/licenses">
					<span class="grow b small">Licenses & attributions</span>
					<Icon name="chevronRight" size={16} />
				</a>
				<button class="li li-click" style="width:100%;background:none;border:0" onclick={() => (cookiesOpen = true)}>
					<span class="grow b small" style="text-align:left">Cookie settings</span>
					<Icon name="chevronRight" size={16} />
				</button>
			</div>

			<p class="hint" style="margin-top:10px">Evently · v2.4.0 (build 2418)</p>
		{/if}
	</div>
</div>

<Sheet bind:open={confirmLogout} title="Sign out?" center>
	<p class="muted small" style="margin-bottom:14px">
		Your tickets stay on this device and will sync again when you sign in.
	</p>
	<div class="col gap-8">
		<button
			class="btn btn-primary btn-block"
			onclick={() => {
				confirmLogout = false;
				app.signOut();
			}}
		>
			Sign out
		</button>
		<button class="btn btn-ghost btn-block" onclick={() => (confirmLogout = false)}>Cancel</button>
	</div>
</Sheet>

<Sheet bind:open={cookiesOpen} title="Cookie settings">
	<div class="col gap-10">
		<Toggle bind:checked={cookies.essential} label="Strictly necessary" hint="Sign-in, ticketing and fraud prevention — always on" />
		<Toggle bind:checked={cookies.analytics} label="Analytics" hint="Helps us understand which screens confuse people" />
		<Toggle bind:checked={cookies.personalisation} label="Personalisation" hint="Powers recommendations from your interests" />
		<Toggle bind:checked={cookies.marketing} label="Marketing" hint="Measure campaign performance off-platform" />
		<button
			class="btn btn-primary btn-block"
			onclick={() => {
				cookiesOpen = false;
				app.say('Cookie preferences saved');
			}}
		>
			Save preferences
		</button>
	</div>
</Sheet>

<Sheet bind:open={safetyOpen} title="Report a safety issue">
	<div class="col gap-8">
		{#each ['Fraudulent or fake event', 'Harassment or abuse', 'Counterfeit ticket', 'Unsafe venue', 'Underage sales', 'Impersonation'] as r}
			<button
				class="srow"
				onclick={() => {
					safetyOpen = false;
					app.notify({
						kind: 'update',
						title: 'Safety report received',
						body: `“${r}” — reviewed by trust & safety within 24 hours.`,
						href: '/notifications'
					});
					app.say('Report submitted — thank you');
				}}
			>
				<Icon name="flag" size={16} /> {r}
			</button>
		{/each}
	</div>
</Sheet>

<Sheet bind:open={confirmDelete} title="Delete account?" center>
	<p class="muted small" style="margin-bottom:14px">
		This removes your profile, tickets and follows. You can restore within 30 days by signing in
		again.
	</p>
	<div class="col gap-8">
		<button
			class="btn btn-danger btn-block"
			onclick={() => {
				confirmDelete = false;
				app.signOut();
				app.say('Account scheduled for deletion', 'info');
			}}
		>
			Delete my account
		</button>
		<button class="btn btn-ghost btn-block" onclick={() => (confirmDelete = false)}>Keep account</button>
	</div>
</Sheet>

<style>
	.prow {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.prow:last-child {
		border-bottom: 0;
	}
	.chans {
		display: flex;
		gap: 8px;
	}
	.chan {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11.5px;
		color: var(--text-2);
		cursor: pointer;
	}
	.chan input {
		accent-color: var(--accent);
		width: 14px;
		height: 14px;
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
	.ic.bad {
		background: var(--bad-soft);
		color: var(--bad);
	}
	.role-row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		padding: 11px 10px;
		border-radius: var(--r);
		border: 1px solid transparent;
		background: transparent;
		cursor: pointer;
	}
	.role-row:hover {
		background: var(--surface);
	}
	.role-row.on {
		border-color: var(--accent-line);
		background: var(--accent-soft);
	}
	.vrow {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.vrow:last-of-type {
		border-bottom: 0;
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
	.link {
		color: var(--accent);
		font-weight: 600;
		background: none;
		border: 0;
		cursor: pointer;
		font-size: 13px;
	}
</style>
