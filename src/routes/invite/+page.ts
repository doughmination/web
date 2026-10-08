// src/routes/invite/+page.ts
// DASL-1.2 — (c) Clove Twilight

import { redirect } from '@sveltejs/kit';
import { discordInvite } from '#lib';

// Short link to the Discord server
export function load() {
	redirect(307, discordInvite, { external: true });
}
