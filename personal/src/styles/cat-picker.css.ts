/* src/styles/cat-picker.css.ts
 * ESAL-2.3
 */

/**
 * cat-picker.css.ts — the oneko cat-collection modal.
 *
 * Ported from the live half of public/css/shared/theme-switcher.css. That file
 * was named for a theme switcher that no longer exists: every .beta-* rule in it
 * styled the old vanilla switcher, which SettingsMenu.module.css replaced. Those
 * were dropped rather than ported, along with:
 *
 *   .cat-toast          — core.ts never builds a toast any more
 *   .cat-section-title  — the picker renders sections without titles
 *   .cat-option.locked  — the unlock mechanic was removed; every cat is free
 *                         now (see cats.json), so `locked` is never applied
 *
 * globalStyle because core.ts builds this modal imperatively with hardcoded
 * class strings (window.toggleCatPicker).
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

const POINTER = 'url("/assets/cursor/pointer_0.png"), pointer';

globalStyle(".cat-picker", {
  position: "fixed",
  inset: 0,
  // One below .bgm-gate so the audio gate always wins if both are somehow open.
  zIndex: 2147483646,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  background: "rgba(17, 17, 27, 0.65)",
  backdropFilter: "blur(2px)",
});

globalStyle(".cat-picker[hidden]", {
  display: "none",
});

globalStyle(".cat-picker-panel", {
  width: "min(94vw, 430px)",
  maxHeight: "82vh",
  overflowY: "auto",
  background: vars.bg,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 16,
  padding: "1rem",
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.55)",
});

globalStyle(".cat-picker-head", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0.85rem",
  fontWeight: 700,
  color: vars.accent,
});

globalStyle(".cat-picker-close", {
  background: "none",
  border: "none",
  color: vars.textMuted,
  fontSize: "1.35rem",
  lineHeight: 1,
  cursor: POINTER,
  padding: "0 0.25rem",
});

globalStyle(".cat-picker-close:hover", {
  color: vars.text,
});

globalStyle(".cat-grid", {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

globalStyle(".cat-section-items", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.6rem",
});

globalStyle(".cat-option", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.75rem 0.4rem 0.6rem",
  borderRadius: 12,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  color: vars.text,
  fontFamily: "inherit",
  fontSize: "0.74rem",
  textAlign: "center",
  cursor: POINTER,
  transition: "transform 0.15s ease, border-color 0.15s ease",
});

// Was `.cat-option:hover:not(.locked)`. `.locked` is never applied any more, so
// the guard was dead weight.
globalStyle(".cat-option:hover", {
  transform: "translateY(-2px)",
  borderColor: vars.accent,
});

globalStyle(".cat-option.current", {
  borderColor: vars.accent,
  boxShadow: `inset 0 0 0 1px ${vars.accent}`,
});

/**
 * 30px window + the -97px,-97px background position lands on the idle frame
 * inset 1px on every side, so no preview can catch pixels from neighbouring
 * frames of the sprite sheet.
 */
globalStyle(".cat-preview", {
  width: 30,
  height: 30,
  margin: "7px 1px 11px",
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
  transform: "scale(1.7)",
  transformOrigin: "center",
});

globalStyle(".cat-name", {
  fontWeight: 500,
});

globalStyle(".cat-hint", {
  margin: "0.85rem 0 0",
  fontSize: "0.68rem",
  color: vars.textMuted,
  textAlign: "center",
});
