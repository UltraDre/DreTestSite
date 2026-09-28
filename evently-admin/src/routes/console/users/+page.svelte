<script>
	import { admin } from '$lib/admin.svelte.js';
	import { compact } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';
	import Avatar from '$comp/Avatar.svelte';

	let q = $state('');
	let open = $state(null);
	let confirm = $state(null);

	const list = $derived(
		admin.users.filter(
			(u) => !q || (u.name + u.handle).toLowerCase().includes(q.toLowerCase())
		)
	);
</script>

<div class="page">
	<PageHead title="Users & organisers" />

	<div class="shell">
		<div class="toolbar">
			<div class="search">
				<Icon name="search" size={16} />
				<input placeholder="Search by name or handle" bind:value={q} />
			</div>
		</div>

		<div class="card card-pad" style="padding:0 16px">
			{#each list as u (u.id)}
				<div class="li">
					<Avatar name={u.name} hue={258 + (u.id.length % 4) * 30} size={38} />
					<div class="col grow" style="min-width:0">
						<span class="b small truncate">{u.name}</span>
						<span class="tiny muted-2 truncate">
							@{u.handle} · {u.role} · joined {u.joined}
							{#if u.tickets != null}· {u.tickets} tickets{/if}
							{#if u.events != null}· {u.events} events{/if}
						</span>
					</div>
					<span class="tag {u.kyc === 'verified' ? 'good' : u.kyc === 'rejected' ? 'bad' : 'warn'}">
						KYC {u.kyc}
					</span>
					<span class="tag {u.status === 'active' ? 'good' : 'bad'}">{u.status}</span>
					<button class="btn btn-sm btn-outline" onclick={() => (open = u)}>Manage</button>
				</div>
			{:else}
				<div class="empty-admin"><p class="small">No users match.</p></div>
			{/each}
		</div>
	</div>
</div>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="scrim" onclick={() => (open = null)}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="sheet" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="sheet-handle"></div>
			<div class="row-between" style="margin-bottom:12px">
				<h3>{open.name}</h3>
				<button class="icon-btn" onclick={() => (open = null)} aria-label="Close">
					<Icon name="x" size={16} />
				</button>
			</div>

			<div class="row gap-12" style="margin-bottom:14px">
				<Avatar name={open.name} hue={258} size={52} />
				<div class="col grow">
					<span class="b">@{open.handle}</span>
					<span class="tiny muted-2">{open.role} · joined {open.joined}</span>
				</div>
			</div>

			<div class="col gap-8">
				{#each [['verified', 'Mark KYC verified'], ['pending', 'Mark KYC pending'], ['rejected', 'Reject KYC']] as [k, label]}
					<button
						class="srow"
						onclick={() => {
							admin.setKyc(open.id, k);
							open = null;
						}}
					>
						<Icon name="shieldCheck" size={16} /> {label}
					</button>
				{/each}
				<hr />
				{#if open.status === 'active'}
					<button
						class="srow danger"
						onclick={() => {
							admin.setUserStatus(open.id, 'suspended');
							open = null;
						}}
					>
						<Icon name="ban" size={16} /> Suspend account
					</button>
				{:else}
					<button
						class="srow"
						onclick={() => {
							admin.setUserStatus(open.id, 'active');
							open = null;
						}}
					>
						<Icon name="checkCircle" size={16} /> Reinstate account
					</button>
				{/if}
				<button class="srow" onclick={() => admin.say('Password reset email sent')}>
					<Icon name="key" size={16} /> Force password reset
				</button>
				<button class="srow" onclick={() => admin.say('Impersonation link generated (logged)')}>
					<Icon name="eye" size={16} /> View as user (audited)
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
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
	.srow.danger {
		color: var(--bad);
		border-color: var(--bad-soft);
		background: var(--bad-soft);
	}
</style>
