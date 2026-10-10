// src/routes/sitemap.xml/+server.ts
// DASL-1.2 — (c) Clove Twilight

import { websiteUrl } from '#lib';

// Built once at build time into a static sitemap.xml
export const prerender = true;

// Every route with a page, so new pages show up without touching this file.
// Redirect-only routes (invite, dev-info) have no +page.svelte and are skipped.
const pages = Object.keys(import.meta.glob('../**/+page.svelte'))
	.map((file) => file.replace(/^\.\.|\/\+page\.svelte$/g, '') || '/')
	.filter((path) => !path.includes('['))
	.sort();

export function GET() {
	const urls = pages
		.map((path) => `\t<url>\n\t\t<loc>${websiteUrl}${path}</loc>\n\t</url>`)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
