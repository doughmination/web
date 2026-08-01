/* status/src/styles/status.css.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* styles/status.css.ts */

import { style, keyframes } from "@vanilla-extract/css";

import { vars } from "./theme.css";

const riseIn = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(16px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

const pulse = keyframes({
  "0%, 100%": {
    opacity: 1,
  },
  "50%": {
    opacity: 0.35,
  },
});

const slide = keyframes({
  to: {
    backgroundPositionX: "200%",
  },
});

export const page = style({
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space.lg,
  padding: vars.space.lg,
});

export const header = style({
  width: "100%",
  maxWidth: "44rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space.xs,
  textAlign: "center",
  marginTop: vars.space.lg,
  animation: `${riseIn} 0.6s ease both`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const title = style({
  fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  backgroundImage:
    "linear-gradient(90deg, #5BCEFA, #F5A9B8, #ffffff, #F5A9B8, #5BCEFA, #5BCEFA)",
  backgroundSize: "200% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  animation: `${slide} 6s linear infinite`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const subtitle = style({
  fontSize: "1rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});

// Overall banner: green when all up, accent-pink when something is down.
export const banner = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  fontWeight: 600,
});

export const grid = style({
  width: "100%",
  maxWidth: "44rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
  gap: vars.space.md,
});

export const card = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  padding: vars.space.lg,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  transition: "border-color 0.2s ease, transform 0.2s ease",
  animation: `${riseIn} 0.5s ease backwards`,
  selectors: {
    "&:hover": {
      borderColor: vars.color.accent,
      transform: "translateY(-4px)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const cardTop = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.sm,
});

export const cardName = style({
  fontSize: "1.1rem",
  fontWeight: 600,
});

export const cardUrl = style({
  fontSize: "0.85rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
  wordBreak: "break-all",
});

export const cardMeta = style({
  display: "flex",
  gap: vars.space.md,
  fontSize: "0.85rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});

// A round status light. Colour is passed inline so one style serves all states.
export const dot = style({
  width: "0.7rem",
  height: "0.7rem",
  borderRadius: vars.radius.full,
  flexShrink: 0,
  boxShadow: "0 0 10px currentColor",
});

export const dotChecking = style([
  dot,
  {
    animation: `${pulse} 1.1s ease-in-out infinite`,
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        animation: "none",
      },
    },
  },
]);

export const pill = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space.xs,
  fontSize: "0.8rem",
  fontWeight: 600,
});

// The two check lines (accessible + backend) stacked inside a card.
export const checks = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  marginTop: vars.space.xs,
});

export const checkLine = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
  fontSize: "0.85rem",
});

export const checkLabel = style({
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});

export const actions = style({
  position: "fixed",
  top: vars.space.md,
  right: vars.space.md,
  display: "flex",
  gap: vars.space.xs,
  zIndex: 10,
});

export const btnPrimary = style({
  padding: `${vars.space.xs} ${vars.space.md}`,
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#0a0b10",
  backgroundImage:
    "linear-gradient(90deg, #5BCEFA, #F5A9B8, #ffffff, #F5A9B8, #5BCEFA)",
  backgroundSize: "200% 100%",
  border: "none",
  borderRadius: vars.radius.full,
  textDecoration: "none",
  cursor: "pointer",
  animation: `${slide} 6s linear infinite`,
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 22px -8px rgba(245,169,184,0.6)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  },
});

export const btnSecondary = style({
  padding: `${vars.space.xs} ${vars.space.md}`,
  fontSize: "0.9rem",
  fontWeight: 600,
  color: vars.color.text,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.full,
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
  selectors: {
    "&:hover": {
      background: vars.color.surfaceHover,
      borderColor: vars.color.accent,
      transform: "translateY(-2px)",
    },
  },
});

export const btnDanger = style([
  btnSecondary,
  {
    selectors: {
      "&:hover": {
        borderColor: "#f5a9b8",
        color: "#f5a9b8",
      },
    },
  },
]);

export const footer = style({
  fontSize: "0.85rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
  marginTop: "auto",
  paddingTop: vars.space.lg,
});

// ---- Admin form ----

export const panel = style({
  width: "100%",
  maxWidth: "44rem",
  display: "flex",
  flexDirection: "column",
  gap: vars.space.md,
});

export const form = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  padding: vars.space.lg,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
});

export const field = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space.xs,
  flex: "1 1 12rem",
});

export const label = style({
  fontSize: "0.8rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});

export const input = style({
  padding: `${vars.space.xs} ${vars.space.sm}`,
  fontSize: "0.95rem",
  fontFamily: vars.font.sans,
  color: vars.color.text,
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  outline: "none",
  selectors: {
    "&:focus": {
      borderColor: vars.color.accent,
    },
  },
});

export const rowActions = style({
  display: "flex",
  gap: vars.space.xs,
  alignItems: "center",
});
