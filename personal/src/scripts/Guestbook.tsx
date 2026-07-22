/* src/scripts/Guestbook.tsx
 * ESAL-2.3
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { HeartFill, type Icon } from "react-bootstrap-icons";
import { useGuestbook, useGuestbookPost } from "@doughmination/react-api";

/* Ported from guestbook.js — the sign form (with honeypot + optional Cloudflare
   Turnstile) and the list of entries. Reads + writes now go through the wrapper
   (useGuestbook / useGuestbookPost); the honeypot is enforced client-side here
   because the wrapper's post input doesn't carry the url2 field. */

/* `icon` holds the component itself rather than an icon name. The name-based
   version built a class string at runtime, so a typo failed silently as a blank
   glyph and nothing could statically verify it; this way the compiler does. */
type Status = {
  text: string;
  kind?: "err" | "ok";
  icon?: Icon;
};

declare global {
  interface Window {
    turnstile?: {
      getResponse: () => string;
      reset: () => void;
    };
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

type Props = {
  turnstileKey?: string;
};

export default function Guestbook({ turnstileKey }: Props) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const hpRef = useRef<HTMLInputElement | null>(null);

  // Reads: seeded from GET /v2/guestbook, kept fresh by the post mutation's
  // cache invalidation.
  const { data, isPending, isError } = useGuestbook({ limit: 100 });
  const entries = data?.entries ?? [];

  // Writes: the mutation resolves Turnstile + invalidates the list on success.
  const post = useGuestbookPost();
  const submitting = post.isPending;

  // Load the Cloudflare Turnstile script once (it auto-renders .cf-turnstile).
  useEffect(() => {
    if (!turnstileKey) return;
    if (
      document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]',
      )
    ) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [turnstileKey]);

  function turnstileToken(): string {
    try {
      if (window.turnstile?.getResponse) {
        return window.turnstile.getResponse() || "";
      }
    } catch {
      /* not ready */
    }
    const input = document.querySelector<HTMLInputElement>(
      '[name="cf-turnstile-response"]',
    );
    return input ? input.value : "";
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !message.trim()) {
      setStatus({ text: "Name and message are both required.", kind: "err" });
      return;
    }

    // Honeypot: hidden field, filled only by bots. Mirror the server's silent
    // drop — fake success, never hit the API. The wrapper doesn't forward url2,
    // so the trap has to be sprung here.
    if (hpRef.current?.value) {
      setStatus({ text: "Thanks for signing!", kind: "ok", icon: HeartFill });
      setName("");
      setWebsite("");
      setMessage("");
      return;
    }

    let token: string | undefined;
    if (turnstileKey) {
      token = turnstileToken();
      if (!token) {
        setStatus({ text: "Please complete the captcha first.", kind: "err" });
        return;
      }
    }

    setStatus({ text: "Signing…" });
    try {
      await post.mutateAsync({
        name,
        website,
        message,
        turnstileToken: token,
      });

      setStatus({ text: "Thanks for signing!", kind: "ok", icon: HeartFill });
      setName("");
      setWebsite("");
      setMessage("");
      try {
        window.turnstile?.reset?.();
      } catch {
        /* ignore */
      }
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Try again.";
      setStatus({ text, kind: "err" });
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
          <input
            type="text"
            id="gb-url2"
            name="url2"
            tabIndex={-1}
            autoComplete="off"
            ref={hpRef}
          />
        </div>

        {turnstileKey ? (
          <div
            className="cf-turnstile gb-turnstile"
            data-sitekey={turnstileKey}
            data-theme="dark"
          />
        ) : null}

        <div className="gb-actions">
          <button type="submit" disabled={submitting}>
            Sign guestbook
          </button>
          <span
            className={`gb-status${status?.kind ? ` gb-${status.kind}` : ""}`}
            role="status"
          >
            {status?.icon ? <status.icon aria-hidden="true" /> : null}{" "}
            {status?.text}
          </span>
        </div>
      </form>

      <div className="gb-entries" aria-live="polite">
        {isPending ? (
          <p className="gb-empty">Loading messages…</p>
        ) : isError ? (
          <p className="gb-empty">Could not load messages right now.</p>
        ) : entries.length === 0 ? (
          <p className="gb-empty">No messages yet, be the first to sign!</p>
        ) : (
          entries.map((entry) => {
            const safeWeb = /^https?:\/\//i.test(entry.website || "")
              ? entry.website
              : null;
            return (
              <div className="gb-entry" key={entry.id}>
                <div className="gb-entry-head">
                  <span className="gb-entry-name">
                    {safeWeb ? (
                      <a href={safeWeb} target="_blank" rel="noopener nofollow ugc">
                        {entry.name}
                      </a>
                    ) : (
                      entry.name
                    )}
                  </span>
                  <span className="gb-entry-time">{relTime(entry.ts)}</span>
                </div>
                <div className="gb-entry-msg">{entry.message}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
