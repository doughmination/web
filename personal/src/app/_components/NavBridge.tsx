/* personal/src/app/_components/NavBridge.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bridges core.ts's remaining imperative links to Next's client-side router.
 *
 * core.ts still routes [data-href] elements (project cards, the 88x31 → /discord
 * link, etc.) through window.ctpNavigate(url). Pointing that at router.push gives
 * client-side navigation: the root layout — and the background-music <audio>
 * core.ts appends to <body> — never unloads, so music keeps playing across
 * pages. (The nav itself is now React/next/link via NavMenu.)
 */
export default function NavBridge() {
  const router = useRouter();

  useEffect(() => {
    const w = window as unknown as {
      ctpNavigate?: (url: string) => void;
    };
    w.ctpNavigate = (url: string) => {
      try {
        const dest = new URL(url, location.href);
        if (dest.origin === location.origin) {
          router.push(dest.pathname + dest.search + dest.hash);
        } else {
          location.href = url;
        }
      } catch {
        location.href = url;
      }
    };
  }, [router]);

  return null;
}
