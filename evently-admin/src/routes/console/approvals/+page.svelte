<script>
	import { admin } from '$lib/admin.svelte.js';
	import { money, timeAgo } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	let filter = $state('all');
	const list = $derived(
		filter === 'all' ? admin.queue : admin.queue.filter((q) => q.risk === filter)
	);
</script>

<div class="page">
	<PageHead title="Approvals" />

	<div class="shell">
		<div class="toolbar">
			<div class="seg">
				{#each [['all', 'All'], ['high', 'High risk'], ['medium', 'Medium'], ['low', 'Low']] as [v, l]}
					<button class:on={filter === v} onclick={() => (filter = v)}>{l}</button>
				{/each}
			</div>
			<span class="tiny muted-2">{list.length} in queue</span>
		</div>

		<div class="stack">
			{#each list as q (q.id)}
				<div class="card card-pad q">
					<div class="row gap-12" style="align-items:flex-start">
						<span class="score {q.risk}">{q.score}</span>
						<div class="col grow" style="min-width:0">
							<div class="row-between">
								<span class="b">{q.title}</span>
								<span class="risk {q.risk}">{q.risk} risk</span>
							</div>
							<span class="small muted-2">
								{q.org} · {q.tickets} ticket type{q.tickets > 1 ? 's' : ''} · from
								{money(q.price, 'NGN')} · submitted {timeAgo(q.at)}
							</span>
							{#if q.flags.length}
								<div class="row gap-6 wrap" style="margin-top:8px">
									{#each q.flags as f}<span class="tag"><Icon name="alert" size={10} /> {f}</span>{/each}
								</div>
							{/if}
							<p class="tiny muted" style="margin-top:8px">{q.notes}</p>
						</div>
					</div>
					<div class="row gap-8" style="margin-top:12px">
						<button class="btn btn-sm btn-outline grow" onclick={() => admin.reject(q.id)}>
							Reject
						</button>
						<button class="btn btn-sm btn-ghost grow" onclick={() => admin.requestInfo(q.id)}>
							Request info
						</button>
						<button class="btn btn-sm btn-primary grow" onclick={() => admin.approve(q.id)}>
							Approve
						</button>
					</div>
				</div>
			{:else}
				<div class="empty-admin">
					<div class="ico"><Icon name="checkCircle" size={26} /></div>
					<p class="b">Queue is clear</p>
					<p class="small">New submissions are auto-scored by the risk engine before reaching you.</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.q {
		border-left: 3px solid var(--line-strong);
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
		padding: 6px 13px;
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
	.ico {
		width: 56px;
		height: 56px;
		border-radius: 99px;
		background: var(--surface);
		display: grid;
		place-items: center;
		margin: 0 auto 12px;
	}
</style>
