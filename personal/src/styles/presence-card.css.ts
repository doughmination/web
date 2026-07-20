/**
 * presence-card.css.ts — the shared Discord-style presence card, used full-size
 * on /discord and /servers and in mini form on /cool-people, plus the stage
 * layout those pages sit on.
 *
 * Ported from public/css/shared/presence-card.css.
 *
 * globalStyle throughout: the card was built imperatively by presenceCard.ts
 * with ~93 hardcoded class strings. That module is now a React component
 * (PresenceCard.tsx), but it still writes these same class names literally, so
 * scoped style() names would break it. Converting to scoped styles is possible
 * now — it just means changing both files together, class by class.
 *
 * Dropped as dead: .api-stage, .api-body, .api-empty and
 * `html[data-theme] body.api-body` — the standalone /api embed page they styled
 * doesn't exist in this app (and data-theme is never set; see the note that was
 * at the top of the source file).
 * Also dropped: .pc-conn-type, which nothing renders.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

const ELLIPSIS = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

/* ---- card shell ----------------------------------------------------------- */

globalStyle(".presence-card", {
  // RGB triplet, not a hex — it feeds rgba() below and is overwritten at
  // runtime by PresenceCard.tsx from the album-art accent (--dc-accent).
  vars: { "--dc-accent": "245, 194, 231" },
  position: "fixed",
  top: "1rem",
  left: "1rem",
  zIndex: 6,
  width: "max-content",
  maxWidth: 280,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 16,
  boxShadow: "0 8px 26px -12px rgba(17, 17, 27, 0.7)",
  overflow: "hidden",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

globalStyle(".presence-card[hidden]", { display: "none" });

globalStyle(".presence-card.has-accent", {
  borderColor: "rgba(var(--dc-accent), 0.5)",
  boxShadow: "0 8px 26px -12px rgba(var(--dc-accent), 0.6)",
});

/* ---- header (always visible) ---------------------------------------------- */

globalStyle(".pc-head", {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.5rem 0.7rem",
});

globalStyle(".pc-avatar", {
  position: "relative",
  width: 40,
  height: 40,
  flexShrink: 0,
});

globalStyle(".pc-av-img", {
  width: 40,
  height: 40,
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
  // Solid fill behind the avatar: many PFPs are partly transparent, and Discord
  // shows a solid backdrop rather than letting the banner through.
  background: vars.bgDeep,
});

/** Avatar decoration / frame overlay (a Discord cosmetic). */
globalStyle(".pc-av-deco", {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 54,
  height: 54,
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
});

globalStyle(".pc-av-deco[hidden]", { display: "none" });

globalStyle(".pc-status", {
  position: "absolute",
  right: -1,
  bottom: -1,
  width: 12,
  height: 12,
  borderRadius: "50%",
  border: `2.5px solid ${vars.surface}`,
  background: vars.textFaint,
});

/**
 * Status colouring, driven by [data-status] on the card.
 *
 * "streaming" is not an online/idle/dnd state — Discord's own client shows the
 * purple live indicator in place of the regular dot whenever the user has an
 * active stream (a type:1 activity), whatever their underlying status. It
 * matches the .pc-stream-thumb ring and the .pc-stream dot further down.
 */
const STATUS_COLOURS = {
  online: { dot: vars.success, text: vars.success },
  idle: { dot: vars.warning, text: vars.warning },
  dnd: { dot: vars.danger, text: vars.danger },
  offline: { dot: vars.textFaint, text: vars.textDim },
  streaming: { dot: vars.accentAlt, text: vars.accentAlt },
} as const;

for (const [status, { dot, text }] of Object.entries(STATUS_COLOURS)) {
  const card = `.presence-card[data-status="${status}"]`;
  globalStyle(`${card} .pc-status`, { background: dot });
  globalStyle(`${card} .pc-status-text`, { color: text });
  globalStyle(`${card} .pc-status-text::before`, { background: dot });
}

globalStyle(".pc-id", {
  display: "flex",
  flexDirection: "column",
  gap: "0.05rem",
  minWidth: 0,
});

globalStyle(".pc-name", {
  fontSize: "0.92rem",
  fontWeight: 700,
  color: vars.accent,
  ...ELLIPSIS,
  transition: "color 0.5s ease",
});

globalStyle(".pc-user", {
  fontSize: "0.7rem",
  color: vars.textMuted,
  whiteSpace: "nowrap",
});

/** Collapse when the API returns no value, rather than leaving a gap. */
globalStyle(".pc-user:empty", { display: "none" });

/** Status word (Online / Idle / Do Not Disturb / Offline / Streaming). */
globalStyle(".pc-status-text", {
  fontSize: "0.7rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
  color: vars.textDim,
});

globalStyle(".pc-status-text:empty", { display: "none" });

globalStyle(".pc-status-text::before", {
  content: '""',
  display: "inline-block",
  width: 7,
  height: 7,
  borderRadius: "50%",
  marginRight: "0.3rem",
  verticalAlign: "baseline",
  background: vars.textFaint,
});

/* ---- expandable sections -------------------------------------------------- */

globalStyle(".pc-sections", {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  padding: "0 0.6rem 0.6rem",
  transition: "opacity 0.2s ease",
});

/** has-sections is set by PresenceCard.tsx once there's something to show. */
globalStyle(".presence-card:not(.has-sections) .pc-sections", { display: "none" });

globalStyle(".pc-row", {
  display: "flex",
  alignItems: "center",
  gap: "0.55rem",
  padding: "0.4rem 0.5rem",
  borderRadius: 10,
  background: vars.bgRaised,
  // transparent so the hover border doesn't shift layout
  border: "1px solid transparent",
  color: vars.text,
  textDecoration: "none",
  transition: "border-color 0.15s ease, transform 0.15s ease",
});

globalStyle("a.pc-row:hover, .pc-row--stack:hover", {
  borderColor: "rgba(var(--dc-accent), 0.55)",
  transform: "translateX(2px)",
});

globalStyle(".pc-row-text", {
  display: "flex",
  flexDirection: "column",
  gap: "0.04rem",
  minWidth: 0,
});

globalStyle(".pc-row-kind", {
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.textMuted,
});

globalStyle(".pc-row-title", {
  fontSize: "0.8rem",
  fontWeight: 500,
  ...ELLIPSIS,
  maxWidth: 200,
});

globalStyle(".pc-row-sub", {
  fontSize: "0.7rem",
  color: vars.textMuted,
  ...ELLIPSIS,
  maxWidth: 200,
});

globalStyle(".pc-row-title:empty, .pc-row-sub:empty", { display: "none" });

globalStyle(".pc-row-elapsed", {
  fontSize: "0.62rem",
  color: vars.textMuted,
  marginTop: "0.1rem",
});

globalStyle(".pc-row-elapsed:empty", { display: "none" });

/* ---- artwork / icons ------------------------------------------------------ */

globalStyle(".pc-art, .pc-row-ic-img", {
  width: 38,
  height: 38,
  borderRadius: 7,
  objectFit: "cover",
  flexShrink: 0,
});

/**
 * Twitch/YouTube live preview thumbnail (streamRow's assets.large_image_url).
 * Wider than the square game/app icons since it's a 16:9-ish video preview; the
 * slim mauve ring ties it to the streaming status dot.
 */
globalStyle(".pc-stream-thumb", {
  width: 56,
  height: 38,
  borderRadius: 7,
  objectFit: "cover",
  flexShrink: 0,
  border: `1.5px solid ${vars.accentAlt}`,
});

globalStyle(".pc-row-ic.pc-dot", {
  width: 9,
  height: 9,
  borderRadius: "50%",
  flexShrink: 0,
  margin: "0 0.5rem",
  background: vars.accent,
});

/** Activity kind recolours (and reshapes) the dot. */
globalStyle(".pc-dev .pc-row-ic.pc-dot", { background: vars.info, borderRadius: 2 });
globalStyle(".pc-game .pc-row-ic.pc-dot", { background: vars.success });
globalStyle(".pc-stream .pc-row-ic.pc-dot", { background: vars.accentAlt });

/* ---- custom status -------------------------------------------------------- */

globalStyle(".pc-custom", {
  position: "relative",
  alignSelf: "flex-start",
  background: vars.surfaceHi,
  border: "none",
  padding: "0.5rem 0.7rem",
  gap: "0.4rem",
  alignItems: "flex-start",
  borderRadius: 13,
  // squared-off top-left corner where the bubble tail attaches
  borderTopLeftRadius: 4,
  marginTop: "0.3rem",
});

/** Discord-style thought-bubble tail: two shrinking circles above the bubble. */
globalStyle(".pc-custom::before, .pc-custom::after", {
  content: '""',
  position: "absolute",
  background: vars.surfaceHi,
  borderRadius: "50%",
  pointerEvents: "none",
});

globalStyle(".pc-custom::before", { width: 9, height: 9, top: -5, left: 12 });
globalStyle(".pc-custom::after", { width: 5, height: 5, top: -11, left: 9 });

/** It's a bubble, not a link — cancel the .pc-row hover treatment. */
globalStyle(".pc-custom:hover", { transform: "none", borderColor: "transparent" });

globalStyle(".pc-emoji", {
  width: 18,
  height: 18,
  flexShrink: 0,
  marginTop: "0.05rem",
});

globalStyle(".pc-custom-text", {
  fontSize: "0.74rem",
  color: vars.textMuted,
  maxWidth: 230,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  lineHeight: 1.35,
});

/* ---- Spotify progress ----------------------------------------------------- */

globalStyle(".pc-spotify .pc-row-title", { color: vars.success });

globalStyle(".pc-progress", {
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
  marginTop: "0.25rem",
  width: 180,
});

globalStyle(".pc-bar", {
  height: 4,
  borderRadius: 999,
  background: vars.surfaceHi,
  overflow: "hidden",
});

globalStyle(".pc-fill", {
  display: "block",
  height: "100%",
  width: 0,
  borderRadius: 999,
  background: "rgb(var(--dc-accent))",
});

globalStyle(".pc-times", {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.58rem",
  color: vars.textMuted,
  fontVariantNumeric: "tabular-nums",
});

globalStyle(".presence-card", {
  "@media": {
    "(max-width: 640px)": { maxWidth: "calc(100vw - 2rem)" },
  },
});

/* ---- extended Lanyard fields ---------------------------------------------- */

globalStyle(".pc-name-row", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  minWidth: 0,
});

globalStyle(".pc-name-row .pc-name", { minWidth: 0 });

/** Gradient display name (display_name_styles); the gradient is set inline. */
globalStyle(".pc-name.is-gradient", {
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
});

/** Server tag chip (primary_guild). */
globalStyle(".pc-tag", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2rem",
  flexShrink: 0,
  padding: "0.05rem 0.35rem",
  borderRadius: 6,
  background: vars.surfaceHigher,
  fontSize: "0.58rem",
  fontWeight: 700,
  letterSpacing: "0.03em",
  color: vars.text,
});

globalStyle(".pc-tag[hidden]", { display: "none" });

globalStyle(".pc-tag-badge", { width: 14, height: 14, display: "block" });

/** Username + active-platform indicators. */
globalStyle(".pc-sub-row", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
});

/** Shared base for the inline SVG icons emitted by presenceIcons.ts (core.ts).
    <svg> sits on the text baseline, which a webfont glyph did not — nudge it
    back so icons sitting in a text run (timezone clock, wishlist empty state)
    stay optically centred. */
globalStyle("svg.pc-ic", {
  verticalAlign: "-0.125em",
  flex: "none",
});

globalStyle(".pc-platforms", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2rem",
  color: vars.textMuted,
});

globalStyle(".pc-plat", {
  display: "inline-flex",
  alignItems: "center",
  fontSize: 12,
  lineHeight: 1,
});

/** KV meta line (location, etc). */
globalStyle(".pc-meta", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  marginTop: "0.1rem",
  fontSize: "0.66rem",
  color: vars.textMuted,
});

globalStyle(".pc-meta[hidden]", { display: "none" });

globalStyle(".pc-pin", { fontSize: "0.7rem", lineHeight: 1 });

/** Stacked rows — activity rows that carry buttons underneath. */
globalStyle(".pc-row--stack", {
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0.4rem",
});

globalStyle(".pc-row-link", {
  display: "flex",
  alignItems: "center",
  gap: "0.55rem",
  minWidth: 0,
  color: vars.text,
  textDecoration: "none",
});

/** Activity icon with a small corner badge (assets.small_image). */
globalStyle(".pc-ic-wrap", {
  position: "relative",
  flexShrink: 0,
  width: 38,
  height: 38,
});

globalStyle(".pc-ic-wrap .pc-row-ic-img", { width: 38, height: 38 });

globalStyle(".pc-ic-badge", {
  position: "absolute",
  right: -3,
  bottom: -3,
  width: 16,
  height: 16,
  borderRadius: "50%",
  // ring in the row's own background so the badge reads as separate
  border: `2px solid ${vars.bgRaised}`,
  objectFit: "cover",
});

/** Activity buttons (labels come from the presence payload). */
globalStyle(".pc-buttons", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
});

globalStyle(".pc-btn", {
  fontSize: "0.66rem",
  padding: "0.22rem 0.55rem",
  borderRadius: 6,
  background: vars.surfaceHi,
  color: vars.text,
  textDecoration: "none",
  border: "1px solid transparent",
  transition: "border-color 0.15s ease, background 0.15s ease",
});

globalStyle(".pc-btn:hover", {
  borderColor: "rgb(var(--dc-accent))",
  background: vars.surfaceHigher,
});

/* ---- profile badges ------------------------------------------------------- */

globalStyle(".pc-badges", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.2rem",
  flexWrap: "wrap",
  marginTop: "0.15rem",
});

globalStyle(".pc-badges:empty", { display: "none" });

globalStyle(".pc-badge", { width: 16, height: 16, display: "block" });

globalStyle(".pc-badge-link", { display: "inline-flex", lineHeight: 0 });

/* ---- wishlist star + panel ------------------------------------------------ */

globalStyle(".pc-star", {
  marginLeft: "auto",
  alignSelf: "flex-start",
  background: "none",
  border: "none",
  cursor: 'url("/assets/cursor/pointer_0.png"), pointer',
  fontSize: "0.95rem",
  lineHeight: 1,
  color: vars.textMuted,
  padding: "0.1rem 0.15rem",
  transition: "color 0.15s ease, transform 0.15s ease",
});

globalStyle(".pc-star:hover", { color: vars.accent, transform: "scale(1.12)" });

/** `on` is set by PresenceCard.tsx when the panel is open. */
globalStyle(".pc-star.on", { color: vars.warning });

globalStyle(".pc-wishlist", { display: "none" });

globalStyle(".presence-card.show-wishlist .pc-wishlist", {
  display: "block",
  borderTop: `1px solid ${vars.surfaceHi}`,
  margin: "0 0.6rem",
  padding: "0.6rem 0 0.7rem",
});

globalStyle(".pc-wishlist-title", {
  fontSize: "0.62rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.textMuted,
  marginBottom: "0.45rem",
});

globalStyle(".pc-wl-item", {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.25rem 0.4rem",
  borderRadius: 8,
  textDecoration: "none",
  color: vars.text,
});

globalStyle("a.pc-wl-item:hover", { background: vars.bgRaised });

globalStyle(".pc-wl-ic", {
  width: 22,
  height: 22,
  borderRadius: 5,
  objectFit: "cover",
});

globalStyle(".pc-wl-text", {
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.2,
  minWidth: 0,
});

globalStyle(".pc-wl-name", { fontSize: "0.8rem" });

globalStyle(".pc-wl-type", {
  fontSize: "0.6rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: vars.textMuted,
});

globalStyle(".pc-wl-price", {
  marginLeft: "auto",
  paddingLeft: "0.5rem",
  fontSize: "0.72rem",
  color: vars.textSoft,
  whiteSpace: "nowrap",
});

/** Already-owned games are dimmed rather than hidden. */
globalStyle(".pc-wl-item.is-owned", { opacity: 0.5 });

globalStyle(".pc-wl-empty", {
  fontSize: "0.78rem",
  color: vars.textMuted,
  margin: 0,
});

/* ---- Discord profile gradient (the Catppuccin surface is the fallback) ----- */

globalStyle(".presence-card.has-profile-grad", {
  background:
    "linear-gradient(180deg, rgb(var(--pc-grad-1-rgb)) 0%, rgb(var(--pc-grad-2-rgb)) 100%)",
});

globalStyle(".presence-card.has-profile-grad:not(.has-accent)", {
  borderColor: "rgba(var(--pc-grad-1-rgb), 0.6)",
});

/** Rows need their own scrim so text stays legible over the gradient. */
globalStyle(".presence-card.has-profile-grad .pc-row", {
  background: "rgba(17, 17, 27, 0.55)",
});

/* ---- extras: banner, bio, connected accounts (the /discord page) ---------- */

globalStyle(".pc-banner", {
  display: "block",
  width: "100%",
  height: 96,
  objectFit: "cover",
  margin: 0,
});

globalStyle(".pc-banner[hidden]", { display: "none" });

/** Solid/accent banner fallback when there's no Nitro banner image. */
globalStyle(".presence-card.has-banner-color::before", {
  content: '""',
  display: "block",
  height: 64,
  background: "var(--pc-banner-color, var(--surface-hi))",
});

/** With a banner present, lift the avatar up over it. */
globalStyle(
  ".presence-card.has-banner .pc-head, .presence-card.has-banner-color .pc-head",
  { marginTop: -22 },
);

/** With a banner, the avatar grows and gains a ring against the artwork. */
globalStyle(
  ".presence-card.has-banner .pc-avatar, .presence-card.has-banner-color .pc-avatar",
  { width: 56, height: 56 },
);

globalStyle(
  ".presence-card.has-banner .pc-av-img, .presence-card.has-banner-color .pc-av-img",
  { width: 56, height: 56, border: `3px solid ${vars.surface}` },
);

globalStyle(
  ".presence-card.has-banner .pc-av-deco, .presence-card.has-banner-color .pc-av-deco",
  { width: 72, height: 72 },
);

/* ---- bio ------------------------------------------------------------------ */

globalStyle(".pc-bio", {
  margin: "0 0.7rem 0.5rem",
  padding: "0.5rem 0.6rem",
  borderRadius: 10,
  background: vars.bgRaised,
  fontSize: "0.74rem",
  lineHeight: 1.25,
  color: vars.textSoft,
  // preserves the line breaks Discord bios use
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

globalStyle(".pc-bio[hidden]", { display: "none" });

/** Custom Discord emoji rendered inline in the bio. */
globalStyle(".pc-bio-emoji", {
  width: "1.2em",
  height: "1.2em",
  // nudges the image onto the text baseline
  verticalAlign: "-0.22em",
  objectFit: "contain",
  margin: 0,
});

/** Linkified URLs in the bio. */
globalStyle(".pc-bio-link", {
  color: vars.info,
  textDecoration: "none",
  overflowWrap: "anywhere",
});

globalStyle(".pc-bio-link:hover", { textDecoration: "underline" });

/* ---- connected accounts --------------------------------------------------- */

globalStyle(".pc-connections", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
  margin: "0 0.7rem 0.6rem",
});

globalStyle(".pc-connections[hidden]", { display: "none" });

globalStyle(".pc-conn", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.2rem 0.5rem",
  borderRadius: 999,
  background: vars.surfaceHi,
  border: "1px solid transparent",
  color: vars.text,
  fontSize: "0.66rem",
  textDecoration: "none",
  transition: "border-color 0.15s ease, background 0.15s ease",
});

globalStyle("a.pc-conn:hover", {
  borderColor: vars.accent,
  background: vars.surfaceHigher,
});

globalStyle(".pc-conn-check", { color: vars.success, fontWeight: 700 });

/** Connection brand logos. Moved here from pages/music.css, which renders no
    presence card — see the note in music.css.ts. */
globalStyle(".pc-conn-ic", {
  width: 14,
  height: 14,
  display: "block",
  flex: "none",
});

/** Inline-SVG variant (presenceIcons.ts). The <svg> carries width/height 1em
    and fill:currentColor, so it inherits sizing and colour the way the old
    Bootstrap Icons glyph did — the base .pc-conn-ic box above still applies. */
globalStyle("svg.pc-conn-ic", {
  width: 14,
  height: 14,
  fontSize: 14,
  lineHeight: 1,
  color: "currentColor",
});

/* ---- sub-row chips: pronouns, timezone, Nitro ----------------------------- */

/** Pronouns and timezone share a chip treatment. */
const CHIP = {
  padding: "0.05rem 0.4rem",
  borderRadius: 6,
  background: vars.surfaceHigher,
  fontSize: "0.6rem",
  fontWeight: 600,
  color: vars.textSoft,
  whiteSpace: "nowrap",
} as const;

globalStyle(".pc-pronouns", CHIP);
globalStyle(".pc-pronouns[hidden]", { display: "none" });

/** Live local-time chip — tabular figures stop it jittering as it ticks. */
globalStyle(".pc-timezone", {
  ...CHIP,
  fontVariantNumeric: "tabular-nums",
  cursor: "default",
});

globalStyle(".pc-timezone[hidden]", { display: "none" });

/** Nitro / boosting indicators. */
globalStyle(".pc-premium", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
});

globalStyle(".pc-premium[hidden]", { display: "none" });

/** Nitro purple, blended toward the theme so it doesn't clash outright. */
globalStyle(".pc-nitro", {
  padding: "0.05rem 0.4rem",
  borderRadius: 6,
  background: `color-mix(in srgb, #b57edc 22%, ${vars.surfaceHigher})`,
  fontSize: "0.6rem",
  fontWeight: 600,
  color: `color-mix(in srgb, #c084fc 70%, ${vars.textSoft})`,
  whiteSpace: "nowrap",
  cursor: "default",
});

globalStyle(".pc-boost", { fontSize: "0.62rem", lineHeight: 1, cursor: "default" });

/* ---- /discord page stage --------------------------------------------------
   MOVED. `.presence-stage` / `.presence-intro` now live in stage.css.ts, and
   the ~150 lines of `.presence-stage .pc-*` overrides that re-scaled this
   compact card into a full-page hero are GONE — /discord renders
   PresenceDashboard (presence-dashboard.css.ts) instead of blowing this one up.
   ------------------------------------------------------------------------- */

/* ---- mini card (/cool-people) --------------------------------------------- */

/** Connection icons shrink in the mini card. */
globalStyle(".presence-card.is-mini .pc-conn-ic", { width: 13, height: 13 });

globalStyle(".presence-card.is-mini svg.pc-conn-ic", {
  width: 13,
  height: 13,
  fontSize: 13,
});
