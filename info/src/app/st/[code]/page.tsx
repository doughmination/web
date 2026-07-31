/* info/src/app/st/[code]/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/st/[code]/page.tsx */

import { redirect } from "next/navigation";

// /st/<code> drops the visitor on signup with their code prefilled.
export default async function StCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const clean = (code || "").replace(/[^A-Za-z0-9._-]/g, "");
  redirect(`/signup?code=${encodeURIComponent(clean)}`);
}
