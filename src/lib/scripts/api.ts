/* src/lib/scripts/api.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// One client for every call to the Doughmination API (https://doughmination.uk,
// see /docs there). Routes either return the payload bare with errors as
// { detail } / { error }, or wrap it in a { success, data, error } envelope.

import { apiBase } from '#lib';

export class ApiError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
	}
}

type ErrorBody = { detail?: string; error?: string | { message?: string } };

function errorMessage(body: ErrorBody | null, status: number): string {
	const error = typeof body?.error === 'string' ? body.error : body?.error?.message;
	return body?.detail ?? error ?? `Request failed (${status})`;
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
