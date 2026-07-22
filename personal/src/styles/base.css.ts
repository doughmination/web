/* src/styles/base.css.ts
 * ESAL-2.3
 */

/**
 * base.css.ts — global reset, the custom cursor set, and the background
 * watermark layers. Applies on every page.
 *
 * Ported from public/css/base.css.
 *
 * Everything here is globalStyle permanently, not just for now: these rules
 * target `*`, `html`, `body` and bare attribute selectors. style() generates a
 * class and can only style elements that carry it, so it can never express
 * "every element" or "the document root" — no amount of React porting changes
 * that.
 *
 * The page cross-fade was dropped rather than ported — see the note below.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

const cursor = (file: string, fallback: string, hotspot = "") =>
  `url('/assets/cursor/${file}.png')${hotspot ? " " + hotspot : ""}, ${fallback}`;

const PAGE_BG = `linear-gradient(135deg, ${vars.bg} 0%, ${vars.bgRaised} 60%, ${vars.bgDeep} 100%)`;

/* ---- reset ---------------------------------------------------------------- */

globalStyle("*", {
  boxSizing: "border-box",
});

/**
 * The default cursor lives on <html> so it INHERITS down the tree. Setting it on
 * `*` would paint it directly onto every element, which beats inheritance and
 * makes children of links/buttons (spans, icons, imgs) fall back to the default
 * cursor instead of the pointer.
 */
globalStyle("html", {
  cursor: cursor("default_0", "auto", "3 3"),
  background: PAGE_BG,
});

globalStyle("html, body", {
  height: "100%",
  overflowX: "hidden",
  overflowY: "auto",
});

globalStyle("body", {
  fontFamily: "'Comic Code', sans-serif",
  display: "flex",
  justifyContent: "center",
  // `safe` stops the centred content being clipped when it overflows the viewport.
  alignItems: "safe center",
  // Array = fallback chain, emitted as two declarations in order. The source had
  // `min-height: 100vh` followed by `100dvh` for browsers without dvh support;
  // an object can't hold a duplicate key, so this is how VE preserves it.
  minHeight: ["100vh", "100dvh"],
  margin: 0,
  padding: "1.5rem 1rem",
  background: PAGE_BG,
  color: vars.text,
});

/* The cross-page view-transition was dropped in the Vanilla Extract migration.
   It needed `@view-transition { navigation: auto }`, a standalone at-rule VE
   can't express, and the ::view-transition-old/new(root) tuning rules only had
   an effect while that opt-in existed — so both went together. */

/* ---- custom cursors ------------------------------------------------------- */

globalStyle(
  'a, button, [role="button"], [role="link"], [data-href], label[for], select, summary, .pc-name--link, #oneko',
  { cursor: cursor("pointer_0", "pointer") },
);

globalStyle(
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]',
  { cursor: cursor("text_0", "text") },
);

/**
 * No url() for these two: the cursor pack never shipped wait_0.png or
 * progress_0.png, so pointing at them just 404s on every match. The native
 * keywords are the intended look anyway.
 *
 * Opt-in via .is-loading only — deliberately NOT [aria-busy="true"]. aria-busy
 * is the right accessibility signal for any widget awaiting data (the homepage
 * cards set it), but a `wait` cursor claims the whole page is blocked, which
 * isn't true for one card refreshing.
 */
globalStyle(".is-loading", { cursor: "wait" });
globalStyle(".is-progress", { cursor: "progress" });

globalStyle('[title]:not(a):not(button), .help', {
  cursor: cursor("help_0", "help"),
});

globalStyle(':disabled, [disabled], [aria-disabled="true"]', {
  cursor: cursor("not-allowed_0", "not-allowed"),
});

globalStyle('[draggable="true"]', {
  cursor: cursor("openhand_0", "grab"),
});

globalStyle(".crosshair", { cursor: cursor("crosshair_0", "crosshair") });
globalStyle(".zoom-in", { cursor: cursor("zoom-in_0", "zoom-in") });
globalStyle(".zoom-out", { cursor: cursor("zoom-out_0", "zoom-out") });

/* ---- background watermarks ------------------------------------------------ */

/** Estrogen watermark blended into the background. */
globalStyle("body::before", {
  content: '""',
  position: "fixed",
  inset: 0,
  background: "url(/assets/theme/estrogen.svg) center / cover no-repeat",
  filter: "invert(86%) sepia(8%) saturate(900%) hue-rotate(190deg) brightness(105%)",
  opacity: 0.05,
  pointerEvents: "none",
  zIndex: 0,
});

/** Miku chibi tucked into the bottom-right corner. */
globalStyle("body::after", {
  content: '""',
  position: "fixed",
  right: "0.5rem",
  bottom: "0.5rem",
  width: "clamp(96px, 14vw, 168px)",
  aspectRatio: "564 / 547",
  background: "url(/assets/theme/miku.png) center / contain no-repeat",
  opacity: 0.18,
  pointerEvents: "none",
  zIndex: 0,
});
