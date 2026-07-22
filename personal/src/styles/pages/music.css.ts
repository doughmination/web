/* src/styles/pages/music.css.ts
 * ESAL-2.3
 */

/**
 * music.css.ts — the /music page: now-playing hero, lyrics panel, recently
 * played, and top artists.
 *
 * Ported from public/css/pages/music.css.
 *
 * Dropped as dead: .music-back — nothing renders it.
 *
 * Moved out: the .pc-conn-ic rules that lived here. They style connection brand
 * logos drawn by PresenceCard.tsx on /discord and /cool-people — neither of which
 * loads this file — so they now live in presence-card.css alongside the markup
 * that uses them.
 *
 * `.top-chip a { align-items }` was declared twice in the source (baseline, then
 * center further down). The later won, so only `center` is carried forward.
 */
import { globalStyle, globalKeyframes } from "@vanilla-extract/css";
import { vars } from "../themes.css";

const MONO = "'Comic Code', ui-monospace, monospace";
const ELLIPSIS = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

/* ---- page shell ----------------------------------------------------------- */

/** The music page scrolls; the default layout pins body to the viewport. */
globalStyle("html:has(.music-wrap), body:has(.music-wrap)", {
  height: "auto",
  minHeight: "100dvh",
  overflowY: "auto",
});

globalStyle("body:has(.music-wrap)", { alignItems: "flex-start" });

globalStyle(".music-wrap", {
  maxWidth: 880,
  margin: "0 auto",
  padding: "2.6rem 1.25rem 5rem",
  fontFamily: MONO,
});

globalStyle(".music-head", { margin: "0 0 1.6rem" });

globalStyle(".music-head h1", {
  fontSize: "clamp(1.7rem, 5vw, 2.4rem)",
  margin: "0 0 0.2rem",
  color: vars.accent,
  letterSpacing: "-0.02em",
  transition: "color 0.5s ease",
});

globalStyle(".music-head p", {
  margin: 0,
  color: vars.textMuted,
  fontSize: "0.95rem",
});

/* ---- now-playing hero ----------------------------------------------------- */

globalStyle(".mdc", {
  display: "grid",
  gridTemplateColumns: "132px 1fr",
  gap: "1.1rem",
  alignItems: "center",
  background: vars.bgRaised,
  border: `1px solid ${vars.surface}`,
  borderRadius: 18,
  padding: "1.1rem",
  position: "relative",
  overflow: "hidden",
  textDecoration: "none",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "96px 1fr",
      gap: "0.85rem",
      padding: "0.9rem",
    },
  },
});

/** A wash of the album accent behind the hero, revealed only when live. */
globalStyle(".mdc::before", {
  content: '""',
  position: "absolute",
  inset: 0,
  background: `radial-gradient(120% 140% at 0% 0%, ${vars.accent}, transparent 60%)`,
  opacity: 0,
  transition: "opacity 0.6s ease",
  pointerEvents: "none",
});

globalStyle("#music.is-live .mdc::before", { opacity: 1 });

globalStyle(".mdc-art", {
  width: 132,
  height: 132,
  borderRadius: 12,
  objectFit: "cover",
  background: vars.surface,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
  "@media": {
    "(max-width: 560px)": { width: 96, height: 96 },
  },
});

/** No artwork: fall back to a centred ♪ glyph. */
globalStyle(".mdc-art:not(.has-art)", { display: "grid" });

globalStyle(".mdc-art:not(.has-art)::after", {
  content: '"♪"',
  color: vars.textFaint,
  fontSize: "2.4rem",
  display: "grid",
  placeItems: "center",
  height: "100%",
});

globalStyle(".mdc-meta", { minWidth: 0, position: "relative" });

globalStyle(".mdc-state", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: vars.textMuted,
  marginBottom: "0.35rem",
});

globalStyle("#music.is-live .mdc-state", { color: vars.accent });

globalStyle(".mdc-title", {
  display: "block",
  fontSize: "1.3rem",
  fontWeight: 700,
  color: vars.text,
  margin: "0 0 0.15rem",
  lineHeight: 1.2,
  ...ELLIPSIS,
  "@media": { "(max-width: 560px)": { fontSize: "1.1rem" } },
});

globalStyle(".mdc-title:hover", { color: vars.accent });

globalStyle(".mdc-artist", {
  display: "block",
  color: vars.textSoft,
  fontSize: "0.95rem",
});

globalStyle(".mdc-album", {
  display: "block",
  color: vars.textMuted,
  fontSize: "0.82rem",
  marginTop: "0.1rem",
});

globalStyle(".mdc-progress", {
  marginTop: "0.8rem",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
});

globalStyle(".mdc-bar", {
  flex: 1,
  height: 6,
  borderRadius: 999,
  background: vars.surface,
  overflow: "hidden",
});

globalStyle(".mdc-fill", {
  display: "block",
  height: "100%",
  width: "0%",
  background: vars.accent,
  borderRadius: 999,
  transition: "width 0.4s linear",
  "@media": { "(prefers-reduced-motion: reduce)": { transition: "none" } },
});

globalStyle(".mdc-time", {
  fontSize: "0.72rem",
  color: vars.textMuted,
  fontVariantNumeric: "tabular-nums",
});

/* ---- section headings ----------------------------------------------------- */

globalStyle(".sec-title", {
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: vars.textMuted,
  margin: "2.4rem 0 0.7rem",
  fontWeight: 500,
});

globalStyle(".sec-row", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "0.8rem",
  margin: "2.4rem 0 0.7rem",
});

globalStyle(".sec-row .sec-title", { margin: 0 });

/* ---- lyrics --------------------------------------------------------------- */

globalStyle(".ly-lock", {
  fontFamily: "inherit",
  fontSize: "0.72rem",
  letterSpacing: "0.04em",
  cursor: 'url("/assets/cursor/pointer_0.png"), pointer',
  borderRadius: 999,
  padding: "0.28rem 0.8rem 0.28rem 0.7rem",
  background: vars.surface,
  color: vars.textSoft,
  border: "1px solid transparent",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  transition: "color 0.15s ease, border-color 0.15s ease, background 0.15s ease",
});

/**
 * Locked state. The background was a 10% pink tint via the broken
 * rgba(var(--pink), .1); it is solid pink now, so the text has to flip to a dark
 * token or it would be pink-on-pink and unreadable. This mirrors the site's own
 * convention for pink fills (see .nav-link.selected).
 */
globalStyle(".ly-lock.is-locked", {
  color: vars.bgDeep,
  borderColor: vars.accent,
  background: vars.accent,
});

globalStyle(".ly-lock:not(.is-locked):hover", {
  color: vars.text,
  borderColor: vars.surfaceHi,
});

/** Spotify-style equaliser bars. */
globalStyle(".ly-bars", {
  display: "inline-flex",
  alignItems: "flex-end",
  gap: 2,
  width: 13,
  height: 11,
  flexShrink: 0,
});

globalStyle(".ly-bars i", {
  flex: 1,
  height: "100%",
  borderRadius: 1,
  background: "currentColor",
  transformOrigin: "bottom",
  transform: "scaleY(0.4)",
  opacity: 0.55,
});

globalKeyframes("ly-eq", {
  "0%, 100%": { transform: "scaleY(0.3)" },
  "50%": { transform: "scaleY(1)" },
});

globalStyle(".ly-lock.is-locked .ly-bars i", {
  opacity: 1,
  animation: "ly-eq 0.9s ease-in-out infinite",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
      transform: "scaleY(0.65)",
    },
  },
});

/** Staggered so the bars ripple rather than pulse in unison. */
globalStyle(".ly-lock.is-locked .ly-bars i:nth-child(2)", { animationDelay: "0.15s" });
globalStyle(".ly-lock.is-locked .ly-bars i:nth-child(3)", { animationDelay: "0.3s" });
globalStyle(".ly-lock.is-locked .ly-bars i:nth-child(4)", { animationDelay: "0.45s" });

globalStyle(".lyrics", {
  // position anchors offsetTop for the follow-scroll calculation
  position: "relative",
  height: 340,
  overflowY: "auto",
  scrollBehavior: "smooth",
  overscrollBehavior: "contain",
  borderRadius: 16,
  background: vars.bgDeep,
  border: `1px solid ${vars.surface}`,
  padding: "1.4rem",
  scrollbarWidth: "thin",
  scrollbarColor: `${vars.surfaceHi} transparent`,
  // fade top + bottom so lines drift in and out
  WebkitMaskImage:
    "linear-gradient(180deg, transparent, #000 14%, #000 86%, transparent)",
  maskImage:
    "linear-gradient(180deg, transparent, #000 14%, #000 86%, transparent)",
  "@media": { "(max-width: 560px)": { height: 300 } },
});

globalStyle(".lyrics::-webkit-scrollbar", { width: 8 });

globalStyle(".lyrics::-webkit-scrollbar-thumb", {
  background: vars.surfaceHi,
  borderRadius: 999,
});

/** Short states (loading / instrumental / empty) centre their message instead. */
globalStyle(".lyrics.is-instrumental, .lyrics.is-empty, .lyrics.is-loading", {
  display: "grid",
  placeContent: "center",
  height: 180,
  WebkitMaskImage: "none",
  maskImage: "none",
});

globalStyle(".ly-line", {
  margin: 0,
  padding: "0.32rem 0",
  fontSize: "1.18rem",
  lineHeight: 1.4,
  color: vars.textFaint,
  transition: "color 0.3s ease, opacity 0.3s ease, transform 0.3s ease",
  "@media": {
    "(max-width: 560px)": { fontSize: "1.05rem" },
    "(prefers-reduced-motion: reduce)": { transition: "color 0.15s ease" },
  },
});

/** Synced lyrics dim every line except the active one. */
globalStyle(".is-synced .ly-line", { opacity: 0.55 });

globalStyle(".is-synced .ly-line.is-active", {
  color: vars.accent,
  opacity: 1,
  fontWeight: 700,
  transform: "translateX(2px)",
});

globalStyle(".ly-static", {
  color: vars.textSoft,
  opacity: 1,
  fontSize: "1.05rem",
});

globalStyle(".ly-note", {
  color: vars.textMuted,
  fontSize: "0.95rem",
  textAlign: "center",
  margin: 0,
  paddingTop: "1rem",
});

globalStyle(".lyrics.is-instrumental .ly-note", {
  color: vars.accent,
  fontSize: "1.2rem",
});

/* ---- recently played ------------------------------------------------------ */

globalStyle(".recent", {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: "0.35rem",
});

globalStyle(".rc-item a", {
  display: "grid",
  gridTemplateColumns: "44px 1fr auto",
  gap: "0.7rem",
  alignItems: "center",
  textDecoration: "none",
  padding: "0.45rem 0.55rem",
  borderRadius: 12,
  transition: "background 0.15s ease",
});

globalStyle(".rc-item a:hover", { background: vars.surface });

globalStyle(".rc-art", {
  width: 44,
  height: 44,
  borderRadius: 8,
  objectFit: "cover",
  background: vars.surface,
});

globalStyle(".rc-art-blank", {
  display: "grid",
  placeItems: "center",
  color: vars.textFaint,
  fontSize: "1.1rem",
});

globalStyle(".rc-text", { minWidth: 0 });

globalStyle(".rc-name", {
  display: "block",
  color: vars.text,
  fontSize: "0.92rem",
  ...ELLIPSIS,
});

globalStyle(".rc-artist", {
  display: "block",
  color: vars.textMuted,
  fontSize: "0.78rem",
  ...ELLIPSIS,
});

globalStyle(".rc-when, .rc-now", { fontSize: "0.72rem", whiteSpace: "nowrap" });
globalStyle(".rc-when", { color: vars.textMuted });
globalStyle(".rc-now", { color: vars.accent, fontWeight: 700 });

/** Highlights the track that's playing right now. */
globalStyle(".is-now", { background: vars.accent, borderRadius: 12 });

globalStyle(".rc-note", {
  color: vars.textMuted,
  fontSize: "0.86rem",
  padding: "0.6rem 0.4rem",
  lineHeight: 1.5,
});

globalStyle(".rc-note code", {
  background: vars.surface,
  color: vars.text,
  padding: "0.1rem 0.35rem",
  borderRadius: 6,
  fontSize: "0.9em",
});

/* ---- top artists ---------------------------------------------------------- */

globalStyle(".top-chips", {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

globalStyle(".top-chip a", {
  display: "inline-flex",
  // `center` not `baseline` — the later of two declarations in the source won.
  alignItems: "center",
  gap: "0.45rem",
  background: vars.bgRaised,
  border: `1px solid ${vars.surface}`,
  borderRadius: 999,
  padding: "0.35rem 0.8rem",
  textDecoration: "none",
  transition: "border-color 0.15s ease",
});

globalStyle(".top-chip a:hover", { borderColor: vars.accent });

globalStyle(".top-art", {
  width: 34,
  height: 34,
  borderRadius: "50%",
  objectFit: "cover",
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: vars.surface,
  color: vars.textMuted,
  fontSize: "0.95rem",
  overflow: "hidden",
});

globalStyle(".top-text", {
  display: "inline-flex",
  flexDirection: "column",
  lineHeight: 1.2,
  minWidth: 0,
});

globalStyle(".top-rank", {
  color: vars.accent,
  fontWeight: 700,
  fontSize: "0.78rem",
});

globalStyle(".top-name", { color: vars.text, fontSize: "0.85rem" });
globalStyle(".top-plays", { color: vars.textMuted, fontSize: "0.72rem" });

/* ---- obsessions ----------------------------------------------------------- */

globalStyle(".obsessions", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
});

globalStyle(".obsession-embed", { width: "100%", border: "none" });
