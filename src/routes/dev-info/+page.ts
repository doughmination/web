// src/routes/dev-info/+page.ts
// DASL-1.2 — (c) Clove Twilight

import { redirect } from '@sveltejs/kit';

// The old site's hardware list lives on /specs now
export function load() {
	redirect(301, '/specs');
}
