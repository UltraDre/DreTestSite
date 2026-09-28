import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: { qrcode: fileURLToPath(new URL('./node_modules/qrcode', import.meta.url)) }
	},
	server: {
		fs: { allow: [repoRoot] },
		host: '0.0.0.0',
		port: 5174,
		strictPort: true,
		allowedHosts: true,
		cors: true
	},
	preview: {
		host: '0.0.0.0',
		port: 4174,
		allowedHosts: true
	}
});
