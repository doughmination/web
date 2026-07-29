/* styles/global.css.ts */

import {
  globalStyle,
  assignVars,
} from "@vanilla-extract/css";

import {
  vars,
  lightValues,
  darkValues,
} from "./theme.css";

// Dark mode trans is the identity, so dark is the default; light only kicks in
// for people who explicitly prefer it.
globalStyle(":root", {
  vars: assignVars(vars, darkValues),
});

globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: light)": {
      vars: assignVars(vars, lightValues),
    },
  },
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
