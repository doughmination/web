/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Global reset, typography, fonts and scrollbar styling — ported from the old
 * app's src/css/main.css + fonts.css to vanilla-extract globalStyle calls.
 */

import { globalFontFace, globalStyle } from "@vanilla-extract/css";
import { palette, vars } from "./theme.css";

/* ============================================================================
   FONTS — Comic Code
   ============================================================================ */
const comic = "Comic Code";

globalFontFace(comic, {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Regular_2022-05-24-151938_hsmz.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Regular_2022-05-24-151938_hsmz.woff') format('woff')",
  fontWeight: 400,
  fontStyle: "normal",
});
globalFontFace(comic, {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Italic_2022-05-24-151939_rdtu.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Italic_2022-05-24-151939_rdtu.woff') format('woff')",
  fontWeight: 400,
  fontStyle: "italic",
});
globalFontFace(comic, {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Medium_2022-05-24-151941_ugqm.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Medium_2022-05-24-151941_ugqm.woff') format('woff')",
  fontWeight: 500,
  fontStyle: "normal",
});
globalFontFace(comic, {
  src: "url('https://fonts.doughmination.co.uk/ComicCode-Bold_2022-05-24-152309_zqkm.woff2') format('woff2'), url('https://fonts.doughmination.co.uk/ComicCode-Bold_2022-05-24-152309_zqkm.woff') format('woff')",
  fontWeight: 700,
  fontStyle: "normal",
});

/* ============================================================================
   GLOBAL RESET & BASE STYLES
   ============================================================================ */
globalStyle("*", {
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  borderColor: vars.border,
});

globalStyle("html, body", {
  overflowX: "hidden",
  maxWidth: "100vw",
});

globalStyle("html", {
  scrollBehavior: "smooth",
});

globalStyle("body", {
  fontFamily: `'${comic}', sans-serif`,
  background: vars.background,
  color: vars.foreground,
  minHeight: "100vh",
  transition: "background-color 0.3s ease, color 0.3s ease",
});

globalStyle(
  "h1, h2, h3, h4, h5, h6, label, input, select, textarea, button",
  {
    fontFamily: `'${comic}', cursive`,
  },
);

globalStyle("h1", { fontSize: "2.5rem", fontWeight: 700 });
globalStyle("h2", { fontSize: "2rem", fontWeight: 600 });
globalStyle("h3", { fontSize: "1.75rem", fontWeight: 600 });

globalStyle(
  "button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible",
  {
    outline: `2px solid ${vars.ring}`,
    outlineOffset: "2px",
  },
);

/* Mobile heading sizes */
globalStyle("h1", { "@media": { "screen and (max-width: 640px)": { fontSize: "2rem" } } });
globalStyle("h2", { "@media": { "screen and (max-width: 640px)": { fontSize: "1.75rem" } } });
globalStyle("h3", { "@media": { "screen and (max-width: 640px)": { fontSize: "1.5rem" } } });

/* ============================================================================
   SCROLLBAR STYLING — THEME AWARE
   ============================================================================ */
globalStyle("html[data-flavor] ::-webkit-scrollbar", {
  width: "12px",
  height: "12px",
});
globalStyle("html[data-flavor] ::-webkit-scrollbar-track", {
  background: palette.mantle,
  borderRadius: "6px",
});
globalStyle("html[data-flavor] ::-webkit-scrollbar-thumb", {
  background: palette.mauve,
  borderRadius: "6px",
  border: `2px solid ${palette.mantle}`,
  transition: "background-color 0.2s ease",
});
globalStyle("html[data-flavor] ::-webkit-scrollbar-thumb:hover", {
  background: palette.pink,
});
globalStyle("html[data-flavor] ::-webkit-scrollbar-thumb:active", {
  background: palette.lavender,
});
globalStyle("html[data-flavor]", {
  scrollbarWidth: "thin",
  scrollbarColor: `${palette.mauve} ${palette.mantle}`,
});
