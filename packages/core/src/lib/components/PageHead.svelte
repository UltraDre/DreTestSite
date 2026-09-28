<script>
	import Icon from './Icon.svelte';
	let { title = '', back = false, right, children } = $props();
</script>

<header class="page-head">
	<div class="shell">
		<div class="row">
			{#if back}
				<button class="icon-btn" onclick={() => history.back()} aria-label="Back">
					<Icon name="arrowLeft" size={19} />
				</button>
			{/if}
			<h1 class="page-title">{title}</h1>
			{#if right}{@render right()}{/if}
		</div>
		{#if children}{@render children()}{/if}
	</div>
</header>
