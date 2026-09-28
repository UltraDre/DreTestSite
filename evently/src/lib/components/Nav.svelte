<script>
	import { page } from '$app/state';
	import { app } from '$shared/lib/state.svelte.js';
	import Icon from '$comp/Icon.svelte';
	import Avatar from '$comp/Avatar.svelte';

	const path = $derived(page.url.pathname);
	const role = $derived(app.role);

	const tabs = $derived.by(() => {
		const t = [
			{ href: '/home', label: 'Home', icon: 'home' },
			{ href: '/explore', label: 'Explore', icon: 'compass' }
		];
		if (role === 'staff') t.push({ href: '/organizer/scan', label: 'Scan', icon: 'scan' });
		else if (['organizer', 'cohost'].includes(role))
			t.push({ href: '/organizer', label: 'Dashboard', icon: 'chart' });
		t.push({ href: '/tickets', label: 'Tickets', icon: 'ticket' });
		t.push({ href: '/profile', label: 'Profile', icon: 'user' });
		return t;
	});

	const railPrimary = $derived(tabs);
	const railSecondary = $derived.by(() => {
		const s = [{ href: '/saved', label: 'Saved', icon: 'bookmark' }, { href: '/notifications', label: 'Notifications', icon: 'bell', count: app.unread }];
		if (['organizer', 'cohost', 'staff', 'venue'].includes(role)) {
			s.push({ href: '/organizer/scan', label: 'Check-in scanner', icon: 'scan' });
			s.push({ href: '/organizer/create', label: 'Create event', icon: 'plus' });
		}

		s.push({ href: '/settings', label: 'Settings', icon: 'sliders' });
		s.push({ href: '/support', label: 'Help & legal', icon: 'info' });
		return s;
	});

	const active = (href) =>
		href === '/organizer'
			? path === '/organizer' || path.startsWith('/organizer/events')
			: path === href || path.startsWith(href + '/');
</script>

<!-- desktop rail -->
<aside class="rail desktop-only">
	<a class="rail-brand" href="/home">
		<span class="logo"><Icon name="ticket" size={17} stroke={2} /></span>
		Evently
	</a>

	<div class="rail-scroll col gap-4">
		{#each railPrimary as t}
			<a class="navitem" class:active={active(t.href)} href={t.href}>
				<Icon name={t.icon} size={19} />
				<span>{t.label}</span>
			</a>
		{/each}

		<div class="eyebrow" style="padding:14px 11px 6px">More</div>
		{#each railSecondary as t}
			<a class="navitem" class:active={active(t.href)} href={t.href}>
				<Icon name={t.icon} size={19} />
				<span class="grow">{t.label}</span>
				{#if t.count}<span class="count">{t.count}</span>{/if}
			</a>
		{/each}
	</div>

	{#if app.user}
		<a class="me" href="/profile">
			<Avatar name={app.user.name} hue={app.user.hue} size={32} />
			<span class="col" style="min-width:0">
				<span class="b small truncate">{app.user.name}</span>
				<span class="tiny muted-2 truncate">{app.roleName}</span>
			</span>
		</a>
	{:else}
		<a class="btn btn-outline btn-sm" href="/auth">Sign in</a>
	{/if}
</aside>

<!-- mobile tab bar -->
<nav class="tabbar">
	{#each tabs as t}
		<a href={t.href} class:active={active(t.href)}>
			<span class="dot">
				<Icon name={t.icon} size={22} stroke={active(t.href) ? 2.1 : 1.8} />
			</span>
			<span>{t.label}</span>
		</a>
	{/each}
</nav>

<style>
	.me {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 10px;
		border-radius: var(--r);
		margin-top: 10px;
		transition: background 0.14s var(--ease);
	}
	.me:hover {
		background: var(--surface);
	}
	.logo {
		width: 28px;
		height: 28px;
		border-radius: 9px;
		background: var(--text);
		color: var(--bg);
		display: grid;
		place-items: center;
	}
	@media (max-width: 899px) {
		.tabbar {
			display: flex;
		}
	}
</style>
