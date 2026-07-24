import {
  globalStyle,
  assignVars,
} from "@vanilla-extract/css";

import {
  vars,
  lightValues,
  darkValues,
} from "./theme.css";

// Light theme is the default; dark kicks in with the OS preference.
globalStyle(":root", {
  vars: assignVars(vars, lightValues),
});

globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: assignVars(vars, darkValues),
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
