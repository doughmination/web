/* status/src/styles/global.css.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* styles/global.css.ts */

import {
  globalStyle,
  globalFontFace,
  assignVars,
} from "@vanilla-extract/css";

import {
  vars,
  darkValues,
} from "./theme.css";

// Comic Code — the shared face across every site, served from the same CDN the
// personal site uses. Four cuts (regular / italic / medium / bold). Declared
// explicitly (no loop): the Turbopack vanilla-extract plugin can't instrument a
// top-level loop in a .css.ts, which breaks file-scope setup for the whole graph.
globalFontFace("Comic Code", {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Regular_2022-05-24-151938_hsmz.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Regular_2022-05-24-151938_hsmz.woff') format('woff')",
  fontWeight: 400,
  fontStyle: "normal",
  fontDisplay: "swap",
});
globalFontFace("Comic Code", {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Italic_2022-05-24-151939_rdtu.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Italic_2022-05-24-151939_rdtu.woff') format('woff')",
  fontWeight: 400,
  fontStyle: "italic",
  fontDisplay: "swap",
});
globalFontFace("Comic Code", {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Medium_2022-05-24-151941_ugqm.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Medium_2022-05-24-151941_ugqm.woff') format('woff')",
  fontWeight: 500,
  fontStyle: "normal",
  fontDisplay: "swap",
});
globalFontFace("Comic Code", {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Bold_2022-05-24-152309_zqkm.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Bold_2022-05-24-152309_zqkm.woff') format('woff')",
  fontWeight: 700,
  fontStyle: "normal",
  fontDisplay: "swap",
});

// Dark mode trans is the identity. Light mode has been dropped so the palette is
// uniform across every site — dark is the single look.
globalStyle(":root", {
  vars: assignVars(vars, darkValues),
  colorScheme: "dark",
});

// Minimal reset.
globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
  margin: 0,
  padding: 0,
});

globalStyle("html, body", {
  minHeight: "100%",
});

globalStyle("body", {
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.font.sans,
  lineHeight: 1.5,
  WebkitFontSmoothing: "antialiased",
});

globalStyle("a", {
  color: "inherit",
  textDecoration: "none",
});

// Respect users who ask for less motion: kill every animation/transition,
// including decorative pseudo-elements, in one sweep.
globalStyle("*, *::before, *::after", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.001ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.001ms !important",
    },
  },
});
