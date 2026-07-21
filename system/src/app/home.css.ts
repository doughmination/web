/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Styles for the home / fronting page (formerly Tailwind utility classes on
 * pages/Index.tsx).
 */

import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

const mix = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export const loadingWrap = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
});

export const loadingText = style({
  fontSize: "1.5rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.text,
});

export const page = style({
  minHeight: "100vh",
  backgroundColor: vars.bg,
  color: vars.text,
  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
});

export const wsBanner = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  backgroundColor: "#eab308",
  color: "#000",
  textAlign: "center",
  padding: "0.5rem 0",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

/* Header */
export const header = style({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 40,
  backgroundColor: mix(vars.bg, 90),
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  borderBottom: `1px solid ${vars.surface}`,
  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
});

export const headerInner = style({
  width: "100%",
  margin: "0 auto",
  padding: "0.75rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const logoLink = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
  color: vars.accent,
  textDecoration: "none",
  transition: "color 0.15s ease",
  ":hover": { color: mix(vars.accent, 80) },
});

export const navUser = style({
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.textMuted,
  marginRight: "0.5rem",
});

export const navUserName = style({
  color: vars.text,
  fontWeight: 600,
});

export const mobileMenuBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem",
  borderRadius: "0.375rem",
  backgroundColor: vars.surface,
  color: vars.text,
  border: "none",
  cursor: "pointer",
  transition: "color 0.15s ease, background-color 0.15s ease",
  ":hover": {
    backgroundColor: vars.accent,
    color: vars.bg,
  },
  "@media": {
    "screen and (min-width: 768px)": { display: "none" },
  },
});

export const icon24 = style({ width: "1.5rem", height: "1.5rem" });
export const icon20 = style({ width: "1.25rem", height: "1.25rem" });

/* Mobile menu */
export const mobileOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 30,
  backgroundColor: "rgb(0 0 0 / 0.5)",
  "@media": {
    "screen and (min-width: 768px)": { display: "none" },
  },
});

export const mobilePanel = style({
  position: "absolute",
  right: 0,
  top: "61px",
  width: "16rem",
  maxWidth: "80vw",
  height: "100vh",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  backgroundColor: mix(vars.bg, 95),
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  borderLeft: `1px solid ${vars.surface}`,
});

export const mobileList = style({
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  gap: "0.75rem",
  listStyle: "none",
});

export const mobileUser = style({
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.textMuted,
  borderBottom: `1px solid ${vars.surface}`,
});

export const mobileUserName = style({
  color: vars.text,
  fontWeight: 600,
  display: "block",
  marginTop: "0.25rem",
});

export const mobileLink = style({
  display: "block",
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  textAlign: "center",
  transition: "all 0.15s ease",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  backgroundColor: vars.surface,
  color: vars.text,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  ":hover": {
    backgroundColor: vars.accent,
    color: vars.accentAlt,
  },
});

export const mobileLogout = style({
  width: "100%",
  padding: "0.75rem 1rem",
  backgroundColor: vars.danger,
  color: vars.bg,
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  textAlign: "center",
  transition: "background-color 0.15s ease",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  ":hover": { backgroundColor: mix(vars.danger, 80) },
});

export const headerSpacer = style({ height: "5rem" });

/* Main content */
export const main = style({
  width: "100%",
  margin: "0 auto",
  padding: "1rem 0.5rem 0",
  flexGrow: 1,
  "@media": {
    "screen and (min-width: 640px)": { paddingLeft: "1rem", paddingRight: "1rem" },
  },
});

export const contentWrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  "@media": {
    "screen and (min-width: 640px)": { gap: "1rem" },
  },
});

export const pageTitle = style({
  fontSize: "2.25rem",
  fontWeight: 700,
  marginBottom: "2rem",
  textAlign: "center",
  fontFamily: vars.fontComic,
  color: vars.accent,
});

/* Mental state banner extras */
export const bannerRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
});

export const bannerIcon = style({ fontSize: "1.5rem" });

export const bannerNotes = style({
  marginTop: "0.5rem",
  fontFamily: vars.fontComic,
  fontSize: "0.875rem",
  opacity: 0.8,
});

export const bannerUpdated = style({
  display: "block",
  marginTop: "0.5rem",
  opacity: 0.75,
  textAlign: "center",
  fontFamily: vars.fontComic,
});

/* Currently fronting */
export const frontingSection = style({
  marginBottom: "1.5rem",
  padding: "1rem",
  borderBottom: `1px solid ${vars.surface}`,
});

export const frontingTitle = style({
  fontSize: "1.25rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginBottom: "0.75rem",
  textAlign: "center",
});

export const frontingRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  justifyContent: "center",
});

export const frontingItem = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
});

/* Thought-bubble status */
export const bubbleWrap = style({
  position: "absolute",
  top: "-2.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 20,
});

export const bubbleWrapGrid = style([bubbleWrap, { top: "-3rem" }]);

export const bubble = style({
  position: "relative",
  backgroundColor: vars.bg,
  border: `2px solid ${vars.surface}`,
  borderRadius: "30px",
  padding: "0.375rem 0.75rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  maxWidth: "140px",
});

export const bubbleRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
});

export const bubbleEmoji = style({ fontSize: "0.875rem" });

export const bubbleText = style({
  fontSize: "0.75rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.text,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const bubbleDotWrapLarge = style({
  position: "absolute",
  bottom: "-1.25rem",
  left: "50%",
  transform: "translateX(calc(-50% + 0.5rem))",
});

export const bubbleDotWrapSmall = style({
  position: "absolute",
  bottom: "-1.75rem",
  left: "50%",
  transform: "translateX(calc(-50% + 0.75rem))",
});

export const bubbleDotLarge = style({
  width: "0.625rem",
  height: "0.625rem",
  backgroundColor: vars.bg,
  border: `2px solid ${vars.surface}`,
  borderRadius: "9999px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
});

export const bubbleDotSmall = style({
  width: "0.375rem",
  height: "0.375rem",
  backgroundColor: vars.bg,
  border: `1px solid ${vars.surface}`,
  borderRadius: "9999px",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
});

/* Avatars & member cards */
export const avatarImg = style({
  width: "4rem",
  height: "4rem",
  borderRadius: "9999px",
  objectFit: "cover",
  borderWidth: "3px",
  borderStyle: "solid",
  transition: "all 0.15s ease",
  cursor: "pointer",
  ":hover": { transform: "scale(1.05)" },
});

export const avatarImgGrid = style([
  avatarImg,
  {
    margin: "0 auto 0.5rem",
    display: "block",
  },
]);

export const frontingNameWrap = style({
  marginTop: "0.5rem",
  textAlign: "center",
  maxWidth: "120px",
});

export const memberLink = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  transition: "color 0.15s ease",
  display: "block",
  textDecoration: "none",
});

export const memberCardName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  lineHeight: 1.25,
  margin: 0,
  transition: "color 0.15s ease",
  /* Names wrap to at most two lines; the reserved height keeps every card in
     a row the same height whether or not the name wraps. */
  minHeight: "2.5em",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

export const memberPronouns = style({
  fontSize: "0.75rem",
  color: vars.textMuted,
  marginTop: "0.25rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const tagRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
  marginTop: "0.25rem",
  justifyContent: "center",
});

export const tagRowSpaced = style([tagRow, { marginTop: "0.5rem" }]);

export const tagChip = style({
  fontSize: "0.75rem",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  backgroundColor: vars.surface,
  color: vars.text,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const tagMore = style({
  fontSize: "0.75rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

/* Search & filters */
export const filtersBlock = style({
  marginBottom: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const filterRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  justifyContent: "center",
});

export const searchRelative = style({ position: "relative" });

/* Grid extras */
export const gridItemRelative = style({ position: "relative" });

export const cardCenter = style({
  textAlign: "center",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.125rem",
});

export const relativeInline = style({ position: "relative", display: "inline-block" });

/* Empty state */
export const emptyState = style({
  textAlign: "center",
  padding: "2rem 0",
});

export const emptyText = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "1.125rem",
  color: vars.textMuted,
});

export const emptyActions = style({
  marginTop: "1rem",
  display: "flex",
  gap: "0.5rem",
  justifyContent: "center",
});

/* Footer extras */
export const footerNote = style({
  marginTop: "1rem",
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const footerNoteLink = style({
  textDecoration: "underline",
  color: "inherit",
  transition: "color 0.15s ease",
  ":hover": { color: vars.text },
});

/* Screen-reader-only SEO block */
export const srOnly = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
});

globalStyle(`${srOnly} *`, {
  position: "static",
});

/* Desktop nav (plain flex version used on the home header) */
export const desktopNavRow = style({
  display: "none",
  alignItems: "center",
  gap: "0.75rem",
  "@media": {
    "screen and (min-width: 768px)": { display: "flex" },
  },
});
