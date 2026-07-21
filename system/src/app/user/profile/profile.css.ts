/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const page = style({
  width: "100%",
  margin: "0 auto",
  padding: "1.5rem",
  paddingTop: "5rem",
});

export const loadingText = style({
  textAlign: "center",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const narrowWrap = style({
  maxWidth: "28rem",
  margin: "0 auto",
});

export const narrowCenter = style([narrowWrap, { textAlign: "center" }]);

export const actionsCenter = style({
  marginTop: "1rem",
  textAlign: "center",
});

export const noDataText = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginBottom: "1rem",
});

export const headerCenter = style({ textAlign: "center" });

export const cardTitle = style({
  fontSize: "1.5rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const centerBlock = style({ textAlign: "center" });

export const avatarWrap = style({
  position: "relative",
  display: "inline-block",
  marginBottom: "1rem",
});

export const avatar = style({
  width: "6rem",
  height: "6rem",
  borderRadius: "9999px",
  margin: "0 auto",
  objectFit: "cover",
  border: `2px solid ${vars.surface}`,
  display: "block",
});

export const avatarFallback = style({
  width: "6rem",
  height: "6rem",
  borderRadius: "9999px",
  backgroundColor: vars.surface,
  margin: "0 auto 1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `2px solid ${vars.surface}`,
});

export const avatarFallbackEmoji = style({ fontSize: "2.25rem" });

export const displayName = style({
  fontSize: "1.25rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginBottom: "0.5rem",
  marginTop: "2rem",
});

export const adminBadge = style({
  marginLeft: "0.5rem",
  fontFamily: vars.fontComic,
});

export const username = style({
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const actionRow = style({
  display: "flex",
  gap: "0.75rem",
  justifyContent: "center",
  paddingTop: "1rem",
});
