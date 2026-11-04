/* src/lib/server/guestbook.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Guestbook moderation, called only from the admin page's server code. The
// key never leaves this server.

import { error } from '@sveltejs/kit';
import { GUESTBOOK_ADMIN_KEY } from '$app/env/private';

import { api } from '#lib/scripts/api.ts';
import type { AdminEntry } from '#lib/scripts/guestbook.ts';

function admin<T>(path: string, init?: RequestInit): Promise<T> {
	const key = GUESTBOOK_ADMIN_KEY;
	if (!key) error(503, 'GUESTBOOK_ADMIN_KEY is not set');
	return api<T>(`/v2/guestbook/admin${path}`, {
		...init,
		headers: { 'X-Guestbook-Key': key }
	});
}

export const listEntries = () =>
	admin<{ entries: AdminEntry[]; total: number; pending: number }>('/entries');

export const setStatus = (id: string, status: AdminEntry['status']) =>
	admin(`/entries/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify({ status })
	});

export const deleteEntry = (id: string) =>
	admin(`/entries/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const getBlocklist = () => admin<{ words: string[] }>('/blocklist');

export const saveBlocklist = (words: string[]) =>
	admin<{ words: string[] }>('/blocklist', { method: 'PUT', body: JSON.stringify({ words }) });
