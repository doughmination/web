/* personal/src/i18n/config.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Central list of supported languages. Add a language by: adding its code
 * here, adding its native display name and URL prefix below, and adding a
 * src/i18n/locales/<code>.ts dictionary satisfying the `Dictionary` type
 * exported from locales/en.ts.
 */

export const SUPPORTED_LANGUAGES = [
  "en",
  "ja",
  "es",
  "nl",
  "de",
  "zh",
  "pt",
  "ko",
  "it",
  "ru",
  "pl",
  "tr",
  "ar",
] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

// Each language's own name for itself, shown in the picker regardless of the
// currently active language (an English speaker still sees "日本語", not
// "Japanese" — that's how every language switcher does it).
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ja: "日本語",
  es: "Español",
  nl: "Nederlands",
  de: "Deutsch",
  zh: "简体中文",
  pt: "Português",
  ko: "한국어",
  it: "Italiano",
  ru: "Русский",
  pl: "Polski",
  tr: "Türkçe",
  ar: "العربية",
};

// The URL path segment each language lives under. The active language is
// encoded in the URL — e.g. /en/discord, /nl/discord — and proxy.ts +
// LanguageProvider treat that prefix as the source of truth.
export const LOCALE_PREFIXES: Record<Language, string> = {
  en: "en",
  ja: "ja",
  es: "es",
  nl: "nl",
  de: "de",
  zh: "zh",
  pt: "pt",
  ko: "ko",
  it: "it",
  ru: "ru",
  pl: "pl",
  tr: "tr",
  ar: "ar",
};

// Reverse of LOCALE_PREFIXES: URL segment -> language.
const PREFIX_TO_LANGUAGE: Record<string, Language> = {
  en: "en",
  ja: "ja",
  es: "es",
  nl: "nl",
  de: "de",
  zh: "zh",
  pt: "pt",
  ko: "ko",
  it: "it",
  ru: "ru",
  pl: "pl",
  tr: "tr",
  ar: "ar",
};

// Languages written right-to-left. LanguageProvider sets <html dir> from this
// so the whole page mirrors; every other language is left-to-right.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);

export function isRtl(language: Language): boolean {
  return RTL_LANGUAGES.has(language);
}

export function directionFor(language: Language): "rtl" | "ltr" {
  return isRtl(language) ? "rtl" : "ltr";
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

// A URL segment (e.g. "UK-en") -> its language, or null if it isn't a prefix.
export function prefixToLanguage(segment: string): Language | null {
  return PREFIX_TO_LANGUAGE[segment] ?? null;
}

// The language a pathname is under, read from its first segment. null when the
// path carries no known locale prefix (e.g. a bare "/discord").
export function localeFromPathname(pathname: string): Language | null {
  const firstSegment = pathname.split("/")[1] ?? "";
  return prefixToLanguage(firstSegment);
}

// Drop a leading locale prefix if the path has one, always returning a path
// that starts with "/". "/UK-en/discord" -> "/discord"; "/discord" -> "/discord".
export function stripLocalePrefix(pathname: string): string {
  const language = localeFromPathname(pathname);
  if (!language) return pathname || "/";

  const prefix = LOCALE_PREFIXES[language];
  const rest = pathname.slice(prefix.length + 1);
  return rest || "/";
}

// The same page under a given language. Strips any existing prefix first, so it
// works whether `pathname` is already localized or bare.
export function localizedPath(pathname: string, language: Language): string {
  const rest = stripLocalePrefix(pathname);
  const suffix = rest === "/" ? "" : rest;
  return `/${LOCALE_PREFIXES[language]}${suffix}`;
}

// Picks the best supported language from an ordered list of BCP-47 tags,
// falling back to DEFAULT_LANGUAGE. Pure, so both the client (navigator
// languages) and middleware (Accept-Language header) can share it.
export function matchLanguage(tags: readonly string[]): Language {
  for (const tag of tags) {
    const base = tag.split("-")[0]?.toLowerCase();
    if (base && isLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

// Parses an Accept-Language header into an ordered list of tags, best first.
// Ignores the q-weights' exact values but preserves their declared order.
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => part.split(";")[0]?.trim() ?? "")
    .filter(Boolean);
}

// Picks the best supported language from the browser's preference list.
// Client-only; guarded for SSR since `navigator` doesn't exist there.
export function detectLanguage(): Language {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return matchLanguage(candidates);
}
