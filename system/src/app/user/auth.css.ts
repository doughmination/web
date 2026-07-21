/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Shared styles for the auth pages (login, forgot password).
 */

import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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
  border: `1px solid ${vars.surface}`,
  borderRadius: "0.5rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  backgroundColor: vars.bg,
});

export const heading = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: "1.5rem",
  textAlign: "center",
  fontFamily: vars.fontComic,
});

export const errorBox = style({
  backgroundColor: `color-mix(in srgb, ${vars.danger} 15%, ${vars.bg})`,
  color: vars.danger,
  padding: "0.75rem",
  borderRadius: "0.375rem",
  marginBottom: "1rem",
});

export const successBox = style({
  backgroundColor: `color-mix(in srgb, ${vars.success} 15%, ${vars.bg})`,
  color: vars.success,
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
  border: `1px solid ${vars.surface}`,
  padding: "0.5rem",
  borderRadius: "0.25rem",
  backgroundColor: vars.bg,
  color: vars.text,
  fontFamily: vars.fontComic,
});

export const linkRight = style({
  textAlign: "right",
});

export const blueLink = style({
  fontSize: "0.875rem",
  color: vars.info,
  fontFamily: vars.fontComic,
  textDecoration: "none",
  ":hover": {
    color: vars.sapphire,
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
  color: vars.textMuted,
  textAlign: "center",
  fontFamily: vars.fontComic,
});

export const submitBtn = style({
  backgroundColor: vars.info,
  color: vars.bg,
  padding: "0.5rem",
  borderRadius: "0.25rem",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  fontFamily: vars.fontComic,
  ":hover": { backgroundColor: vars.sapphire },
  ":disabled": {
    backgroundColor: `color-mix(in srgb, ${vars.info} 50%, ${vars.bg})`,
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
  color: vars.textMuted,
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
  color: vars.accent,
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
  borderBottom: `2px solid ${vars.accent}`,
});

/* ---------------------------------------------------------------------------
   Account recovery (forgot password / forgot username / reset password)
   --------------------------------------------------------------------------- */

export const subtitle = style({
  marginTop: "-1rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  lineHeight: 1.5,
});

/** Confirmation panel shown after a recovery email goes out. */
export const sentInner = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
});

export const sentEmoji = style({ fontSize: "3rem" });

export const sentTitle = style({
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
  color: vars.success,
  margin: 0,
});

export const sentText = style({
  fontSize: "0.9375rem",
  fontFamily: vars.fontComic,
  lineHeight: 1.6,
  margin: 0,
});

/** The masked a•••@d•••.win hint. Monospace so the dots line up. */
export const maskedAddress = style({
  display: "inline-block",
  padding: "0.5rem 0.875rem",
  borderRadius: "0.375rem",
  backgroundColor: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  color: vars.accent,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "1rem",
  letterSpacing: "0.02em",
});

/** Inline availability / validation feedback under a field. */
export const fieldHint = style({
  marginTop: "0.375rem",
  fontSize: "0.8125rem",
  fontFamily: vars.fontComic,
});

export const hintOk = style([fieldHint, { color: vars.success }]);
export const hintBad = style([fieldHint, { color: vars.danger }]);
export const hintMuted = style([fieldHint, { color: vars.textMuted }]);

export const helperText = style({
  fontSize: "0.8125rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  marginTop: "0.375rem",
  lineHeight: 1.5,
});

/** Requirement checklist on the reset form. */
export const ruleList = style({
  listStyle: "none",
  margin: "0.5rem 0 0",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

export const ruleItem = style({
  fontSize: "0.8125rem",
  fontFamily: vars.fontComic,
  color: vars.textMuted,
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
});

export const ruleMet = style([ruleItem, { color: vars.success }]);

export const linkRow = style({
  marginTop: "1rem",
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
});

/** Full-card centred state, used while validating a reset token. */
export const centerState = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
  padding: "1rem 0",
});

export const stateEmoji = style({ fontSize: "3rem" });

export const stateTitle = style({
  fontSize: "1.375rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
  margin: 0,
});

export const stateTitleBad = style([stateTitle, { color: vars.danger }]);

/** Callout panel — e.g. the "confirm your email" prompt on failed login. */
export const infoPanel = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "0.5rem",
  backgroundColor: `color-mix(in srgb, ${vars.warning} 12%, ${vars.bg})`,
  border: `1px solid color-mix(in srgb, ${vars.warning} 40%, transparent)`,
});

export const backLink = style({
  display: "inline-block",
  marginTop: "0.5rem",
  padding: "0.5rem 1.25rem",
  borderRadius: "0.375rem",
  backgroundColor: vars.accent,
  color: vars.bg,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "0.875rem",
  textDecoration: "none",
  ":hover": { backgroundColor: vars.accentAlt },
});
