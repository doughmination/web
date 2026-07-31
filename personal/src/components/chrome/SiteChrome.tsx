/* personal/src/components/chrome/SiteChrome.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
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
