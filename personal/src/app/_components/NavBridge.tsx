"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Bridges core.js's imperative navigation to Next's client-side router.
 *
 * core.js builds the nav and, on click, calls window.ctpNavigate(url). By
 * pointing that at router.push we get client-side navigation: the root layout
 * (and the background-music <audio> that core.js appends to <body>) never
 * unloads, so music keeps playing across pages while each route's scripts
 * still load fresh (see PageScripts.tsx).
 */
export default function NavBridge() {
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    // core.js only runs buildNav() once on load; refresh the active link after
    // each client navigation.
    const w = window as unknown as { ctpBuildNav?: () => void };
    w.ctpBuildNav?.();
  }, [pathname]);

  return null;
}
