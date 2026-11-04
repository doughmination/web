/* src/lib/scripts/plural.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Fronting and device state from the Doughmination API
// (https://doughmination.uk, see /docs there)

import { api } from '#lib/scripts/api.ts';
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

// Both are kept until the socket says they've changed
export function fetchFronters(): Promise<Member[]> {
	return cached(
		'fronters',
		async () => (await api<{ members: Member[] }>('/v2/plural/fronters')).members ?? [],
		{ events: ['fronters_update', 'reconnect'] }
	);
}

export function fetchDevice(device: string): Promise<Device> {
	return cached(
		`device:${device}`,
		() => api<Device>(`/v2/devices/${encodeURIComponent(device)}`),
		{
			events: ['device_update', 'reconnect']
		}
	);
}

export function memberName(m: Member): string {
	return m.display_name || m.name;
}
