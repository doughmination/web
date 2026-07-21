/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { palette, vars } from "@/styles/theme.css";

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, ${vars.background})`;

export const stateCardBase = style({
  borderWidth: "2px",
});

export const stateSafe = style({
  backgroundColor: tint(palette.green, 12),
  borderColor: palette.green,
});

export const stateUnstable = style({
  backgroundColor: tint(palette.yellow, 12),
  borderColor: palette.yellow,
});

export const stateIdealizing = style({
  backgroundColor: tint(palette.peach, 12),
  borderColor: palette.peach,
});

export const stateSelfHarming = style({
  backgroundColor: tint(palette.red, 12),
  borderColor: palette.red,
});

export const stateHighRisk = style({
  backgroundColor: tint(palette.maroon, 18),
  borderColor: palette.maroon,
});

export const currentRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "0.75rem",
});

export const currentIcon = style({ fontSize: "2.25rem" });

export const currentLabel = style({
  fontFamily: vars.fontComic,
  fontWeight: 700,
  fontSize: "1.25rem",
});

export const currentNotes = style({
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

export const select = style({
  width: "100%",
  padding: "0.5rem",
  border: `1px solid ${vars.input}`,
  borderRadius: "0.375rem",
  backgroundColor: vars.background,
  color: vars.foreground,
  fontFamily: vars.fontComic,
});

export const textarea = style({
  width: "100%",
  padding: "0.5rem",
  border: `1px solid ${vars.input}`,
  borderRadius: "0.375rem",
  backgroundColor: vars.background,
  color: vars.foreground,
  fontFamily: vars.fontComic,
  resize: "none",
});
