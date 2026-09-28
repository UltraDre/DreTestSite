<script>
	let { tabs = [], value = $bindable(tabs[0]?.id), scroll = true } = $props();
</script>

<div class="tabs" class:scroll-x={scroll}>
	{#each tabs as t}
		<button class="tab" class:on={value === t.id} onclick={() => (value = t.id)}>
			{t.label}
			{#if t.count != null}<span class="c">{t.count}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: 6px;
		padding-bottom: 2px;
	}
	.tab {
		border: 0;
		background: transparent;
		padding: 8px 13px;
		border-radius: 99px;
		font-size: 14px;
		font-weight: 550;
		color: var(--text-2);
		cursor: pointer;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.14s var(--ease);
	}
	.tab:hover {
		background: var(--surface);
	}
	.tab.on {
		background: var(--text);
		color: var(--bg);
	}
	.tab .c {
		font-size: 11px;
		font-weight: 700;
		opacity: 0.7;
	}
</style>
