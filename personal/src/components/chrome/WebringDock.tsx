"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, House } from "react-bootstrap-icons";
import styles from "./WebringDock.module.css";

/**
 * Bottom-left webring dock: one tab per ring, each expands its own panel and
 * only one is open at a time. The lanyard.cafe keyring is the injected
 * #lc-embed (shown via html.wr-lanyard, styled in keyring.css); stabring gets
 * its own panel here.
 */

const RING = "https://ring.stabbed.me";
type OpenRing = "lanyard" | "stab" | null;

export default function WebringDock() {
  const [openRing, setOpenRing] = useState<OpenRing>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const stabRef = useRef<HTMLDivElement>(null);

  // The stabring panel only renders after a click (client-side), so reading
  // location here is safe and needs no state/effect.
  const host = typeof window !== "undefined" ? window.location.hostname : "";

  // Toggle the external lanyard panel via a root class (see keyring.css).
  useEffect(() => {
    document.documentElement.classList.toggle("wr-lanyard", openRing === "lanyard");
  }, [openRing]);

  // Close on outside click / Escape (ignoring clicks inside a panel).
  useEffect(() => {
    if (!openRing) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dockRef.current?.contains(t) || stabRef.current?.contains(t)) return;
      const lc = document.getElementById("lc-embed");
      if (lc && lc.contains(t)) return;
      setOpenRing(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenRing(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openRing]);

  const toggle = (r: Exclude<OpenRing, null>) =>
    setOpenRing((cur) => (cur === r ? null : r));

  return (
    <>
      <div className={styles.dock} ref={dockRef}>
        <button
          type="button"
          className={`${styles.tab}${openRing === "lanyard" ? " " + styles.active : ""}`}
          aria-label="lanyard.cafe webring"
          aria-expanded={openRing === "lanyard"}
          title="lanyard.cafe webring"
          onClick={(e) => {
            e.stopPropagation();
            toggle("lanyard");
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.ico} src="/assets/webrings/lanyard.png" alt="" />
        </button>

        <button
          type="button"
          className={`${styles.tab}${openRing === "stab" ? " " + styles.active : ""}`}
          aria-label="stabring webring"
          aria-expanded={openRing === "stab"}
          title="stabring — ring.stabbed.me"
          onClick={(e) => {
            e.stopPropagation();
            toggle("stab");
          }}
        >
          <span className={`${styles.ico} ${styles.emoji}`} aria-hidden="true">
            🔪
          </span>
        </button>
      </div>

      {openRing === "stab" && (
        <div className={styles.panel} ref={stabRef}>
          <span className={styles.panelTitle}>🔪 stabring</span>
          <div className={styles.stabringNav}>
            <a className={styles.stabringBtn} href={`${RING}/prev/from/${host}`} rel="noopener">
              <ArrowLeft size={16} /> prev
            </a>
            <a
              className={`${styles.stabringBtn} ${styles.home}`}
              href={RING}
              rel="noopener"
            >
              <House size={16} /> home
            </a>
            <a className={styles.stabringBtn} href={`${RING}/next/from/${host}`} rel="noopener">
              next <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
