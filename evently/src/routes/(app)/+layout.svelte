<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import Nav from '../../lib/components/Nav.svelte';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		if (!app.launched) goto('/', { replaceState: true });
	});

	$effect(() => {
		if (browser && app.launched && page.url.pathname !== '/') app.lastRoute = page.url.pathname;
	});
</script>

<div class="with-rail">
	<Nav />
	<main class="rail-main">
		{@render children()}
	</main>
</div>
