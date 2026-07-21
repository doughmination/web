/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Styles for app-level components (MemberStatus, ThemeToggle, ProtectedRoute).
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

/* MemberStatus */
export const statusCompact = style({
  marginTop: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.25rem",
});

export const statusCompactEmoji = style({
  fontSize: "0.875rem",
});

export const statusCompactText = style({
  fontSize: "0.75rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100px",
});

export const statusFull = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  padding: "0.75rem",
  borderRadius: "0.5rem",
  backgroundColor: `color-mix(in srgb, ${vars.muted} 50%, transparent)`,
  border: `1px solid ${vars.border}`,
});

export const statusFullEmoji = style({
  fontSize: "1.5rem",
  flexShrink: 0,
});

export const statusFullBody = style({
  flex: 1,
  minWidth: 0,
});

export const statusFullText = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  wordBreak: "break-word",
});

export const statusFullUpdated = style({
  fontSize: "0.75rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

/* ThemeToggle */
export const themeToggleButton = style({
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  ":hover": {
    transform: "scale(1.05)",
  },
});

export const themeToggleInner = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const themeToggleIcon = style({ fontSize: "0.875rem" });
export const themeToggleLabel = style({ fontSize: "0.75rem", fontWeight: 500 });

/* ProtectedRoute */
export const guardLoading = style({
  textAlign: "center",
  padding: "2rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const guardPage = style({
  width: "100%",
  margin: "0 auto",
  padding: "1.5rem",
  paddingTop: "5rem",
});

export const guardCard = style({
  maxWidth: "28rem",
  margin: "0 auto",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const guardEmoji = style({ fontSize: "3.75rem" });

export const guardTitle = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
});

export const guardText = style({
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const guardBack = style({
  color: vars.primary,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  background: "none",
  border: "none",
  cursor: "pointer",
  ":hover": { textDecoration: "underline" },
});
