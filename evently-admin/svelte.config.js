import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';

const core = fileURLToPath(new URL('../packages/core/src', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: 'index.html', strict: false }),
		alias: {
			$shared: core,
			$comp: `${core}/lib/components`
		}
	}
};

export default config;
