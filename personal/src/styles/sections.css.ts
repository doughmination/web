/**
 * sections.css.ts — the shared .section / .section-title / .section-subtitle trio.
 *
 * Ported from public/css/shared/sections.css. These originally lived in
 * pages/projects.css, but /cool-people (FriendsGrid) and /dev-info use them too,
 * so route-splitting projects.css would have dropped their headings.
 *
 * globalStyle (not style) keeps the literal class names, because this markup is
 * written by hand across several components rather than owned by one of them.
 * Colours come from the typed theme contract, so `vars.mauve` is checked at
 * compile time where `var(--mauve)` was just a string.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

globalStyle(".section", {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  width: "100%",
});

globalStyle(".section-title", {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: vars.mauve,
});

globalStyle(".section-subtitle", {
  margin: "-1.1rem 0 0",
  fontSize: "1.1rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "lowercase",
  color: vars.surface2,
});
