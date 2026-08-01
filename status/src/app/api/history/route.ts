/* status/src/app/api/history/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Public: 90-day daily uptime ratios per service. */

import { NextResponse } from "next/server";

import { getHistory } from "@lib/history";

export const dynamic = "force-dynamic";

export async function GET() {
  const history = await getHistory(90);
  return NextResponse.json({ history });
}
