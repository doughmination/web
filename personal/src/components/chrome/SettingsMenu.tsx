"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gear, PlayFill, PauseFill, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import styles from "./SettingsMenu.module.css";
import { DEFAULT_THEME, THEMES, THEME_IDS, themeById, type Theme } from "@lib/themes";

/**
 * The bottom-left settings button (theme / cat / music), click-to-expand.
 *
 * Theme switching is owned here in React. The cat-collection modal and the
 * background-music <audio> still live in core.ts; this component drives them
 * through the small window hooks core.ts exposes (window.toggleCatPicker,
 * window.ctpBgm).
 */

type Flavor = string;

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
  return THEME_IDS.includes(f ?? "") ? (f as Flavor) : DEFAULT_THEME;
}

function setThemeColor(flavor: Flavor) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", themeById(flavor).dot);
}

/**
 * A theme's icon, or a flat chip of its accent colour when it has none — so a
 * newly registered theme renders sensibly before anyone draws artwork for it.
 */
function ThemeSwatch({ theme, className }: { theme: Theme; className: string }) {
  if (!theme.icon) {
    return <span className={className} style={{ background: theme.dot }} aria-hidden="true" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={theme.icon} alt="" aria-hidden="true" />;
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [paused, setPaused] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  const flavor = useSyncExternalStore(subscribeFlavor, getFlavorSnapshot, () => "cherry" as Flavor);
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

  const pickFlavor = useCallback((next: Flavor) => {
    document.documentElement.setAttribute("data-flavor", next);
    window.localStorage.setItem("ctpFlavor", next);
    setThemeColor(next);
    window.dispatchEvent(new Event(FLAVOR_EVENT)); // re-read via the store
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
        setThemesOpen(false);
      }
    };
    // Escape backs out one layer at a time: picker first, then the whole bar.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setThemesOpen((wasOpen) => {
        if (!wasOpen) setOpen(false);
        return false;
      });
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
          setOpen((o) => {
            if (o) setThemesOpen(false); // collapsing the bar closes the picker too
            return !o;
          });
        }}
      >
        <Gear size={22} />
      </button>

      {open && (
        <div className={styles.items}>
          <button
            type="button"
            className={styles.btn}
            aria-haspopup="true"
            aria-expanded={themesOpen}
            title={`Theme: ${themeById(flavor).label}`}
            onClick={(e) => {
              e.stopPropagation();
              setThemesOpen((t) => !t);
            }}
          >
            <ThemeSwatch theme={themeById(flavor)} className={styles.themeIcon} />
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

      {/* Sibling of .items, not a child of it — .items is a ~44px flex column,
          which gave this an unresolvable shrink-to-fit containing block and
          collapsed the grid to a sliver. Anchored to .bar instead. */}
      {open && themesOpen && (
        <div className={styles.themePicker} role="listbox" aria-label="Site theme">
          {THEMES.map((t) => {
            const active = t.id === flavor;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`${styles.themeOption}${active ? " " + styles.themeActive : ""}`}
                title={t.label}
                onClick={() => pickFlavor(t.id)}
              >
                <ThemeSwatch theme={t} className={styles.themeSwatch} />
                <span className={styles.themeName}>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
