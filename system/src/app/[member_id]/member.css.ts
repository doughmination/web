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

export const errorWrap = style({
  maxWidth: "28rem",
  margin: "0 auto",
});

export const errorActions = style({
  marginTop: "1rem",
  textAlign: "center",
});

export const cardWrap = style({
  maxWidth: "42rem",
  margin: "0 auto",
});

export const headerCenter = style({
  textAlign: "center",
});

export const avatarBlock = style({
  marginBottom: "1rem",
  position: "relative",
  display: "inline-block",
});

/* Thought bubble */
export const bubbleWrap = style({
  position: "absolute",
  top: "-5rem",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 20,
});

export const bubble = style({
  position: "relative",
  backgroundColor: vars.bg,
  border: `2px solid ${vars.surface}`,
  borderRadius: "30px",
  padding: "0.5rem 1rem",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  maxWidth: "200px",
});

export const bubbleRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const bubbleEmoji = style({ fontSize: "1.125rem" });

export const bubbleText = style({
  fontSize: "0.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  color: vars.text,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const dotBase = {
  position: "absolute",
  left: "50%",
} as const;

export const bubbleDot1Wrap = style({
  ...dotBase,
  bottom: "-1.25rem",
  transform: "translateX(calc(-50% + 0.5rem))",
});
export const bubbleDot2Wrap = style({
  ...dotBase,
  bottom: "-2rem",
  transform: "translateX(calc(-50% + 1rem))",
});
export const bubbleDot3Wrap = style({
  ...dotBase,
  bottom: "-2.5rem",
  transform: "translateX(calc(-50% + 1.25rem))",
});

export const bubbleDot1 = style({
  width: "0.75rem",
  height: "0.75rem",
  backgroundColor: vars.bg,
  border: `2px solid ${vars.surface}`,
  borderRadius: "9999px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
});
export const bubbleDot2 = style({
  width: "0.5rem",
  height: "0.5rem",
  backgroundColor: vars.bg,
  border: `2px solid ${vars.surface}`,
  borderRadius: "9999px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
});
export const bubbleDot3 = style({
  width: "0.375rem",
  height: "0.375rem",
  backgroundColor: vars.bg,
  border: `1px solid ${vars.surface}`,
  borderRadius: "9999px",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
});

export const avatar = style({
  width: "8rem",
  height: "8rem",
  borderRadius: "9999px",
  margin: "0 auto",
  objectFit: "cover",
  borderWidth: "4px",
  borderStyle: "solid",
  transition: "all 0.15s ease",
  display: "block",
});

export const title = style({
  fontSize: "1.875rem",
  fontFamily: vars.fontComic,
  fontWeight: 600,
  transition: "color 0.15s ease",
});

export const pronouns = style({
  fontFamily: vars.fontComic,
  fontWeight: 600,
  marginTop: "0.25rem",
});

export const content = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const sectionTitle = style({
  fontSize: "1.125rem",
  fontFamily: vars.fontComic,
  marginBottom: "0.5rem",
  fontWeight: 600,
});

export const description = style({
  color: vars.textMuted,
  fontFamily: vars.fontComic,
  fontWeight: 600,
});

export const tagRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

export const backWrap = style({
  textAlign: "center",
  paddingTop: "1rem",
});
