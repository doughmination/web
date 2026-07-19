/**
 * projects.css.ts — the /projects card grid.
 *
 * Ported from public/css/pages/projects.css. Nothing dropped: .project-card-status
 * looked unused to a grep, but the rendered DOM confirms it (and `.closed`) are
 * live — they're applied conditionally from the project's status.
 *
 * Note the html/body:has(.friend-grid) rules here also serve /cool-people. They
 * were written as a shared "grid pages scroll" fix and are kept together rather
 * than split, since duplicating them risks the two copies drifting.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/* ---- page shell ----------------------------------------------------------- */

/** On this page the header sits closer to the sections below it. */
globalStyle("body:has(.project-grid) .hub-header", {
  position: "relative",
  zIndex: 1,
  marginBottom: "0.25rem",
});

/** Grid pages need to scroll — the default layout pins body to the viewport. */
globalStyle("html:has(.project-grid), html:has(.friend-grid)", {
  height: "auto",
  minHeight: "100dvh",
  overflowY: "auto",
  overflowX: "hidden",
});

globalStyle("body:has(.project-grid), body:has(.friend-grid)", {
  height: "auto",
  minHeight: "100dvh",
  alignItems: "flex-start",
  overflowX: "hidden",
  overflowY: "visible",
});

/* ---- cards ---------------------------------------------------------------- */

globalStyle(".project-grid", {
  marginBottom: "1.5rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "1rem",
  width: "100%",
  maxWidth: 640,
});

globalStyle(".project-card", {
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
  padding: "1rem",
  borderRadius: 16,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  color: vars.text,
  textDecoration: "none",
  transition:
    "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
});

globalStyle(".project-card:hover, .project-card:has(:focus-visible)", {
  transform: "translateY(-3px)",
  background: vars.surfaceHi,
  borderColor: vars.accent,
  boxShadow: `0 6px 20px ${vars.accent}`,
});

/** The repo link fills the card body (avatar + title/status + bio). */
globalStyle(".project-card-main", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.9rem",
  minWidth: 0,
  color: "inherit",
  textDecoration: "none",
});

/** Separate call-to-action link to the live/deployed version. */
globalStyle(".project-card-live", {
  alignSelf: "flex-end",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  padding: "0.32rem 0.8rem",
  borderRadius: 999,
  background: vars.sky,
  border: `1px solid ${vars.sky}`,
  color: vars.bgDeep,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "filter 0.15s ease, transform 0.15s ease",
});

globalStyle(".project-card-live:hover, .project-card-live:focus-visible", {
  filter: "brightness(1.12)",
  transform: "translateY(-1px)",
});

globalStyle(".project-card-img", {
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 14,
  objectFit: "cover",
  border: `2px solid ${vars.warning}`,
  boxShadow: `0 4px 14px ${vars.accent}`,
});

globalStyle(".project-card-body", {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  minWidth: 0,
});

globalStyle(".project-card-head", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap",
});

globalStyle(".project-card-title", {
  fontWeight: 600,
  fontSize: "1rem",
  color: vars.text,
});

globalStyle(".project-card-status", {
  fontSize: "0.66rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  padding: "0.15rem 0.55rem",
  borderRadius: 999,
  background: vars.bgDeep,
  border: `1px solid ${vars.success}`,
  color: vars.success,
  whiteSpace: "nowrap",
});

globalStyle(".project-card-status.closed", {
  borderColor: vars.danger,
  color: vars.danger,
});

globalStyle(".project-card-bio", {
  margin: 0,
  fontSize: "0.85rem",
  lineHeight: 1.45,
  color: vars.textMuted,
});

/** Italic + dimmed until a real description replaces it. */
globalStyle(".project-card-bio.is-placeholder", {
  fontStyle: "italic",
  opacity: 0.65,
});
