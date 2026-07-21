/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Catppuccin theme system, ported from the old Vite app's CSS variable themes
 * (src/css/themes/*.css + the semantic bridge in main.css) to vanilla-extract.
 * Flavors are still keyed off html[data-flavor="..."] so the useTheme hook
 * works exactly as before.
 */

import {
  createGlobalTheme,
  createGlobalThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

/* ============================================================================
   PALETTE CONTRACT — raw Catppuccin variables, one set per flavor
   ============================================================================ */
export const palette = createGlobalThemeContract(
  {
    rosewater: null,
    flamingo: null,
    pink: null,
    accentRgb: null,
    mauve: null,
    red: null,
    maroon: null,
    peach: null,
    yellow: null,
    green: null,
    teal: null,
    sky: null,
    saphire: null,
    blue: null,
    lavender: null,
    text: null,
    subtext0: null,
    subtext1: null,
    overlay0: null,
    overlay1: null,
    overlay2: null,
    surface0: null,
    surface1: null,
    surface2: null,
    base: null,
    mantle: null,
    crust: null,
  },
  (_, path) => {
    // Keep the exact legacy CSS variable names (--subtext-0, --accent-rgb, ...)
    const legacy: Record<string, string> = {
      accentRgb: "accent-rgb",
      subtext0: "subtext-0",
      subtext1: "subtext-1",
      overlay0: "overlay-0",
      overlay1: "overlay-1",
      overlay2: "overlay-2",
      surface0: "surface-0",
      surface1: "surface-1",
      surface2: "surface-2",
    };
    const key = path.join("-");
    return legacy[key] ?? key;
  },
);

type Palette = Record<keyof typeof palette, string>;

/* Catppuccin Mocha — official palette (dark, default) */
const mocha: Palette = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  accentRgb: "245, 194, 231",
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
  subtext0: "#a6adc8",
  subtext1: "#bac2de",
  overlay0: "#6c7086",
  overlay1: "#7f849c",
  overlay2: "#9399b2",
  surface0: "#313244",
  surface1: "#45475a",
  surface2: "#585b70",
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
};

/* Catppuccin Macchiato */
const macchiato: Palette = {
  rosewater: "#f4dbd6",
  flamingo: "#f0c6c6",
  pink: "#f5bde6",
  accentRgb: "245, 189, 230",
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
  subtext0: "#a5adcb",
  subtext1: "#b8c0e0",
  overlay0: "#6e738d",
  overlay1: "#8087a2",
  overlay2: "#939ab7",
  surface0: "#363a4f",
  surface1: "#494d64",
  surface2: "#5b6078",
  base: "#24273a",
  mantle: "#1e2030",
  crust: "#181926",
};

/* Catppuccin Frappé */
const frappe: Palette = {
  rosewater: "#f2d5cf",
  flamingo: "#eebebe",
  pink: "#f4b8e4",
  accentRgb: "244, 184, 228",
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
  subtext0: "#a5adce",
  subtext1: "#b5bfe2",
  overlay0: "#737994",
  overlay1: "#838ba7",
  overlay2: "#949cbb",
  surface0: "#414559",
  surface1: "#51576d",
  surface2: "#626880",
  base: "#303446",
  mantle: "#292c3c",
  crust: "#232634",
};

/* Catppuccin Latte (light) */
const latte: Palette = {
  rosewater: "#dc8a78",
  flamingo: "#dd7878",
  pink: "#ea76cb",
  accentRgb: "234, 118, 203",
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
  subtext0: "#6c6f85",
  subtext1: "#5c5f77",
  overlay0: "#9ca0b0",
  overlay1: "#8c8fa1",
  overlay2: "#7c7f93",
  surface0: "#ccd0da",
  surface1: "#bcc0cc",
  surface2: "#acb0be",
  base: "#eff1f5",
  mantle: "#e6e9ef",
  crust: "#dce0e8",
};

createGlobalTheme('html[data-flavor="mocha"]', palette, mocha);
createGlobalTheme('html[data-flavor="macchiato"]', palette, macchiato);
createGlobalTheme('html[data-flavor="frappe"]', palette, frappe);
createGlobalTheme('html[data-flavor="latte"]', palette, latte);

globalStyle('html[data-flavor="mocha"], html[data-flavor="macchiato"], html[data-flavor="frappe"]', {
  colorScheme: "dark",
});
globalStyle('html[data-flavor="latte"]', {
  colorScheme: "light",
});

/* ============================================================================
   SEMANTIC BRIDGE — maps semantic tokens onto the active flavor's palette
   ============================================================================ */
export const vars = createGlobalThemeContract(
  {
    background: null,
    foreground: null,
    card: null,
    cardForeground: null,
    popover: null,
    popoverForeground: null,
    primary: null,
    primaryForeground: null,
    secondary: null,
    secondaryForeground: null,
    muted: null,
    mutedForeground: null,
    accent: null,
    accentForeground: null,
    destructive: null,
    destructiveForeground: null,
    border: null,
    input: null,
    ring: null,
    radius: null,
    fontComic: null,
  },
  (_, path) => path.join("-").replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`),
);

createGlobalTheme("html[data-flavor]", vars, {
  background: palette.base,
  foreground: palette.text,
  card: palette.base,
  cardForeground: palette.text,
  popover: palette.mantle,
  popoverForeground: palette.text,
  primary: palette.mauve,
  primaryForeground: palette.base,
  secondary: palette.surface0,
  secondaryForeground: palette.text,
  muted: palette.surface0,
  mutedForeground: palette.subtext0,
  accent: palette.pink,
  accentForeground: palette.base,
  destructive: palette.red,
  destructiveForeground: palette.base,
  border: palette.surface0,
  input: palette.surface0,
  ring: palette.mauve,
  radius: "0.75rem",
  fontComic: "'Comic Code', cursive",
});
