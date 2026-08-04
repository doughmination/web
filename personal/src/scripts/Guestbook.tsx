/* personal/src/scripts/Guestbook.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { HeartFill, type Icon } from "react-bootstrap-icons";
import { useGuestbook, useGuestbookPost } from "@doughmination/react-api";
import { playClickSound } from "@lib/sound";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Dictionary } from "@/i18n/locales/en";

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

function relTime(ts: number, time: Dictionary["time"]): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return time.justNow;
  if (diff < 3600) return time.minutesAgo.replace("{n}", String(Math.floor(diff / 60)));
  if (diff < 86400) return time.hoursAgo.replace("{n}", String(Math.floor(diff / 3600)));
  if (diff < 604800) return time.daysAgo.replace("{n}", String(Math.floor(diff / 86400)));
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
  const { t, dict } = useLanguage();
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
    playClickSound();

    if (!name.trim() || !message.trim()) {
      setStatus({
        text: t("guestbook.errRequired"),
        kind: "err"
      });
      return;
    }

    // Honeypot: hidden field, filled only by bots. Mirror the server's silent
    // drop — fake success, never hit the API. The wrapper doesn't forward url2,
    // so the trap has to be sprung here.
    if (hpRef.current?.value) {
      setStatus({
        text: t("guestbook.thanks"),
        kind: "ok",
        icon: HeartFill
      });
      setName("");
      setWebsite("");
      setMessage("");
      return;
    }

    let token: string | undefined;
    if (turnstileKey) {
      token = turnstileToken();
      if (!token) {
        setStatus({
          text: t("guestbook.errCaptcha"),
          kind: "err"
        });
        return;
      }
    }

    setStatus({ text: t("guestbook.signing") });
    try {
      await post.mutateAsync({
        name,
        website,
        message,
        turnstileToken: token,
      });

      setStatus({
        text: t("guestbook.thanks"),
        kind: "ok",
        icon: HeartFill
      });
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
          : t("guestbook.errGeneric");
      setStatus({
        text,
        kind: "err"
      });
    }
  }

  return (
    <>
      <form className="gb-form" autoComplete="off" noValidate onSubmit={onSubmit}>
        <div className="gb-field">
          <label htmlFor="gb-name">{t("guestbook.nameLabel")}</label>
          <input
            type="text"
            id="gb-name"
            name="name"
            maxLength={40}
            required
            placeholder={t("guestbook.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="gb-field">
          <label htmlFor="gb-website">
            {t("guestbook.websiteLabel")}{" "}
            <span className="gb-optional">{t("guestbook.optional")}</span>
          </label>
          <input
            type="url"
            id="gb-website"
            name="website"
            maxLength={200}
            placeholder={t("guestbook.websitePlaceholder")}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div className="gb-field">
          <label htmlFor="gb-message">{t("guestbook.messageLabel")}</label>
          <textarea
            id="gb-message"
            name="message"
            maxLength={500}
            rows={3}
            required
            placeholder={t("guestbook.messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <span className="gb-counter">
            {t("guestbook.counter").replace("{n}", String(message.length))}
          </span>
        </div>

        {/* Honeypot: hidden from humans, bots tend to fill it. */}
        <div className="gb-hp" aria-hidden="true">
          <label htmlFor="gb-url2">{t("guestbook.honeypot")}</label>
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
            {t("guestbook.sign")}
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
          <p className="gb-empty">{t("guestbook.loadingMessages")}</p>
        ) : isError ? (
          <p className="gb-empty">{t("guestbook.loadError")}</p>
        ) : entries.length === 0 ? (
          <p className="gb-empty">{t("guestbook.noMessages")}</p>
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
                      <a href={safeWeb} target="_blank" rel="noopener nofollow ugc" onClick={playClickSound}>
                        {entry.name}
                      </a>
                    ) : (
                      entry.name
                    )}
                  </span>
                  <span className="gb-entry-time">{relTime(entry.ts, dict.time)}</span>
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
