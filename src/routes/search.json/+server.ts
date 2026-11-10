// src/routes/search.json/+server.ts
// DASL-1.2 — (c) Clove Twilight

import {
	blueskyUrl,
	contactEmail,
	discordInvite,
	githubUrl,
	linkedinUrl,
	twitchUrl,
	twitterUrl,
	youtubeUrl
} from '#lib';
import type { PostMeta } from '#lib/scripts/blog.ts';
import { PROJECT_GROUPS } from '#lib/scripts/projects.ts';
import type { SearchItem } from '#lib/scripts/search.ts';
import { slugify } from '#lib/scripts/slugify.ts';

// Built once at build time into a static search.json, read by the Ctrl+K palette
export const prerender = true;

// Every page's source, so new pages are searchable without touching this file
const sources = import.meta.glob<string>('../**/+page.svelte', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const posts = import.meta.glob<PostMeta>('../blog/*/+page.svelte', {
	eager: true,
	import: 'metadata'
});

const ENTITIES: Record<string, string> = {
	'&apos;': "'",
	'&#39;': "'",
	'&quot;': '"',
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&nbsp;': ' '
};

function decode(text: string): string {
	return text.replace(/&[#a-z0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity).trim();
}

// "../blog/arch-btw/+page.svelte" → "/blog/arch-btw"
function routePath(file: string): string {
	return file.replace(/^\.\.|\/\+page\.svelte$/g, '') || '/';
}

// title="…" or title='…' inside the page's <Meta … /> tag
function metaAttribute(source: string, name: string): string | undefined {
	const tag = /<Meta\b[\s\S]*?\/>/.exec(source)?.[0] ?? '';
	const match = new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`).exec(tag);
	const value = match?.[1] ?? match?.[2];

	return value ? decode(value) : undefined;
}

// Plain-text headings only; ones built from {expressions} are skipped
function headings(source: string, levels: string): string[] {
	const pattern = new RegExp(`<h([${levels}])\\b[^>]*>([^<{]+)</h\\1>`, 'g');

	return [...source.matchAll(pattern)].map((match) => decode(match[2])).filter(Boolean);
}

function pageItems(): SearchItem[] {
	const items: SearchItem[] = [];

	for (const [file, source] of Object.entries(sources)) {
		const path = routePath(file);

		// Admin is private, [params] routes have no single page, posts are added below
		if (path.startsWith('/admin') || path.includes('[')) continue;
		if (file in posts) continue;

		const title = metaAttribute(source, 'title') ?? headings(source, '1')[0] ?? path;

		items.push({
			kind: 'page',
			title,
			url: path,
			description: metaAttribute(source, 'description'),
			keywords: headings(source, '123').filter((heading) => heading !== title)
		});
	}

	// Home first, then A to Z
	return items.sort((a, b) => {
		if (a.url === '/') return -1;
		if (b.url === '/') return 1;

		return a.title.localeCompare(b.title);
	});
}

// Each post, plus its h2/h3 sections linked straight to their anchors
function postItems(): SearchItem[] {
	const items: SearchItem[] = [];

	const sorted = Object.entries(posts).sort(([, a], [, b]) => b.date.localeCompare(a.date));

	for (const [file, meta] of sorted) {
		const url = routePath(file);

		items.push({
			kind: 'post',
			title: meta.title,
			url,
			description: meta.excerpt,
			keywords: meta.tags
		});

		// A content warning hides the post until the reader continues, so its anchors don't exist yet
		if (meta.warning) continue;

		const usedIds = new Set<string>();

		for (const heading of headings(sources[file] ?? '', '23')) {
			// Same -2, -3 suffixes as headingAnchors.ts gives repeated headings
			const baseId = slugify(heading) || 'section';
			let uniqueId = baseId;
			let suffix = 2;

			while (usedIds.has(uniqueId)) {
				uniqueId = `${baseId}-${suffix}`;
				suffix += 1;
			}

			usedIds.add(uniqueId);

			items.push({
				kind: 'section',
				title: heading,
				url: `${url}#${uniqueId}`,
				parent: meta.title,
				keywords: meta.tags
			});
		}
	}

	return items;
}

function projectItems(): SearchItem[] {
	return PROJECT_GROUPS.flatMap((group) =>
		group.projects.map((project) => ({
			kind: 'project' as const,
			title: project.title,
			url: project.href ?? project.live ?? '/projects',
			description: project.bio,
			parent: group.heading
		}))
	);
}

const LINKS: SearchItem[] = [
	{
		kind: 'link',
		title: 'GitHub',
		url: githubUrl
	},
	{
		kind: 'link',
		title: 'Discord server',
		url: discordInvite,
		keywords: ['invite', 'join']
	},
	{
		kind: 'link',
		title: 'Email',
		url: `mailto:${contactEmail}`,
		description: contactEmail,
		keywords: ['contact', 'mail']
	},
	{
		kind: 'link',
		title: 'Bluesky',
		url: blueskyUrl
	},
	{
		kind: 'link',
		title: 'X / Twitter',
		url: twitterUrl
	},
	{
		kind: 'link',
		title: 'LinkedIn',
		url: linkedinUrl
	},
	{
		kind: 'link',
		title: 'Twitch',
		url: twitchUrl,
		keywords: ['stream']
	},
	{
		kind: 'link',
		title: 'YouTube',
		url: youtubeUrl,
		keywords: ['video']
	}
];

export function GET() {
	const items = [...pageItems(), ...postItems(), ...projectItems(), ...LINKS];

	return new Response(JSON.stringify(items), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
