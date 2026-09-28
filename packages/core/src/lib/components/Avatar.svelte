<script>
	import { initials } from '$shared/lib/util.js';

	let {
		name = '?',
		hue = 258,
		size = 40,
		class: klass = '',
		ring = false,
		image = null
	} = $props();
</script>

<div
	class="avatar {klass}"
	class:ring
	style="width:{size}px;height:{size}px;background:linear-gradient(135deg,hsl({hue} 62% 58%),hsl({hue +
		26} 55% 42%));font-size:{size * 0.38}px"
	title={name}
>
	{#if image}
		<img class="pic" src={image} alt={name} loading="lazy" decoding="async" />
	{:else}
		<span class="avatar-initials">{initials(name)}</span>
	{/if}
</div>

<style>
	.avatar {
		border-radius: 99px;
		overflow: hidden;
		position: relative;
		flex: none;
	}
	.pic {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.ring {
		box-shadow: 0 0 0 2px var(--bg), 0 0 0 3.5px hsl(var(--h, 258) 60% 60%);
	}
</style>
