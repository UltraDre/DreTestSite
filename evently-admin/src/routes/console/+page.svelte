<script>
	import { admin } from '$lib/admin.svelte.js';
	import { money, timeAgo, compact, pct } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	const ticketsSold = $derived(
		admin.events.reduce((s, e) => s + e.ticketTypes.reduce((x, t) => x + t.sold, 0), 0)
	);
	const checkedIn = $derived(
		admin.events.reduce((s, e) => s + e.ticketTypes.reduce((x, t) => x + t.sold * 0.82, 0), 0)
	);
	const series = $derived(
		Array.from({ length: 14 }, (_, i) => Math.round(40 + i * 3 + Math.sin(i / 1.7) * 22 + (i % 3) * 6))
	);
	const maxS = $derived(Math.max(...series));
	const highRisk = $derived(admin.queue.filter((q) => q.risk === 'high').length);
</script>

<div class="page">
	<PageHead title="Overview" />

	<div class="shell">
		<div class="kpis">
			<div class="kpi">
				<span class="k">Pending approvals</span>
				<span class="v">{admin.queue.length}</span>
				<span class="d" style="color:var(--bad)">{highRisk} high risk</span>
			</div>
			<div class="kpi">
				<span class="k">Open reports</span>
				<span class="v">{admin.reports.length}</span>
				<span class="d" style="color:var(--warn)">
					{admin.reports.filter((r) => r.sev === 'high').length} high severity
				</span>
			</div>
			<div class="kpi">
				<span class="k">GMV</span>
				<span class="v">{money(admin.gmv30d, 'NGN')}</span>
				<span class="d" style="color:var(--good)">{compact(ticketsSold)} tickets sold</span>
			</div>
			<div class="kpi">
				<span class="k">Payouts due</span>
				<span class="v">
					{money(admin.pendingPayouts.reduce((s, p) => s + p.amount, 0), 'NGN')}
				</span>
				<span class="d muted-2">{admin.pendingPayouts.length} organisers</span>
			</div>
		</div>

		<div class="card card-pad" style="margin-top:12px">
			<div class="row-between" style="margin-bottom:12px">
				<div>
					<span class="eyebrow">Tickets issued · last 14 days</span>
					<div class="b" style="font-size:18px">{compact(ticketsSold)} total</div>
				</div>
				<span class="tag good"><Icon name="trending" size={11} /> +18% vs prior</span>
			</div>
			<div class="bars">
				{#each series as v, i}
					<div class="bw"><div class="bar" style="height:{(v / maxS) * 100}%;--d:{i * 35}ms"></div></div>
				{/each}
			</div>
			<div class="row-between tiny muted-2" style="margin-top:8px">
				<span>14 days ago</span><span>Today</span>
			</div>
		</div>

		<div class="grid-two" style="margin-top:12px">
			<div class="card card-pad">
				<div class="row-between" style="margin-bottom:8px">
					<h3>Needs a decision</h3>
					<a class="link small" href="/console/approvals">All approvals</a>
				</div>
				{#each admin.queue.slice(0, 3) as q (q.id)}
					<div class="li">
						<span class="score {q.risk}">{q.score}</span>
						<div class="col grow" style="min-width:0">
							<span class="b small truncate">{q.title}</span>
							<span class="tiny muted-2 truncate">{q.org} · {timeAgo(q.at)}</span>
						</div>
						<div class="row gap-6">
							<button class="btn btn-sm btn-outline" onclick={() => admin.reject(q.id)}>Reject</button>
							<button class="btn btn-sm btn-primary" onclick={() => admin.approve(q.id)}>
								Approve
							</button>
						</div>
					</div>
				{:else}
					<div class="empty-admin"><p class="small">Queue is clear.</p></div>
				{/each}
			</div>

			<div class="card card-pad">
				<div class="row-between" style="margin-bottom:8px">
					<h3>Live events</h3>
					<a class="link small" href="/console/events">All events</a>
				</div>
				<table class="tbl">
					<thead>
						<tr><th>Event</th><th>Sold</th><th class="right">Gross</th></tr>
					</thead>
					<tbody>
						{#each admin.liveEvents.slice(0, 5) as e (e.id)}
							<tr>
								<td class="b truncate" style="max-width:180px">{e.title}</td>
								<td>{pct(e.ticketTypes.reduce((s, t) => s + t.sold, 0), e.capacity)}%</td>
								<td class="right b">
									{money(e.ticketTypes.reduce((s, t) => s + t.sold * t.price, 0), 'NGN')}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="card card-pad" style="margin-top:12px">
			<div class="row-between" style="margin-bottom:8px">
				<h3>Recent activity</h3>
				<a class="link small" href="/console/audit">Full log</a>
			</div>
			{#each admin.audit.slice(0, 5) as a (a.id)}
				<div class="li">
					<span class="ic"><Icon name="list" size={14} /></span>
					<div class="col grow" style="min-width:0">
						<span class="small b truncate">{a.what}</span>
						<span class="tiny muted-2">{a.who}</span>
					</div>
					<span class="tiny muted-2">{timeAgo(a.at)}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		height: 100px;
	}
	.bw {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: flex-end;
	}
	.bar {
		width: 100%;
		border-radius: 5px 5px 2px 2px;
		background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #fff));
		animation: grow 0.5s var(--ease) both;
		animation-delay: var(--d);
		min-height: 3px;
	}
	@keyframes grow {
		from {
			height: 0;
		}
	}
	.grid-two {
		display: grid;
		gap: 12px;
	}
	.ic {
		width: 28px;
		height: 28px;
		border-radius: 9px;
		background: var(--surface);
		display: grid;
		place-items: center;
		color: var(--text-2);
		flex: none;
	}
	.link {
		color: var(--accent);
		font-weight: 600;
	}
	@media (min-width: 900px) {
		.grid-two {
			grid-template-columns: 1.3fr 1fr;
		}
	}
</style>
