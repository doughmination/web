/* src/styles/pages/selfies.css.ts
 * ESAL-2.3
 */

/**
 * selfies.css.ts — the /selfies grid and lightbox.
 *
 * Ported from public/css/pages/selfies.css.
 *
 * Two things changed in the port:
 *
 * 1. The `html:has(.selfies-wrap), body:has(.selfies-wrap)` scroll rules are NOT
 *    repeated here — they already live in styles/scroll-wrap.css.ts, which is
 *    global. Only the align-items tweak, which scroll-wrap doesn't cover for
 *    this wrapper, is kept below.
 *
 * 2. `.lightbox-img` was declared twice in the source, with max-height 86vh and
 *    then 80vh further down. The later won, so 80vh is the real value — merged
 *    into a single rule here rather than carrying the dead 86vh forward.
 */
import { globalStyle, globalKeyframes } from "@vanilla-extract/css";
import { vars } from "../themes.css";

const LIGHTBOX_MAX_W = "min(92vw, 1100px)";

/* ---- page shell ----------------------------------------------------------- */

globalStyle("body:has(.selfies-wrap)", {
  alignItems: "flex-start",
});

globalStyle("body:has(.selfies-wrap) .hub", {
  maxWidth: 960,
});

globalStyle("body:has(.selfies-wrap) .hub-header", {
  position: "relative",
  zIndex: 1,
  marginBottom: "2rem",
});

/* ---- grid ----------------------------------------------------------------- */

globalStyle(".selfie-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "0.9rem",
  width: "100%",
  marginBottom: "1.5rem",
  paddingBottom: "4.5rem",
  "@media": {
    "(max-width: 560px)": {
      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
      gap: "0.6rem",
    },
  },
});

globalStyle(".selfie-item", {
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
});

globalStyle(".selfie-thumb", {
  margin: 0,
  padding: 0,
  border: `1px solid ${vars.surfaceHi}`,
  borderRadius: 14,
  overflow: "hidden",
  background: vars.surface,
  aspectRatio: "1 / 1",
  display: "block",
  transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

globalStyle(".selfie-thumb img", {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

globalStyle(".selfie-thumb:hover, .selfie-thumb:focus-visible", {
  transform: "translateY(-3px)",
  borderColor: vars.accent,
  boxShadow: `0 6px 20px ${vars.accent}`,
  outline: "none",
});

globalStyle(".selfie-caption", {
  textAlign: "center",
  fontSize: "0.8rem",
  lineHeight: 1.35,
  color: vars.textMuted,
  overflowWrap: "anywhere",
});

globalStyle(".selfie-empty", {
  gridColumn: "1 / -1",
  textAlign: "center",
  color: vars.textMuted,
  fontStyle: "italic",
  padding: "3rem 1rem",
});

/* ---- lightbox ------------------------------------------------------------- */

globalKeyframes("lightbox-fade", {
  from: { opacity: 0 },
  to: { opacity: 1 },
});

globalStyle(".lightbox", {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  background: `color-mix(in srgb, ${vars.bgDeep} 86%, transparent)`,
  WebkitBackdropFilter: "blur(6px)",
  backdropFilter: "blur(6px)",
});

globalStyle(".lightbox[hidden]", { display: "none" });

globalStyle(".lightbox.is-open", {
  animation: "lightbox-fade 0.18s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { animation: "none" },
  },
});

globalStyle(".lightbox-figure", {
  margin: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.8rem",
  maxWidth: LIGHTBOX_MAX_W,
});

globalStyle(".lightbox-img", {
  maxWidth: LIGHTBOX_MAX_W,
  // 80vh, not 86vh — leaves room beneath the image for the caption line.
  maxHeight: "80vh",
  objectFit: "contain",
  borderRadius: 12,
  border: `2px solid ${vars.accent}`,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
});

globalStyle(".lightbox-caption", {
  margin: 0,
  textAlign: "center",
  color: vars.text,
  fontSize: "0.95rem",
  lineHeight: 1.4,
  maxWidth: LIGHTBOX_MAX_W,
  overflowWrap: "anywhere",
});

globalStyle(".lightbox-caption[hidden]", { display: "none" });

globalStyle(".lightbox-close, .lightbox-nav", {
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${vars.surfaceHi}`,
  background: `color-mix(in srgb, ${vars.surface} 85%, transparent)`,
  color: vars.text,
  borderRadius: 999,
  lineHeight: 1,
  transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
  "@media": {
    "(prefers-reduced-motion: reduce)": { transition: "none" },
  },
});

globalStyle(
  ".lightbox-close:hover, .lightbox-nav:hover, .lightbox-close:focus-visible, .lightbox-nav:focus-visible",
  {
    background: vars.surfaceHi,
    borderColor: vars.accent,
    outline: "none",
  },
);

globalStyle(".lightbox-close", {
  top: "1rem",
  right: "1rem",
  width: "2.6rem",
  height: "2.6rem",
  fontSize: "1.8rem",
});

globalStyle(".lightbox-nav", {
  top: "50%",
  transform: "translateY(-50%)",
  width: "3rem",
  height: "3rem",
  fontSize: "2rem",
  "@media": {
    "(max-width: 560px)": { width: "2.6rem", height: "2.6rem", fontSize: "1.6rem" },
  },
});

globalStyle(".lightbox-nav:hover", {
  transform: "translateY(-50%) scale(1.06)",
  "@media": {
    // Keep the centring transform, drop only the scale.
    "(prefers-reduced-motion: reduce)": { transform: "translateY(-50%)" },
  },
});

globalStyle(".lightbox-prev", { left: "1rem" });
globalStyle(".lightbox-next", { right: "1rem" });
globalStyle(".lightbox-nav[hidden]", { display: "none" });

/** Freeze the page behind the lightbox while it's open. */
globalStyle("body.lightbox-open", { overflow: "hidden" });
