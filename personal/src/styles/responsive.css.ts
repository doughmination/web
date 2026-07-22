/* src/styles/responsive.css.ts
 * ESAL-2.3
 */

/**
 * responsive.css.ts — cross-page responsive overrides.
 *
 * Ported from public/css/shared/responsive.css, minus a large amount of dead
 * weight. These blocks targeted features that no longer exist and were dropped
 * rather than carried forward:
 *
 *   .links / .link-card / .link-text / .icon  — the old link-hub grid
 *   .topbar (+ .topbar .presence-card,
 *             .topbar .beta-bar)              — the mobile top-bar reflow
 *   .beta-bar                                 — the old vanilla theme switcher
 *   .badges                                   — the badge stack
 *   .terminal                                 — removed with the terminal widget
 *
 * globalStyle throughout: these are cross-cutting overrides on html/body and on
 * classes owned by several different components.
 */
import { globalStyle } from "@vanilla-extract/css";

/* ---- narrow / short screens ---------------------------------------------- */

/** Shrink the header so the hub never needs to scroll on small viewports. */
const NARROW_OR_SHORT = "(max-width: 420px), (max-height: 640px)";

globalStyle(".hub-header", {
  "@media": {
    [NARROW_OR_SHORT]: { marginBottom: "1.25rem" },
    "(max-width: 640px)": { marginBottom: "1.5rem" },
  },
});

globalStyle(".hub-header h1", {
  "@media": { [NARROW_OR_SHORT]: { fontSize: "1.6rem" } },
});

globalStyle(".pfp", {
  "@media": {
    [NARROW_OR_SHORT]: { width: 72, height: 72, marginBottom: "0.5rem" },
  },
});

/** Cat picker drops to 2 columns on very narrow screens. */
globalStyle(".cat-grid", {
  "@media": { "(max-width: 420px)": { gridTemplateColumns: "repeat(2, 1fr)" } },
});

/* ---- mobile: single vertical scroll, stacked widgets ---------------------- */

const MOBILE = "(max-width: 640px)";

globalStyle("html", {
  "@media": {
    [MOBILE]: {
      height: "auto",
      // Single vertical scroll root on mobile; clip horizontal overflow so
      // absolutely-positioned children can't pan the page sideways.
      overflowX: "hidden",
      overflowY: "auto",
    },
  },
});

globalStyle(
  "body, body:has(.dev-info), body:has(.project-grid), body:has(.friend-grid)",
  {
    "@media": {
      [MOBILE]: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "1rem",
        height: "auto",
        minHeight: "100dvh",
        overflowX: "hidden",
        overflowY: "visible",
        padding: "1.25rem 1rem 2rem",
      },
    },
  },
);

globalStyle(
  ".hub, body:has(.dev-info) .hub, body:has(.project-grid) .hub, body:has(.friend-grid) .hub",
  { "@media": { [MOBILE]: { order: 2, width: "100%", maxWidth: "100%" } } },
);

/** Page nav becomes a centred, wrapping group instead of a fixed column. */
globalStyle(".nav", {
  "@media": { [MOBILE]: { order: 3, position: "static", inset: "auto", width: "100%" } },
});

globalStyle(".nav-links", {
  "@media": {
    [MOBILE]: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "0.5rem",
    },
  },
});

/**
 * The selected-item pointer triangle and its indent only make sense in the
 * vertical desktop nav.
 */
globalStyle(".nav-link.selected", {
  "@media": { [MOBILE]: { marginLeft: 0 } },
});

globalStyle(".nav-link.selected::before", {
  "@media": { [MOBILE]: { display: "none" } },
});

/** Keep long-form content from butting up against the nav below it. */
globalStyle(".dev-info, .project-grid, .friend-grid", {
  "@media": { [MOBILE]: { paddingBottom: "1rem" } },
});

globalStyle(".section + .section", {
  "@media": { [MOBILE]: { marginTop: "1.5rem" } },
});

/* ---- dev-info waka bars --------------------------------------------------- */

/** Narrow the label column so the bars aren't crushed. */
globalStyle(".waka-bar-row", {
  "@media": {
    [MOBILE]: { gridTemplateColumns: "5rem 1fr auto" },
    "(max-width: 380px)": { gridTemplateColumns: "4rem 1fr auto", gap: "0.4rem" },
  },
});

globalStyle(".waka-bar-val", {
  "@media": { "(max-width: 380px)": { fontSize: "0.66rem" } },
});

/* ---- very narrow phones --------------------------------------------------- */

globalStyle(".project-grid", {
  "@media": { "(max-width: 380px)": { gridTemplateColumns: "1fr" } },
});

globalStyle(".project-card-img", {
  "@media": { "(max-width: 380px)": { width: 48, height: 48 } },
});
