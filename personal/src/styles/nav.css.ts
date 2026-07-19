/**
 * nav.css.ts — the page nav, pinned top-left.
 *
 * Ported from public/css/shared/nav.css. Two things were dropped as dead:
 *
 *   .nav-link.is-a-dev (+ :hover) — core.ts only ever adds "selected" to a nav
 *                                   link; nothing applies is-a-dev. (The
 *                                   "is-a-dev" strings elsewhere in src are a
 *                                   visitor-counter namespace and a Discord
 *                                   server name — unrelated to this class.)
 *   .badges                       — shared a transition rule with .nav, but the
 *                                   badge stack is no longer rendered anywhere.
 *
 * globalStyle because core.ts builds the nav imperatively from nav.json with
 * hardcoded class strings (buildNav / window.ctpBuildNav).
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

globalStyle(".nav", {
  position: "fixed",
  left: "1rem",
  top: "1rem",
  zIndex: 6,
  // Side chrome fades on theme/flavor transitions.
  transition: "opacity 0.6s ease, transform 0.6s ease",
});

globalStyle(".nav-links", {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.4rem",
});

globalStyle(".nav-link", {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  padding: "0.3rem 0.7rem",
  borderRadius: 999,
  background: vars.surface0,
  border: `1px solid ${vars.surface1}`,
  color: vars.subtext1,
  fontSize: "0.8rem",
  textDecoration: "none",
  transition:
    "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
});

globalStyle(".nav-link:hover", {
  borderColor: vars.pink,
  color: vars.text,
  transform: "translateX(2px)",
});

globalStyle(".nav-link.selected", {
  background: vars.pink,
  borderColor: vars.pink,
  color: vars.crust,
  fontWeight: 700,
  // Indented to make room for the pointer triangle below.
  marginLeft: 14,
});

/** Triangle pointing at the selected item. */
globalStyle(".nav-link.selected::before", {
  content: '""',
  position: "absolute",
  left: -14,
  top: "50%",
  transform: "translateY(-50%)",
  border: "6px solid transparent",
  borderLeftColor: vars.pink,
});
