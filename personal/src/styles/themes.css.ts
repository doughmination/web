/**
 * themes.css.ts — the site palette, as a typed contract.
 *
 * Names are semantic, not Catppuccin. Three groups:
 *
 *   accents    accent / accentAlt / success / warning / danger / info
 *              What a colour MEANS. Use these for UI.
 *   hues       rosewater / maroon / peach / teal / sky / sapphire / lavender
 *              Pure swatches with no semantic role. They exist for the
 *              /dev-info tech-icon palette and the Minecraft role accents,
 *              where the point is "a distinct colour", not a meaning.
 *   neutrals   bgDeep < bgRaised < bg < surface < surfaceHi < surfaceHigher,
 *              and textFaint < textDim < textMuted < textSoft < text.
 *              Both scales run dark -> light.
 *
 * createGlobalThemeContract pins each token to a literal CSS variable name, so
 * `var(--accent)` works from markup and from code that builds var() strings at
 * runtime (MinecraftAccounts does exactly that for role accents).
 *
 * Omit or misspell a token in any flavour and the BUILD FAILS.
 */
import {
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

/** Token -> literal CSS custom-property name (accentAlt => var(--accent-alt)). */
export const vars = createGlobalThemeContract({
  accent: "accent",
  accentAlt: "accent-alt",
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
  rosewater: "rosewater",
  maroon: "maroon",
  peach: "peach",
  teal: "teal",
  sky: "sky",
  sapphire: "sapphire",
  lavender: "lavender",
  bgDeep: "bg-deep",
  bgRaised: "bg-raised",
  bg: "bg",
  surface: "surface",
  surfaceHi: "surface-hi",
  surfaceHigher: "surface-higher",
  textFaint: "text-faint",
  textDim: "text-dim",
  textMuted: "text-muted",
  textSoft: "text-soft",
  text: "text",
});

createGlobalTheme('html[data-flavor="cherry"]', vars, {
  accent: "#ff5c8a",
  accentAlt: "#d9739f",
  success: "#7a9b5c",
  danger: "#c22a3e",
  warning: "#d9a441",
  info: "#6b7fd1",
  rosewater: "#ffd9e3",
  maroon: "#8c1c33",
  peach: "#e8825a",
  teal: "#4a9b8e",
  sky: "#6fa8c9",
  sapphire: "#4d87b3",
  lavender: "#9d8ce0",
  bgDeep: "#0d0508",
  bgRaised: "#140a0e",
  bg: "#1c0f14",
  surface: "#2b1620",
  surfaceHi: "#3d1f2c",
  surfaceHigher: "#52293a",
  textFaint: "#825b71",
  textDim: "#9a7489",
  textMuted: "#c9a8b9",
  textSoft: "#e0c3d0",
  text: "#f5dde6",
});
globalStyle('html[data-flavor="cherry"]', { colorScheme: "dark" });

createGlobalTheme('html[data-flavor="toxic"]', vars, {
  accent: "#7fff3f",
  accentAlt: "#a3e635",
  success: "#39ff14",
  danger: "#ff3b3b",
  warning: "#d4ff2a",
  info: "#4ade80",
  rosewater: "#d4ffb3",
  maroon: "#b91c1c",
  peach: "#ffb347",
  teal: "#2ee6a8",
  sky: "#6bffb8",
  sapphire: "#3ecf8e",
  lavender: "#8fffb0",
  bgDeep: "#060a04",
  bgRaised: "#0a0f07",
  bg: "#0e150a",
  surface: "#17210f",
  surfaceHi: "#223018",
  surfaceHigher: "#2e4022",
  textFaint: "#618350",
  textDim: "#7a9c69",
  textMuted: "#aecf9c",
  textSoft: "#c8e8b8",
  text: "#e4ffd9",
});
globalStyle('html[data-flavor="toxic"]', { colorScheme: "dark" });

/**
 * Lemon — warm dark citrus. Charcoal-olive neutrals under a bright lemon accent.
 *
 * Two deliberate choices:
 *
 * `warning` is amber, not yellow. Yellow is already the accent here, so a yellow
 * warning would be invisible as a signal — the low-battery chip would look
 * identical to every other accented thing on the page.
 *
 * sapphire / sky / teal / maroon stay in cool + rust families rather than being
 * tinted lemon. They're the Minecraft role accents (see ROLE_META), and their
 * whole job is telling six accounts apart at a glance — collapsing them toward
 * the theme hue would defeat that.
 */
createGlobalTheme('html[data-flavor="lemon"]', vars, {
  accent: "#ffe14d",
  accentAlt: "#e0b92e",
  success: "#a8d94a",
  danger: "#ff5a4d",
  warning: "#ffab2e",
  info: "#63c5d9",
  rosewater: "#fff0b8",
  maroon: "#a8442a",
  peach: "#ffab5e",
  teal: "#3fbfa0",
  sky: "#6fc9e8",
  sapphire: "#3d9be0",
  lavender: "#b89ae0",
  bgDeep: "#0a0903",
  bgRaised: "#121006",
  bg: "#191509",
  surface: "#262010",
  surfaceHi: "#352d16",
  surfaceHigher: "#473d1e",
  textFaint: "#8a7a45",
  textDim: "#a89654",
  textMuted: "#cfbe86",
  textSoft: "#e8dbaa",
  text: "#fff8dc",
});
globalStyle('html[data-flavor="lemon"]', { colorScheme: "dark" });
