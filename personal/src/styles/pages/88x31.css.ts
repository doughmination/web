/**
 * 88x31.css.ts — the /88x31 button wall.
 *
 * Ported from public/css/pages/88x31.css. Nothing dropped; every selector is
 * rendered.
 *
 * Imported from app/88x31/page.tsx, so Vanilla Extract code-splits it into that
 * route's chunk automatically — no <link precedence="page"> needed any more.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/* ---- page shell ----------------------------------------------------------- */

/** This page scrolls, like the other long content pages. */
globalStyle("html:has(.button-page), body:has(.button-page)", {
  height: "auto",
  minHeight: "100dvh",
  overflowY: "auto",
});

globalStyle("body:has(.button-page)", {
  alignItems: "flex-start",
});

/** Wider than the default hub so more buttons fit per row. */
globalStyle("body:has(.button-page) .hub", {
  maxWidth: 560,
});

globalStyle(".button-page", {
  display: "flex",
  justifyContent: "center",
  paddingBottom: "4.5rem",
});

/* ---- the wall ------------------------------------------------------------- */

globalStyle(".button-wall", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.6rem",
  margin: "0 auto",
  "@media": {
    "(max-width: 640px)": { maxWidth: "100%" },
  },
});

/** line-height: 0 stops the anchor adding descender space under each button. */
globalStyle(".button-wall a", {
  display: "block",
  lineHeight: 0,
});

globalStyle(".button-wall img", {
  width: 132,
  height: 46,
  border: `1px solid ${vars.surface1}`,
  borderRadius: 2,
  transition: "transform 0.12s ease, border-color 0.12s ease",
});

globalStyle(".button-wall a:hover img, .button-wall img:hover", {
  transform: "translateY(-2px)",
  borderColor: vars.pink,
});
