const sveltePreprocess = require('svelte-preprocess');
const adapter = require('@sveltejs/adapter-static');
const pkg = require('./package.json');

const { resolve } = require('path');
const md = require('vite-plugin-markdown');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess(),
	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		vite: {
			plugins: [md.plugin({ mode: md.Mode.HTML })],
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {})
			},
			resolve: {
				alias: {
					// custom aliases (be sure to add in in tsconfig.json)
					$components: resolve(__dirname, './src/components')
				}
			}
		}
	}
};
