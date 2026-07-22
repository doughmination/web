/* src/styles/keyring.css.ts
 * ESAL-2.3
 */

import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

const PANEL_SHADOW = "0 10px 26px -16px rgba(0, 0, 0, 0.7)";

/* ---- third-party lanyard.cafe embed -------------------------------------- */

globalStyle("#lc-embed", {
  fontFamily: "'Comic Code', 'Quicksand', system-ui, sans-serif !important",
  left: "1rem !important",
  bottom: "4.5rem !important", // sit above the webring dock
  zIndex: "6 !important",
  // Collapsed by default — the dock's lanyard tab toggles it.
  display: "none !important",
});

/** Shown only while the lanyard webring tab is active (see webrings() in core.ts). */
globalStyle("html.wr-lanyard #lc-embed", {
  display: "block !important",
});

globalStyle("#lc-embed > section", {
  marginBottom: "0 !important",
});

/** The card — matched to .webring-panel (stabring) so both look identical. */
globalStyle("#lc-embed > section > div", {
  background: `${vars.surface} !important`,
  border: `1px solid ${vars.accent} !important`,
  borderRadius: "14px !important",
  boxShadow: `${PANEL_SHADOW} !important`,
  padding: "0.6rem 0.7rem !important",
});

/** prev / random / next buttons — matched to .stabring-btn. */
globalStyle("#lc-embed a", {
  background: `${vars.surfaceHi} !important`,
  borderRadius: "10px !important",
  fontWeight: "600 !important",
  fontSize: "0.78rem !important",
  padding: "0.3rem 0.6rem !important",
  transition:
    "transform 0.12s ease, background 0.12s ease, color 0.12s ease !important",
});

globalStyle("#lc-embed a:nth-child(1), #lc-embed a:nth-child(3)", {
  color: `${vars.accent} !important`,
});

globalStyle("#lc-embed a:nth-child(2)", {
  color: `${vars.lavender} !important`,
});

globalStyle("#lc-embed a:hover", {
  background: `${vars.surfaceHigher} !important`,
  transform: "translateY(-2px) !important",
});

/** The "you are at <url>" line. */
globalStyle("#lc-embed p", {
  color: `${vars.textMuted} !important`,
});

globalStyle("#lc-embed p span", {
  color: `${vars.accent} !important`,
});

/**
 * On mobile the body is a single flex column and every other floating widget
 * (nav, badges, presence card) reflows into it. The keyring, being fixed, used
 * to float over the nav pills when scrolled to the bottom. It's collapsed by
 * default now so it no longer needs to reflow — it just must not overflow.
 */
globalStyle("#lc-embed > section > div", {
  "@media": {
    "(max-width: 640px)": {
      minWidth: "0 !important",
    },
  },
});

/* The .webring-* / .stabring-* dock rules that used to live here are gone:
   WebringDock.tsx is a React component styled by WebringDock.module.css, so
   those global classes were never rendered. Only the third-party #lc-embed
   overrides above are still needed — we don't own that DOM and can't scope it. */
