import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	vitePlugin: {
		inspector: true
	},
	kit: {
		// Node adapter configured for Lambda compatibility
		adapter: adapter({
			// Generate standalone server for Lambda
			out: 'build'
		}),
		alias: {
			$logic: './src/lib/server/logic/'
		}
	}
};
export default config;

