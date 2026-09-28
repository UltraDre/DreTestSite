<script>
	import Icon from './Icon.svelte';
	import Cover from './Cover.svelte';
	import Avatar from './Avatar.svelte';
	import { fileToImage, normaliseUrl, checkUrl, MAX_EDGE, isImageFile } from '$shared/lib/media.js';

	let {
		value = $bindable(null),
		hue = $bindable(258),
		glyph = 'sparkle',
		variant = 'cover', // 'cover' | 'avatar'
		label = 'Picture',
		hint = '',
		name = 'Evently',
		seed = 1,
		ratio = '16 / 9',
		size = 92,
		presets = true,
		onchange
	} = $props();

	let busy = $state(false);
	let err = $state('');
	let linkOpen = $state(false);
	let linkValue = $state('');
	let dragOver = $state(false);
	let fileInput;

	const max = $derived(MAX_EDGE[variant] ?? MAX_EDGE.cover);
	const isAvatar = $derived(variant === 'avatar');
	const has = $derived(!!value);

	const HUES = [258, 218, 190, 168, 148, 32, 12, 320];

	function set(v) {
		value = v;
		onchange?.(v);
	}

	async function fromFile(file) {
		err = '';
		if (!file) return;
		if (!isImageFile(file)) {
			err = 'That file isn’t an image. Pick a PNG, JPG or WebP.';
			return;
		}
		busy = true;
		try {
			set(await fileToImage(file, { max }));
			linkOpen = false;
		} catch {
			err = 'We couldn’t read that image. Try another file.';
		} finally {
			busy = false;
		}
	}

	function choose() {
		fileInput?.click();
	}

	function onPick(ev) {
		const input = ev.currentTarget;
		fromFile(input.files?.[0]);
		input.value = ''; // let the same file be picked twice in a row
	}

	function onDrop(ev) {
		ev.preventDefault();
		dragOver = false;
		fromFile(ev.dataTransfer?.files?.[0]);
	}

	async function addLink() {
		const url = normaliseUrl(linkValue);
		if (!url) return;
		err = '';
		if (!/^data:image\//i.test(url)) {
			busy = true;
			const ok = await checkUrl(url);
			busy = false;
			if (!ok) {
				err = 'That link didn’t load an image. Check the URL and try again.';
				return;
			}
		}
		set(url);
		linkOpen = false;
		linkValue = '';
	}

	function clear() {
		set(null);
		linkOpen = false;
		err = '';
	}
</script>

<div class="pp-field">
	<div class="row-between">
		<span class="label" style="margin:0">{label}</span>
		{#if hint}<span class="tiny muted-2">{hint}</span>{/if}
	</div>

	<button
		type="button"
		class="drop"
		class:avatar={isAvatar}
		class:over={dragOver}
		class:busy
		style={isAvatar ? `width:${size}px;height:${size}px` : `aspect-ratio:${ratio}`}
		onclick={choose}
		ondragover={(e) => {
			e.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => (dragOver = false)}
		ondrop={onDrop}
		aria-label={`${label} — choose a picture`}
	>
		{#if has}
			<img class="imgprev" class:round={isAvatar} src={value} alt="" />
		{:else if isAvatar}
			<Avatar {name} {hue} size={size - 10} />
		{:else}
			<Cover {hue} {glyph} radius={12} {seed} />
		{/if}

		<span class="ov" class:round={isAvatar}>
			<span class="ov-in">
				<Icon name={busy ? 'refresh' : 'camera'} size={isAvatar ? 20 : 22} />
				<span class="tiny">{busy ? 'Working…' : has ? 'Change' : 'Add photo'}</span>
			</span>
		</span>
	</button>

	<input
		bind:this={fileInput}
		class="hidden-file"
		type="file"
		accept="image/*"
		tabindex="-1"
		onchange={onPick}
	/>

	<div class="acts">
		<button type="button" class="chip sm" onclick={choose} disabled={busy}>
			<Icon name="upload" size={13} /> Upload
		</button>
		<button type="button" class="chip sm" onclick={() => (linkOpen = !linkOpen)} disabled={busy}>
			<Icon name="link" size={13} /> Link
		</button>
		{#if presets}
			<span class="hues">
				{#each HUES as h (h)}
					<button
						type="button"
						class="sw"
						class:on={hue === h && !has}
						style="background:hsl({h} 62% 56%)"
						title="Use this colour"
						aria-label={`Use colour ${h}`}
						onclick={() => {
							hue = h;
							if (has) set(null);
						}}
					></button>
				{/each}
			</span>
		{/if}
		<span class="grow"></span>
		{#if has}
			<button type="button" class="chip sm danger" onclick={clear}>
				<Icon name="trash" size={13} /> Remove
			</button>
		{/if}
	</div>

	{#if linkOpen}
		<div class="row gap-6" style="margin-top:8px">
			<input
				class="input"
				placeholder="https://…"
				bind:value={linkValue}
				onkeydown={(e) => e.key === 'Enter' && addLink()}
			/>
			<button type="button" class="btn btn-sm btn-primary" onclick={addLink} disabled={busy}>
				Add
			</button>
		</div>
	{/if}

	{#if err}
		<p class="tiny" style="color:var(--bad);margin-top:6px">{err}</p>
	{:else}
		<p class="hint" style="margin-top:6px">
			{#if isAvatar}
				Square images look best. We shrink it to fit on your device.
			{:else}
				Wide images look best — about 16:9. We shrink it before saving.
			{/if}
		</p>
	{/if}
</div>

<style>
	.pp-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.drop {
		position: relative;
		width: 100%;
		padding: 0;
		border: 1px dashed var(--line-strong);
		border-radius: var(--r-lg);
		background: var(--surface);
		overflow: hidden;
		cursor: pointer;
		display: grid;
		place-items: stretch;
		transition:
			border-color 0.15s var(--ease),
			background 0.15s var(--ease);
	}
	.drop.avatar {
		border-radius: 99px;
		place-items: center;
		margin: 0 auto;
	}
	.drop:hover,
	.drop.over {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.drop.busy {
		opacity: 0.7;
	}
	.imgprev {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.imgprev.round {
		border-radius: 99px;
	}
	.ov {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgba(8, 8, 10, 0.34);
		color: #fff;
		opacity: 0;
		transition: opacity 0.15s var(--ease);
	}
	.ov.round {
		border-radius: 99px;
	}
	.drop:hover .ov,
	.drop:focus-visible .ov,
	.drop.over .ov,
	.drop.busy .ov {
		opacity: 1;
	}
	.ov-in {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		font-weight: 600;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
	}
	.acts {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.grow {
		flex: 1;
	}
	.hues {
		display: inline-flex;
		gap: 5px;
		margin-left: 2px;
	}
	.sw {
		width: 18px;
		height: 18px;
		border-radius: 99px;
		border: 2px solid transparent;
		box-shadow: 0 0 0 1px var(--line);
		cursor: pointer;
		padding: 0;
	}
	.sw.on {
		border-color: var(--bg);
		box-shadow: 0 0 0 2px var(--accent);
	}
	.chip.danger {
		color: var(--bad);
	}
	.hidden-file {
		display: none;
	}
</style>
