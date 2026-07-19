import { globalStyle } from "@vanilla-extract/css";
import { vars } from "../themes.css";

/** Discord brand colours for role pills — deliberately not themed. */
const ROLE = {
  default: "#5865f2", // blurple
  owner: "#f5a623", // gold
  admin: "#ed4245", // red
  mod: "#43b581", // green, matches the online dot
  member: "#5865f2",
} as const;

const ONLINE_GREEN = "#43b581";
const CARD_BORDER = "rgba(255, 255, 255, 0.08)";

globalStyle(".guild-grid", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "1rem",
});

globalStyle(".guild-card", {
  display: "block",
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  background: vars.bg,
  textDecoration: "none",
  color: "inherit",
  border: `1px solid ${CARD_BORDER}`,
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  fontFamily: "'DDN gg sans', sans-serif", // matches the presence cards
});

globalStyle(".guild-card:hover, .guild-card:focus-visible", {
  transform: "translateY(-2px)",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
});

globalStyle(".gc-banner", {
  width: "100%",
  height: 80,
  objectFit: "cover",
  display: "block",
});

globalStyle(".gc-head", {
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  padding: "0 0.75rem 0.75rem",
});

/** Only the icon overlaps the banner, Discord-style. */
globalStyle(".gc-icon", {
  width: 56,
  height: 56,
  borderRadius: "50%",
  border: `3px solid ${vars.bg}`,
  background: vars.bg,
  objectFit: "cover",
  marginTop: -28,
  flexShrink: 0,
});

globalStyle(".gc-icon-fallback", {
  width: 56,
  height: 56,
  borderRadius: "50%",
  border: `3px solid ${vars.bg}`,
  background: vars.accent,
  color: vars.bg,
  marginTop: -28,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "1.4rem",
  lineHeight: 1,
});

globalStyle(".gc-icon-fallback[hidden]", {
  display: "none",
});

globalStyle(".guild-card.gc-banner-fallback .gc-banner", {
  display: "none",
});

/** Solid colour block standing in for a missing banner. */
globalStyle(".guild-card.gc-banner-fallback::before", {
  content: '""',
  display: "block",
  width: "100%",
  height: 80, // matches .gc-banner's height so layout doesn't shift
  background: vars.accent,
});

globalStyle(".gc-id", {
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
  minWidth: 0,
  paddingTop: "0.75rem", // keeps the name clear of the banner edge above
});

globalStyle(".gc-name", {
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

globalStyle(".gc-counts", {
  fontSize: "0.8rem",
  opacity: 0.75,
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
});

globalStyle(".gc-dot", {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: ONLINE_GREEN,
  display: "inline-block",
});

globalStyle(".gc-desc", {
  padding: "0 0.75rem 0.75rem",
  fontSize: "0.85rem",
  opacity: 0.85,
});

/** Role badge — small pill pinned to the card's top-right corner. */
globalStyle(".gc-role", {
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  zIndex: 1,
  padding: "0.15rem 0.5rem",
  borderRadius: 999,
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  lineHeight: 1.4,
  color: "#fff",
  background: ROLE.default,
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.35)",
  textTransform: "uppercase",
});

globalStyle(".gc-role-owner", { background: ROLE.owner });
globalStyle(".gc-role-admin", { background: ROLE.admin });
globalStyle(".gc-role-mod", { background: ROLE.mod });
globalStyle(".gc-role-member", { background: ROLE.member });
