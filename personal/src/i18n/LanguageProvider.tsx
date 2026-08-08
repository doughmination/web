/* personal/src/i18n/LanguageProvider.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * The active language, now driven by the URL. proxy.ts guarantees every
 * page is served under a locale prefix (/en/…), so the prefix in the path
 * is the source of truth: this provider reads it, and setLang navigates to the
 * same page under the new prefix. The choice is persisted to a cookie (which
 * middleware reads on the next bare visit) and to localStorage (which the
 * legacy core.ts still reads). Wraps the whole <body> in layout.tsx since
 * NavMenu and SettingsMenu — both outside Providers — need it too.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { DEFAULT_LANGUAGE, directionFor, localeFromPathname, localizedPath, type Language } from "./config";
import { dictionaries } from "./dictionaries";
import { resolve, type TranslationKey } from "./translate";
import type { Dictionary } from "./locales/en";

const STORAGE_KEY = "lang";

// A year, in seconds.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  // The full dictionary for the active language — for the rare case (e.g.
  // relTime() in util.ts) where a plain, non-component helper needs a group
  // of related strings at once rather than one key via t().
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Mirror the URL's language into storage the middleware and legacy core.ts
// read. The URL already carries it, so a failure here is non-fatal.
function persist(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    // Storage can throw in private modes; the URL still carries the language.
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // The prefix in the URL is authoritative. Both the server render and the
  // first client render read the same pathname, so there's no hydration
  // mismatch and no flash of the wrong language.
  const lang = localeFromPathname(pathname) ?? DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = directionFor(lang);
    persist(lang);
  }, [lang]);

  const setLang = useCallback(
    (next: Language) => {
      persist(next);
      router.push(localizedPath(pathname, next));
    },
    [pathname, router],
  );

  const t = useCallback((key: TranslationKey) => resolve(dictionaries[lang], key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dict: dictionaries[lang] }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
