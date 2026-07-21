/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * vanilla-extract styles for the UI component library (formerly shadcn/ui
 * Tailwind classes). Variants are expressed with @vanilla-extract/recipes.
 */

import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { vars } from "@/styles/theme.css";

const mix = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/* Shared animations (replacing tailwindcss-animate) */
const fadeZoomIn = keyframes({
  from: { opacity: 0, transform: "scale(0.95)" },
  to: { opacity: 1, transform: "scale(1)" },
});
const fadeZoomOut = keyframes({
  from: { opacity: 1, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(0.95)" },
});

/* ============================================================================
   BUTTON
   ============================================================================ */
export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    whiteSpace: "nowrap",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    transition: "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
    cursor: "pointer",
    border: "1px solid transparent",
    selectors: {
      "&:focus-visible": {
        outline: "none",
        boxShadow: `0 0 0 2px ${vars.bg}, 0 0 0 4px ${vars.ring}`,
      },
      "&:disabled": {
        pointerEvents: "none",
        opacity: 0.5,
      },
    },
  },
  variants: {
    variant: {
      default: {
        backgroundColor: vars.accent,
        color: vars.bg,
        ":hover": { backgroundColor: mix(vars.accent, 90) },
      },
      destructive: {
        backgroundColor: vars.danger,
        color: vars.dangerForeground,
        ":hover": { backgroundColor: mix(vars.danger, 90) },
      },
      outline: {
        border: `1px solid ${vars.surface}`,
        backgroundColor: vars.bg,
        color: vars.text,
        ":hover": {
          backgroundColor: vars.accent,
          color: vars.bg,
        },
      },
      secondary: {
        backgroundColor: vars.surface,
        color: vars.text,
        ":hover": { backgroundColor: mix(vars.surface, 80) },
      },
      ghost: {
        backgroundColor: "transparent",
        color: vars.text,
        ":hover": {
          backgroundColor: vars.accent,
          color: vars.bg,
        },
      },
      link: {
        backgroundColor: "transparent",
        color: vars.accent,
        textUnderlineOffset: "4px",
        ":hover": { textDecoration: "underline" },
      },
    },
    size: {
      default: { height: "2.5rem", padding: "0.5rem 1rem" },
      sm: { height: "2.25rem", borderRadius: "0.375rem", padding: "0 0.75rem" },
      lg: { height: "2.75rem", borderRadius: "0.375rem", padding: "0 2rem" },
      icon: { height: "2.5rem", width: "2.5rem", padding: 0 },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

/* ============================================================================
   CARD
   ============================================================================ */
export const card = style({
  borderRadius: "0.5rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.bg,
  color: vars.bgForeground,
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
});

export const cardHeader = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
  padding: "1.5rem",
});

export const cardTitle = style({
  fontSize: "1.5rem",
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: "-0.025em",
});

export const cardDescription = style({
  fontSize: "0.875rem",
  color: vars.textMuted,
});

export const cardContent = style({
  padding: "1.5rem",
  paddingTop: 0,
});

export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  padding: "1.5rem",
  paddingTop: 0,
});

/* ============================================================================
   INPUT
   ============================================================================ */
export const input = style({
  display: "flex",
  height: "2.5rem",
  width: "100%",
  borderRadius: "0.375rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.bg,
  padding: "0.5rem 0.75rem",
  fontSize: "1rem",
  color: vars.text,
  "::placeholder": {
    color: vars.textMuted,
  },
  selectors: {
    "&:focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 2px ${vars.bg}, 0 0 0 4px ${vars.ring}`,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
  "@media": {
    "screen and (min-width: 768px)": { fontSize: "0.875rem" },
  },
});

/* ============================================================================
   LABEL
   ============================================================================ */
export const label = style({
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1,
});

/* ============================================================================
   BADGE
   ============================================================================ */
export const badge = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: "1px solid transparent",
    padding: "0.125rem 0.625rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    transition: "colors 0.15s ease",
  },
  variants: {
    variant: {
      default: {
        backgroundColor: vars.accent,
        color: vars.bg,
      },
      secondary: {
        backgroundColor: vars.surface,
        color: vars.text,
      },
      destructive: {
        backgroundColor: vars.danger,
        color: vars.dangerForeground,
      },
      outline: {
        color: vars.text,
        borderColor: vars.surface,
        backgroundColor: "transparent",
      },
    },
  },
  defaultVariants: { variant: "default" },
});

/* ============================================================================
   ALERT
   ============================================================================ */
export const alert = recipe({
  base: {
    position: "relative",
    width: "100%",
    borderRadius: "0.5rem",
    border: `1px solid ${vars.surface}`,
    padding: "1rem",
  },
  variants: {
    variant: {
      default: {
        backgroundColor: vars.bg,
        color: vars.text,
      },
      destructive: {
        borderColor: mix(vars.danger, 50),
        color: vars.danger,
      },
    },
  },
  defaultVariants: { variant: "default" },
});

export const alertTitle = style({
  marginBottom: "0.25rem",
  fontWeight: 500,
  lineHeight: 1,
  letterSpacing: "-0.025em",
});

export const alertDescription = style({
  fontSize: "0.875rem",
});

globalStyle(`${alertDescription} p`, { lineHeight: 1.625 });

/* ============================================================================
   SEPARATOR
   ============================================================================ */
export const separatorBase = style({
  flexShrink: 0,
  backgroundColor: vars.surface,
});

export const separatorHorizontal = style({ height: "1px", width: "100%" });
export const separatorVertical = style({ height: "100%", width: "1px" });

/* ============================================================================
   CHECKBOX
   ============================================================================ */
export const checkbox = style({
  height: "1rem",
  width: "1rem",
  flexShrink: 0,
  borderRadius: "0.125rem",
  border: `1px solid ${vars.accent}`,
  backgroundColor: "transparent",
  cursor: "pointer",
  selectors: {
    '&[data-state="checked"]': {
      backgroundColor: vars.accent,
      color: vars.bg,
    },
    "&:focus-visible": {
      outline: "none",
      boxShadow: `0 0 0 2px ${vars.bg}, 0 0 0 4px ${vars.ring}`,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

export const checkboxIndicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "currentColor",
});

/* ============================================================================
   TOOLTIP
   ============================================================================ */
export const tooltipContent = style({
  zIndex: 50,
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.popover,
  padding: "0.375rem 0.75rem",
  fontSize: "0.875rem",
  color: vars.popoverForeground,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  animation: `${fadeZoomIn} 0.15s ease`,
  selectors: {
    '&[data-state="closed"]': {
      animation: `${fadeZoomOut} 0.15s ease`,
    },
  },
});

/* ============================================================================
   SELECT
   ============================================================================ */
export const selectTrigger = style({
  display: "flex",
  height: "2.5rem",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "0.375rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.bg,
  color: vars.text,
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  cursor: "pointer",
  selectors: {
    "&:focus": {
      outline: "none",
      boxShadow: `0 0 0 2px ${vars.bg}, 0 0 0 4px ${vars.ring}`,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

globalStyle(`${selectTrigger} > span`, {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const selectIcon = style({
  height: "1rem",
  width: "1rem",
  opacity: 0.5,
});

export const selectScrollButton = style({
  display: "flex",
  cursor: "default",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.25rem 0",
});

export const selectContent = style({
  position: "relative",
  zIndex: 50,
  maxHeight: "24rem",
  minWidth: "8rem",
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: vars.popover,
  color: vars.popoverForeground,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  animation: `${fadeZoomIn} 0.15s ease`,
  selectors: {
    '&[data-state="closed"]': {
      animation: `${fadeZoomOut} 0.15s ease`,
    },
    '&[data-side="bottom"]': { transform: "translateY(0.25rem)" },
    '&[data-side="top"]': { transform: "translateY(-0.25rem)" },
  },
});

export const selectViewport = style({
  padding: "0.25rem",
});

export const selectViewportPopper = style({
  height: "var(--radix-select-trigger-height)",
  width: "100%",
  minWidth: "var(--radix-select-trigger-width)",
});

export const selectLabel = style({
  padding: "0.375rem 0.5rem 0.375rem 2rem",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const selectItem = style({
  position: "relative",
  display: "flex",
  width: "100%",
  cursor: "default",
  userSelect: "none",
  alignItems: "center",
  borderRadius: "0.125rem",
  padding: "0.375rem 0.5rem 0.375rem 2rem",
  fontSize: "0.875rem",
  outline: "none",
  selectors: {
    "&[data-disabled]": {
      pointerEvents: "none",
      opacity: 0.5,
    },
    "&:focus": {
      backgroundColor: vars.accent,
      color: vars.bg,
    },
  },
});

export const selectItemIndicator = style({
  position: "absolute",
  left: "0.5rem",
  display: "flex",
  height: "0.875rem",
  width: "0.875rem",
  alignItems: "center",
  justifyContent: "center",
});

export const selectSeparator = style({
  margin: "0.25rem -0.25rem",
  height: "1px",
  backgroundColor: vars.surface,
});

/* ============================================================================
   TOAST (Radix)
   ============================================================================ */
const slideInFromTop = keyframes({
  from: { transform: "translateY(-100%)" },
  to: { transform: "translateY(0)" },
});
const slideInFromBottom = keyframes({
  from: { transform: "translateY(100%)" },
  to: { transform: "translateY(0)" },
});
const slideOutToRight = keyframes({
  from: { transform: "translateX(0)", opacity: 1 },
  to: { transform: "translateX(100%)", opacity: 0 },
});

export const toastViewport = style({
  position: "fixed",
  top: 0,
  zIndex: 100,
  display: "flex",
  maxHeight: "100vh",
  width: "100%",
  flexDirection: "column-reverse",
  padding: "1rem",
  "@media": {
    "screen and (min-width: 640px)": {
      bottom: 0,
      right: 0,
      top: "auto",
      flexDirection: "column",
    },
    "screen and (min-width: 768px)": {
      maxWidth: "420px",
    },
  },
});

export const toastRoot = recipe({
  base: {
    pointerEvents: "auto",
    position: "relative",
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    overflow: "hidden",
    borderRadius: "0.375rem",
    border: `1px solid ${vars.surface}`,
    padding: "1.5rem",
    paddingRight: "2rem",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    transition: "all 0.2s ease",
    selectors: {
      '&[data-swipe="cancel"]': { transform: "translateX(0)" },
      '&[data-swipe="end"]': {
        transform: "translateX(var(--radix-toast-swipe-end-x))",
        animation: `${slideOutToRight} 0.15s ease forwards`,
      },
      '&[data-swipe="move"]': {
        transform: "translateX(var(--radix-toast-swipe-move-x))",
        transition: "none",
      },
      '&[data-state="open"]': {
        animation: `${slideInFromTop} 0.2s ease`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToRight} 0.2s ease forwards`,
      },
    },
    "@media": {
      "screen and (min-width: 640px)": {
        selectors: {
          '&[data-state="open"]': {
            animation: `${slideInFromBottom} 0.2s ease`,
          },
        },
      },
    },
  },
  variants: {
    variant: {
      default: {
        backgroundColor: vars.bg,
        color: vars.text,
      },
      destructive: {
        borderColor: vars.danger,
        backgroundColor: vars.danger,
        color: vars.dangerForeground,
      },
    },
  },
  defaultVariants: { variant: "default" },
});

export const toastAction = style({
  display: "inline-flex",
  height: "2rem",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.375rem",
  border: `1px solid ${vars.surface}`,
  backgroundColor: "transparent",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "colors 0.15s ease",
  ":hover": { backgroundColor: vars.surface },
  selectors: {
    "&:focus": {
      outline: "none",
      boxShadow: `0 0 0 2px ${vars.ring}`,
    },
    "&:disabled": { pointerEvents: "none", opacity: 0.5 },
  },
});

export const toastClose = style({
  position: "absolute",
  right: "0.5rem",
  top: "0.5rem",
  borderRadius: "0.375rem",
  padding: "0.25rem",
  color: mix(vars.text, 50),
  opacity: 0,
  transition: "opacity 0.15s ease",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  ":hover": { color: vars.text },
  selectors: {
    "&:focus": { opacity: 1, outline: "none", boxShadow: `0 0 0 2px ${vars.ring}` },
  },
});

globalStyle(`${toastRoot.classNames.base}:hover ${toastClose}`, {
  opacity: 1,
});

export const toastTitle = style({
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const toastDescription = style({
  fontSize: "0.875rem",
  opacity: 0.9,
});

export const toastContentGrid = style({
  display: "grid",
  gap: "0.25rem",
});
