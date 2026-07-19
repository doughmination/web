/**
 * minecraft.css.ts — /minecraft account cards plus the detail modal
 * (overview / 3D skin viewer / Hypixel tabs).
 *
 * Ported from public/css/pages/minecraft.css. Nothing dropped — a grep flagged
 * .mc-pill / .mc-overlay / .mc-copy / .mc-ctl-group as unused, but they're built
 * with template literals (`mc-pill${...}`) that a quote-delimited match can't see.
 *
 * The .presence-stage / .presence-intro rules that used to live here already
 * moved to presence-card.css.ts: /discord and /servers render those elements too
 * and don't load this file.
 *
 * The source used var(--surface0, #313244) — no hyphen, so the token never
 * resolved and every one of those fell back to a hardcoded Mocha hex, meaning
 * this page didn't re-theme. Fixed earlier; the tokens are real here.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/* ---- account grid --------------------------------------------------------- */

globalStyle(".mc-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "1rem",
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
  "@media": {
    "(max-width: 480px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "0.65rem",
    },
  },
});

globalStyle(".mc-card", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.6rem",
  padding: "1.1rem 1rem 1.2rem",
  borderRadius: 14,
  background: vars.surface0,
  border: `1px solid ${vars.surface1}`,
  textDecoration: "none",
  color: vars.text,
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
  cursor: "pointer",
  transition: "transform 0.12s ease, box-shadow 0.12s ease",
});

globalStyle(".mc-card:hover, .mc-card:focus-visible", {
  transform: "translateY(-3px)",
  boxShadow: "0 8px 22px rgba(0, 0, 0, 0.28)",
  outline: "none",
});

/** Role pill — the accent colour is set inline per account. */
globalStyle(".mc-role", {
  alignSelf: "flex-start",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.03em",
  padding: "0.15rem 0.55rem",
  borderRadius: 999,
  color: vars.base,
});

globalStyle(".mc-body", { height: 150, width: "auto" });

globalStyle(".mc-name", {
  fontWeight: 600,
  fontSize: "1rem",
  textAlign: "center",
  wordBreak: "break-word",
});

globalStyle(".mc-cape", { fontSize: "0.72rem", color: vars.subtext0 });

/* ---- detail modal --------------------------------------------------------- */

globalStyle(".mc-overlay", {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.25rem",
  background: "rgba(0, 0, 0, 0.55)",
  backdropFilter: "blur(3px)",
  // stays mounted but inert until .is-open, so the fade can animate
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.16s ease",
});

globalStyle(".mc-overlay.is-open", { opacity: 1, pointerEvents: "auto" });

globalStyle(".mc-dialog", {
  position: "relative",
  width: "100%",
  maxWidth: 460,
  maxHeight: "90vh",
  overflow: "auto",
  background: vars.base,
  border: `1px solid ${vars.surface1}`,
  borderRadius: 18,
  padding: "1.4rem",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  transform: "translateY(12px) scale(0.98)",
  transition: "transform 0.16s ease",
});

globalStyle(".mc-overlay.is-open .mc-dialog", { transform: "none" });

globalStyle(".mc-close", {
  position: "absolute",
  top: "0.8rem",
  right: "0.8rem",
  width: 30,
  height: 30,
  border: "none",
  borderRadius: "50%",
  background: vars.surface0,
  color: vars.text,
  fontSize: "1.1rem",
  lineHeight: 1,
  cursor: "pointer",
});

globalStyle(".mc-close:hover", { background: vars.surface1 });

globalStyle(".mc-d-head", {
  display: "flex",
  gap: "0.9rem",
  alignItems: "center",
  marginBottom: "1rem",
});

globalStyle(".mc-hero", { height: 190, width: "auto", flex: "none" });

globalStyle(".mc-d-title", {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  minWidth: 0,
});

globalStyle(".mc-skull", { width: 52, height: 52, flex: "none" });

globalStyle(".mc-d-name", {
  fontSize: "1.3rem",
  fontWeight: 700,
  wordBreak: "break-word",
});

globalStyle(".mc-d-role", {
  alignSelf: "flex-start",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.03em",
  padding: "0.15rem 0.6rem",
  borderRadius: 999,
  color: vars.base,
});

globalStyle(".mc-hat", {
  alignSelf: "flex-start",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.75rem",
  padding: "0.3rem 0.6rem",
  borderRadius: 8,
  border: `1px solid ${vars.surface1}`,
  background: vars.surface0,
  color: vars.text,
});

globalStyle(".mc-hat:hover", { background: vars.surface1 });

/* ---- tabs ----------------------------------------------------------------- */

globalStyle(".mc-tabs", {
  display: "flex",
  gap: "0.35rem",
  marginBottom: "1rem",
  borderBottom: `1px solid ${vars.surface1}`,
});

globalStyle(".mc-tab", {
  flex: 1,
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.82rem",
  fontWeight: 600,
  padding: "0.55rem 0.4rem",
  border: "none",
  background: "none",
  color: vars.subtext0,
  borderBottom: "2px solid transparent",
  // pulls the active underline over the container's own border
  marginBottom: -1,
  transition: "color 0.12s ease, border-color 0.12s ease",
});

globalStyle(".mc-tab:hover", { color: vars.text });

globalStyle(".mc-tab.is-active", {
  color: vars.text,
  borderBottomColor: vars.mauve,
});

globalStyle(".mc-panel", { display: "none" });
globalStyle(".mc-panel.is-active", { display: "block" });

/* ---- 3D skin viewer ------------------------------------------------------- */

globalStyle(".mc-ext-hero", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.6rem",
  marginBottom: "1rem",
});

globalStyle(".mc-3d-wrap", {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 400,
  marginBottom: "0.5rem",
});

globalStyle(".mc-3d-canvas", {
  maxWidth: "100%",
  borderRadius: 12,
  background: vars.surface0,
  border: `1px solid ${vars.surface1}`,
  cursor: "grab",
  // stops the page panning while dragging to rotate the model
  touchAction: "none",
});

globalStyle(".mc-3d-canvas:active", { cursor: "grabbing" });

globalStyle(".mc-3d-loading", {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.subtext0,
  fontSize: "0.9rem",
  pointerEvents: "none",
});

globalStyle(".mc-3d-loading[hidden]", { display: "none" });

globalStyle(".mc-3d-hint", {
  textAlign: "center",
  fontSize: "0.72rem",
  color: vars.subtext0,
  margin: "0 0 0.75rem",
});

/* ---- viewer controls (cape / elytra / animation pills) -------------------- */

globalStyle(".mc-ctl-group", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  justifyContent: "center",
  marginBottom: "0.6rem",
});

/** Zero-height flex item that forces a wrap, splitting a control group. */
globalStyle(".mc-flex-break", {
  flexBasis: "100%",
  height: 0,
  margin: 0,
  padding: 0,
  border: 0,
});

globalStyle(".mc-ctl-label", {
  width: "100%",
  textAlign: "center",
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: vars.subtext0,
  marginBottom: "0.1rem",
});

globalStyle(".mc-pill", {
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.75rem",
  padding: "0.32rem 0.7rem",
  borderRadius: 999,
  border: `1px solid ${vars.surface1}`,
  background: vars.surface0,
  color: vars.text,
  transition: "background 0.12s ease, border-color 0.12s ease",
});

globalStyle(".mc-pill:hover", { background: vars.surface1 });

globalStyle(".mc-pill.is-active", {
  background: vars.mauve,
  borderColor: vars.mauve,
  color: vars.base,
});

/* ---- data rows ------------------------------------------------------------ */

globalStyle(".mc-rows", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  margin: "0.25rem 0 1rem",
});

globalStyle(".mc-row", {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  fontSize: "0.85rem",
  padding: "0.4rem 0.65rem",
  borderRadius: 9,
  background: vars.surface0,
});

globalStyle(".mc-row-k", { color: vars.subtext0 });

globalStyle(".mc-row-v", {
  // --mono isn't a defined token; the fallback stack is what actually applies
  fontFamily: "var(--mono, ui-monospace, monospace)",
  wordBreak: "break-all",
  textAlign: "right",
});

globalStyle(".mc-copy", {
  cursor: "pointer",
  border: "none",
  background: "none",
  color: "inherit",
  font: "inherit",
  textAlign: "right",
  padding: 0,
});

globalStyle(".mc-copy:hover", { color: vars.mauve });

/* ---- textures ------------------------------------------------------------- */

globalStyle(".mc-tex", { display: "flex", gap: "0.75rem", marginBottom: "1rem" });

globalStyle(".mc-tex figure", {
  margin: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
});

/** pixelated so the skin/cape textures stay crisp rather than blurring. */
globalStyle(".mc-tex img, .mc-tex canvas", {
  imageRendering: "pixelated",
  background: vars.surface0,
  borderRadius: 8,
  border: `1px solid ${vars.surface1}`,
});

globalStyle(".mc-cape-cv", { width: 60, height: 96 });

globalStyle(".mc-tex figcaption", { fontSize: "0.7rem", color: vars.subtext0 });

globalStyle(".mc-section-t", {
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: vars.subtext0,
  margin: "0 0 0.5rem",
});

globalStyle(".mc-soon", {
  padding: "1rem",
  borderRadius: 12,
  border: `1px dashed ${vars.surface1}`,
  background: vars.surface0,
  color: vars.subtext0,
  textAlign: "center",
  fontSize: "0.9rem",
  marginBottom: "1rem",
});

globalStyle(".mc-namemc", {
  display: "inline-block",
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  padding: "0.65rem",
  borderRadius: 10,
  background: vars.surface0,
  color: vars.text,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
});

globalStyle(".mc-namemc:hover", { background: vars.surface1 });
