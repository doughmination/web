// src/routes/admin/+page.server.ts
// DASL-1.2 — (c) Clove Twilight

import { fail, redirect } from '@sveltejs/kit';

import { endSession, requireSession } from '#lib/server/sso.ts';
import {
	deleteEntry,
	getBlocklist,
	listEntries,
	saveBlocklist,
	setStatus
} from '#lib/server/guestbook.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = requireSession(cookies);
	const [entries, blocklist] = await Promise.all([listEntries(), getBlocklist()]);
	return { name: session.name, ...entries, words: blocklist.words };
};

// Every action checks the session again: a form post doesn't run load first.
async function run(cookies: Parameters<typeof requireSession>[0], task: () => Promise<unknown>) {
	requireSession(cookies);
	try {
		await task();
	} catch (err) {
		return fail(502, { error: err instanceof Error ? err.message : 'Request failed' });
	}
}

const entryId = async (request: Request) => String((await request.formData()).get('id') ?? '');

export const actions: Actions = {
	approve: async ({ cookies, request }) => {
		const id = await entryId(request);
		return run(cookies, () => setStatus(id, 'approved'));
	},
	hold: async ({ cookies, request }) => {
		const id = await entryId(request);
		return run(cookies, () => setStatus(id, 'pending'));
	},
	delete: async ({ cookies, request }) => {
		const id = await entryId(request);
		return run(cookies, () => deleteEntry(id));
	},
	blocklist: async ({ cookies, request }) => {
		const words = String((await request.formData()).get('words') ?? '')
			.split('\n')
			.map((w) => w.trim())
			.filter(Boolean);
		const failed = await run(cookies, () => saveBlocklist(words));
		return failed ?? { saved: true };
	},
	logout: async ({ cookies }) => {
		endSession(cookies);
		redirect(303, '/');
	}
};
