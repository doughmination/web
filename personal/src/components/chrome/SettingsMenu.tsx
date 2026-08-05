/* personal/src/components/chrome/SettingsMenu.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  Gear,
  PlayFill,
  PauseFill,
  EyeFill,
  EyeSlashFill,
  Translate,
  ChevronDown,
  VolumeDownFill,
} from "react-bootstrap-icons";
import { playClickSound, playOpenSound, playCloseSound, playHoverSound } from "@lib/sound";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from "@/i18n/config";
import { useMenus } from "./MenusProvider";
import styles from "./SettingsMenu.module.css";

/**
 * The settings cog. On desktop it sits beside the nav hamburger and, when
 * opened, floats its controls down with the same staggered reveal. Layout:
 * a row of icon dots (cat collection / cat visibility / music play-pause),
 * a volume slider below, and a language pill that expands its list downward.
 *
 * Open state is shared with NavMenu via MenusProvider so only one of the two
 * menus is ever open. The cat-collection modal and the background-music
 * <audio> live in core.ts; this drives them through the window hooks it
 * exposes (window.toggleCatPicker, window.ctpBgm).
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
      getVolume: () => number;
      setVolume: (volume: number) => void;
      subscribeVolume: (cb: (volume: number) => void) => () => void;
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
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(0.1);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const { lang, setLang, t } = useLanguage();

  const { isOpen, toggle, close } = useMenus();
  const open = isOpen("settings");

  const catHidden = useSyncExternalStore(subscribeCatHidden, getCatHiddenSnapshot, () => false);

  const toggleCat = useCallback(() => {
    playClickSound();
    const next = !getCatHiddenSnapshot();
    if (window.ctpSetCatHidden) window.ctpSetCatHidden(next);
    else window.localStorage.setItem("onekoHidden", next ? "1" : "0");
    window.dispatchEvent(new Event(CAT_HIDDEN_EVENT));
  }, []);

  // Reflect the bg-music play state and volume (core.ts owns the <audio>).
  useEffect(() => {
    let unsubPaused: (() => void) | undefined;
    let unsubVolume: (() => void) | undefined;
    let tries = 0;
    const attach = () => {
      if (window.ctpBgm) {
        unsubPaused = window.ctpBgm.subscribe(setPaused);
        unsubVolume = window.ctpBgm.subscribeVolume(setVolume);
      } else if (tries++ < 50) {
        window.setTimeout(attach, 100);
      }
    };
    attach();
    return () => {
      unsubPaused?.();
      unsubVolume?.();
    };
  }, []);

  const onVolumeInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value) / 100;
    setVolume(next);
    window.ctpBgm?.setVolume(next);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLangPickerOpen(false);
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // The language picker only makes sense while the bar is open.
  useEffect(() => {
    if (!open) setLangPickerOpen(false);
  }, [open]);

  return (
    <div className={`${styles.bar}${open ? " " + styles.open : ""}`}>
      <button
        type="button"
        className={`${styles.btn} ${styles.toggle}`}
        aria-label={t("settings.title")}
        aria-haspopup="true"
        aria-expanded={open}
        title={t("settings.title")}
        onMouseEnter={playHoverSound}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) playOpenSound();
          else playCloseSound();
          toggle("settings");
        }}
      >
        <Gear size={22} />
      </button>

      {/* Always mounted (not `{open && ...}`) so the close transition can play
          instead of the flyout just vanishing. Hidden from layout/AT/keyboard
          via aria-hidden + tabIndex while closed. */}
      <div className={styles.items} aria-hidden={!open}>
        <div className={styles.dotRow}>
          <button
            type="button"
            className={styles.btn}
            title={t("settings.catCollection")}
            aria-label={t("settings.openCatCollection")}
            tabIndex={open ? 0 : -1}
            onMouseEnter={playHoverSound}
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
            onMouseEnter={playHoverSound}
            onClick={toggleCat}
          >
            {catHidden ? <EyeSlashFill size={22} /> : <EyeFill size={22} />}
          </button>

          <button
            type="button"
            className={styles.btn}
            aria-pressed={!paused}
            title={paused ? t("settings.playMusic") : t("settings.pauseMusic")}
            aria-label={paused ? t("settings.playMusic") : t("settings.pauseMusic")}
            tabIndex={open ? 0 : -1}
            onMouseEnter={playHoverSound}
            onClick={() => {
              playClickSound();
              window.ctpBgm?.toggle();
            }}
          >
            {paused ? <PlayFill size={22} /> : <PauseFill size={22} />}
          </button>
        </div>

        <div className={styles.volumeRow}>
          <VolumeDownFill size={18} aria-hidden="true" className={styles.volumeIcon} />
          <input
            type="range"
            className={styles.volumeSlider}
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            tabIndex={open ? 0 : -1}
            aria-label={t("settings.volume")}
            onMouseEnter={playHoverSound}
            onPointerDown={playClickSound}
            onChange={onVolumeInput}
          />
        </div>

        <button
          type="button"
          className={styles.langPill}
          aria-haspopup="true"
          aria-expanded={langPickerOpen}
          title={t("settings.language")}
          aria-label={t("settings.language")}
          tabIndex={open ? 0 : -1}
          onMouseEnter={playHoverSound}
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
            setLangPickerOpen((o) => !o);
          }}
        >
          <Translate size={20} aria-hidden="true" />
          <span className={styles.langPillName}>{LANGUAGE_NAMES[lang]}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`${styles.langChevron}${langPickerOpen ? " " + styles.langChevronOpen : ""}`}
          />
        </button>

        {/* Flows down below the pill. Only rendered while the bar is open so it
            can't be reached or focused while collapsed. */}
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
                  onMouseEnter={playHoverSound}
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
    </div>
  );
}
