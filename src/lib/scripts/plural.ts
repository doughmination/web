/* src/lib/scripts/plural.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Fronting and device state from the Doughmination API
// (https://doughmination.uk, see /docs there)
import { ApiError, type ErrorBody, errorMessage } from '#lib/scripts/errors';
import { cached } from '#lib/scripts/cache.ts';
import { pluralBase } from '#lib';

async function pluralApi<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(pluralBase + path, {
		...init,
		headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers }
	});
	const body = (await res.json().catch(() => null)) as (T & ErrorBody) | null;
	if (!res.ok) throw new ApiError(errorMessage(body, res.status), res.status);
	return body as T;
}

export interface Member {
	id: string;
	name: string;
	display_name: string | null;
	pronouns: string | null;
	color: string | null;
	avatar_url: string | null;
	tags: string[];
	status: { text: string; emoji: string | null; updated_at: string } | null;
}

// Both are kept until the socket says they've changed
export function fetchFronters(): Promise<Member[]> {
	return cached(
		'fronters',
		async () => (await pluralApi<{ members: Member[] }>('/plural/fronters')).members ?? [],
		{ events: ['fronters_update', 'reconnect'] }
	);
}

export function memberName(m: Member): string {
	return m.display_name || m.name;
}
