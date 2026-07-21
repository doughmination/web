/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Pings POST /helper on every route change so the backend can log the visit.
 * Renders nothing. Mounted in the root layout.
 *
 * Fires for ALL paths, including the 404 catch-all (which is the point —
 * the backend wants to see attempts at non-existent URLs too).
 */
const VisitorTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const path = `${pathname}${window.location.search}${window.location.hash}`;
    const body = JSON.stringify({ path });

    // Prefer sendBeacon when leaving the page; otherwise plain fetch.
    // Both are fire-and-forget — we never block rendering on the log call.
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        const ok = navigator.sendBeacon("https://doughmination.uk/v2/plural/helper", blob);
        if (ok) return;
      }
    } catch {
      // fall through to fetch
    }

    fetch("https://doughmination.uk/v2/plural/helper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Silently ignore — visitor logging must never break the UI.
    });
  }, [pathname]);

  return null;
};

export default VisitorTracker;
