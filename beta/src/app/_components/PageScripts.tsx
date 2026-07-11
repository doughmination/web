"use client";

import { useEffect } from "react";

export type PageScript =
  | string
  | { src: string; attrs?: Record<string, string> }
  | { inline: string; module?: boolean };

/**
 * Loads a route's vanilla page scripts (terminal.js, discord.js, …) on mount
 * and tears them down on unmount, so client-side navigation runs them fresh
 * every visit without stacking duplicate intervals/listeners.
 *
 * Scripts load strictly in order: each external script's `load` is awaited
 * before the next entry, so an inline entry (e.g. dev-info's
 * `ContribHeatmap.render(...)`) can safely depend on an external loaded just
 * before it.
 *
 * Teardown reuses core.js's own machinery: on unmount we enable its interval/
 * listener tracking and sweep it (window.ctpEnableTracking / ctpClearPageState).
 * Mirroring the original soft-nav, the very first page's scripts run untracked
 * (tracking only switches on once we leave a page), which is fine — that page's
 * chrome is torn down when React unmounts it anyway.
 */
export default function PageScripts({ scripts }: { scripts: PageScript[] }) {
  useEffect(() => {
    let cancelled = false;
    const added: HTMLScriptElement[] = [];

    function appendExternal(src: string, attrs?: Record<string, string>) {
      return new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = false; // preserve source order across the inserted batch
        if (attrs) {
          for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
        }
        s.addEventListener("load", () => resolve(), { once: true });
        s.addEventListener("error", () => resolve(), { once: true });
        document.body.appendChild(s);
        added.push(s);
      });
    }

    function appendInline(code: string, module?: boolean) {
      const s = document.createElement("script");
      if (module) s.type = "module";
      s.textContent = code;
      document.body.appendChild(s);
      added.push(s);
    }

    (async () => {
      for (const item of scripts) {
        if (cancelled) return;
        if (typeof item === "string") {
          await appendExternal(item);
        } else if ("inline" in item) {
          appendInline(item.inline, item.module);
        } else {
          await appendExternal(item.src, item.attrs);
        }
      }
    })();

    return () => {
      cancelled = true;
      const w = window as unknown as {
        ctpEnableTracking?: () => void;
        ctpClearPageState?: () => void;
      };
      // From here on, page-registered intervals/listeners are tracked so the
      // next navigation can sweep them.
      w.ctpEnableTracking?.();
      w.ctpClearPageState?.();
      added.forEach((s) => s.remove());
    };
    // scripts is a static per-route list; intentionally run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
