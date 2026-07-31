/* personal/src/components/chrome/SettingsMenu.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gear, PlayFill, PauseFill, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import styles from "./SettingsMenu.module.css";

/**
 * The bottom-left settings button (cat / music), click-to-expand.
 *
 * The theme switcher was removed — the site now uses one fixed palette. The
 * cat-collection modal and the background-music <audio> still live in core.ts;
 * this component drives them through the small window hooks core.ts exposes
 * (window.toggleCatPicker, window.ctpBgm).
 */

declare global {
  interface Window {
    toggleCatPicker?: () => void;
    ctpSetCatHidden?: (hidden: boolean) => void;
    ctpIsCatHidden?: () => boolean;
    ctpBgm?: {
      toggle: () => void;
      isPaused: () => boolean;
      subscribe: (cb: (paused: boolean) => void) => () => void;
    };
  }
}

const CAT_HIDDEN_EVENT = "ctpcathiddenchange";

// Cat visibility is external state (localStorage "onekoHidden"), owned by
// core.ts and mirrored here via useSyncExternalStore.
function subscribeCatHidden(cb: () => void) {
  window.addEventListener(CAT_HIDDEN_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CAT_HIDDEN_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function getCatHiddenSnapshot(): boolean {
  return window.localStorage.getItem("onekoHidden") === "1";
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  const catHidden = useSyncExternalStore(subscribeCatHidden, getCatHiddenSnapshot, () => false);

  const toggleCat = useCallback(() => {
    const next = !getCatHiddenSnapshot();
    if (window.ctpSetCatHidden) window.ctpSetCatHidden(next);
    else window.localStorage.setItem("onekoHidden", next ? "1" : "0");
    // re-read via the store
    window.dispatchEvent(new Event(CAT_HIDDEN_EVENT));
  }, []);

  // Reflect the bg-music play state (core.ts owns the <audio>).
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let tries = 0;
    const attach = () => {
      if (window.ctpBgm) unsub = window.ctpBgm.subscribe(setPaused);
      else if (tries++ < 50) window.setTimeout(attach, 100);
    };
    attach();
    return () => unsub?.();
  }, []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`${styles.bar}${open ? " " + styles.open : ""}`} ref={barRef}>
      <button
        type="button"
        className={`${styles.btn} ${styles.toggle}`}
        aria-label="Settings"
        aria-haspopup="true"
        aria-expanded={open}
        title="Settings"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Gear size={22} />
      </button>

      {open && (
        <div className={styles.items}>
          <button
            type="button"
            className={styles.btn}
            title="Cat collection"
            aria-label="Open cat collection"
            onClick={() => window.toggleCatPicker?.()}
          >
            <span className={styles.catIcon} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.btn}
            aria-pressed={catHidden}
            title={catHidden ? "Show cat" : "Hide cat"}
            aria-label={catHidden ? "Show cat" : "Hide cat"}
            onClick={toggleCat}
          >
            {catHidden ? <EyeSlashFill size={22} /> : <EyeFill size={22} />}
          </button>

          <button
            type="button"
            className={styles.btn}
            aria-pressed={!paused}
            title={paused ? "Play background music" : "Pause background music"}
            onClick={() => window.ctpBgm?.toggle()}
          >
            {paused ? <PlayFill size={22} /> : <PauseFill size={22} />}
          </button>
        </div>
      )}
    </div>
  );
}
