/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

const tint = (color: string, pct: number) =>
  `color-mix(in srgb, ${color} ${pct}%, ${vars.bg})`;

export const card = style({
  maxWidth: "42rem",
  margin: "2.5rem auto 0",
  padding: "1.5rem",
  border: `1px solid ${vars.surface}`,
  borderRadius: "0.5rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  backgroundColor: vars.bg,
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
  color: vars.textMuted,
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
  backgroundColor: tint(vars.warning, 15),
  border: `1px solid ${tint(vars.warning, 40)}`,
});

export const infoTitle = style({
  fontWeight: 600,
  color: vars.warning,
  fontFamily: vars.fontComic,
  marginBottom: "0.25rem",
});

export const infoText = style({
  fontSize: "0.875rem",
  color: vars.warning,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const futureBox = style({
  ...noticeBase,
  backgroundColor: tint(vars.accent, 15),
  border: `1px solid ${tint(vars.accent, 40)}`,
});

export const futureTitle = style({
  fontWeight: 600,
  color: vars.accent,
  fontFamily: vars.fontComic,
  marginBottom: "0.25rem",
});

export const futureText = style({
  fontSize: "0.875rem",
  color: vars.accent,
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
  backgroundColor: tint(vars.lavender, 15),
  borderColor: tint(vars.lavender, 40),
  color: vars.lavender,
});

export const contactEmail = style({
  backgroundColor: tint(vars.info, 15),
  borderColor: tint(vars.info, 40),
  color: vars.info,
});

export const contactTwitter = style({
  backgroundColor: tint(vars.sky, 15),
  borderColor: tint(vars.sky, 40),
  color: vars.sky,
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
  backgroundColor: vars.success,
  color: vars.bg,
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
  backgroundColor: vars.surface,
  border: `1px solid ${vars.surface}`,
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
  color: vars.success,
  fontWeight: 700,
});

/* Back to login */
export const backWrap = style({ textAlign: "center" });

export const backButton = style({
  display: "inline-block",
  backgroundColor: vars.info,
  color: vars.bg,
  padding: "0.5rem 1.5rem",
  borderRadius: "0.25rem",
  transition: "background-color 0.15s ease",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  textDecoration: "none",
  ":hover": { backgroundColor: vars.sapphire },
});

export const helpBlock = style({
  marginTop: "1.5rem",
  paddingTop: "1.5rem",
  borderTop: `1px solid ${vars.surface}`,
});

export const helpText = style({
  textAlign: "center",
  fontSize: "0.875rem",
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});
