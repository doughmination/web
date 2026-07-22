/* src/scripts/Guestbook.tsx
 * ESAL-2.3
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeartFill, type Icon } from "react-bootstrap-icons";

/* Ported from guestbook.js — the sign form (with honeypot + optional Cloudflare
   Turnstile) and the list of entries. */

type Entry = { name: string; website?: string; message: string; ts: number };
/* `icon` holds the component itself rather than an icon name. The name-based
   version built a class string at runtime, so a typo failed silently as a blank
   glyph and nothing could statically verify it; this way the compiler does. */
type Status = { text: string; kind?: "err" | "ok"; icon?: Icon };

declare global {
  interface Window {
    turnstile?: { getResponse: () => string; reset: () => void };
  }
}

function relTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

type Props = { api: string; turnstileKey?: string };

export default function Guestbook({ api, turnstileKey }: Props) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<Entry[] | null>(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const hpRef = useRef<HTMLInputElement | null>(null);

  const loadEntries = useCallback(async () => {
    if (!api) {
      setEntries([]);
      setStatus({ text: "Guestbook API not configured yet.", kind: "err" });
      return;
    }
    try {
      const res = await fetch(`${api}?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [api]);

  useEffect(() => {
    void (async () => {
      await loadEntries();
    })();
  }, [loadEntries]);

  // Load the Cloudflare Turnstile script once (it auto-renders .cf-turnstile).
  useEffect(() => {
    if (!turnstileKey) return;
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [turnstileKey]);

  function turnstileToken(): string {
    try {
      if (window.turnstile?.getResponse) return window.turnstile.getResponse() || "";
    } catch {
      /* not ready */
    }
    const input = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
    return input ? input.value : "";
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!api) {
      setStatus({ text: "Guestbook API not configured yet.", kind: "err" });
      return;
    }
    if (!name.trim() || !message.trim()) {
      setStatus({ text: "Name and message are both required.", kind: "err" });
      return;
    }
    const payload: Record<string, string> = {
      name,
      website,
      message,
      url2: hpRef.current?.value || "", // honeypot
    };
    if (turnstileKey) {
      const token = turnstileToken();
      if (!token) {
        setStatus({ text: "Please complete the captcha first.", kind: "err" });
        return;
      }
      payload.turnstileToken = token;
    }

    setSubmitting(true);
    setStatus({ text: "Signing…" });
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ text: data.error || "Something went wrong. Try again.", kind: "err" });
        return;
      }
      setStatus({ text: "Thanks for signing!", kind: "ok", icon: HeartFill });
      setName("");
      setWebsite("");
      setMessage("");
      try {
        window.turnstile?.reset?.();
      } catch {
        /* ignore */
      }
      await loadEntries();
    } catch {
      setStatus({ text: "Network error, please try again.", kind: "err" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="gb-form" autoComplete="off" noValidate onSubmit={onSubmit}>
        <div className="gb-field">
          <label htmlFor="gb-name">Name</label>
          <input
            type="text"
            id="gb-name"
            name="name"
            maxLength={40}
            required
            placeholder="what should I call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="gb-field">
          <label htmlFor="gb-website">
            Website <span className="gb-optional">(optional)</span>
          </label>
          <input
            type="url"
            id="gb-website"
            name="website"
            maxLength={200}
            placeholder="https://your-cool-site.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div className="gb-field">
          <label htmlFor="gb-message">Message</label>
          <textarea
            id="gb-message"
            name="message"
            maxLength={500}
            rows={3}
            required
            placeholder="say hi!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <span className="gb-counter">{message.length} / 500</span>
        </div>

        {/* Honeypot: hidden from humans, bots tend to fill it. */}
        <div className="gb-hp" aria-hidden="true">
          <label htmlFor="gb-url2">Leave this empty</label>
          <input type="text" id="gb-url2" name="url2" tabIndex={-1} autoComplete="off" ref={hpRef} />
        </div>

        {turnstileKey ? (
          <div className="cf-turnstile gb-turnstile" data-sitekey={turnstileKey} data-theme="dark" />
        ) : null}

        <div className="gb-actions">
          <button type="submit" disabled={submitting}>
            Sign guestbook
          </button>
          <span className={`gb-status${status?.kind ? ` gb-${status.kind}` : ""}`} role="status">
            {status?.icon ? <status.icon aria-hidden="true" /> : null}{" "}
            {status?.text}
          </span>
        </div>
      </form>

      <div className="gb-entries" aria-live="polite">
        {entries === null && !loadError ? (
          <p className="gb-empty">Loading messages…</p>
        ) : loadError ? (
          <p className="gb-empty">Could not load messages right now.</p>
        ) : entries && entries.length === 0 ? (
          <p className="gb-empty">No messages yet, be the first to sign!</p>
        ) : (
          entries?.map((e, i) => {
            const safeWeb = /^https?:\/\//i.test(e.website || "") ? e.website : null;
            return (
              <div className="gb-entry" key={i}>
                <div className="gb-entry-head">
                  <span className="gb-entry-name">
                    {safeWeb ? (
                      <a href={safeWeb} target="_blank" rel="noopener nofollow ugc">
                        {e.name}
                      </a>
                    ) : (
                      e.name
                    )}
                  </span>
                  <span className="gb-entry-time">{relTime(e.ts)}</span>
                </div>
                <div className="gb-entry-msg">{e.message}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
