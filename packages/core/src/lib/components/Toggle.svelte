<script>
	let { checked = $bindable(false), label = '', hint = '' } = $props();
</script>

<label class="toggle">
	<span class="col gap-4 grow">
		{#if label}<span class="label" style="color:var(--text)">{label}</span>{/if}
		{#if hint}<span class="hint">{hint}</span>{/if}
	</span>
	<input type="checkbox" bind:checked />
	<span class="track" class:on={checked}><i></i></span>
</label>

<style>
	.toggle {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 0;
		cursor: pointer;
		border-bottom: 1px solid var(--line);
	}
	.toggle:last-child {
		border-bottom: 0;
	}
	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.track {
		width: 44px;
		height: 26px;
		border-radius: 99px;
		background: var(--line-strong);
		position: relative;
		transition: background 0.18s var(--ease);
		flex: none;
	}
	.track i {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 99px;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.18s var(--ease);
	}
	.track.on {
		background: var(--accent);
	}
	.track.on i {
		transform: translateX(18px);
	}
</style>
