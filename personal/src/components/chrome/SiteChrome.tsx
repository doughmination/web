/* src/components/chrome/SiteChrome.tsx
 * ESAL-2.3
 */

"use client";

import { useEffect } from "react";
import { initCore } from "@scripts/core";

/* Boots the global site shell (core.ts) once, client-only: the realtime DM
   client, nav builder, theme boot, bg-music gate, and the oneko cat + picker.
   Renders nothing — it just wires up window-level globals the rest of the app
   (and the vanilla-turned-React widgets) depend on. */
export default function SiteChrome({ catSrc }: { catSrc?: string }) {
  useEffect(() => {
    initCore(catSrc);
  }, [catSrc]);
  return null;
}
