/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Shared styles for the admin + owner dashboard pages.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "./theme.css";

export const page = style({
  width: "100%",
  margin: "0 auto",
  padding: "1.5rem",
  paddingTop: "5rem",
});

export const loadingText = style({
  textAlign: "center",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const wrap = style({
  maxWidth: "56rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const wrapNarrow = style({
  maxWidth: "48rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const headerRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const pageTitle = style({
  fontSize: "1.875rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
});

export const pageSubtitle = style({
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const btnIcon = style({
  width: "1rem",
  height: "1rem",
  marginRight: "0.5rem",
});

/* Dashboard grid */
export const dashGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",
  "@media": {
    "screen and (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
});

export const dashCard = style({
  padding: "1.5rem",
  borderRadius: "0.5rem",
  border: `2px solid ${vars.border}`,
  transition: "all 0.15s ease",
  cursor: "pointer",
  textAlign: "center",
  height: "100%",
  ":hover": {
    borderColor: vars.primary,
    backgroundColor: vars.accent,
  },
});

export const dashIcon = style({
  fontSize: "2.25rem",
  display: "block",
  marginBottom: "0.75rem",
  transition: "transform 0.15s ease",
  selectors: {
    [`${dashCard}:hover &`]: { transform: "scale(1.1)" },
  },
});

export const dashLabel = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const dashDesc = style({
  fontSize: "0.75rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

/* Forms */
export const formStack = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const fieldBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const checkboxRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const checkboxLabel = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  cursor: "pointer",
});

export const buttonRow = style({
  display: "flex",
  gap: "0.5rem",
});

export const flexGrow = style({ flex: 1 });

export const fullWidth = style({ width: "100%" });

export const cardTopPad = style({ paddingTop: "1.5rem" });

/* User list */
export const listStack = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const userRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  backgroundColor: vars.muted,
  borderRadius: "0.5rem",
  border: `1px solid ${vars.border}`,
});

export const userRowCurrent = style({
  borderColor: vars.primary,
});

export const userAvatar = style({
  width: "3rem",
  height: "3rem",
  borderRadius: "9999px",
  objectFit: "cover",
  flexShrink: 0,
});

export const userInfo = style({
  flex: 1,
  minWidth: 0,
});

export const userNameRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap",
});

export const userName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const userHandle = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const smallBadge = style({
  fontFamily: vars.fontComic,
  fontSize: "0.75rem",
});

/* Per-user edit panel */
export const editPanel = style({
  padding: "1rem",
  backgroundColor: vars.background,
  borderRadius: "0.5rem",
  border: `1px solid ${vars.border}`,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

/* Stats */
export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",
});

export const statBox = style({
  padding: "1rem",
  backgroundColor: vars.muted,
  borderRadius: "0.5rem",
});

export const statLabel = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const statValue = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
});

export const emptyNote = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  textAlign: "center",
  padding: "1rem 0",
});

/* Member rows (status/tag/switch managers) */
export const memberRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem",
  backgroundColor: vars.muted,
  borderRadius: "0.5rem",
  border: `1px solid ${vars.border}`,
  transition: "border-color 0.15s ease",
  cursor: "pointer",
  ":hover": { borderColor: vars.primary },
});

export const memberRowSelected = style({
  borderColor: vars.primary,
  backgroundColor: vars.accent,
});

export const memberAvatarSm = style({
  width: "1.5rem",
  height: "1.5rem",
  borderRadius: "9999px",
  objectFit: "cover",
});

export const memberAvatarMd = style({
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "9999px",
  objectFit: "cover",
});

export const inlineRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const inlineRowTight = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.25rem",
});

export const smallMuted = style({
  fontSize: "0.75rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const smallMutedRight = style([smallMuted, { textAlign: "right" }]);

export const memberRowName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
});

export const truncate = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/* Emoji picker */
export const emojiInput = style({
  width: "5rem",
  textAlign: "center",
  fontSize: "1.5rem",
});

export const emojiGrid = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
});

export const emojiButton = style({
  width: "2rem",
  height: "2rem",
  fontSize: "1.25rem",
  borderRadius: "0.25rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  ":hover": { backgroundColor: vars.accent },
});

export const emojiPickerRow = style({
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  marginTop: "0.5rem",
});

/* Current status box */
export const statusBox = style({
  marginTop: "1rem",
  padding: "0.75rem",
  backgroundColor: vars.muted,
  borderRadius: "0.5rem",
  border: `1px solid ${vars.border}`,
});

export const statusBoxText = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
});

export const emojiLg = style({ fontSize: "1.25rem" });

/* Tag chips */
export const chipRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

export const chip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  padding: "0.25rem 0.625rem",
  borderRadius: "9999px",
  backgroundColor: vars.secondary,
  color: vars.secondaryForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const chipRemove = style({
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "inherit",
  fontWeight: 700,
  padding: 0,
  lineHeight: 1,
  ":hover": { color: vars.destructive },
});

/* Force refresh banner */
export const dangerBanner = style({
  backgroundColor: `color-mix(in srgb, ${vars.destructive} 10%, transparent)`,
  border: `2px solid ${vars.destructive}`,
  borderRadius: "0.5rem",
  padding: "1rem",
});

export const dangerBannerRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
});

export const dangerBannerTitle = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.destructive,
  marginBottom: "0.25rem",
});

export const dangerBannerText = style({
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.mutedForeground,
});

export const noWrap = style({ whiteSpace: "nowrap" });

export const helpText = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});
