<script>
	import { admin } from '$lib/admin.svelte.js';
	import { money, compact } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	const due = $derived(admin.payouts.filter((p) => p.status === 'Pending'));
	const held = $derived(admin.payouts.filter((p) => p.status === 'On hold'));

	function runBatch() {
		const ids = due.map((p) => p.id);
		ids.forEach((id) => admin.payout(id, 'Paid'));
		admin.log(`Ran payout batch for ${ids.length} organisers`);
		admin.say(`Payout batch released — ${ids.length} organisers`);
	}
</script>

<div class="page">
	<PageHead title="Payouts" />

	<div class="shell">
		<div class="kpis">
			<div class="kpi">
				<span class="k">Due next run</span>
				<span class="v">{money(due.reduce((s, p) => s + p.amount, 0), 'NGN')}</span>
				<span class="d muted-2">{due.length} organisers</span>
			</div>
			<div class="kpi">
				<span class="k">On hold</span>
				<span class="v">{money(held.reduce((s, p) => s + p.amount, 0), 'NGN')}</span>
				<span class="d" style="color:var(--warn)">KYC or dispute</span>
			</div>
			<div class="kpi">
				<span class="k">Paid (30d)</span>
				<span class="v">{money(12400000, 'NGN')}</span>
				<span class="d" style="color:var(--good)">18 batches</span>
			</div>
			<div class="kpi">
				<span class="k">Take rate</span>
				<span class="v">6.0%</span>
				<span class="d muted-2">platform fee</span>
			</div>
		</div>

		<div class="card card-pad" style="margin-top:12px;padding:0;overflow-x:auto">
			<table class="tbl">
				<thead>
					<tr>
						<th>Organiser</th>
						<th>KYC</th>
						<th class="right">Amount</th>
						<th>Schedule</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each admin.payouts as p (p.id)}
						<tr>
							<td class="b">{p.org}</td>
							<td>
								<span
									class="tag {p.kyc === 'verified' ? 'good' : p.kyc === 'rejected' ? 'bad' : 'warn'}"
								>
									{p.kyc}
								</span>
							</td>
							<td class="right b">{money(p.amount, 'NGN')}</td>
							<td class="small muted-2">{p.date}</td>
							<td>
								<span
									class="tag {p.status === 'Paid' ? 'good' : p.status === 'On hold' ? 'warn' : ''}"
								>
									{p.status}
								</span>
							</td>
							<td class="right">
								{#if p.status === 'Pending'}
									<button class="btn btn-sm btn-outline" onclick={() => admin.payout(p.id, 'On hold')}>
										Hold
									</button>
									<button class="btn btn-sm btn-primary" onclick={() => admin.payout(p.id, 'Paid')}>
										Release
									</button>
								{:else if p.status === 'On hold'}
									<button class="btn btn-sm btn-primary" onclick={() => admin.payout(p.id, 'Paid')}>
										Release
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<button class="btn btn-primary btn-block" style="margin-top:14px" onclick={runBatch} disabled={!due.length}>
			<Icon name="banknote" size={16} /> Run payout batch ({due.length})
		</button>
		<p class="hint" style="margin-top:8px">
			Batches settle T+48h. Held payouts need KYC clearance or dispute resolution first.
		</p>
	</div>
</div>

<style>
	.right {
		text-align: right;
	}
</style>
