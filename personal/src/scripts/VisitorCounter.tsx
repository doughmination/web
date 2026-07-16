"use client";

import { useEffect, useState } from "react";

/* Ported from visitor-counter.js — a pixel-digit hit counter (via Abacus).
   Caches per tab-session so a refresh doesn't re-increment the count. */

type Props = {
  namespace?: string;
  /** Abacus key (named hitKey since `key` is reserved in React). */
  hitKey?: string;
  label?: string;
  imgPath?: string;
  imgExt?: string;
};

function storeKey(ns: string, key: string) {
  return `vc:${ns}:${key}`;
}

/* Cached count for this tab-session, or null. A refresh keeps the same
   sessionStorage token; a new tab starts fresh. */
function getCached(ns: string, key: string): number | null {
  try {
    const raw = localStorage.getItem(storeKey(ns, key));
    if (!raw) return null;
    const { count, session } = JSON.parse(raw);
    const token = sessionStorage.getItem("vc-session");
    return token && token === session ? count : null;
  } catch {
    return null;
  }
}

function setCached(ns: string, key: string, count: number) {
  try {
    let token = sessionStorage.getItem("vc-session");
    if (!token) {
      token = Math.random().toString(36).slice(2);
      sessionStorage.setItem("vc-session", token);
    }
    localStorage.setItem(storeKey(ns, key), JSON.stringify({ count, session: token }));
  } catch {
    /* storage unavailable — just skip caching */
  }
}

export default function VisitorCounter({
  namespace = "clove-is-a-dev",
  hitKey = "hits",
  label = "visitors",
  imgPath = "/assets/numbers/",
  imgExt = ".png",
}: Props) {
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
    <div id="visitor-counter" className="vc-root" role="status" aria-label="Visitor count">
      {error ? (
        <span className="vc-error">?? visitors</span>
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
          {label ? <span className="vc-label">{label}</span> : null}
        </>
      )}
    </div>
  );
}
