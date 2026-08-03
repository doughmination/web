/* personal/src/components/chrome/SettingsMenu.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gear, PlayFill, PauseFill, EyeFill, EyeSlashFill, Translate } from "react-bootstrap-icons";
import { playClickSound, playOpenSound, playCloseSound } from "@lib/sound";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from "@/i18n/config";
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
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const { lang, setLang, t } = useLanguage();

  const catHidden = useSyncExternalStore(subscribeCatHidden, getCatHiddenSnapshot, () => false);

  const toggleCat = useCallback(() => {
    playClickSound();
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

  // Close on Escape. (Outside-click used to also close this, but that made
  // the flyout snap shut the moment you interacted with anything it opened —
  // e.g. the cat-collection modal — so it's gone; the cog now stays open
  // until explicitly toggled or dismissed with Escape.)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangPickerOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The language picker only makes sense while the bar itself is open —
  // collapse it too if the bar closes some other way (e.g. its own Escape
  // handler above already covers Escape; this covers clicking the cog shut).
  useEffect(() => {
    if (!open) setLangPickerOpen(false);
  }, [open]);

  return (
    <div className={`${styles.bar}${open ? " " + styles.open : ""}`} ref={barRef}>
      <button
        type="button"
        className={`${styles.btn} ${styles.toggle}`}
        aria-label={t("settings.title")}
        aria-haspopup="true"
        aria-expanded={open}
        title={t("settings.title")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => {
            const next = !o;
            if (next) playOpenSound();
            else playCloseSound();
            return next;
          });
        }}
      >
        <Gear size={22} />
      </button>

      {/* Always mounted (not `{open && ...}`) so the close transition can
          actually play instead of the flyout just vanishing. Hidden from
          layout/AT/keyboard via aria-hidden + tabIndex while closed. */}
      <div className={styles.items} aria-hidden={!open}>
        <button
          type="button"
          className={styles.btn}
          title={t("settings.catCollection")}
          aria-label={t("settings.openCatCollection")}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            playClickSound();
            window.toggleCatPicker?.();
          }}
        >
          <span className={styles.catIcon} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.btn}
          aria-pressed={catHidden}
          title={catHidden ? t("settings.showCat") : t("settings.hideCat")}
          aria-label={catHidden ? t("settings.showCat") : t("settings.hideCat")}
          tabIndex={open ? 0 : -1}
          onClick={toggleCat}
        >
          {catHidden ? <EyeSlashFill size={22} /> : <EyeFill size={22} />}
        </button>

        <button
          type="button"
          className={styles.btn}
          aria-pressed={!paused}
          title={paused ? t("settings.playMusic") : t("settings.pauseMusic")}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            playClickSound();
            window.ctpBgm?.toggle();
          }}
        >
          {paused ? <PlayFill size={22} /> : <PauseFill size={22} />}
        </button>

        <button
          type="button"
          className={styles.btn}
          aria-haspopup="true"
          aria-expanded={langPickerOpen}
          aria-pressed={langPickerOpen}
          title={t("settings.language")}
          aria-label={t("settings.language")}
          tabIndex={open ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
            setLangPickerOpen((o) => !o);
          }}
        >
          <Translate size={22} />
        </button>
      </div>

      {/* Flyout grid of language options, anchored to the whole bar (see
          .langPicker) so it never overlaps .items. Only rendered while the
          bar is open so it can't be reached or focused while collapsed. */}
      {open && langPickerOpen && (
        <div className={styles.langPicker} role="menu" aria-label={t("settings.language")}>
          {SUPPORTED_LANGUAGES.map((code) => {
            const active = code === lang;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`${styles.langOption}${active ? " " + styles.langActive : ""}`}
                onClick={() => {
                  playClickSound();
                  setLang(code);
                  setLangPickerOpen(false);
                }}
              >
                <span className={styles.langCode} aria-hidden="true">
                  {code}
                </span>
                <span className={styles.langName}>{LANGUAGE_NAMES[code]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}