/* personal/src/scripts/VisitorCounter.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

/* Ported from visitor-counter.js — a pixel-digit hit counter (via Abacus).
   Caches per tab-session so a refresh doesn't re-increment the count. */

type Props = {
  namespace?: string;
  /** Abacus key (named hitKey since `key` is reserved in React). */
  hitKey?: string;
  /** Overrides the translated default ("visitors" / "訪問者" / "visitantes"). */
  label?: string;
  imgPath?: string;
  imgExt?: string;
};

function storeKey(ns: string, key: string) {
  return `${ns}:${key}`;
}

/* Cached count for this tab-session, or null. A refresh keeps the same
   sessionStorage token; a new tab starts fresh. */
function getCached(ns: string, key: string): number | null {
  try {
    const raw = window.localStorage.getItem(storeKey(ns, key));
    if (!raw) return null;
    const { count, session } = JSON.parse(raw);
    const token = window.sessionStorage.getItem("vc-session");
    return token && token === session ? count : null;
  } catch {
    return null;
  }
}

function setCached(ns: string, key: string, count: number) {
  try {
    let token = window.sessionStorage.getItem("vc-session");
    if (!token) {
      token = Math.random().toString(36).slice(2);
      window.sessionStorage.setItem("vc-session", token);
    }
    window.localStorage.setItem(storeKey(ns, key), JSON.stringify({
      count,
      session: token
    }));
  } catch {
    /* storage unavailable — just skip caching */
  }
}

export default function VisitorCounter({
  namespace = "dough",
  hitKey = "hits",
  label,
  imgPath = "https://m.doughmination.gay/img/numbers/",
  imgExt = ".png",
}: Props) {
  const { t } = useLanguage();
  const resolvedLabel = label ?? t("visitorCounter.label");
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cached = getCached(namespace, hitKey);
      if (cached !== null) {
        if (!cancelled) setCount(cached);
        return;
      }
      try {
        const r = await fetch(
          `https://abacus.jasoncameron.dev/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(hitKey)}`,
        );
        if (!r.ok) throw new Error(`Abacus HTTP ${r.status}`);
        const data: { value?: number } = await r.json();
        if (typeof data.value !== "number") throw new Error("Unexpected response shape");
        setCached(namespace, hitKey, data.value);
        if (!cancelled) setCount(data.value);
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [namespace, hitKey]);

  return (
    <div id="visitor-counter" className="vc-root" role="status" aria-label={t("visitorCounter.ariaLabel")}>
      {error ? (
        <span className="vc-error">{t("visitorCounter.error")}</span>
      ) : (
        <>
          <div className="vc-digits">
            {count === null
              ? null
              : String(Math.max(0, Math.floor(count)))
                .padStart(6, "0")
                .split("")
                .map((d, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={`${imgPath}${d}${imgExt}`} alt={d} width={22.5} height={50} />
                ))}
          </div>
          {resolvedLabel ? <span className="vc-label">{resolvedLabel}</span> : null}
        </>
      )}
    </div>
  );
}
