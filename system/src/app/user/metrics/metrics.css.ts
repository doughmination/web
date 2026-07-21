/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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
  maxWidth: "72rem",
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
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const selectorContent = style({
  paddingTop: "1.5rem",
});

export const selectorRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const selectorLabel = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const selectTrigger = style({
  width: "200px",
  fontFamily: vars.fontComic,
});

export const overviewGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1rem",
  "@media": {
    "screen and (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
});

export const overviewHeader = style({
  paddingBottom: "0.75rem",
});

export const overviewTitle = style({
  fontSize: "1.125rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const overviewValue = style({
  fontSize: "1.875rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
});

export const overviewNote = style({
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

export const tooltipBox = style({
  backgroundColor: vars.bg,
  border: `1px solid ${vars.surface}`,
  borderRadius: "0.5rem",
  padding: "0.75rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
});

export const tooltipName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const tooltipValue = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  color: vars.textMuted,
});

export const frontersList = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const fronterRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem",
  backgroundColor: vars.surface,
  borderRadius: "0.5rem",
});

export const fronterRank = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  borderRadius: "9999px",
  backgroundColor: vars.accent,
  color: vars.bg,
  fontWeight: 700,
  fontFamily: vars.fontComic,
  fontSize: "0.875rem",
});

export const fronterAvatar = style({
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "9999px",
  objectFit: "cover",
});

export const fronterInfo = style({
  flex: 1,
  minWidth: 0,
});

export const fronterName = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const fronterDuration = style({
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const progressWrap = style({
  width: "8rem",
  display: "none",
  "@media": {
    "screen and (min-width: 640px)": { display: "block" },
  },
});

export const progressTrack = style({
  height: "0.5rem",
  backgroundColor: vars.bg,
  borderRadius: "9999px",
  overflow: "hidden",
});

export const progressBar = style({
  height: "100%",
  backgroundColor: vars.accent,
  transition: "all 0.15s ease",
});

export const noDataContent = style({
  padding: "3rem 0",
});

export const noDataText = style({
  textAlign: "center",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});
