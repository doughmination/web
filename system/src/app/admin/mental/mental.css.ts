/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, ${vars.bg})`;

export const stateCardBase = style({
  borderWidth: "2px",
});

export const stateSafe = style({
  backgroundColor: tint(vars.success, 12),
  borderColor: vars.success,
});

export const stateUnstable = style({
  backgroundColor: tint(vars.warning, 12),
  borderColor: vars.warning,
});

export const stateIdealizing = style({
  backgroundColor: tint(vars.peach, 12),
  borderColor: vars.peach,
});

export const stateSelfHarming = style({
  backgroundColor: tint(vars.danger, 12),
  borderColor: vars.danger,
});

export const stateHighRisk = style({
  backgroundColor: tint(vars.maroon, 18),
  borderColor: vars.maroon,
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
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

export const select = style({
  width: "100%",
  padding: "0.5rem",
  border: `1px solid ${vars.surface}`,
  borderRadius: "0.375rem",
  backgroundColor: vars.bg,
  color: vars.text,
  fontFamily: vars.fontComic,
});

export const textarea = style({
  width: "100%",
  padding: "0.5rem",
  border: `1px solid ${vars.surface}`,
  borderRadius: "0.375rem",
  backgroundColor: vars.bg,
  color: vars.text,
  fontFamily: vars.fontComic,
  resize: "none",
});
