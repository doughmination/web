/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const wrapWide = style({
  maxWidth: "72rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const columns = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.5rem",
  "@media": {
    "screen and (min-width: 1024px)": {
      gridTemplateColumns: "2fr 1fr",
    },
  },
});

export const colStack = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const searchActions = style({
  display: "flex",
  gap: "0.5rem",
});

export const selectedCount = style({
  marginLeft: "auto",
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
});

export const memberScroll = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxHeight: "600px",
  overflowY: "auto",
  paddingRight: "0.5rem",
});

export const memberOption = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem",
  borderRadius: "0.5rem",
  border: `2px solid ${vars.surface}`,
  cursor: "pointer",
  transition: "all 0.15s ease",
  ":hover": {
    borderColor: `color-mix(in srgb, ${vars.accent} 50%, transparent)`,
  },
});

export const memberOptionSelected = style({
  borderColor: `${vars.accent} !important` as unknown as string,
  backgroundColor: vars.accent,
});

export const tagChip = style({
  fontSize: "0.75rem",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  backgroundColor: vars.surface,
  color: vars.text,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const tagRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
  marginTop: "0.25rem",
});

export const sideList = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const sideRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const sideAvatar = style({
  width: "2rem",
  height: "2rem",
  borderRadius: "9999px",
  objectFit: "cover",
});

export const sideName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  flex: 1,
});

export const removeBtn = style({
  color: vars.danger,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "0.875rem",
  ":hover": { opacity: 0.8 },
});

export const centerNoteXs = style({
  fontSize: "0.75rem",
  textAlign: "center",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});
