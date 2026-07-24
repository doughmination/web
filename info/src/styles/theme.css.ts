import { createThemeContract } from "@vanilla-extract/css";

// The shape of the design system. Values are filled per-theme below.
export const vars = createThemeContract({
  color: {
    bg: null,
    surface: null,
    surfaceHover: null,
    text: null,
    muted: null,
    border: null,
    accent: null,
  },
  font: {
    sans: null,
    mono: null,
  },
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
  },
  radius: {
    md: null,
    lg: null,
    full: null,
  },
});

// Tokens shared across every theme (only color changes with dark mode).
const shared = {
  font: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  space: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "2rem",
    xl: "4rem",
  },
  radius: {
    md: "0.75rem",
    lg: "1.25rem",
    full: "999px",
  },
};

export const lightValues = {
  color: {
    bg: "#fafafa",
    surface: "#ffffff",
    surfaceHover: "#f4f4f5",
    text: "#18181b",
    muted: "#71717a",
    border: "#e4e4e7",
    accent: "#6d28d9",
  },
  ...shared,
};

export const darkValues = {
  color: {
    bg: "#09090b",
    surface: "#121215",
    surfaceHover: "#1c1c20",
    text: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
    accent: "#a78bfa",
  },
  ...shared,
};
