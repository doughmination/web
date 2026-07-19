/**
 * cool-people.css.ts — the /cool-people page.
 *
 * Ported from public/css/pages/cool-people.css, which was mostly dead. Friend
 * cards used to be a bespoke `.friend-card` / `.fc-*` component; they're now
 * built by presenceCard.ts as mini presence cards (FriendsGrid calls
 * createPresenceCard). The old implementation was never removed — roughly 60 of
 * the file's 78 rules styled markup nothing renders any more:
 *
 *   .friend-card (+ .has-profile-grad, .is-hovering, .tier-dead-alt, all the
 *                 [data-status] variants)
 *   .fc-banner .fc-main .fc-avatar .fc-pfp .fc-deco .fc-status .fc-id
 *   .fc-name-row .fc-name (+ tier-heart ::before variants) .fc-tag .fc-tag-badge
 *   .fc-user .fc-custom (+ tail, emoji, text) .fc-badges .fc-badge .fc-badge-link
 *   #friends-root
 *
 * All dropped. What survives is the grid, the page shell, and the .is-mini
 * variant that re-skins the shared presence card for this page.
 *
 * IMPORTANT — cascade order: this file overrides rules in presence-card.css.ts,
 * so cool-people/page.tsx must import that FIRST. Vanilla Extract emits in
 * import order, and these overrides are same-specificity in places.
 *
 * The html/body :has(.friends-wrap) scroll rules aren't repeated here — they're
 * already global in styles/scroll-wrap.css.ts.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/* ---- page shell ----------------------------------------------------------- */

globalStyle("body:has(.friend-grid) .hub-header", {
  position: "relative",
  zIndex: 1,
  marginBottom: "2rem",
});

globalStyle("body:has(.friends-wrap) .hub", { maxWidth: 960 });

/**
 * flex-wrap rather than grid: it centres EVERY row including a partial last
 * one, so a lone trailing card sits centred instead of stuck to the left.
 */
globalStyle(".friend-grid", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  marginBottom: "1.5rem",
  gap: "1.1rem",
  width: "100%",
});

globalStyle(".friends-disclaimer", {
  margin: "2.5rem auto 0",
  maxWidth: "60ch",
  textAlign: "center",
  fontSize: "0.8rem",
  lineHeight: 1.5,
  opacity: 0.6,
});

globalStyle(".friends-disclaimer a", {
  color: "inherit",
  textDecoration: "underline",
});

/* ---- mini presence cards ---------------------------------------------------
   Each friend is a full presence card built by presenceCard.ts, just smaller
   than the /discord one. The base card is already compact (~280px); this mostly
   un-fixes it from the viewport corner so the cards can tile in .friend-grid.
   ------------------------------------------------------------------------- */

globalStyle(".presence-card.is-mini", {
  // The base card is position: fixed in the corner — undo all of that.
  position: "static",
  top: "auto",
  left: "auto",
  right: "auto",
  bottom: "auto",
  zIndex: "auto",
  margin: 0,
  // clearly smaller than the 680px /discord card
  width: 300,
  maxWidth: "100%",
});

/** Keep things tidy at the smaller size. */
globalStyle(".presence-card.is-mini .pc-banner", { height: 84 });

globalStyle(".presence-card.is-mini .pc-bio", {
  maxHeight: "6.5em",
  overflowY: "auto",
});

/** The friend's name can link out to a personal site. */
globalStyle(".presence-card.is-mini .pc-name--link", { textDecoration: "none" });
globalStyle(".presence-card.is-mini .pc-name--link:hover", {
  textDecoration: "underline",
});

/* ---- tier hearts ----------------------------------------------------------
   Ported from the old .fc-name prefixes. presenceCard.ts adds `tier-<name>`
   alongside is-mini, so the heart is chosen purely in CSS.
   ------------------------------------------------------------------------- */

const TIER_HEARTS: Record<string, string> = {
  "": "🩵 ", // default, no tier class
  closer: "💜 ",
  known: "💛 ",
  wife: "🖤 ",
  close: "🤍 ",
  "active-alt": "🎭 ",
  "dead-alt": "💀 ",
};

for (const [tier, heart] of Object.entries(TIER_HEARTS)) {
  const sel = tier
    ? `.presence-card.is-mini.tier-${tier} .pc-name::before`
    : ".presence-card.is-mini .pc-name::before";
  globalStyle(sel, { content: `"${heart}"` });
}

/**
 * Gradient display names clip their text to transparent. Repaint the heart
 * normally so it keeps its own colour instead of vanishing with the fill.
 */
globalStyle(".presence-card.is-mini .pc-name.is-gradient::before", {
  WebkitTextFillColor: "initial",
  color: vars.text,
});

/* ---- dead alts: greyed, struck through, no live status -------------------- */

globalStyle(".presence-card.is-mini.tier-dead-alt .pc-av-img", {
  filter: "grayscale(1) brightness(0.6)",
});

globalStyle(".presence-card.is-mini.tier-dead-alt .pc-name", {
  color: vars.textDim,
  textDecoration: "line-through",
});

globalStyle(".presence-card.is-mini.tier-dead-alt .pc-status", {
  display: "none",
});
