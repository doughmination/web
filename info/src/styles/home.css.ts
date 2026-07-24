import { style, keyframes } from "@vanilla-extract/css";

import { vars } from "./theme.css";

// The trans gradient lives on the whole word (one continuous ramp) and its
// position shimmers across; each letter bobs on top of it, independently.
const slide = keyframes({ to: { backgroundPositionX: "200%" } });
const wave = keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-0.16em)" },
});

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
  whiteSpace: "pre",
  // One trans gradient across the whole word; its position shimmers.
  backgroundImage:
    "linear-gradient(90deg, #5BCEFA, #F5A9B8, #ffffff, #F5A9B8, #5BCEFA, #5BCEFA)",
  backgroundSize: "200% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  animation: `${slide} 6s linear infinite`,
  // Soft trans-blue + trans-pink glow so the title pops on the dark canvas.
  filter:
    "drop-shadow(0 0 14px rgba(91, 206, 250, 0.28)) drop-shadow(0 0 14px rgba(245, 169, 184, 0.28))",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

// One per character — just the bob. The gradient/shimmer is on the parent word;
// letters inherit its clipped colour and only move.
export const letter = style({
  display: "inline-block",
  animationName: wave,
  animationDuration: "2.2s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationName: "none",
    },
  },
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
  background: "linear-gradient(90deg, #5BCEFA, #F5A9B8)",
  border: "none",
  borderRadius: vars.radius.full,
  textDecoration: "none",
  transition: "opacity 0.15s ease",
  selectors: {
    "&:hover": { opacity: 0.9 },
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
  transition: "background 0.15s ease, border-color 0.15s ease",
  selectors: {
    "&:hover": {
      background: vars.color.surfaceHover,
      borderColor: vars.color.accent,
    },
  },
});

export const footer = style({
  fontSize: "0.85rem",
  color: vars.color.muted,
  fontFamily: vars.font.mono,
});
