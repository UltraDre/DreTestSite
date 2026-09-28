<script>
	import { app } from '$shared/lib/state.svelte.js';
	import Icon from './Icon.svelte';
</script>

<div class="toasts">
	{#if app.toast}
		{#key app.toast.id}
			<div class="toast">
				<Icon name={app.toast.icon === 'check' ? 'checkCircle' : app.toast.icon} size={16} />
				<span>{app.toast.message}</span>
			</div>
		{/key}
	{/if}
</div>
