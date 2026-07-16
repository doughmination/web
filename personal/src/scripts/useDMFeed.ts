"use client";

import { useEffect, useState } from "react";

/* The realtime client core.js exposes on window. `on` returns an unsubscribe;
   `request` is a cached on-demand REST lookup (guilds, members, etc.). */
type DMClient = {
  on: (topic: string, cb: (v: unknown) => void) => (() => void) | void;
  request?: (
    topic: string,
    params: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => Promise<unknown>;
};

declare global {
  interface Window {
    DM?: DMClient;
  }
}

/**
 * Subscribe a component to one of core.js's DM topics ("devices", "fronters", …).
 *
 * Mirrors the old vanilla scripts: subscribe to the live socket feed when DM is
 * ready (retrying briefly if core.js hasn't loaded yet), and fall back to a
 * one-shot REST fetch if nothing has arrived — so the widget still paints in
 * local dev where the socket may not push immediately. `pick` maps the raw DM/
 * REST payload to the shape the component wants (return null to ignore).
 */
export function useDMFeed<T>(
  topic: string,
  restUrl: string,
  pick: (raw: unknown) => T | null,
): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let painted = false;
    let cancelled = false;
    let off: (() => void) | void;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;

    const apply = (raw: unknown) => {
      const v = pick(raw);
      if (cancelled || v == null) return;
      painted = true;
      setData(v);
    };

    const directFetch = () => {
      fetch(restUrl, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j != null) apply(j); })
        .catch(() => {});
    };

    const attach = () => {
      if (cancelled) return;
      const dm = window.DM;
      if (dm) {
        off = dm.on(topic, apply);
        // Belt-and-suspenders: direct fetch if the socket hasn't delivered.
        timer = setTimeout(() => { if (!painted) directFetch(); }, 2500);
      } else if (tries++ < 50) {
        timer = setTimeout(attach, 100); // core.js not ready yet — retry
      } else {
        directFetch();
      }
    };
    attach();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (typeof off === "function") off();
    };
    // pick is intentionally omitted — topic/restUrl are stable, and pick is pure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, restUrl]);

  return data;
}
