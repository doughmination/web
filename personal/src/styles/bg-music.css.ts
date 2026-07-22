/* src/styles/bg-music.css.ts
 * ESAL-2.3
 */

/**
 * bg-music.css.ts — sitewide background audio: the "click to enter" gate that
 * starts it, and the play/pause button it leaves behind in the settings row.
 *
 * Ported from public/css/shared/bg-music.css.
 *
 * globalStyle throughout — core.ts builds the gate imperatively with hardcoded
 * class strings (window.ctpBgm), so these selectors must stay literal.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

globalStyle(".bgm-gate", {
  position: "fixed",
  inset: 0,
  // Sits above literally everything — it gates the whole page on first visit.
  zIndex: 2147483647,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  background: "rgba(17, 17, 27, 0.75)",
  backdropFilter: "blur(3px)",
  cursor: 'url("/assets/cursor/pointer_0.png"), pointer',
  opacity: 1,
  transition: "opacity 0.25s ease",
});

globalStyle(".bgm-gate[hidden]", {
  display: "none",
});

globalStyle(".bgm-gate.is-leaving", {
  opacity: 0,
});

globalStyle(".bgm-gate-panel", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.6rem",
  padding: "1.5rem 2rem",
  background: vars.bg,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 16,
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.55)",
  textAlign: "center",
  pointerEvents: "none", // click passes through to .bgm-gate
});

globalStyle(".bgm-gate-note", {
  margin: 0,
  color: vars.accent,
  fontWeight: 700,
  fontSize: "1rem",
});

globalStyle(".bgm-gate-hint", {
  margin: 0,
  color: vars.textMuted,
  fontSize: "0.75rem",
});

/* .bgm-icon was dropped in the port: SettingsMenu renders PlayFill/PauseFill
   from react-bootstrap-icons now, so nothing carried that class. */
