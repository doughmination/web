/* src/lib/scripts/blog.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Each post is src/routes/blog/<slug>/+page.svelte and exports one of these
// from its `<script module>` block, which is what the /blog list reads
export interface PostMeta {
	title: string;
	excerpt: string;
	// YYYY-MM-DD
	date: string;
	// YYYY-MM-DD, set when a post is edited after it went up
	updated?: string;
	user: string;
	tags: string[];
	// Content warning shown before the post, which stays hidden until the reader chooses to continue
	warning?: string;
	// Note shown above the post, such as how it was written
	disclaimer?: string;
}

export interface PostSummary extends PostMeta {
	slug: string;
}

export function fmtPostDate(date: string): string {
	// Read as UTC so the day doesn't shift with the visitor's timezone
	return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
