/* src/lib/scripts/slugify.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// "Update: I Think I Kinda Fell…" → "update-i-think-i-kinda-fell"
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
