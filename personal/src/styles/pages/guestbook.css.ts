/**
 * guestbook.css.ts — the sign form and entry list on /guestbook.
 *
 * Ported from public/css/pages/guestbook.css. Nothing dropped — a grep called
 * .gb-status, .gb-turnstile and .guestbook-wrap unused, but the rendered DOM
 * shows all three.
 */
import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

globalStyle(".guestbook-wrap", {
  maxWidth: 640,
});

/* ---- sign form ------------------------------------------------------------ */

globalStyle(".gb-form", {
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
  background: vars.surface0,
  border: `1px solid ${vars.surface1}`,
  borderRadius: 14,
  padding: "1.1rem 1.2rem",
  marginBottom: "2rem",
});

globalStyle(".gb-field", {
  display: "flex",
  flexDirection: "column",
  gap: "0.3rem",
  // Anchors the absolutely-positioned honeypot below.
  position: "relative",
});

globalStyle(".gb-field label", {
  fontSize: "0.8rem",
  color: vars.subtext0,
  letterSpacing: "0.03em",
});

globalStyle(".gb-optional", {
  color: vars.overlay0,
});

globalStyle(".gb-form input, .gb-form textarea", {
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: vars.text,
  background: vars.mantle,
  border: `1px solid ${vars.surface1}`,
  borderRadius: 9,
  padding: "0.55rem 0.7rem",
  width: "100%",
  resize: "vertical",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
});

globalStyle(".gb-form input:focus, .gb-form textarea:focus", {
  outline: "none",
  borderColor: vars.pink,
  boxShadow: `inset 0 0 0 1px ${vars.pink}`,
});

globalStyle(".gb-counter", {
  alignSelf: "flex-end",
  fontSize: "0.7rem",
  color: vars.overlay0,
});

/** Collapses the Turnstile slot until the widget actually renders into it. */
globalStyle(".gb-turnstile:empty", {
  display: "none",
});

globalStyle(".gb-actions", {
  display: "flex",
  alignItems: "center",
  gap: "0.9rem",
  flexWrap: "wrap",
});

globalStyle(".gb-form button", {
  fontFamily: "inherit",
  fontSize: "0.9rem",
  color: vars.crust,
  background: vars.pink,
  border: "none",
  borderRadius: 9,
  padding: "0.55rem 1.1rem",
  fontWeight: 700,
  transition: "transform 0.12s ease, opacity 0.12s ease",
});

globalStyle(".gb-form button:hover:not(:disabled)", {
  transform: "translateY(-1px)",
});

globalStyle(".gb-form button:disabled", {
  opacity: 0.55,
});

globalStyle(".gb-status", {
  fontSize: "0.82rem",
  color: vars.subtext0,
});

globalStyle(".gb-status.gb-err", { color: vars.red });
globalStyle(".gb-status.gb-ok", { color: vars.green });

/** Honeypot: visually hidden but still in the DOM for bots to fill in. */
globalStyle(".gb-hp", {
  position: "absolute",
  left: -9999,
  width: 1,
  height: 1,
  overflow: "hidden",
});

/* ---- entries -------------------------------------------------------------- */

globalStyle(".gb-entries", {
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
  paddingBottom: "4.5rem",
});

globalStyle(".gb-empty", {
  color: vars.subtext0,
  textAlign: "center",
  fontSize: "0.9rem",
});

globalStyle(".gb-entry", {
  background: vars.surface0,
  border: `1px solid ${vars.surface1}`,
  borderRadius: 12,
  padding: "0.85rem 1rem",
  transition: "border-color 0.15s ease, transform 0.15s ease",
});

globalStyle(".gb-entry:hover", {
  borderColor: vars.pink,
  transform: "translateY(-2px)",
});

globalStyle(".gb-entry-head", {
  display: "flex",
  alignItems: "baseline",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginBottom: "0.35rem",
});

globalStyle(".gb-entry-name", {
  fontWeight: 700,
  color: vars.pink,
});

globalStyle(".gb-entry-name a", {
  color: "inherit",
  textDecoration: "none",
  borderBottom: `1px dotted ${vars.overlay1}`,
});

globalStyle(".gb-entry-name a:hover", {
  borderBottomColor: vars.pink,
});

/** margin-left: auto pushes the timestamp to the far right of the head row. */
globalStyle(".gb-entry-time", {
  fontSize: "0.72rem",
  color: vars.overlay0,
  marginLeft: "auto",
});

globalStyle(".gb-entry-msg", {
  color: vars.text,
  fontSize: "0.92rem",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});
