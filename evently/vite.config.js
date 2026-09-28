import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	/* core lives outside the app root — resolve its only npm dependency from here */
	resolve: {
		alias: { qrcode: fileURLToPath(new URL('./node_modules/qrcode', import.meta.url)) }
	},
	/* the shared core package lives outside this app's root */
	server: {
		fs: { allow: [repoRoot] },
		host: '0.0.0.0',
		port: 5173,
		strictPort: true,
		allowedHosts: true,
		cors: true
	},
	preview: {
		host: '0.0.0.0',
		port: 4173,
		allowedHosts: true
	}
});
