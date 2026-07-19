/**
 * genshin.css.ts — the /genshin 3D render gallery.
 *
 * Ported from public/css/pages/genshin.css.
 *
 * Dropped: .genshin-hint — nothing renders it.
 *
 * BROKEN TOKEN, deliberately preserved: the source said
 * `color: var(--subtext, var(--text))`. There is no --subtext token (the
 * contract has --subtext-0 and --subtext-1), so it has always resolved to
 * --text. Mapping to vars.text keeps the current appearance exactly; switch to
 * vars.textMuted if you want the dimmer secondary colour that was clearly
 * intended.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

globalStyle(".genshin-stage", {
  maxWidth: 1320,
  margin: "0 auto",
  padding: "2rem 1rem 4rem",
});

globalStyle(".genshin-intro", {
  textAlign: "center",
  marginBottom: "2rem",
});

globalStyle(".genshin-intro h1", {
  color: vars.accent,
  marginBottom: "0.25rem",
});

globalStyle(".genshin-intro p", {
  color: vars.text, // see the --subtext note above
  opacity: 0.85,
  maxWidth: "44ch",
  margin: "0 auto",
});

/**
 * Desktop-only. Below the breakpoint the grid is hidden entirely — which also
 * means the heavy <model-viewer> instances never load — and a short notice is
 * shown instead.
 */
globalStyle(".genshin-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "1.5rem",
  "@media": {
    "(max-width: 820px)": { display: "none" },
  },
});

globalStyle(".genshin-desktop-only", {
  display: "none",
  "@media": {
    "(max-width: 820px)": {
      display: "block",
      textAlign: "center",
      color: vars.text,
      background: vars.bgRaised,
      border: `1px solid ${vars.bgDeep}`,
      borderRadius: "1rem",
      padding: "2rem 1.5rem",
      maxWidth: "40ch",
      margin: "1rem auto 0",
      lineHeight: 1.5,
    },
  },
});

globalStyle(".genshin-card", {
  background: vars.bgRaised,
  border: `1px solid ${vars.surface}`,
  borderRadius: "1rem",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
});

globalStyle(".genshin-card:hover", {
  transform: "translateY(-4px)",
  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
});

/**
 * The 3D viewport. model-viewer fills it; the poster shows while loading.
 * Taller ratio gives the (portrait) character models more room.
 */
globalStyle(".genshin-viewer", {
  position: "relative",
  width: "100%",
  aspectRatio: "3 / 5",
  minHeight: 420,
  background: `radial-gradient(circle at 50% 30%, ${vars.surface}, ${vars.bgDeep})`,
});

/** Owned / Want badge, top-right corner of each viewer. */
globalStyle(".genshin-tag", {
  position: "absolute",
  top: "0.6rem",
  right: "0.6rem",
  zIndex: 2,
  padding: "0.2rem 0.6rem",
  borderRadius: 999,
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  color: vars.bgDeep,
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  pointerEvents: "none",
});

globalStyle(".genshin-tag.owned", { background: vars.success });
globalStyle(".genshin-tag.want", { background: vars.warning });

globalStyle(".genshin-meta", {
  padding: "1rem 1.1rem 1.2rem",
  borderTop: `1px solid ${vars.bgDeep}`,
});

globalStyle(".genshin-meta h2", {
  margin: "0 0 0.15rem",
  color: vars.accentAlt,
  fontSize: "1.15rem",
});

globalStyle(".genshin-meta .element", {
  fontSize: "0.85rem",
  color: vars.peach,
  margin: "0 0 0.5rem",
});

globalStyle(".genshin-meta .credit", {
  fontSize: "0.72rem",
  opacity: 0.6,
  margin: 0,
  lineHeight: 1.4,
});
