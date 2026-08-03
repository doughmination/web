/* personal/src/i18n/config.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Central list of supported languages. Add a language by: adding its code
 * here, adding its native display name below, and adding a
 * src/i18n/locales/<code>.ts dictionary satisfying the `Dictionary` type
 * exported from locales/en.ts.
 */

export const SUPPORTED_LANGUAGES = ["en", "ja", "es"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

// Each language's own name for itself, shown in the picker regardless of the
// currently active language (an English speaker still sees "日本語", not
// "Japanese" — that's how every language switcher does it).
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ja: "日本語",
  es: "Español",
};

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

// Picks the best supported language from the browser's Accept-Language-style
// preference list, falling back to DEFAULT_LANGUAGE. Client-only; guarded for
// SSR since `navigator` doesn't exist there.
export function detectLanguage(): Language {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    const base = tag.split("-")[0]?.toLowerCase();
    if (base && isLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}
