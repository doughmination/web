/* src/lib/scripts/api.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// One client for every call to the Doughmination API (https://doughmination.uk,
// see /docs there). Routes either return the payload bare with errors as
// { detail } / { error }, or wrap it in a { success, data, error } envelope.

import { apiBase } from '#lib';
import { cached } from '#lib/scripts/cache.ts';
import { ApiError, type ErrorBody, errorMessage } from '#lib/scripts/errors';

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

/** A bare-payload route. Throws ApiError on any non-2xx response. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(apiBase + path, {
		...init,
		headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers }
	});
	const body = (await res.json().catch(() => null)) as (T & ErrorBody) | null;
	if (!res.ok) throw new ApiError(errorMessage(body, res.status), res.status);
	return body as T;
}

/** A { success, data } route, unwrapped to its data. */
export async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
	const body = await api<{ success: boolean; data?: T } & ErrorBody>(path, init);
	if (!body.success || body.data === undefined) throw new ApiError(errorMessage(body, 200), 200);
	return body.data;
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