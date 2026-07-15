"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gear, PlayFill, PauseFill, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import styles from "./SettingsMenu.module.css";

/**
 * The bottom-left settings button (theme / cat / music), click-to-expand.
 *
 * Theme switching is owned here in React. The cat-collection modal and the
 * background-music <audio> still live in core.js; this component drives them
 * through the small window hooks core.js exposes (window.toggleCatPicker,
 * window.ctpBgm).
 */

type Flavor = "mocha" | "macchiato" | "frappe" | "latte";

const ORDER: Flavor[] = ["mocha", "macchiato", "frappe", "latte"];
const DOT: Record<Flavor, string> = {
  mocha: "#f5c2e7",
  macchiato: "#f5bde6",
  frappe: "#f4b8e4",
  latte: "#ea76cb",
};
const LABEL: Record<Flavor, string> = {
  mocha: "Mocha",
  macchiato: "Macchiato",
  frappe: "Frappé",
  latte: "Latte",
};

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

const FLAVOR_EVENT = "ctpflavorchange";
const CAT_HIDDEN_EVENT = "ctpcathiddenchange";

// Cat visibility is external state (localStorage "onekoHidden"), owned by
// core.js and mirrored here via useSyncExternalStore.
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

// The active flavor is external state (localStorage), read via useSyncExternalStore
// so there's no setState-in-effect and SSR stays consistent.
function subscribeFlavor(cb: () => void) {
  window.addEventListener(FLAVOR_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(FLAVOR_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function getFlavorSnapshot(): Flavor {
  const f = window.localStorage.getItem("ctpFlavor");
  return (ORDER as string[]).includes(f ?? "") ? (f as Flavor) : "mocha";
}

function setThemeColor(flavor: Flavor) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", DOT[flavor]);
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  const flavor = useSyncExternalStore(subscribeFlavor, getFlavorSnapshot, () => "mocha" as Flavor);
  const catHidden = useSyncExternalStore(subscribeCatHidden, getCatHiddenSnapshot, () => false);

  const toggleCat = useCallback(() => {
    const next = !getCatHiddenSnapshot();
    if (window.ctpSetCatHidden) window.ctpSetCatHidden(next);
    else window.localStorage.setItem("onekoHidden", next ? "1" : "0");
    window.dispatchEvent(new Event(CAT_HIDDEN_EVENT)); // re-read via the store
  }, []);

  // Keep <meta theme-color> in sync (data-flavor is already set pre-paint).
  useEffect(() => {
    setThemeColor(flavor);
  }, [flavor]);

  const cycleFlavor = useCallback(() => {
    const next = ORDER[(ORDER.indexOf(getFlavorSnapshot()) + 1) % ORDER.length];
    document.documentElement.setAttribute("data-flavor", next);
    window.localStorage.setItem("ctpFlavor", next);
    setThemeColor(next);
    window.dispatchEvent(new Event(FLAVOR_EVENT)); // re-read via the store
  }, []);

  // Reflect the bg-music play state (core.js owns the <audio>).
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
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(false);
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
            title={`Theme: ${LABEL[flavor]} (click to cycle)`}
            onClick={cycleFlavor}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.themeIcon} src={`/assets/theme/${flavor}.png`} alt={LABEL[flavor]} />
          </button>

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
