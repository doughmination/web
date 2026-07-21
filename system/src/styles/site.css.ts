/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Shared site-wide component styles ported from main.css (@layer components)
 * to vanilla-extract. Classes are imported by pages instead of referenced as
 * string literals.
 */

import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

const mobile = "screen and (max-width: 640px)";
const tablet = "screen and (min-width: 641px) and (max-width: 1024px)";
const ultrawide = "screen and (min-width: 1920px)";

// No per-flavor font token in the new theme contract — same face across
// every flavor, so it just lives here as a plain constant.
const FONT_COMIC = "'Comic Code', cursive";

export const fontComic = style({
  fontFamily: FONT_COMIC,
  fontWeight: 600,
});

/* App shell (old #root styles) */
export const appRoot = style({
  maxWidth: "none",
  margin: "0 auto",
  padding: "1rem",
  textAlign: "center",
  overflowX: "hidden",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

/* Header */
export const header = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 40,
  height: "68px",
  backgroundColor: `color-mix(in srgb, ${vars.bg} 90%, transparent)`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: `1px solid color-mix(in srgb, ${vars.surface} 50%, transparent)`,
  boxShadow: `0 1px 3px color-mix(in srgb, ${vars.text} 8%, transparent)`,
  "@media": {
    [mobile]: { height: "60px", padding: "0.5rem 1rem" },
  },
});

export const container = style({
  width: "100%",
  maxWidth: "none",
  paddingLeft: "1rem",
  paddingRight: "1rem",
  marginLeft: "auto",
  marginRight: "auto",
  boxSizing: "border-box",
  "@media": {
    [mobile]: { padding: "0 1rem", maxWidth: "100%" },
    [tablet]: { padding: "0 1.5rem" },
  },
});

export const headerContainer = style([
  container,
  {
    height: "100%",
    padding: "0 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "none",
  },
]);

/* Navigation */
export const desktopNav = style({
  display: "none",
  gap: "1rem",
  alignItems: "center",
  marginLeft: "auto",
  "@media": {
    "screen and (min-width: 768px)": { display: "flex" },
  },
});

globalStyle(`${desktopNav} button, ${desktopNav} a`, {
  padding: "0.75rem 1.25rem",
  minHeight: "3rem",
  borderRadius: "0.375rem",
  transition: "all 0.2s ease",
  fontFamily: FONT_COMIC,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  backgroundColor: vars.surface,
  color: vars.text,
  border: `1px solid ${vars.surface}`,
});

globalStyle(`${desktopNav} button:hover, ${desktopNav} a:hover`, {
  backgroundColor: vars.accentAlt,
  color: vars.bg,
  borderColor: vars.accent,
});

/* Member grid */
export const memberGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "1.5rem",
  padding: "1rem",
  width: "100%",
  maxWidth: "none",
  overflow: "visible",
  boxSizing: "border-box",
  "@media": {
    [mobile]: {
      gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
      gap: "0.5rem",
      padding: "0.5rem",
    },
    [tablet]: {
      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      gap: "1rem",
    },
    [ultrawide]: {
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "1.75rem",
    },
  },
});

export const memberGridItem = style({});

globalStyle(`${memberGridItem} a`, {
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",
  borderRadius: "0.75rem",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
  textDecoration: "none !important" as unknown as "none",
  backgroundColor: `color-mix(in srgb, ${vars.bg} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${vars.surface} 30%, transparent)`,
  color: vars.text,
});

globalStyle(`${memberGridItem} a:hover`, {
  transform: "translateY(-5px)",
  boxShadow: `0 10px 15px -3px color-mix(in srgb, ${vars.accent} 40%, transparent)`,
  borderColor: `color-mix(in srgb, ${vars.accent} 70%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${vars.bg} 90%, transparent)`,
});

/* Avatars */
export const avatarContainer = style({
  position: "relative",
  borderRadius: "50%",
  overflow: "hidden",
  flexShrink: 0,
  margin: "0 auto",
  boxSizing: "border-box",
  width: "4.5rem",
  height: "4.5rem",
  border: `2px solid ${vars.surface}`,
  backgroundColor: vars.surface,
  "@media": {
    [mobile]: { width: "3.5rem", height: "3.5rem" },
    [tablet]: { width: "4rem", height: "4rem" },
  },
});

globalStyle(`${avatarContainer} img`, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  margin: 0,
  padding: 0,
});

globalStyle(`${memberGridItem} a:hover ${avatarContainer}`, {
  boxShadow: "0 0 20px var(--member-color)",
});

/* Fronting members */
export const frontingMembersContainer = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "1.5rem",
  alignItems: "flex-start",
  width: "100%",
  maxWidth: "100%",
  "@media": {
    [mobile]: { gap: "1rem" },
  },
});

export const frontingMember = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: "140px",
  textAlign: "center",
  flexShrink: 0,
  "@media": {
    [mobile]: { maxWidth: "100px", minWidth: "90px" },
  },
});

export const frontingMemberName = style({
  marginTop: "0.75rem",
  fontFamily: FONT_COMIC,
  fontWeight: 600,
  fontSize: "1.5rem",
  lineHeight: 1.2,
  wordWrap: "break-word",
  maxWidth: "100%",
  color: vars.text,
  "@media": {
    [mobile]: { fontSize: "1.25rem", marginTop: "0.5rem" },
  },
});

export const memberName = style({
  fontSize: "1.5rem",
  fontFamily: FONT_COMIC,
  fontWeight: 600,
  "@media": {
    [mobile]: { fontSize: "1.25rem" },
  },
});

/* Mental state banners */
const pulse = keyframes({
  "0%, 100%": { boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.7)" },
  "70%": { boxShadow: "0 0 0 10px rgba(220, 38, 38, 0)" },
});

export const mentalStateBanner = style({
  padding: "1rem",
  margin: "1rem 0",
  borderRadius: "0.5rem",
  border: "2px solid",
  position: "relative",
  fontFamily: FONT_COMIC,
  fontWeight: 600,
});

globalStyle(`${mentalStateBanner} *`, {
  fontFamily: FONT_COMIC,
  fontWeight: 600,
});

export const mentalStateSafe = style({
  background:
    "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
  borderColor: "rgba(34, 197, 94, 0.5)",
  color: "#10b981",
});

export const mentalStateUnstable = style({
  background:
    "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)",
  borderColor: "rgba(251, 191, 36, 0.5)",
  color: "#f59e0b",
});

export const mentalStateSelfHarming = style({
  background:
    "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)",
  borderColor: "rgba(239, 68, 68, 0.7)",
  color: "#f87171",
});

export const mentalStateHighlyAtRisk = style({
  background:
    "linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)",
  borderColor: "rgba(220, 38, 38, 0.8)",
  color: "#fca5a5",
  animation: `${pulse} 2s infinite`,
});

/* Badges */
export const hostBadge = style({
  display: "inline-block",
  fontSize: "0.7rem",
  padding: "0.15rem 0.55rem",
  borderRadius: "0.35rem",
  marginLeft: "0.5rem",
  fontWeight: 600,
  textTransform: "uppercase",
  verticalAlign: "middle",
  letterSpacing: "0.5px",
  fontFamily: FONT_COMIC,
  background: vars.accent,
  color: vars.bg,
  boxShadow: `0 2px 4px color-mix(in srgb, ${vars.accent} 50%, transparent)`,
});

/* Footer */
export const githubFooter = style({
  marginTop: "3rem",
  padding: "1.5rem 0",
  textAlign: "center",
  width: "100%",
  fontFamily: FONT_COMIC,
  borderTop: `1px solid color-mix(in srgb, ${vars.surface} 30%, transparent)`,
});

export const githubButton = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "1rem 2rem",
  minHeight: "3.5rem",
  borderRadius: "0.5rem",
  fontWeight: 600,
  transition: "all 0.2s ease",
  fontFamily: FONT_COMIC,
  textDecoration: "none",
  background: vars.surface,
  color: `${vars.text} !important` as unknown as string,
  boxShadow: `0 2px 4px color-mix(in srgb, ${vars.text} 10%, transparent)`,
  border: `1px solid ${vars.surface}`,
  ":hover": {
    transform: "translateY(-1px)",
    boxShadow: `0 4px 6px color-mix(in srgb, ${vars.accent} 30%, transparent)`,
    background: vars.accentAlt,
    color: vars.bg,
  },
});

/* Search bar */
export const searchContainer = style({
  position: "relative",
  maxWidth: "28rem",
  margin: "0 auto 1.5rem",
});

export const searchInput = style({
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 3rem",
  borderRadius: "0.5rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.surface,
  color: vars.text,
  fontFamily: FONT_COMIC,
  fontSize: "0.875rem",
  transition: "all 0.2s ease",
  ":focus": {
    outline: "none",
    borderColor: vars.accent,
    boxShadow: `0 0 0 2px color-mix(in srgb, ${vars.accent} 20%, transparent)`,
  },
  "::placeholder": {
    color: vars.textMuted,
  },
});

export const searchIcon = style({
  position: "absolute",
  left: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: vars.textMuted,
  width: "1.25rem",
  height: "1.25rem",
});

export const searchClear = style({
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: vars.textMuted,
  cursor: "pointer",
  padding: "0.25rem",
  borderRadius: "0.25rem",
  transition: "all 0.2s ease",
  ":hover": {
    color: vars.text,
    backgroundColor: vars.surface,
  },
});

/* Filter buttons */
export const filterButton = style({
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  transition: "all 0.2s ease",
  fontFamily: FONT_COMIC,
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.surface,
  color: vars.text,
  ":hover": {
    backgroundColor: vars.accentAlt,
    color: vars.bg,
    borderColor: vars.accent,
  },
});

export const filterButtonActive = style({
  backgroundColor: `${vars.accent} !important` as unknown as string,
  color: `${vars.bg} !important` as unknown as string,
  borderColor: vars.accent,
});

/* Fronting glow */
const frontingPulse = keyframes({
  "0%, 100%": { transform: "scale(1)" },
  "50%": { transform: "scale(1.02)" },
});

export const frontingGlow = style({
  position: "relative",
  animation: `${frontingPulse} 2s ease-in-out infinite`,
});

globalStyle(`${frontingGlow} a`, {
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--member-color) 15%, transparent) 0%, color-mix(in srgb, var(--member-color) 5%, transparent) 100%)",
  border: "2px solid color-mix(in srgb, var(--member-color) 50%, transparent)",
  boxShadow:
    "0 0 20px color-mix(in srgb, var(--member-color) 30%, transparent), 0 0 40px color-mix(in srgb, var(--member-color) 20%, transparent), inset 0 0 20px color-mix(in srgb, var(--member-color) 10%, transparent)",
});

globalStyle(`${frontingGlow} a:hover`, {
  borderColor: "color-mix(in srgb, var(--member-color) 80%, transparent)",
  boxShadow:
    "0 0 30px color-mix(in srgb, var(--member-color) 50%, transparent), 0 0 60px color-mix(in srgb, var(--member-color) 30%, transparent), inset 0 0 30px color-mix(in srgb, var(--member-color) 15%, transparent)",
});

globalStyle(`${frontingGlow} img`, {
  borderColor: "var(--member-color)",
  boxShadow: "0 0 15px color-mix(in srgb, var(--member-color) 40%, transparent)",
});

globalStyle(`${frontingGlow} a::before`, {
  content: '"FRONTING"',
  position: "absolute",
  top: "-8px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--member-color)",
  color: "white",
  fontSize: "0.65rem",
  padding: "0.15rem 0.5rem",
  borderRadius: "0.25rem",
  fontWeight: 700,
  letterSpacing: "0.5px",
  fontFamily: FONT_COMIC,
  boxShadow: "0 2px 8px color-mix(in srgb, var(--member-color) 40%, transparent)",
  zIndex: 10,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
});

/* Utility */
export const themeTransition = style({
  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
});

// Re-export vars for pages that need raw tokens (e.g. charts)
export { vars };