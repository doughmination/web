/* status/src/app/api/services/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Admin-only: list, add, and remove monitored services. */

import { NextRequest, NextResponse } from "next/server";

import {
  listServices,
  addService,
  removeService,
} from "@lib/store";
import {
  readSession,
  isAdmin,
} from "@lib/session";

export const dynamic = "force-dynamic";

async function guard(): Promise<NextResponse | null> {
  const session = await readSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;

  const services = await listServices();
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    url?: string;
    container?: string;
    expectBelow?: number;
  } | null;

  const name = body?.name?.trim();
  const url = body?.url?.trim();
  const container = body?.container?.trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!url && !container) {
    return NextResponse.json(
      { error: "provide a url, a container, or both" },
      { status: 400 },
    );
  }
  if (url) {
    try {
      // Reject anything that is not a real http(s) URL.
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("bad protocol");
      }
    } catch {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }
  }

  const service = await addService({
    name,
    url,
    container,
    expectBelow: body?.expectBelow,
  });
  return NextResponse.json({ service }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await removeService(id);
  return NextResponse.json({ ok: true });
}
