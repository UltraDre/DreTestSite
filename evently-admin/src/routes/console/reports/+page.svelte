<script>
	import { admin } from '$lib/admin.svelte.js';
	import { timeAgo } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	let filter = $state('open');
	let detail = $state(null);

	const list = $derived(
		admin.reports.filter((r) => filter === 'open' || r.sev === filter)
	);
</script>

<div class="page">
	<PageHead title="Reports & disputes" />

	<div class="shell">
		<div class="toolbar">
			<div class="seg">
				{#each [['open', 'All open'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']] as [v, l]}
					<button class:on={filter === v} onclick={() => (filter = v)}>{l}</button>
				{/each}
			</div>
			<span class="tiny muted-2">{list.length} items</span>
		</div>

		<div class="stack">
			{#each list as r (r.id)}
				<div class="card card-pad">
					<div class="row-between">
						<span class="b small">{r.kind}</span>
						<span class="sev {r.sev}">{r.sev}</span>
					</div>
					<span class="small muted">Target: {r.target}</span>
					<span class="tiny muted-2">{r.by} · {timeAgo(r.at)}</span>
					<p class="small" style="margin-top:8px;line-height:1.6">{r.body}</p>

					<div class="row gap-8" style="margin-top:12px">
						<button class="btn btn-sm btn-outline grow" onclick={() => (detail = r)}>Details</button>
						<button class="btn btn-sm btn-outline grow" onclick={() => admin.resolveReport(r.id, 'resolved with refund')}>
							Refund
						</button>
						<button class="btn btn-sm btn-danger grow" onclick={() => admin.resolveReport(r.id, 'resolved with suspension')}>
							Suspend
						</button>
						<button class="btn btn-sm btn-ghost grow" onclick={() => admin.resolveReport(r.id)}>
							Dismiss
						</button>
					</div>
				</div>
			{:else}
				<div class="empty-admin">
					<div class="ico"><Icon name="checkCircle" size={26} /></div>
					<p class="b">No open reports</p>
					<p class="small">Escalations land here from the public app and from issuing banks.</p>
				</div>
			{/each}
		</div>
	</div>
</div>

{#if detail}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="scrim" onclick={() => (detail = null)}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="sheet" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="sheet-handle"></div>
			<div class="row-between" style="margin-bottom:10px">
				<h3>{detail.kind}</h3>
				<button class="icon-btn" onclick={() => (detail = null)} aria-label="Close">
					<Icon name="x" size={16} />
				</button>
			</div>
			<div class="col gap-8">
				<div class="li">
					<span class="grow small muted">Target</span><span class="small b">{detail.target}</span>
				</div>
				<div class="li">
					<span class="grow small muted">Reported by</span><span class="small b">{detail.by}</span>
				</div>
				<div class="li">
					<span class="grow small muted">Received</span><span class="small b">{timeAgo(detail.at)}</span>
				</div>
				<p class="small muted" style="line-height:1.6">{detail.body}</p>
				<div class="row gap-8" style="margin-top:6px">
					<button class="btn btn-outline grow" onclick={() => (detail = null)}>Close</button>
					<button
						class="btn btn-primary grow"
						onclick={() => {
							admin.resolveReport(detail.id, 'resolved');
							detail = null;
						}}
					>
						Mark resolved
					</button>
				</div>
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
