/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const page = style({
  display: "flex",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: vars.bg,
});

export const inner = style({ textAlign: "center" });

export const title = style({
  marginBottom: "1rem",
  fontSize: "2.25rem",
  fontWeight: 700,
});

export const text = style({
  marginBottom: "1rem",
  fontSize: "1.25rem",
  color: vars.textMuted,
});

export const link = style({
  color: vars.info,
  textDecoration: "underline",
  ":hover": { color: vars.sapphire },
});
