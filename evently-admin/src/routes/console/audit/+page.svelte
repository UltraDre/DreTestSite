<script>
	import { admin } from '$lib/admin.svelte.js';
	import { timeAgo } from '$shared/lib/util.js';
	import PageHead from '$comp/PageHead.svelte';

	let q = $state('');
	let who = $state('all');

	const list = $derived(
		admin.audit.filter(
			(a) =>
				(!q || a.what.toLowerCase().includes(q.toLowerCase())) &&
				(who === 'all' || (who === 'system' ? a.who === 'system' : a.who !== 'system'))
		)
	);
</script>

<div class="page">
	<PageHead title="Audit log" />

	<div class="shell">
		<div class="toolbar">
			<div class="search">
				<input placeholder="Search actions" bind:value={q} />
			</div>
			<select class="select" style="width:auto;height:44px" bind:value={who}>
				<option value="all">Everyone</option>
				<option value="staff">Staff actions</option>
				<option value="system">System</option>
			</select>
		</div>

		<div class="card card-pad" style="padding:0 16px">
			{#each list as a (a.id)}
				<div class="li">
					<div class="col grow" style="min-width:0">
						<span class="small b truncate">{a.what}</span>
						<span class="tiny muted-2">{a.who}</span>
					</div>
					<span class="tiny muted-2" style="white-space:nowrap">{timeAgo(a.at)}</span>
				</div>
			{:else}
				<div class="empty-admin"><p class="small">Nothing matches.</p></div>
			{/each}
		</div>

		<p class="hint" style="margin-top:10px">
			Logs are immutable and retained for 2 years for financial compliance. Every impersonation
			and payout action is recorded with the operator's identity.
		</p>
	</div>
</div>
