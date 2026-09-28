<script>
	import '$shared/app.css';
	import '../app.css';
	import { browser } from '$app/environment';
	import { admin } from '$lib/admin.svelte.js';
	import Icon from '$comp/Icon.svelte';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', admin.theme);
	});

	$effect(() => {
		if (!browser || !('serviceWorker' in navigator)) return;
		const id = setTimeout(() => navigator.serviceWorker.register('/sw.js').catch(() => {}), 1200);
		return () => clearTimeout(id);
	});
</script>

<svelte:head>
	<title>Evently Admin</title>
</svelte:head>

{@render children()}

{#if admin.toast}
	{#key admin.toast.id}
		<div class="toasts">
			<div class="toast">
				<Icon name={admin.toast.icon === 'check' ? 'checkCircle' : admin.toast.icon} size={16} />
				<span>{admin.toast.message}</span>
			</div>
		</div>
	{/key}
{/if}

<style>
	.toasts {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 76px;
		z-index: 300;
	}
	.toast {
		background: var(--text);
		color: var(--bg);
		padding: 11px 16px;
		border-radius: 99px;
		font-size: 13.5px;
		font-weight: 550;
		box-shadow: var(--shadow-md);
		display: flex;
		align-items: center;
		gap: 8px;
		animation: fade-up 0.28s var(--ease) both;
	}
	@media (min-width: 900px) {
		.toasts {
			bottom: 26px;
		}
	}
</style>
