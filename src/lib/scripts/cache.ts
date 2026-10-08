/* src/lib/scripts/cache.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// API responses kept for the whole visit, so moving between pages doesn't
// refetch everything. An entry expires after `ttl` ms, or straight away when
// the live socket reports one of its `events` (see discord.ts). Failed
// requests aren't kept, so the next caller tries again.

interface Entry {
	value: Promise<unknown>;
	expires: number;
	events: string[];
}

const entries = new Map<string, Entry>();

export function cached<T>(
	key: string,
	load: () => Promise<T>,
	{ ttl = 5 * 60_000, events = [] }: { ttl?: number; events?: string[] } = {}
): Promise<T> {
	const hit = entries.get(key);
	if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;

	const value = load();
	entries.set(key, { value, expires: Date.now() + ttl, events });
	value.catch(() => {
		if (entries.get(key)?.value === value) entries.delete(key);
	});
	return value;
}

export function invalidateOn(event: string) {
	for (const [key, entry] of entries) {
		if (entry.events.includes(event)) entries.delete(key);
	}
}
