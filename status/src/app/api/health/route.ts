/* status/src/app/api/health/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Public: current health of every configured service. */

import { NextResponse } from "next/server";

import { listServices } from "@lib/store";
import { checkAll } from "@lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await listServices();
  const results = await checkAll(services);
  return NextResponse.json({ results });
}
