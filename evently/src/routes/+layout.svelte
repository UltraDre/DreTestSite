<script>
	import '$shared/app.css';
	import { app } from '$shared/lib/state.svelte.js';
	import Toasts from '$comp/Toasts.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', app.theme);
		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', app.theme === 'dark' ? '#0a0a0b' : '#ffffff');
	});

	$effect(() => {
		if (!browser || !('serviceWorker' in navigator)) return;
		const id = setTimeout(() => {
			navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
		}, 1200);
		return () => clearTimeout(id);
	});
</script>

<svelte:head>
	<title>Evently — discover, attend and run events</title>
</svelte:head>

{@render children()}

<Toasts />
