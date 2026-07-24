import { style } from "@vanilla-extract/css";

import { vars } from "./theme.css";

export const page = style({
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.xl,
  padding: vars.space.lg,
});

export const header = style({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: vars.space.sm,
  maxWidth: "34rem",
});

export const name = style({
  fontSize: "clamp(2rem, 6vw, 3rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
});

export const tagline = style({
  fontSize: "1.05rem",
  color: vars.color.muted,
});

export const grid = style({
  width: "100%",
  maxWidth: "40rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
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
  transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
  selectors: {
    "&:hover": {
      background: vars.color.surfaceHover,
      borderColor: vars.color.accent,
      transform: "translateY(-2px)",
    },
  },
});

export const cardTitle = style({
  fontSize: "1.1rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: vars.space.xs,
});

export const cardArrow = style({
  color: vars.color.accent,
  transition: "transform 0.15s ease",
  selectors: {
    [`${card}:hover &`]: {
      transform: "translateX(3px)",
    },
  },
});

export const cardDesc = style({
  fontSize: "0.9rem",
  color: vars.color.muted,
});

export const footer = style({
  fontSize: "0.85rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});
