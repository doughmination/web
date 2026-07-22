/* src/styles/pages/dev-info.css.ts
 * ESAL-2.3
 */

/**
 * dev-info.css.ts — the /dev-info page: tech-stack icons, hardware list,
 * WakaTime stats cards, and the GitHub contribution heatmap.
 *
 * Ported from public/css/pages/dev-info.css.
 *
 * Dropped as dead (nothing renders them):
 *   .about-badges, .about-list, .about-setup
 *       plus `.about-badges .badge` and `.about-setup #pokeball-secret`, which
 *       referenced the badge stack and the pokeball easter egg — both already
 *       removed from the site.
 *   .waka-setup, .waka-setup-btn, .waka-steps (+ .waka-steps code)
 *       the "how to set up WakaTime" empty state, no longer rendered.
 *
 * Kept carefully: the source had `.waka-steps a, .waka-empty a, .waka-credit a`
 * as one selector. Only the .waka-steps part is dead, so the rule survives with
 * that fragment removed rather than being dropped wholesale.
 */
import { globalStyle, globalKeyframes } from "@vanilla-extract/css";
import { vars } from "../themes.css";

const POINTER = 'url("/assets/cursor/pointer_0.png"), pointer';
const ELLIPSIS = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

/* ---- page shell ----------------------------------------------------------- */

/** Only this page scrolls; the link hub stays locked. */
globalStyle("html:has(.dev-info), body:has(.dev-info), html:has(.waka), body:has(.waka)", {
  height: "auto",
  minHeight: "100dvh",
  overflowY: "auto",
});

globalStyle("body:has(.dev-info), body:has(.waka)", {
  alignItems: "flex-start",
});

globalStyle("body:has(.dev-info) .hub", { maxWidth: 860 });

globalStyle(".dev-info", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.5rem",
  margin: "0 auto",
  paddingBottom: "4.5rem",
});

/* ---- tech-stack icons ------------------------------------------------------
   Simple Icons rendered via CSS mask so the colour is theme-driven. The markup
   supplies the icon URL inline:
     <span class="tech-icon pink" style="--si:url('https://cdn.simpleicons.org/SLUG')">
   ------------------------------------------------------------------------- */

globalStyle(".tech-icon", {
  position: "relative",
  width: 30,
  height: 30,
  display: "inline-block",
  transition: "transform 0.15s ease, filter 0.15s ease",
});

/** The icon shape itself — masked, so the ::after label stays visible. */
globalStyle(".tech-icon::before", {
  content: '""',
  position: "absolute",
  inset: 0,
  backgroundColor: "currentColor",
  WebkitMask: "var(--si) center / contain no-repeat",
  mask: "var(--si) center / contain no-repeat",
});

globalStyle(".tech-icon:hover", {
  transform: "translateY(-2px) scale(1.12)",
  filter: "drop-shadow(0 4px 8px currentColor)",
});

/** Hover label — pulls its text from aria-label, tinted to match the icon. */
globalStyle(".tech-icon::after", {
  content: "attr(aria-label)",
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: "50%",
  transform: "translateX(-50%) translateY(4px)",
  padding: "0.25rem 0.5rem",
  borderRadius: 6,
  background: vars.bgDeep,
  border: "1px solid currentColor",
  color: vars.text,
  fontSize: "0.72rem",
  lineHeight: 1,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity 0.15s ease, transform 0.15s ease",
  zIndex: 10,
});

globalStyle(".tech-icon:hover::after", {
  opacity: 1,
  transform: "translateX(-50%) translateY(0)",
});

/**
 * Tech icons are a single colour now, so no per-icon accent classes.
 *
 * The mask in ::before paints with currentColor, so setting it here colours
 * every icon — and the hover drop-shadow, which also uses currentColor, follows
 * along for free.
 *
 * dev-info/page.tsx still passes a colour name into `className={`tech-icon
 * ${color}`}`. Those extra classes now match nothing and are harmless; strip
 * them from the data whenever you next touch that file.
 */
globalStyle(".tech-icon", { color: vars.text });

/** Inside the collapsible card, drop the standalone block's bottom padding. */
globalStyle(".tech-stack .dev-info", {
  paddingBottom: 0,
  justifyContent: "flex-start",
});

/* ---- WakaTime cards ------------------------------------------------------- */

globalStyle(".waka", {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 640,
  margin: "0 auto",
  paddingBottom: "4.5rem",
});

globalStyle(".waka .hub-header", { marginBottom: "1.5rem" });

globalStyle(".waka-meta", {
  margin: "0.5rem 0 0",
  fontSize: "0.72rem",
  letterSpacing: "0.03em",
  color: vars.textMuted,
});

globalStyle(".waka-section", {
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 16,
  padding: "0.85rem 1.25rem 0.95rem",
  marginBottom: "0.7rem",
});

globalStyle(".waka-section .section-title", {
  textAlign: "left",
  fontSize: "0.82rem",
  marginBottom: "1rem",
});

/* headline total + weekly chart */

globalStyle(".waka-total", { textAlign: "center" });

globalStyle(".waka-total-num", {
  fontSize: "2.1rem",
  fontWeight: 700,
  color: vars.accent,
  lineHeight: 1.1,
});

globalStyle(".waka-total-sub", {
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.textMuted,
  marginBottom: "1.1rem",
});

globalStyle(".waka-week", {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "0.5rem",
  height: 120,
});

globalStyle(".waka-day", {
  flex: "1 1 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.4rem",
  height: "100%",
});

globalStyle(".waka-day-track", {
  flex: 1,
  width: "100%",
  maxWidth: 34,
  display: "flex",
  alignItems: "flex-end",
  background: vars.surfaceHi,
  borderRadius: 7,
  overflow: "hidden",
});

globalStyle(".waka-day-fill", {
  width: "100%",
  minHeight: 3,
  background: vars.accent,
  borderRadius: "7px 7px 0 0",
  transition: "height 0.5s ease",
});

globalStyle(".waka-day-label", { fontSize: "0.66rem", color: vars.textMuted });

/* ranked horizontal bars (languages / projects / editors / os) */

globalStyle(".waka-bars", {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
});

globalStyle(".waka-bar-row", {
  display: "grid",
  gridTemplateColumns: "7.5rem 1fr auto",
  alignItems: "center",
  gap: "0.7rem",
  "@media": {
    "(max-width: 560px)": { gridTemplateColumns: "5.5rem 1fr auto" },
  },
});

globalStyle(".waka-bar-name", {
  fontSize: "0.82rem",
  color: vars.text,
  ...ELLIPSIS,
});

globalStyle(".waka-bar-track", {
  height: 9,
  background: vars.surfaceHi,
  borderRadius: 999,
  overflow: "hidden",
});

globalStyle(".waka-bar-fill", {
  display: "block",
  height: "100%",
  width: 0,
  background: vars.accent,
  borderRadius: 999,
  transition: "width 0.6s ease",
});

globalStyle(".waka-bar-val", {
  fontSize: "0.74rem",
  color: vars.textMuted,
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
});

/* two-up grid for editors + OS on wider screens */

globalStyle(".waka-grid2", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.1rem",
  "@media": {
    "(max-width: 560px)": { gridTemplateColumns: "1fr", gap: 0 },
  },
});

globalStyle(".waka-grid2 .waka-section", {
  marginBottom: 0,
  "@media": { "(max-width: 560px)": { marginBottom: "1.1rem" } },
});

globalStyle(".waka-empty", {
  fontSize: "0.85rem",
  color: vars.textMuted,
  lineHeight: 1.5,
  margin: 0,
});

globalStyle(".waka-credit", {
  textAlign: "center",
  fontSize: "0.72rem",
  color: vars.textMuted,
  margin: "1.4rem 0 0",
});

globalStyle(".waka-empty a, .waka-credit a", {
  color: vars.accent,
  textDecoration: "none",
});

globalStyle(".waka-empty a:hover, .waka-credit a:hover", {
  textDecoration: "underline",
});

/* ---- collapsible sections (details/summary) ------------------------------- */

globalStyle("details.waka-section", {
  // tight when collapsed; [open] below expands it
  paddingBottom: "0.85rem",
  transition: "padding-bottom 0.15s ease",
});

globalStyle("details.waka-section[open]", { paddingBottom: "1.15rem" });

globalStyle("summary.section-title", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  cursor: POINTER,
  listStyle: "none",
  userSelect: "none",
  marginBottom: 0,
  transition: "margin-bottom 0.15s ease, color 0.15s ease",
});

/** Hide the native disclosure triangle in both engines. */
globalStyle("summary.section-title::-webkit-details-marker", { display: "none" });
globalStyle("summary.section-title::marker", { content: '""' });

globalStyle("summary.section-title:hover", { color: vars.accent });

globalStyle("summary.section-title:focus-visible", {
  outline: `2px solid ${vars.accent}`,
  outlineOffset: 3,
  borderRadius: 6,
});

/** Custom chevron that flips when the section opens. */
globalStyle("summary.section-title::after", {
  content: '""',
  flex: "none",
  width: "0.5rem",
  height: "0.5rem",
  marginRight: "0.15rem",
  borderRight: "2px solid currentColor",
  borderBottom: "2px solid currentColor",
  transform: "rotate(45deg)",
  transition: "transform 0.2s ease",
});

globalStyle("details.waka-section[open] > summary.section-title", {
  marginBottom: "0.75rem",
});

globalStyle("details.waka-section[open] > summary.section-title::after", {
  transform: "rotate(-135deg)",
});

/* ---- hardware spec list --------------------------------------------------- */

globalStyle(".hw-item", { textDecoration: "none", color: vars.text });

globalStyle(".hw-intro", {
  margin: "0 0 0.9rem",
  fontSize: "0.8rem",
  color: vars.textMuted,
});

globalStyle(".hw-list", {
  display: "flex",
  flexDirection: "column",
  gap: "0.55rem",
  margin: 0,
});

globalStyle(".hw-row", {
  display: "grid",
  gridTemplateColumns: "8rem 1fr",
  gap: "0.7rem",
  alignItems: "baseline",
  "@media": { "(max-width: 560px)": { gridTemplateColumns: "6rem 1fr" } },
});

globalStyle(".hw-row dt", {
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.textMuted,
});

globalStyle(".hw-row dd", { margin: 0, fontSize: "0.88rem", color: vars.text });

/* ---- contribution heatmap (.ch-*) -----------------------------------------
   Deliberately NOT themed: --contrib-0..4 are GitHub's own green scale, so the
   heatmap stays recognisable regardless of the site flavour. --ch-cell / --ch-gap
   / --ch-weekday-w drive the grid geometry from one place.
   ------------------------------------------------------------------------- */

globalStyle(".ch-root", {
  vars: {
    "--ch-cell": "13px",
    "--ch-gap": "3px",
    "--ch-weekday-w": "30px",
    "--contrib-0": "#232a33",
    "--contrib-1": "#173f2c",
    "--contrib-2": "#1e7349",
    "--contrib-3": "#34ab68",
    "--contrib-4": "#5ce897",
    "--ch-muted": "#8b95a1",
    "--ch-text": "#d3dae2",
  },
  display: "block",
  width: "100%",
  maxWidth: "100%",
  color: "var(--ch-text)",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
});

globalStyle(".ch-count", {
  margin: "0 0 14px",
  fontSize: 13,
  color: "var(--ch-muted)",
  fontVariantNumeric: "tabular-nums",
  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
});

globalStyle(".ch-scroll", {
  overflowX: "auto",
  paddingBottom: 4,
  scrollbarWidth: "thin",
  scrollbarColor: "var(--ch-muted) transparent",
});

globalStyle(".ch-scroll::-webkit-scrollbar", { height: 8 });
globalStyle(".ch-scroll::-webkit-scrollbar-thumb", {
  background: "var(--ch-muted)",
  borderRadius: 4,
});
globalStyle(".ch-scroll::-webkit-scrollbar-track", { background: "transparent" });

globalStyle(".ch-months", {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "var(--ch-cell)",
  gap: "var(--ch-gap)",
  // offset past the weekday gutter so month labels line up with their columns
  marginLeft: "calc(var(--ch-weekday-w) + var(--ch-gap))",
  marginBottom: 6,
  height: 14,
  fontSize: 11,
  color: "var(--ch-muted)",
});

globalStyle(".ch-months span", { whiteSpace: "nowrap", lineHeight: "14px" });

globalStyle(".ch-body", { display: "flex", gap: "var(--ch-gap)" });

globalStyle(".ch-weekdays", {
  display: "grid",
  gridTemplateRows: "repeat(7, var(--ch-cell))",
  gap: "var(--ch-gap)",
  width: "var(--ch-weekday-w)",
  fontSize: 10,
  color: "var(--ch-muted)",
});

globalStyle(".ch-weekdays span", { lineHeight: "var(--ch-cell)" });

globalStyle(".ch-grid", {
  display: "grid",
  gridTemplateRows: "repeat(7, var(--ch-cell))",
  gridAutoFlow: "column",
  gridAutoColumns: "var(--ch-cell)",
  gap: "var(--ch-gap)",
});

globalKeyframes("ch-pop", { to: { opacity: 1 } });

globalStyle(".ch-day", {
  width: "var(--ch-cell)",
  height: "var(--ch-cell)",
  borderRadius: 3,
  outline: "1px solid rgba(255, 255, 255, 0.04)",
  outlineOffset: -1,
  opacity: 0,
  animation: "ch-pop 0.4s ease forwards",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none", opacity: 1 },
  },
});

globalStyle(".ch-day:hover", { outline: "1px solid var(--ch-text)" });

/** Contribution intensity, 0–4. DevInfo builds the class as `l${level}`. */
for (let i = 0; i <= 4; i++) {
  globalStyle(`.ch-day.l${i}`, { background: `var(--contrib-${i})` });
}

globalStyle(".ch-legend", {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 14,
  fontSize: 11,
  color: "var(--ch-muted)",
});

/** Legend swatches are static — no pop-in animation. */
globalStyle(".ch-legend .ch-day", { animation: "none", opacity: 1 });
