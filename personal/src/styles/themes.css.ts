/**
 * themes.css.ts — the six flavour palettes as a typed contract.
 *
 * createGlobalThemeContract (NOT createThemeContract) is deliberate: it pins
 * each token to a literal CSS variable name, so this still emits `--pink`,
 * `--text`, `--base` and friends. The ~200 KB of hand-written CSS that says
 * `var(--pink)` keeps working untouched, which is what makes an incremental
 * migration possible. createThemeContract would hash the names and break all
 * of it at once.
 *
 * createGlobalTheme binds each flavour to the same `html[data-flavor="x"]`
 * selector the old stylesheets used, so the pre-paint boot script in layout.tsx,
 * the data-flavor attribute and the localStorage round-trip are unaffected.
 *
 * The payoff: omit or misspell a token in any flavour and the BUILD FAILS.
 * That parity was previously only checked by a script run by hand.
 *
 * Values generated from public/css/themes/*.css, so they are exact.
 */
import {
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

/** Token -> literal CSS custom-property name (mauve => var(--mauve)). */
export const vars = createGlobalThemeContract({
  rosewater: "rosewater",
  flamingo: "flamingo",
  pink: "pink",
  mauve: "mauve",
  red: "red",
  maroon: "maroon",
  peach: "peach",
  yellow: "yellow",
  green: "green",
  teal: "teal",
  sky: "sky",
  saphire: "saphire",
  blue: "blue",
  lavender: "lavender",
  text: "text",
  subtext1: "subtext-1",
  subtext0: "subtext-0",
  overlay2: "overlay-2",
  overlay1: "overlay-1",
  overlay0: "overlay-0",
  surface2: "surface-2",
  surface1: "surface-1",
  surface0: "surface-0",
  base: "base",
  mantle: "mantle",
  crust: "crust",
});

createGlobalTheme('html[data-flavor="cherry"]', vars, {
  rosewater: "#ffd9e3",
  flamingo: "#ffb3c6",
  pink: "#ff5c8a",
  mauve: "#d9739f",
  red: "#c22a3e",
  maroon: "#8c1c33",
  peach: "#e8825a",
  yellow: "#d9a441",
  green: "#7a9b5c",
  teal: "#4a9b8e",
  sky: "#6fa8c9",
  saphire: "#4d87b3",
  blue: "#6b7fd1",
  lavender: "#9d8ce0",
  text: "#f5dde6",
  subtext1: "#e0c3d0",
  subtext0: "#c9a8b9",
  overlay2: "#b28ea1",
  overlay1: "#9a7489",
  overlay0: "#825b71",
  surface2: "#52293a",
  surface1: "#3d1f2c",
  surface0: "#2b1620",
  base: "#1c0f14",
  mantle: "#140a0e",
  crust: "#0d0508",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="cherry"]', { colorScheme: "dark" });

createGlobalTheme('html[data-flavor="frappe"]', vars, {
  rosewater: "#f2d5cf",
  flamingo: "#eebebe",
  pink: "#f4b8e4",
  mauve: "#ca9ee6",
  red: "#e78284",
  maroon: "#ea999c",
  peach: "#ef9f76",
  yellow: "#e5c890",
  green: "#a6d189",
  teal: "#81c8be",
  sky: "#99d1db",
  saphire: "#85c1dc",
  blue: "#8caaee",
  lavender: "#babbf1",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  subtext0: "#a5adce",
  overlay2: "#949cbb",
  overlay1: "#838ba7",
  overlay0: "#737994",
  surface2: "#626880",
  surface1: "#51576d",
  surface0: "#414559",
  base: "#303446",
  mantle: "#292c3c",
  crust: "#232634",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="frappe"]', { colorScheme: "dark" });

createGlobalTheme('html[data-flavor="latte"]', vars, {
  rosewater: "#dc8a78",
  flamingo: "#dd7878",
  pink: "#ea76cb",
  mauve: "#8839ef",
  red: "#d20f39",
  maroon: "#e64553",
  peach: "#fe640b",
  yellow: "#df8e1d",
  green: "#40a02b",
  teal: "#179299",
  sky: "#04a5e5",
  saphire: "#209fb5",
  blue: "#1e66f5",
  lavender: "#7287fd",
  text: "#4c4f69",
  subtext1: "#5c5f77",
  subtext0: "#6c6f85",
  overlay2: "#7c7f93",
  overlay1: "#8c8fa1",
  overlay0: "#9ca0b0",
  surface2: "#acb0be",
  surface1: "#bcc0cc",
  surface0: "#ccd0da",
  base: "#eff1f5",
  mantle: "#e6e9ef",
  crust: "#dce0e8",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="latte"]', { colorScheme: "light" });

createGlobalTheme('html[data-flavor="macchiato"]', vars, {
  rosewater: "#f4dbd6",
  flamingo: "#f0c6c6",
  pink: "#f5bde6",
  mauve: "#c6a0f6",
  red: "#ed8796",
  maroon: "#ee99a0",
  peach: "#f5a97f",
  yellow: "#eed49f",
  green: "#a6da95",
  teal: "#8bd5ca",
  sky: "#91d7e3",
  saphire: "#7dc4e4",
  blue: "#8aadf4",
  lavender: "#b7bdf8",
  text: "#cad3f5",
  subtext1: "#b8c0e0",
  subtext0: "#a5adcb",
  overlay2: "#939ab7",
  overlay1: "#8087a2",
  overlay0: "#6e738d",
  surface2: "#5b6078",
  surface1: "#494d64",
  surface0: "#363a4f",
  base: "#24273a",
  mantle: "#1e2030",
  crust: "#181926",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="macchiato"]', { colorScheme: "dark" });

createGlobalTheme('html[data-flavor="mocha"]', vars, {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  saphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  text: "#cdd6f4",
  subtext1: "#bac2de",
  subtext0: "#a6adc8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  overlay0: "#6c7086",
  surface2: "#585b70",
  surface1: "#45475a",
  surface0: "#313244",
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="mocha"]', { colorScheme: "dark" });

createGlobalTheme('html[data-flavor="toxic"]', vars, {
  rosewater: "#d4ffb3",
  flamingo: "#b8ff8a",
  pink: "#7fff3f",
  mauve: "#a3e635",
  red: "#ff3b3b",
  maroon: "#b91c1c",
  peach: "#ffb347",
  yellow: "#d4ff2a",
  green: "#39ff14",
  teal: "#2ee6a8",
  sky: "#6bffb8",
  saphire: "#3ecf8e",
  blue: "#4ade80",
  lavender: "#8fffb0",
  text: "#e4ffd9",
  subtext1: "#c8e8b8",
  subtext0: "#aecf9c",
  overlay2: "#94b682",
  overlay1: "#7a9c69",
  overlay0: "#618350",
  surface2: "#2e4022",
  surface1: "#223018",
  surface0: "#17210f",
  base: "#0e150a",
  mantle: "#0a0f07",
  crust: "#060a04",
});
/* color-scheme is a plain declaration, not a token, so it needs globalStyle. */
globalStyle('html[data-flavor="toxic"]', { colorScheme: "dark" });
