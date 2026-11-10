/* src/lib/scripts/search.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Ctrl+K site search: the index shape (built by routes/search.json) and the
// scoring that ranks it as you type

export type SearchKind = 'page' | 'post' | 'section' | 'project' | 'link';

export interface SearchItem {
	kind: SearchKind;
	title: string;
	url: string;
	description?: string;
	// Page or post a section belongs to
	parent?: string;
	keywords?: string[];
}

export const KIND_LABEL: Record<SearchKind, string> = {
	page: 'Page',
	post: 'Post',
	section: 'Section',
	project: 'Project',
	link: 'Link'
};

// Small nudge so whole pages beat sections that match equally well
const KIND_BONUS: Record<SearchKind, number> = {
	page: 6,
	post: 4,
	project: 3,
	link: 2,
	section: 0
};

const MAX_RESULTS = 30;

let index: Promise<SearchItem[]> | undefined;

// Fetched on first open, then kept for the whole visit
export function loadIndex(): Promise<SearchItem[]> {
	index ??= fetch('/search.json')
		.then((res) => {
			if (!res.ok) throw new Error(`Search index failed (${res.status})`);
			return res.json() as Promise<SearchItem[]>;
		})
		.catch((err) => {
			index = undefined;
			throw err;
		});
	return index;
}

// Lowercase and drop accents, so "cafe" finds "Café"
function normalise(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '');
}

// Letters of the term appear in order, e.g. "npdn" in "npm to deno"
function isSubsequence(term: string, text: string): boolean {
	let position = 0;

	for (const letter of text) {
		if (letter === term[position]) position += 1;
		if (position === term.length) return true;
	}

	return false;
}

function scoreText(text: string, term: string, allowFuzzy: boolean): number {
	if (text === term) return 100;
	if (text.startsWith(term)) return 80;

	const at = text.indexOf(term);

	// Start of a word beats the middle of one
	if (at > 0 && /[^a-z0-9]/.test(text[at - 1])) return 60;
	if (at > 0) return 40;
	if (allowFuzzy && term.length >= 2 && isSubsequence(term, text)) return 15;

	return 0;
}

function scoreItem(item: SearchItem, terms: string[]): number {
	const title = normalise(item.title);
	const keywords = normalise((item.keywords ?? []).join(' '));
	const parent = normalise(item.parent ?? '');
	const description = normalise(item.description ?? '');

	let total = 0;

	for (const term of terms) {
		const best = Math.max(
			scoreText(title, term, true),
			scoreText(keywords, term, false) * 0.6,
			scoreText(parent, term, false) * 0.5,
			scoreText(description, term, false) * 0.4
		);

		// Every word typed has to match somewhere
		if (best === 0) return 0;

		total += best;
	}

	return total + KIND_BONUS[item.kind];
}

// With nothing typed, list every page so the palette doubles as a menu
export function search(items: SearchItem[], query: string): SearchItem[] {
	const terms = normalise(query).split(/\s+/).filter(Boolean);

	if (!terms.length) {
		return items.filter((item) => item.kind === 'page');
	}

	return items
		.map((item) => ({
			item,
			score: scoreItem(item, terms)
		}))
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, MAX_RESULTS)
		.map((result) => result.item);
}
