<script>
	import Icon from './Icon.svelte';

	let {
		hue = 258,
		glyph = 'ticket',
		class: klass = '',
		radius = 16,
		dim = false,
		seed = 1,
		image = null,
		/* height of a bottom gradient that fades the art into the page background */
		blend = 0,
		alt = ''
	} = $props();

	const g = $derived(`cover-g-${hue}-${seed}`);
</script>

<div class="cover {klass}" class:dim style="--r:{radius}px">
	{#if image}
		<img class="photo" src={image} alt={alt} loading="lazy" decoding="async" />
	{:else}
		<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			<defs>
				<linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="hsl({hue} 64% 56%)" />
					<stop offset="55%" stop-color="hsl({hue + 18} 58% 44%)" />
					<stop offset="100%" stop-color="hsl({hue + 34} 52% 30%)" />
				</linearGradient>
			</defs>
			<rect width="400" height="260" fill="url(#{g})" />
			<circle cx="330" cy="46" r="92" fill="#fff" opacity="0.09" />
			<circle cx="72" cy="228" r="76" fill="#000" opacity="0.1" />
			<circle cx="248" cy="196" r="34" fill="#fff" opacity="0.07" />
			<g opacity="0.14" stroke="#fff" stroke-width="1.2">
				{#each Array(7) as _, i}
					<path d="M{-40 + i * 72} 300 L{60 + i * 72} -20" />
				{/each}
			</g>
		</svg>
		<div class="glyph">
			<Icon name={glyph} size={70} stroke={1.3} />
		</div>
	{/if}
	{#if blend}
		<div class="blend" style="height:{blend}px"></div>
	{/if}
</div>

<style>
	.cover {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--r);
		background: var(--surface-2);
	}
	.cover > svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.photo {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.glyph {
		position: absolute;
		right: 12px;
		bottom: 8px;
		color: #fff;
		opacity: 0.85;
		transform: rotate(-8deg);
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.18));
	}
	.dim::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
	}
	.blend {
		position: absolute;
		inset: auto 0 0 0;
		pointer-events: none;
		background: linear-gradient(to bottom, transparent, var(--bg));
	}
</style>
