/* vite.config.ts
 * DASL-1.2 — (c) Clove Twilight
 */

import denoAdapter from '@deno/svelte-adapter';
import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

// The Deno adapter writes prerendered endpoints (sitemap.xml, search.json) but never routes them
function adapter(): Adapter {
	const base = denoAdapter();

	return {
		...base,
		async adapt(builder) {
			await base.adapt(builder);

			const deployFile = '.deno-deploy/deploy.json';
			const deployConfig = JSON.parse(await readFile(deployFile, 'utf8'));

			for (const pathname of builder.prerendered.assets.keys()) {
				deployConfig.staticFiles.push({
					source: pathname,
					destination: `.deno-deploy/static${pathname}`
				});
			}

			await writeFile(deployFile, JSON.stringify(deployConfig, null, 2));
		}
	};
}

export default defineConfig({
	resolve: {
		// Kit 3 only reads `#lib` from package.json imports, which this project no longer has
		alias: [
			{
				find: /^#lib$/,
				replacement: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url))
			},
			{
				find: /^#lib\//,
				replacement: fileURLToPath(new URL('./src/lib/', import.meta.url))
			}
		]
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			// Inspector breaks under Deno's symlinked node_modules (its CSS fails to load)
			inspector: false
		}),
		// Turns each `~icons/<set>/<name>` import into an inline-SVG Svelte component at build time
		Icons({ compiler: 'svelte', scale: 1 })
	]
});
