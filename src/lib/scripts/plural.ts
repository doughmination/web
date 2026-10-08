/* src/lib/scripts/plural.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Fronting and device state from the Doughmination API
// (https://doughmination.uk, see /docs there)

import { API_BASE } from '#lib/scripts/discord.ts';
import { cached } from '#lib/scripts/cache.ts';

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

export interface Device {
	device: string;
	level?: number;
	charging?: boolean;
	lowPowerMode?: boolean;
	wifi?: string;
	watch?: boolean;
	airpods?: boolean;
	updated_at: string;
}

// Unlike the Discord routes, these return the payload bare rather than in
// a { success, data } envelope, and errors as { detail }
async function get<T>(path: string): Promise<T> {
	const res = await fetch(API_BASE + path);
	const body = (await res.json()) as T & { detail?: string };
	if (!res.ok) throw new Error(body?.detail ?? `Request failed (${res.status})`);
	return body as T;
}

// Both are kept until the socket says they've changed
export function fetchFronters(): Promise<Member[]> {
	return cached(
		'fronters',
		async () => (await get<{ members: Member[] }>('/v2/plural/fronters')).members ?? [],
		{ events: ['fronters_update', 'reconnect'] }
	);
}

export function fetchDevice(device: string): Promise<Device> {
	return cached(
		`device:${device}`,
		() => get<Device>(`/v2/devices/${encodeURIComponent(device)}`),
		{
			events: ['device_update', 'reconnect']
		}
	);
}

export function memberName(m: Member): string {
	return m.display_name || m.name;
}
