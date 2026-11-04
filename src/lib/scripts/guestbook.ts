/* src/lib/scripts/guestbook.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Guestbook on the Doughmination API. Posting goes straight from the browser,
// so the API's per-IP rate limit sees the visitor rather than this server.

import { api } from '#lib/scripts/api.ts';

export interface Entry {
	id: string;
	name: string;
	message: string;
	website: string;
	ts: number;
}

export interface AdminEntry extends Entry {
	status: 'approved' | 'pending';
	flagged?: string[];
}

export const LIMITS = { name: 40, message: 500, website: 200 } as const;

export function fetchEntries(limit = 50, offset = 0) {
	return api<{ entries: Entry[]; total: number }>(`/v2/guestbook?limit=${limit}&offset=${offset}`);
}

export interface Signature {
	name: string;
	message: string;
	website: string;
	/** Honeypot, left empty by people */
	url2: string;
	turnstileToken?: string;
}

/** Sign the guestbook. `pending` means the word filter held it for review. */
export function signGuestbook(signature: Signature) {
	return api<{ ok: true; entry?: Entry; pending?: true; skipped?: true }>('/v2/guestbook', {
		method: 'POST',
		body: JSON.stringify(signature)
	});
}
