<script>
	import { admin } from '$lib/admin.svelte.js';
	import { app as core } from '$shared/lib/state.svelte.js';
	import { money, dateShort, compact, pct } from '$shared/lib/util.js';
	import Icon from '$comp/Icon.svelte';
	import PageHead from '$comp/PageHead.svelte';

	let q = $state('');
	let status = $state('all');

	const list = $derived(
		admin.events.filter((e) => {
			if (status !== 'all' && e.status !== status) return false;
			return !q || e.title.toLowerCase().includes(q.toLowerCase());
		})
	);

	function unpublish(e) {
		admin.log(`Unpublished “${e.title}”`);
		admin.say('Event unpublished');
	}
</script>

<div class="page">
	<PageHead title="Events" />

	<div class="shell">
		<div class="toolbar">
			<div class="search">
				<Icon name="search" size={16} />
				<input placeholder="Search events" bind:value={q} />
			</div>
			<select class="select" style="width:auto;height:44px" bind:value={status}>
				<option value="all">All statuses</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
				<option value="cancelled">Cancelled</option>
			</select>
		</div>

		<div class="card card-pad" style="padding:0;overflow-x:auto">
			<table class="tbl">
				<thead>
					<tr>
						<th>Event</th>
						<th>Organiser</th>
						<th>Date</th>
						<th>Sold</th>
						<th class="right">Gross</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each list as e (e.id)}
						<tr>
							<td class="b" style="max-width:220px">
								<div class="truncate">{e.title}</div>
								<span class="tiny muted-2">{e.category}</span>
							</td>
							<td class="muted small">
								{core.organizer(e.organizerId)?.name ??
									admin.users.find((u) => u.id === e.organizerId)?.name ??
									e.organizerId}
							</td>
							<td class="small">{dateShort(e.start)}</td>
							<td class="small">
								{e.ticketTypes.reduce((s, t) => s + t.sold, 0)}
								<span class="muted-2">/ {e.capacity}</span>
							</td>
							<td class="right b">{money(e.ticketTypes.reduce((s, t) => s + t.sold * t.price, 0), 'NGN')}</td>
							<td>
								<span class="tag {e.status === 'published' ? 'good' : e.status === 'cancelled' ? 'bad' : ''}">
									{e.status}
								</span>
							</td>
							<td class="right">
								{#if e.status === 'published'}
									<button class="btn btn-sm btn-ghost" onclick={() => unpublish(e)}>Unpublish</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if !list.length}
				<div class="empty-admin"><p class="small">No events match.</p></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.right {
		text-align: right;
	}
</style>
