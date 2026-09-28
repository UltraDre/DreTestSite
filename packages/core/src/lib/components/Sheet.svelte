<script>
	let { open = $bindable(false), title = '', center = false, children, onclose } = $props();

	function close() {
		open = false;
		onclose?.();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="scrim" onclick={close}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="sheet" class:center-modal={center} onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="sheet-handle"></div>
			{#if title}
				<div class="row-between" style="margin-bottom:12px">
					<h3>{title}</h3>
					<button class="icon-btn" onclick={close} aria-label="Close">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
					</button>
				</div>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}
