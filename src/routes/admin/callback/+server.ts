// src/routes/admin/callback/+server.ts
// DASL-1.2 — (c) Clove Twilight

import { completeLogin } from '#lib/server/sso.ts';

export const GET = completeLogin;
