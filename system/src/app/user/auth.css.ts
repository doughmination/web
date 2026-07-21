/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Shared styles for the auth pages (login, forgot password).
 */

import { keyframes, style } from "@vanilla-extract/css";
import { palette, vars } from "@/styles/theme.css";

const bounce = keyframes({
  "0%, 100%": {
    transform: "translateY(-25%)",
    animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
  },
  "50%": {
    transform: "none",
    animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
  },
});

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});

export const card = style({
  maxWidth: "28rem",
  margin: "2.5rem auto 0",
  padding: "1.5rem",
  border: `1px solid ${vars.border}`,
  borderRadius: "0.5rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  backgroundColor: vars.card,
});

export const heading = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: "1.5rem",
  textAlign: "center",
  fontFamily: vars.fontComic,
});

export const errorBox = style({
  backgroundColor: `color-mix(in srgb, ${vars.destructive} 15%, ${vars.background})`,
  color: vars.destructive,
  padding: "0.75rem",
  borderRadius: "0.375rem",
  marginBottom: "1rem",
});

export const successBox = style({
  backgroundColor: `color-mix(in srgb, ${palette.green} 15%, ${vars.background})`,
  color: palette.green,
  padding: "0.75rem",
  borderRadius: "0.375rem",
  marginBottom: "1rem",
});

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const fieldLabel = style({
  display: "block",
  marginBottom: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  fontFamily: vars.fontComic,
});

export const textInput = style({
  width: "100%",
  border: `1px solid ${vars.input}`,
  padding: "0.5rem",
  borderRadius: "0.25rem",
  backgroundColor: vars.background,
  color: vars.foreground,
  fontFamily: vars.fontComic,
});

export const linkRight = style({
  textAlign: "right",
});

export const blueLink = style({
  fontSize: "0.875rem",
  color: palette.blue,
  fontFamily: vars.fontComic,
  textDecoration: "none",
  ":hover": {
    color: palette.saphire,
    textDecoration: "underline",
  },
});

export const turnstileBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const turnstileCenter = style({
  display: "flex",
  justifyContent: "center",
});

export const mutedNote = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  textAlign: "center",
  fontFamily: vars.fontComic,
});

export const submitBtn = style({
  backgroundColor: palette.blue,
  color: vars.background,
  padding: "0.5rem",
  borderRadius: "0.25rem",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  fontFamily: vars.fontComic,
  ":hover": { backgroundColor: palette.saphire },
  ":disabled": {
    backgroundColor: `color-mix(in srgb, ${palette.blue} 50%, ${vars.background})`,
    cursor: "not-allowed",
  },
});

export const bottomNote = style({
  marginTop: "1rem",
  textAlign: "center",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
});

export const loadingNote = style({
  marginTop: "1rem",
  textAlign: "center",
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
});

/* Welcome screen */
export const welcomeInner = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const welcomeEmoji = style({
  fontSize: "3.75rem",
  animation: `${bounce} 1s infinite`,
});

export const welcomeTitle = style({
  fontSize: "1.875rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
  color: vars.primary,
});

export const welcomeName = style({
  fontSize: "1.25rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const spinnerWrap = style({
  display: "flex",
  justifyContent: "center",
});

export const spinner = style({
  animation: `${spin} 1s linear infinite`,
  borderRadius: "9999px",
  height: "2rem",
  width: "2rem",
  borderBottom: `2px solid ${vars.primary}`,
});
