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

export const narrowWrap = style({
  maxWidth: "28rem",
  margin: "0 auto",
});

export const actionsCenter = style({
  marginTop: "1rem",
  textAlign: "center",
});

export const wrap = style({
  maxWidth: "42rem",
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

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const formTight = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const fieldBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const avatarBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const avatarRow = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

export const avatarRelative = style({ position: "relative" });

export const avatar = style({
  width: "5rem",
  height: "5rem",
  borderRadius: "9999px",
  objectFit: "cover",
  border: `2px solid ${vars.surface}`,
});

export const avatarFallback = style({
  width: "5rem",
  height: "5rem",
  borderRadius: "9999px",
  backgroundColor: vars.surface,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `2px solid ${vars.surface}`,
});

export const avatarFallbackEmoji = style({ fontSize: "1.5rem" });

export const avatarCheck = style({
  position: "absolute",
  bottom: "-0.25rem",
  right: "-0.25rem",
  backgroundColor: vars.accent,
  color: vars.bg,
  borderRadius: "9999px",
  width: "1.5rem",
  height: "1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
});

export const avatarControls = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const buttonRow = style({
  display: "flex",
  gap: "0.5rem",
});

export const fileNote = style({
  fontSize: "0.75rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const hiddenInput = style({ display: "none" });

export const helpText = style({
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const submitRow = style({
  display: "flex",
  justifyContent: "flex-end",
});
