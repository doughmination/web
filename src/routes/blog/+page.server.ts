// src/routes/blog/+page.server.ts
// DASL-1.2 — (c) Clove Twilight

import type { PostMeta, PostSummary } from '#lib/scripts/blog.ts';

// Every post folder's `metadata` export, so a new post shows up here without touching this file.
// Runs on the server only, so the post components never end up in the list page's bundle.
const modules = import.meta.glob<PostMeta>('./*/+page.svelte', {
	eager: true,
	import: 'metadata'
});

const posts: PostSummary[] = Object.entries(modules)
	.map(([file, meta]) => ({ ...meta, slug: file.split('/')[1] }))
	.sort((a, b) => b.date.localeCompare(a.date));

export function load() {
	return { posts };
}
