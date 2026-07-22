/* src/styles/layout.css.ts
 * ESAL-2.3
 */

/**
 * layout.css.ts — the shared .hub / .pfp / .hub-header chrome at the top of
 * most pages.
 *
 * Ported from public/css/shared/layout.css. All six rules were live.
 *
 * globalStyle rather than style(): this markup is written by hand across many
 * page components (app/page.tsx, 88x31, selfies, dev-info, …) rather than owned
 * by a single one, so the class names must stay literal.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

globalStyle(".hub", {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 460,
});

globalStyle(".pfp", {
  width: 96,
  height: 96,
  borderRadius: "50%",
  objectFit: "cover",
  border: `3px solid ${vars.warning}`,
  boxShadow: "0 4px 18px rgba(245, 194, 231, 0.25)",
  marginBottom: "0.75rem",
});

globalStyle(".hub-header", {
  textAlign: "center",
  marginBottom: "2.25rem",
});

globalStyle(".hub-header h1", {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  color: vars.accent,
  transition: "color 0.6s ease",
});

globalStyle(".tagline", {
  margin: "0.35rem 0 0",
  color: vars.textMuted,
  fontSize: "0.95rem",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
});

globalStyle(".pronouns", {
  margin: "0.35rem 0 0",
  color: vars.accentAlt,
  fontSize: "0.95rem",
  letterSpacing: "0.04em",
  textTransform: "lowercase",
});
