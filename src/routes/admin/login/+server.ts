// src/routes/admin/login/+server.ts
// DASL-1.2 — (c) Clove Twilight

import { beginLogin } from '#lib/server/sso.ts';

export const GET = beginLogin;
