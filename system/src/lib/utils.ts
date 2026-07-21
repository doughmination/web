/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { clsx, type ClassValue } from "clsx";

// tailwind-merge is no longer needed — styles are vanilla-extract classes now.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/* ============================================================================
   MEMBER COLOURS
   ============================================================================ */

/** PluralKit returns hex colours without the leading `#`. Normalise to a
 *  usable CSS colour, or null when unset. */
export function normalizeColor(color: string | null | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const chan = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue(p, q, h + 1 / 3) * 255),
    Math.round(hue(p, q, h) * 255),
    Math.round(hue(p, q, h - 1 / 3) * 255),
  ];
}

/** Luminance floor that reads comfortably against the dark theme backgrounds
 *  (all flavours sit below ~0.02 luminance). */
const MIN_LUMINANCE = 0.18;

/**
 * Keep a member's chosen colour, but raise its lightness when it is too dark
 * to read against the dark background. Hue and saturation are preserved, so
 * the colour still reads as "theirs" — it just stops disappearing.
 * Returns `fallback` when there is no usable colour.
 */
export function readableOnDark(
  color: string | null | undefined,
  fallback = "var(--text)",
): string {
  const normalized = normalizeColor(color);
  if (!normalized) return fallback;

  const rgb = hexToRgb(normalized);
  // Non-hex (named colours, rgb()) pass through untouched.
  if (!rgb) return normalized;

  if (relativeLuminance(rgb) >= MIN_LUMINANCE) return normalized;

  const [h, s] = rgbToHsl(rgb);
  let [, , l] = rgbToHsl(rgb);
  let out = rgb;
  // Walk lightness up until the colour clears the floor, capping well short
  // of white so strongly-coloured names keep their identity.
  while (l < 0.85 && relativeLuminance(out) < MIN_LUMINANCE) {
    l = Math.min(0.85, l + 0.04);
    out = hslToRgb([h, s, l]);
  }

  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(out[0])}${toHex(out[1])}${toHex(out[2])}`;
}
