/* personal/src/scripts/SelfiesGallery.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraFill } from "react-bootstrap-icons";
import { playClickSound } from "@lib/sound";
import { useLanguage } from "@/i18n/LanguageProvider";

/* Ported from selfies.js — grid + lightbox from /selfies/selfies.json.
   Manifest is an array of filename strings or { src, alt, caption } objects. */

type Item = { src: string; alt: string; caption: string };

const MANIFEST = "/selfies/selfies.json";
const FOLDER = "/selfies/";

function resolveSrc(s: unknown): string {
  if (typeof s !== "string") return "";
  const t = s.trim();
  if (/^https?:\/\//i.test(t) || t.startsWith("/")) return t;
  return FOLDER + t.replace(/^\.?\//, "");
}

function normalize(entry: unknown, i: number): Item | null {
  let raw = "";
  let alt = "";
  let caption = "";
  if (typeof entry === "string") {
    raw = entry;
  } else if (entry && typeof entry === "object" && "src" in entry) {
    const e = entry as { src?: unknown; alt?: unknown; caption?: unknown };
    raw = typeof e.src === "string" ? e.src : "";
    alt = typeof e.alt === "string" ? e.alt : "";
    caption = typeof e.caption === "string" ? e.caption.trim() : "";
  }
  if (!raw.trim()) return null;
  const src = resolveSrc(raw);
  if (!src) return null;
  if (!alt) alt = caption || `Selfie ${i + 1} of Clove Nytrix Doughmination Twilight`;
  return {
    src,
    alt,
    caption
  };
}

type Status = "loading" | "ready" | "empty" | "error";

export default function SelfiesGallery() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("loading");
  const [items, setItems] = useState<Item[]>([]);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(MANIFEST, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error("manifest is not an array");
        const norm = data
          .map((e, i) => normalize(e, i))
          .filter((x): x is Item => x !== null);
        setItems(norm);
        setStatus(norm.length ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = items.filter((it) => !failed.has(it.src));

  const openAt = useCallback((i: number) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setCurrent(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (lastFocus.current?.focus) lastFocus.current.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setCurrent((c) => {
        const n = visible.length;
        return n ? (c + delta + n) % n : 0;
      });
    },
    [visible.length],
  );

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("lightbox-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("lightbox-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (status === "loading") {
    return <div className="selfie-grid" aria-label={t("selfies.galleryLabel")} aria-busy="true" />;
  }
  if (status === "empty") {
    return (
      <div className="selfie-grid" aria-label={t("selfies.galleryLabel")}>
        <p className="selfie-empty">
          {t("selfies.empty")} <CameraFill aria-hidden="true" />
        </p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="selfie-grid" aria-label={t("selfies.galleryLabel")}>
        <p className="selfie-empty">{t("selfies.error")}</p>
      </div>
    );
  }

  const multiple = visible.length > 1;
  const cur = visible[current] ?? visible[0];

  return (
    <>
      <div className="selfie-grid" aria-label={t("selfies.galleryLabel")}>
        {visible.map((it, i) => (
          <figure className="selfie-item" key={it.src}>
            <button
              type="button"
              className="selfie-thumb"
              aria-label={t("selfies.openLabel").replace("{name}", it.caption || it.alt)}
              onClick={() => {
                playClickSound();
                openAt(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.alt}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailed((f) => new Set(f).add(it.src))}
              />
            </button>
            {it.caption ? <figcaption className="selfie-caption">{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>

      {open && cur ? (
        <div
          className={`lightbox${reduceMotion ? "" : " is-open"}`}
          role="dialog"
          aria-modal="true"
          aria-label={t("selfies.viewerLabel")}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playClickSound();
              close();
            }
          }}
        >
          <button
            ref={closeBtnRef}
            className="lightbox-close"
            type="button"
            aria-label={t("selfies.closeEsc")}
            onClick={() => {
              playClickSound();
              close();
            }}
          >
            {"×"}
          </button>
          {multiple ? (
            <button
              className="lightbox-nav lightbox-prev"
              type="button"
              aria-label={t("selfies.prev")}
              onClick={() => {
                playClickSound();
                step(-1);
              }}
            >
              {"‹"}
            </button>
          ) : null}
          <figure className="lightbox-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lightbox-img" src={cur.src} alt={cur.alt} />
            {cur.caption ? (
              <figcaption className="lightbox-caption">{cur.caption}</figcaption>
            ) : null}
          </figure>
          {multiple ? (
            <button
              className="lightbox-nav lightbox-next"
              type="button"
              aria-label={t("selfies.next")}
              onClick={() => {
                playClickSound();
                step(1);
              }}
            >
              {"›"}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
