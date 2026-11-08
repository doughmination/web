/* src/lib/scripts/headingAnchors.ts
 * DASL-1.2 — (c) Clove Twilight
 */

import { mount, unmount } from 'svelte';
import IcLink from '~icons/ic/outline-link';

// "Update: I Think I Kinda Fell…" → "update-i-think-i-kinda-fell"
function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// Gives each h2/h3 in a post an id and a hover link to it, so sections can be shared
export function headingAnchors(container: HTMLElement) {
	const usedIds = new Set<string>();
	const mountedIcons: ReturnType<typeof mount>[] = [];
	const addedLinks: HTMLAnchorElement[] = [];

	for (const heading of container.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
		const headingText = heading.textContent?.trim() ?? '';
		const baseId = heading.id || slugify(headingText) || 'section';

		// Two headings with the same text get -2, -3 and so on
		let uniqueId = baseId;
		let suffix = 2;

		while (usedIds.has(uniqueId)) {
			uniqueId = `${baseId}-${suffix}`;
			suffix += 1;
		}

		usedIds.add(uniqueId);
		heading.id = uniqueId;

		const link = document.createElement('a');
		link.className = 'heading-anchor';
		link.href = `#${uniqueId}`;
		link.setAttribute('aria-label', `Link to section: ${headingText}`);

		mountedIcons.push(
			mount(IcLink, {
				target: link,
				props: {
					'aria-hidden': 'true'
				}
			})
		);

		heading.append(link);
		addedLinks.push(link);
	}

	// The ids only exist after hydration, so the browser's own jump-to-hash on load misses them
	const targetId = decodeURIComponent(location.hash.slice(1));

	if (targetId) {
		document.getElementById(targetId)?.scrollIntoView();
	}

	return {
		destroy() {
			for (const icon of mountedIcons) {
				unmount(icon);
			}

			for (const link of addedLinks) {
				link.remove();
			}
		}
	};
}
