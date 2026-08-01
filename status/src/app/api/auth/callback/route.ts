/* status/src/app/api/auth/callback/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Finish the PocketID login: verify state, exchange code, set session. */

import { NextRequest, NextResponse } from "next/server";

import { completeLogin } from "@lib/oidc";
import {
  takePending,
  createSession,
} from "@lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const origin = request.nextUrl.origin;

  const pending = await takePending();

  if (!code || !state || !pending) {
    return NextResponse.redirect(`${origin}/?error=login`);
  }
  if (state !== pending.state) {
    return NextResponse.redirect(`${origin}/?error=state`);
  }

  try {
    const identity = await completeLogin(code, pending);
    await createSession(identity);
    const returnTo = pending.returnTo.startsWith("/") ? pending.returnTo : "/admin";
    return NextResponse.redirect(`${origin}${returnTo}`);
  } catch {
    return NextResponse.redirect(`${origin}/?error=login`);
  }
}
