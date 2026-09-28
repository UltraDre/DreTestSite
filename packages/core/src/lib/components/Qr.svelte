<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let { payload = '', size = 190, dark = '#0B0B0C', light = '#FFFFFF' } = $props();

	let host = $state(null);
	let dataUrl = $state('');

	$effect(() => {
		if (!host || !payload) return;
		QRCode.toDataURL(payload, {
			width: 480,
			margin: 1,
			errorCorrectionLevel: 'M',
			color: { dark, light: '#ffffff00' }
		})
			.then((url) => (dataUrl = url))
			.catch(() => (dataUrl = ''));
	});
</script>

<div class="qr" bind:this={host} style="width:{size}px;height:{size}px">
	{#if dataUrl}
		<img src={dataUrl} alt="QR code" style="width:100%;height:100%" />
	{:else}
		<div class="skel" style="width:100%;height:100%;border-radius:12px"></div>
	{/if}
</div>

<style>
	.qr {
		background: #fff;
		padding: 10px;
		border-radius: 16px;
		display: grid;
		place-items: center;
	}
</style>
