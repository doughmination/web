/**
 * visitor-counter.css.ts — the #visitor-counter widget, top-right.
 *
 * Ported from public/css/shared/visitor-counter.css.
 *
 * globalStyle because the digit strip is injected imperatively (originally by
 * visitor-counter.js, now by the VisitorCounter component's effect) with
 * hardcoded class strings.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

const MONO = "'Comic Code', ui-monospace, monospace";

globalStyle("#visitor-counter", {
  position: "fixed",
  // Clears the settings row in the corner.
  top: "4rem",
  right: "1rem",
  zIndex: 6,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  transition: "opacity 0.6s ease, transform 0.6s ease",

  // Mobile: drop out of fixed positioning and sit in the topbar flow.
  "@media": {
    "(max-width: 640px)": {
      position: "static",
      margin: "0 auto",
    },
  },
});

/* A `.topbar #visitor-counter { order: 2 }` rule used to sit here. Nothing
   renders .topbar any more — the mobile top-bar reflow was removed — so it was
   dropped rather than carried forward. */

globalStyle("#visitor-counter .vc-label", {
  fontSize: "0.65rem",
  letterSpacing: "0.06em",
  textTransform: "lowercase",
  color: vars.subtext0,
  fontFamily: MONO,
});

/** Digit strip. */
globalStyle(".vc-root", {
  fontFamily: MONO,
});

globalStyle(".vc-digits", {
  display: "flex",
  alignItems: "center",
  gap: 4,
  // Reserves the strip's height so the counter doesn't shift the corner when
  // the digits arrive.
  minHeight: 50,
});

globalStyle(".vc-digits img", {
  display: "block",
  imageRendering: "pixelated",
  width: 22.5,
  height: 50,
});

globalStyle(".vc-error", {
  fontSize: "0.7rem",
  color: vars.subtext0,
});
