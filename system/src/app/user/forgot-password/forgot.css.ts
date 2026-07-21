/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { palette, vars } from "@/styles/theme.css";

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, ${vars.background})`;

export const card = style({
  maxWidth: "42rem",
  margin: "2.5rem auto 0",
  padding: "1.5rem",
  border: `1px solid ${vars.border}`,
  borderRadius: "0.5rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  backgroundColor: vars.card,
});

export const header = style({
  textAlign: "center",
  marginBottom: "1.5rem",
});

export const title = style({
  fontSize: "1.875rem",
  fontWeight: 700,
  marginBottom: "0.5rem",
  fontFamily: vars.fontComic,
});

export const subtitle = style({
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

/* Info / notice boxes */
const noticeBase = {
  borderRadius: "0.5rem",
  padding: "1rem",
  marginBottom: "1.5rem",
} as const;

export const infoBox = style({
  ...noticeBase,
  backgroundColor: tint(palette.yellow, 15),
  border: `1px solid ${tint(palette.yellow, 40)}`,
});

export const infoTitle = style({
  fontWeight: 600,
  color: palette.yellow,
  fontFamily: vars.fontComic,
  marginBottom: "0.25rem",
});

export const infoText = style({
  fontSize: "0.875rem",
  color: palette.yellow,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const futureBox = style({
  ...noticeBase,
  backgroundColor: tint(palette.mauve, 15),
  border: `1px solid ${tint(palette.mauve, 40)}`,
});

export const futureTitle = style({
  fontWeight: 600,
  color: palette.mauve,
  fontFamily: vars.fontComic,
  marginBottom: "0.25rem",
});

export const futureText = style({
  fontSize: "0.875rem",
  color: palette.mauve,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const noticeRow = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const noticeEmoji = style({ fontSize: "1.5rem" });

/* Contact methods */
export const contactsBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
});

export const sectionTitle = style({
  fontWeight: 600,
  fontSize: "1.125rem",
  fontFamily: vars.fontComic,
});

export const contactCard = style({
  border: "1px solid",
  borderRadius: "0.5rem",
  padding: "1rem",
  transition: "transform 0.15s ease",
  ":hover": { transform: "scale(1.02)" },
});

export const contactDiscord = style({
  backgroundColor: tint(palette.lavender, 15),
  borderColor: tint(palette.lavender, 40),
  color: palette.lavender,
});

export const contactEmail = style({
  backgroundColor: tint(palette.blue, 15),
  borderColor: tint(palette.blue, 40),
  color: palette.blue,
});

export const contactTwitter = style({
  backgroundColor: tint(palette.sky, 15),
  borderColor: tint(palette.sky, 40),
  color: palette.sky,
});

export const contactRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const contactEmoji = style({ fontSize: "1.875rem" });

export const contactBody = style({ flex: 1 });

export const contactNameRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.25rem",
});

export const contactName = style({
  fontWeight: 600,
  fontFamily: vars.fontComic,
});

export const preferredBadge = style({
  fontSize: "0.75rem",
  backgroundColor: palette.green,
  color: vars.background,
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const contactValue = style({
  fontSize: "0.875rem",
  fontFamily: "monospace",
  fontWeight: 600,
});

/* What to include */
export const includeBox = style({
  ...noticeBase,
  backgroundColor: vars.muted,
  border: `1px solid ${vars.border}`,
});

export const includeTitle = style({
  fontWeight: 600,
  fontSize: "1.125rem",
  fontFamily: vars.fontComic,
  marginBottom: "0.75rem",
});

export const includeList = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  listStyle: "none",
});

export const includeItem = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
});

export const includeCheck = style({
  color: palette.green,
  fontWeight: 700,
});

/* Back to login */
export const backWrap = style({ textAlign: "center" });

export const backButton = style({
  display: "inline-block",
  backgroundColor: palette.blue,
  color: vars.background,
  padding: "0.5rem 1.5rem",
  borderRadius: "0.25rem",
  transition: "background-color 0.15s ease",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  textDecoration: "none",
  ":hover": { backgroundColor: palette.saphire },
});

export const helpBlock = style({
  marginTop: "1.5rem",
  paddingTop: "1.5rem",
  borderTop: `1px solid ${vars.border}`,
});

export const helpText = style({
  textAlign: "center",
  fontSize: "0.875rem",
  color: vars.mutedForeground,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});
