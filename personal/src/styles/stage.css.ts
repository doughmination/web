/**
 * stage.css.ts — the centred full-height page shell (`.presence-stage`) and its
 * heading block (`.presence-intro`).
 *
 * Extracted from presence-card.css.ts. Despite the name, this layout has nothing
 * to do with the presence card: /minecraft and /servers both render a
 * `.presence-stage` and were pulling in the entire ~1000-line card stylesheet
 * purely to get these ~40 lines. /discord used to use it too, but now renders
 * PresenceDashboard, which brings its own scoped layout.
 *
 * Still globalStyle because three page files write these class names literally.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./themes.css";

/** The stage owns scrolling for its pages — the global shell is fixed-height. */
globalStyle("html:has(.presence-stage), body:has(.presence-stage)", {
  height: "auto",
  minHeight: "100dvh",
  overflowY: "auto",
});

globalStyle("body:has(.presence-stage)", { padding: 0 });

globalStyle(".presence-stage", {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  // Was in pages/minecraft.css; /minecraft and /servers render .presence-stage
  // and stopped loading that file once page CSS was route-split.
  width: "100%",
  boxSizing: "border-box",
  "@media": {
    "(max-width: 480px)": { padding: 10, justifyContent: "flex-start" },
  },
});

globalStyle(".presence-intro", {
  textAlign: "center",
  margin: "0 0 1.25rem",
  "@media": { "(max-width: 480px)": { maxWidth: "100%" } },
});

globalStyle(".presence-intro h1", { margin: 0, fontSize: "1.8rem", color: vars.accent });

globalStyle(".presence-intro p", {
  margin: "0.3rem 0 0",
  fontSize: "0.9rem",
  color: vars.textMuted,
});
