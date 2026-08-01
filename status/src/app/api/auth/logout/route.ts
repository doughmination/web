/* status/src/app/api/auth/logout/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Clear the session, then bounce through PocketID end-session if configured. */

import { NextRequest, NextResponse } from "next/server";

import { endSessionUrl } from "@lib/oidc";
import { destroySession } from "@lib/session";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  await destroySession();
  const end = await endSessionUrl();
  return NextResponse.redirect(end || `${request.nextUrl.origin}/`);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
