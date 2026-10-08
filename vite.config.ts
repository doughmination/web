/* vite.config.ts
 * DASL-1.2 — (c) Clove Twilight
 */

import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			inspector: true
		})
	],
	// iconsax fetches its icon data relative to its own file, which pre-bundling breaks
	optimizeDeps: {
		exclude: ['iconsax']
	}
});
