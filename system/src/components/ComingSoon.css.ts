/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
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

const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

export const page = style({
  minHeight: "100vh",
  backgroundColor: vars.background,
  color: vars.foreground,
  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
});

export const wrap = style({
  maxWidth: "42rem",
  width: "100%",
});

export const cardBorder = style({
  borderWidth: "2px",
});

export const headerCenter = style({
  textAlign: "center",
  gap: "1.5rem",
  paddingBottom: "1rem",
});

export const iconWrap = style({
  display: "flex",
  justifyContent: "center",
});

export const icon = style({
  fontSize: "6rem",
  animation: `${bounce} 1s infinite`,
});

export const titleBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const title = style({
  fontSize: "2.25rem",
  fontWeight: 700,
  fontFamily: vars.fontComic,
  color: vars.primary,
});

export const subtitle = style({
  fontSize: "1.25rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
});

export const description = style({
  textAlign: "center",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "1.125rem",
});

export const progressBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const progressLabels = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const progressMuted = style({ color: vars.mutedForeground });

export const progressActive = style({
  color: vars.primary,
  fontWeight: 600,
});

export const progressTrack = style({
  width: "100%",
  backgroundColor: vars.muted,
  borderRadius: "9999px",
  height: "0.75rem",
  overflow: "hidden",
});

export const progressBar = style({
  height: "100%",
  background: `linear-gradient(to right, ${vars.primary}, ${vars.accent})`,
  borderRadius: "9999px",
  animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});

export const featuresBox = style({
  backgroundColor: `color-mix(in srgb, ${vars.muted} 50%, transparent)`,
  borderRadius: "0.5rem",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const featuresTitle = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  fontSize: "1.125rem",
  textAlign: "center",
});

export const featuresGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "0.75rem",
  "@media": {
    "screen and (min-width: 768px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
});

export const featureItem = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
});

export const featureIcon = style({ fontSize: "1.25rem" });

export const featureText = style({
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.mutedForeground,
});

export const actions = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  justifyContent: "center",
  "@media": {
    "screen and (min-width: 640px)": {
      flexDirection: "row",
    },
  },
});

export const btnIcon = style({
  width: "1rem",
  height: "1rem",
  marginRight: "0.5rem",
});

export const footerBlock = style({
  textAlign: "center",
  paddingTop: "1.5rem",
  borderTop: `1px solid ${vars.border}`,
});

export const footerText = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const footerLink = style({
  color: vars.primary,
  fontWeight: 600,
  textDecoration: "none",
  ":hover": { textDecoration: "underline" },
});
