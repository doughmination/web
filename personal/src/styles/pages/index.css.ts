/**
 * index.css.ts — the homepage: About card, plus the Fronting / Devices /
 * Location status cards beneath it.
 *
 * Ported from public/css/pages/index.css.
 *
 * Dropped as dead:
 *   .links / .link-card / .link-text / .link-title / .link-sub / .icon
 *       the old link-hub grid, no longer rendered anywhere
 *   .terminal (in the 640px media query)
 *       removed along with the terminal widget
 */
import { globalStyle, globalKeyframes } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/** Shared chrome for the three status cards, which are visually identical. */
const STATUS_CARD = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  margin: "0.9rem auto 0",
  padding: "0.85rem 1rem",
  background: vars.bgRaised,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 14,
  boxShadow: "0 18px 50px -22px rgba(0, 0, 0, 0.6)",
} as const;

/** Shared header row for the three status cards. */
const CARD_HEAD = {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: vars.textMuted,
} as const;

/* ---- About ---------------------------------------------------------------- */

/** A touch more room for the About card + status cards than the default hub. */
globalStyle("body:has(.about) .hub", {
  maxWidth: "min(94vw, 560px)",
  width: "100%",
});

globalStyle(".about", {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.1rem",
  padding: "1.4rem 1.3rem",
  background: vars.bgRaised,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 16,
  boxShadow: "0 18px 50px -22px rgba(0, 0, 0, 0.6)",
});

globalStyle(".about-bio", {
  margin: 0,
  textAlign: "center",
  lineHeight: 1.6,
  color: vars.textSoft,
  maxWidth: "42ch",
});

globalStyle(".about-source", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: "0.9rem",
  color: vars.bgDeep,
  background: vars.teal,
  border: `1px solid ${vars.teal}`,
  textDecoration: "none",
  transition: "filter 0.15s ease, transform 0.15s ease",
});

globalStyle(".about-source:hover, .about-source:focus-visible", {
  filter: "brightness(1.08)",
  transform: "translateY(-1px)",
});

globalStyle(".about-source .bi", { fontSize: "1.05rem" });

/* ---- Fronting card -------------------------------------------------------- */

globalStyle(".fronting-card", STATUS_CARD);
globalStyle(".fronting-card[hidden]", { display: "none" });

globalStyle(".fr-head", { ...CARD_HEAD, marginBottom: "0.7rem" });

globalKeyframes("fr-pulse", {
  "0%": { boxShadow: "0 0 0 0 rgba(166, 227, 161, 0.5)" },
  "70%": { boxShadow: "0 0 0 7px rgba(166, 227, 161, 0)" },
  "100%": { boxShadow: "0 0 0 0 rgba(166, 227, 161, 0)" },
});

globalStyle(".fr-dot", {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: vars.success,
  boxShadow: "0 0 0 0 rgba(166, 227, 161, 0.55)",
  animation: "fr-pulse 2.4s ease-out infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

globalStyle(".fr-members", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.6rem",
});

globalStyle(".fr-member", {
  vars: { "--fr-accent": vars.accent },
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  flex: "1 1 auto",
  minWidth: 0,
  padding: "0.5rem 0.75rem 0.5rem 0.5rem",
  borderRadius: 12,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  borderLeft: "3px solid var(--fr-accent)",
  color: vars.text,
});

globalStyle(".fr-av", {
  width: 38,
  height: 38,
  borderRadius: "50%",
  objectFit: "cover",
  flex: "0 0 auto",
  border: "2px solid var(--fr-accent)",
  background: vars.bgDeep,
});

globalStyle(".fr-av--empty", { display: "inline-block" });

globalStyle(".fr-meta", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  lineHeight: 1.25,
});

globalStyle(".fr-name", {
  fontWeight: 600,
  color: vars.text,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

globalStyle(".fr-pronouns", { fontSize: "0.74rem", color: vars.textMuted });

globalStyle(".fr-empty", {
  fontSize: "0.82rem",
  color: vars.textMuted,
  fontStyle: "italic",
});

/* ---- Loading placeholders (CLS) ------------------------------------------
   Fronting and Devices used to render nothing until their API replied, so the
   cards popped in from zero height and shoved the page down — the bulk of the
   homepage's 0.131 CLS. The shells now render immediately and these min-heights
   hold the body open at roughly its settled size, so filling in barely moves. */

/** One .fr-member row = 38px avatar + 0.5rem*2 padding + 2px border. */
globalStyle(".fr-members.is-fetching", {
  minHeight: 56,
  alignItems: "center",
});

/** Tune --dev-rows-reserve to however many devices you normally have online. */
globalStyle(".dev-rows.is-fetching", {
  vars: { "--dev-rows-reserve": "2" },
  // per row: ~28px content + 0.45rem*2 padding + 2px border, + 0.55rem gaps
  minHeight:
    "calc(var(--dev-rows-reserve) * 44px + (var(--dev-rows-reserve) - 1) * 0.55rem)",
});

globalKeyframes("ctp-pulse", {
  "0%, 100%": { opacity: 0.35 },
  "50%": { opacity: 0.75 },
});

globalStyle(
  ".fr-members.is-fetching .fr-empty, .dev-rows.is-fetching .dev-empty",
  {
    opacity: 0.65,
    "@media": {
      "(prefers-reduced-motion: no-preference)": {
        animation: "ctp-pulse 1.6s ease-in-out infinite",
      },
    },
  },
);

/* ---- Devices card --------------------------------------------------------- */

globalStyle(".devices-card", STATUS_CARD);
globalStyle(".devices-card[hidden]", { display: "none" });

globalStyle(".dev-head", { ...CARD_HEAD, marginBottom: "0.7rem" });

/** Little battery glyph drawn with borders, so it needs no asset. */
globalStyle(".dev-icon", {
  position: "relative",
  width: 18,
  height: 10,
  border: `1.5px solid ${vars.textMuted}`,
  borderRadius: 2,
});

/** The battery's positive terminal nub. */
globalStyle(".dev-icon::after", {
  content: '""',
  position: "absolute",
  top: "50%",
  right: -3,
  width: 2,
  height: 5,
  transform: "translateY(-50%)",
  borderRadius: "0 1px 1px 0",
  background: vars.textMuted,
});

globalStyle(".dev-rows", {
  display: "flex",
  flexDirection: "column",
  gap: "0.55rem",
});

globalStyle(".dev-row", {
  vars: { "--dev-accent": vars.success },
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  padding: "0.45rem 0.6rem",
  borderRadius: 12,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  borderLeft: "3px solid var(--dev-accent)",
  color: vars.text,
});

/** Battery level recolours the accent, which the bar and percentage inherit. */
globalStyle(".dev-row.dev-ok", { vars: { "--dev-accent": vars.success } });
globalStyle(".dev-row.dev-mid", { vars: { "--dev-accent": vars.warning } });
globalStyle(".dev-row.dev-low", { vars: { "--dev-accent": vars.danger } });
globalStyle(".dev-row.dev-unknown", { vars: { "--dev-accent": vars.textFaint } });

globalStyle(".dev-main", {
  display: "grid",
  gridTemplateColumns: "4.5rem 1fr auto",
  alignItems: "center",
  gap: "0.6rem",
  "@media": {
    // Tighten the name column so bars stay wide on narrow screens.
    "(max-width: 640px)": { gridTemplateColumns: "3.5rem 1fr auto" },
  },
});

globalStyle(".dev-name", {
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

globalStyle(".dev-track", {
  position: "relative",
  height: 10,
  minWidth: 0,
  borderRadius: 999,
  background: vars.bgDeep,
  border: `1px solid ${vars.surfaceHi}`,
  overflow: "hidden",
});

globalKeyframes("dev-pulse", {
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.55 },
});

globalStyle(".dev-fill", {
  display: "block",
  height: "100%",
  borderRadius: 999,
  background: "var(--dev-accent)",
  transition: "width 0.5s ease",
});

/** Gentle pulse on the fill while a device is charging. */
globalStyle(".dev-row.is-charging .dev-fill", {
  animation: "dev-pulse 1.8s ease-in-out infinite",
});

globalStyle(".dev-pct", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.15rem",
  fontVariantNumeric: "tabular-nums",
  fontWeight: 600,
  color: "var(--dev-accent)",
  minWidth: "2.6rem",
  justifyContent: "flex-end",
});

globalStyle(".dev-bolt", { color: vars.warning });

/** Meta line: charging / low-power / wifi chips plus the timestamp. */
globalStyle(".dev-meta", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.4rem",
  paddingLeft: "0.1rem",
});

globalStyle(".dev-tag", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2rem",
  padding: "0.05rem 0.4rem",
  borderRadius: 999,
  fontSize: "0.68rem",
  fontWeight: 600,
  background: vars.surfaceHi,
  border: `1px solid ${vars.surfaceHigher}`,
  color: vars.textSoft,
  whiteSpace: "nowrap",
  maxWidth: "12rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

globalStyle(".dev-tag.dev-charging", { color: vars.success });
globalStyle(".dev-tag.dev-lowpower", { color: vars.warning });
globalStyle(".dev-tag.dev-watch", { color: vars.sky });
globalStyle(".dev-tag.dev-airpods", { color: vars.lavender });

globalStyle(".dev-when", {
  marginLeft: "auto",
  fontSize: "0.72rem",
  color: vars.textMuted,
  whiteSpace: "nowrap",
});

globalStyle(".dev-empty", {
  fontSize: "0.82rem",
  color: vars.textMuted,
  fontStyle: "italic",
});

/* ---- Location card (iPhone location, from the devices feed) --------------- */

globalStyle(".location-card", STATUS_CARD);
globalStyle(".location-card[hidden]", { display: "none" });

globalStyle(".loc-head", { ...CARD_HEAD, marginBottom: "0.55rem" });

globalStyle(".loc-head .bi", { color: vars.accent, fontSize: "0.85rem" });

globalStyle(".loc-body", {
  display: "flex",
  flexDirection: "column",
  gap: "0.55rem",
});

globalStyle(".loc-map", {
  width: "100%",
  height: 200,
  border: 0,
  borderRadius: 10,
  display: "block",
  background: vars.surface,
});

globalStyle(".loc-cap", {
  display: "flex",
  alignItems: "baseline",
  flexWrap: "wrap",
  gap: "0.5rem",
});

globalStyle(".loc-place", { fontWeight: 600, color: vars.text });

globalStyle(".loc-link", {
  color: vars.sky,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "baseline",
  gap: "0.3rem",
  transition: "color 0.15s ease",
});

globalStyle(".loc-link:hover, .loc-link:focus-visible", {
  color: vars.accent,
  textDecoration: "underline",
});

globalStyle(".loc-link .bi", { fontSize: "0.75rem" });

globalStyle(".loc-when", {
  marginLeft: "auto",
  fontSize: "0.72rem",
  color: vars.textMuted,
});
