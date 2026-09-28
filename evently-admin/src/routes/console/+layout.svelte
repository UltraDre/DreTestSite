<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { admin } from '$lib/admin.svelte.js';
	import Icon from '$comp/Icon.svelte';

	let { children } = $props();

	const WEB = import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173';
	const path = $derived(page.url.pathname);

	const items = $derived([
		{ href: '/console', label: 'Overview', icon: 'chart' },
		{ href: '/console/approvals', label: 'Approvals', icon: 'checkCircle', n: admin.queue.length },
		{ href: '/console/events', label: 'Events', icon: 'calendar' },
		{ href: '/console/users', label: 'Users', icon: 'users' },
		{ href: '/console/reports', label: 'Reports', icon: 'flag', n: admin.reports.length },
		{ href: '/console/payouts', label: 'Payouts', icon: 'banknote' },
		{ href: '/console/audit', label: 'Audit', icon: 'list' },
		{ href: '/console/settings', label: 'Settings', icon: 'sliders' }
	]);

	const active = (href) => (href === '/console' ? path === '/console' : path.startsWith(href));

	$effect(() => {
		if (browser && !admin.session) goto('/', { replaceState: true });
	});
</script>

{#if admin.session}
	<div class="with-rail">
		<aside class="admin-rail">
			<div class="brand">
				<span class="mark"><Icon name="shield" size={16} /></span>
				<span class="col">
					Evently
					<small>Admin</small>
				</span>
			</div>

			<div class="col gap-4" style="flex:1;overflow-y:auto">
				{#each items as i}
					<a class="navitem" class:active={active(i.href)} href={i.href}>
						<Icon name={i.icon} size={18} />
						<span class="grow">{i.label}</span>
						{#if i.n}<span class="count">{i.n}</span>{/if}
					</a>
				{/each}
			</div>

			<div class="col gap-8" style="border-top:1px solid var(--line);padding-top:12px">
				<a class="li li-click" href={WEB} target="_blank" rel="noreferrer">
					<Icon name="external" size={16} />
					<span class="grow small b">Public app</span>
				</a>
				<a class="li li-click" href="/console/settings">
					<Icon name="user" size={16} />
					<span class="col grow" style="min-width:0">
						<span class="small b truncate">{admin.session.email}</span>
						<span class="tiny muted-2">{admin.roleName}</span>
					</span>
				</a>
			</div>
		</aside>

		<main class="rail-main">
			{@render children()}
		</main>

		<nav class="admin-tabs">
			{#each items as i}
				<a href={i.href} class:active={active(i.href)}>
					<Icon name={i.icon} size={20} />
					<span>{i.label}</span>
					{#if i.n}<span class="n">{i.n}</span>{/if}
				</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.count {
		background: var(--bad);
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		padding: 1px 7px;
		border-radius: 99px;
	}
</style>
