/* personal/src/styles/nav.css.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * nav.css.ts — the page nav, pinned top-left.
 *
 * The nav is a React component now (NavMenu.tsx) built from navItems.tsx with
 * react-bootstrap-icons, so these are plain global class rules the component
 * renders against (.nav / .nav-links / .nav-link / .nav-ico / .nav-label).
 *
 * Desktop (min-width 641px): the nav collapses into a hamburger. Opening it
 * blooms the items in as icon dots (staggered), holds ~1s, then telescopes
 * each dot out into its label. Pure CSS off a hidden checkbox — no JS timers.
 * Mobile keeps the centred wrapping row (icons hidden, labels shown).
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

globalStyle(".nav", {
  position: "fixed",
  left: "1rem",
  top: "1rem",
  zIndex: 6,
  // Side chrome fades on theme/flavor transitions.
  transition: "opacity 0.6s ease, transform 0.6s ease",
});

globalStyle(".nav-links", {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.4rem",
});

globalStyle(".nav-link", {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  padding: "0.3rem 0.7rem",
  borderRadius: 999,
  background: vars.surface,
  border: `1px solid ${vars.surfaceHi}`,
  color: vars.textSoft,
  fontSize: "0.8rem",
  textDecoration: "none",
  transition:
    "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
});

globalStyle(".nav-link:hover", {
  borderColor: vars.accent,
  color: vars.text,
  transform: "translateX(2px)",
});

globalStyle(".nav-link.selected", {
  background: vars.accent,
  borderColor: vars.accent,
  color: vars.bgDeep,
  fontWeight: 700,
  // Indented to make room for the pointer triangle below.
  marginLeft: 14,
});

/** Triangle pointing at the selected item. */
globalStyle(".nav-link.selected::before", {
  content: '""',
  position: "absolute",
  left: -14,
  top: "50%",
  transform: "translateY(-50%)",
  border: "6px solid transparent",
  borderLeftColor: vars.accent,
});

/* The icon rides inside each link; hidden on mobile (labels-only row). */
globalStyle(".nav-ico", {
  display: "none",
});

/* ==========================================================================
 * Desktop hamburger + JARVIS-style reveal (min-width 641px only).
 * ======================================================================== */

const DESKTOP = "(min-width: 641px)";

/* The checkbox is hidden but stays focusable so keyboard users can toggle it. */
globalStyle(".nav-toggle", {
  position: "absolute",
  width: 1,
  height: 1,
  opacity: 0,
  margin: 0,
  pointerEvents: "none",
});

/* Burger button: hidden by default, shown only on desktop. */
globalStyle(".nav-burger", {
  display: "none",
});

globalStyle(".nav-burger", {
  "@media": {
    [DESKTOP]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
      width: "2.5rem",
      height: "2.5rem",
      padding: "0 0.6rem",
      borderRadius: 999,
      background: vars.surface,
      border: `1px solid ${vars.surfaceHi}`,
      cursor: "pointer",
      transition: "border-color 0.15s ease, background 0.15s ease",
    },
  },
});

globalStyle(".nav-burger:hover", {
  "@media": {
    [DESKTOP]: {
      borderColor: vars.accent,
      background: vars.surfaceHi,
    },
  },
});

globalStyle(".nav-toggle:focus-visible ~ .nav-burger", {
  "@media": {
    [DESKTOP]: {
      borderColor: vars.accent,
      outline: `2px solid ${vars.accent}`,
      outlineOffset: 2,
    },
  },
});

/* The three bars. */
globalStyle(".nav-burger span", {
  "@media": {
    [DESKTOP]: {
      display: "block",
      width: "100%",
      height: "2px",
      borderRadius: 2,
      background: vars.textSoft,
      transition: "transform 0.3s ease, opacity 0.2s ease",
    },
  },
});

/* Checked = morph the bars into an X (bar gap 4px + height 2px = 6px shift). */
globalStyle(".nav-toggle:checked ~ .nav-burger span:nth-child(1)", {
  "@media": { [DESKTOP]: { transform: "translateY(6px) rotate(45deg)" } },
});
globalStyle(".nav-toggle:checked ~ .nav-burger span:nth-child(2)", {
  "@media": { [DESKTOP]: { opacity: 0 } },
});
globalStyle(".nav-toggle:checked ~ .nav-burger span:nth-child(3)", {
  "@media": { [DESKTOP]: { transform: "translateY(-6px) rotate(-45deg)" } },
});

/* Menu container. No max-height collapse — that snapped shut faster than the
 * items could reverse-animate. Instead the container just toggles interactivity
 * and a subtle group shift; each item's own opacity hides it when closed, so
 * closing reverse-telescopes the pills back into dots and fades them out. */
globalStyle(".nav-links", {
  "@media": {
    [DESKTOP]: {
      transform: "translateY(-6px)",
      marginTop: "0.5rem",
      pointerEvents: "none",
      transition: "transform 0.32s ease",
    },
  },
});

globalStyle(".nav-toggle:checked ~ .nav-links", {
  "@media": {
    [DESKTOP]: {
      transform: "translateY(0)",
      pointerEvents: "auto",
    },
  },
});

/* Desktop: no selected-triangle/indent — dots stay aligned, selected shows via
 * the accent fill instead. */
globalStyle(".nav-link.selected", {
  "@media": { [DESKTOP]: { marginLeft: 0 } },
});
globalStyle(".nav-link.selected::before", {
  "@media": { [DESKTOP]: { display: "none" } },
});

/* Phase 1 — each item starts as a hidden icon dot. Per-property transitions so
 * the checked state can delay the "expand" props (max-width/padding) well after
 * the "appear" props (opacity/transform). */
globalStyle(".nav-links .nav-link", {
  "@media": {
    [DESKTOP]: {
      width: "2.5rem",
      height: "2.5rem",
      padding: 0,
      justifyContent: "center",
      overflow: "hidden",
      opacity: 0,
      transform: "scale(0.4)",
      transitionProperty:
        "opacity, transform, width, padding, background, border-color, color",
      transitionDuration: "0.3s, 0.3s, 0.45s, 0.45s, 0.15s, 0.15s, 0.15s",
      transitionTimingFunction: "ease",
    },
  },
});

globalStyle(".nav-links .nav-link:hover", {
  "@media": { [DESKTOP]: { transform: "scale(1.06)" } },
});

/* The icon, centred in the dot; fades out as the label takes over. */
globalStyle(".nav-ico", {
  "@media": {
    [DESKTOP]: {
      display: "flex",
      position: "absolute",
      inset: 0,
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.05rem",
      opacity: 1,
      pointerEvents: "none",
      transition: "opacity 0.3s ease",
    },
  },
});

/* The label, collapsed until the expand phase. */
globalStyle(".nav-label", {
  "@media": {
    [DESKTOP]: {
      opacity: 0,
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition: "opacity 0.3s ease",
    },
  },
});

/* Phase 1 result: dots bloom in. */
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link", {
  "@media": {
    [DESKTOP]: {
      opacity: 1,
      transform: "scale(1)",
      // Phase 2: telescope open to a uniform pill width (delayed ~1s in the
      // per-item rules below). Animating width (not max-width) is what makes
      // the pill actually grow from the dot.
      width: "11rem",
      padding: "0 0.8rem",
    },
  },
});

/* Phase 2: icon fades and label reveals, ~1s after the dots have bloomed. */
globalStyle(".nav-toggle:checked ~ .nav-links .nav-ico", {
  "@media": { [DESKTOP]: { opacity: 0, transitionDelay: "0.95s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-label", {
  "@media": {
    [DESKTOP]: { opacity: 1, transitionDelay: "1s" },
  },
});

/* Per-item stagger. transition-delay order matches transitionProperty above:
 * opacity, transform, width, padding, background, border-color, color.
 * Appear (opacity/transform) staggers; expand (width/padding) waits ~1s.
 * Explicit rules because Turbopack's vanilla-extract plugin can't instrument a
 * top-level loop in a .css.ts. */
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(1)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.05s, 0.05s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(2)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.10s, 0.10s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(3)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.15s, 0.15s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(4)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.20s, 0.20s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(5)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.25s, 0.25s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(6)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.30s, 0.30s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(7)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.35s, 0.35s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(8)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.40s, 0.40s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(9)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.45s, 0.45s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(10)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.50s, 0.50s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(11)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.55s, 0.55s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(12)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.60s, 0.60s, 1s, 1s, 0s, 0s, 0s" } },
});
globalStyle(".nav-toggle:checked ~ .nav-links .nav-link:nth-child(13)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.65s, 0.65s, 1s, 1s, 0s, 0s, 0s" } },
});

/* Reverse JARVIS on close. These delays sit on the UNCHECKED state, so they
 * only apply when closing (opening uses the :checked delays above). Order
 * matches transitionProperty: opacity, transform, width, padding, ... — so the
 * pills shrink back to dots immediately (width/padding delay 0), then the dots
 * fade + scale out bottom-to-top (opacity/transform delay grows toward item 1).
 * Delay = 0.4s + (13 - index) * 0.05s. */
globalStyle(".nav-links .nav-link:nth-child(1)", {
  "@media": { [DESKTOP]: { transitionDelay: "1s, 1s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(2)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.95s, 0.95s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(3)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.90s, 0.90s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(4)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.85s, 0.85s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(5)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.80s, 0.80s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(6)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.75s, 0.75s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(7)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.70s, 0.70s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(8)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.65s, 0.65s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(9)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.60s, 0.60s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(10)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.55s, 0.55s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(11)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.50s, 0.50s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(12)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.45s, 0.45s, 0s, 0s, 0s, 0s, 0s" } },
});
globalStyle(".nav-links .nav-link:nth-child(13)", {
  "@media": { [DESKTOP]: { transitionDelay: "0.40s, 0.40s, 0s, 0s, 0s, 0s, 0s" } },
});

/* Label collapses back with the pill (no per-item delay) as it closes. */
globalStyle(".nav-label", {
  "@media": { [DESKTOP]: { transitionDelay: "0s" } },
});

/* Reduced motion: skip the bloom/telescope, just show the labelled pills. */
globalStyle(
  ".nav-links, .nav-links .nav-link, .nav-ico, .nav-label, .nav-burger span",
  {
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transition: "none",
      },
    },
  },
);
