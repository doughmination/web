/* status/src/app/api/auth/login/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Start the PocketID login: stash PKCE state, redirect to authorize. */

import { NextRequest, NextResponse } from "next/server";

import { buildAuthUrl } from "@lib/oidc";
import { savePending } from "@lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/admin";

  try {
    const { url, pending } = await buildAuthUrl(returnTo);
    await savePending(pending);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
