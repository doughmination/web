/**
 * Theme registry — the single source of truth for site flavors.
 *
 * Adding a theme is three steps:
 *   1. Write public/css/themes/<id>.css, scoped to html[data-flavor="<id>"].
 *   2. Add `@import url(/css/themes/<id>.css);` to public/css/main.css.
 *   3. Add an entry to THEMES below.
 *
 * Step 2 can't be automated from here — main.css is plain CSS and can't read
 * TypeScript. Everything else (the picker UI, the pre-paint boot script, the
 * <meta theme-color> sync, and the localStorage validation) derives from this
 * array, so those can't drift out of sync with each other.
 */

export type Theme = {
  /** Matches the html[data-flavor="…"] selector and the localStorage value. */
  id: string;
  /** Shown in the picker. */
  label: string;
  /** Drives <meta name="theme-color"> and the picker swatch. Usually --pink. */
  dot: string;
  /**
   * Optional icon under /assets/theme/. When omitted the picker falls back to
   * a flat swatch of `dot`, so a new theme doesn't require artwork to ship.
   */
  icon?: string;
};

export const THEMES: Theme[] = [
  { id: "cherry", label: "Cherry", dot: "#f4b8e4", icon: "/assets/theme/cherry.png" },
  { id: "toxic", label: "Toxic", dot: "#7fff3f", icon: "/assets/theme/toxic.png" },
  { id: "lemon", label: "Lemon", dot: "#ffe14d", icon: "/assets/theme/lemon.png" },
];

/** The flavor applied when nothing is stored, or when the stored value is junk. */
export const DEFAULT_THEME = "cherry";

export const THEME_IDS: string[] = THEMES.map((t) => t.id);

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/**
 * Inline script for <head>, run before first paint so the saved flavor is on
 * <html> before anything renders — otherwise every load flashes the default
 * theme first. Kept as a string (not an imported module) precisely because it
 * must execute synchronously, ahead of the bundle.
 */
export const themeBootScript = `try { var f = localStorage.getItem('ctpFlavor'); document.documentElement.setAttribute('data-flavor', ${JSON.stringify(
  THEME_IDS,
)}.indexOf(f) >= 0 ? f : '${DEFAULT_THEME}'); } catch (e) { document.documentElement.setAttribute('data-flavor', '${DEFAULT_THEME}'); }`;
