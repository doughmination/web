/* personal/src/i18n/LanguageProvider.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * The language toggle's actual state: which language is active, persisted to
 * localStorage, with browser-language detection for first-time visitors.
 * Wraps the whole <body> in layout.tsx (not just Providers' children) since
 * NavMenu and SettingsMenu — both outside Providers — need it too.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_LANGUAGE, detectLanguage, isLanguage, type Language } from "./config";
import { dictionaries } from "./dictionaries";
import { resolve, type TranslationKey } from "./translate";

const STORAGE_KEY = "lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server-rendered HTML always assumes DEFAULT_LANGUAGE (matches <html
  // lang="en"> in layout.tsx). The real choice — localStorage, else browser
  // detection — is resolved client-side in the effect below, same pattern
  // SettingsMenu already uses for cat visibility. Doing it there rather than
  // in a lazy useState initializer keeps the first client render in sync
  // with the server-rendered markup and avoids a hydration mismatch.
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setLangState(stored && isLanguage(stored) ? stored : detectLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback((key: TranslationKey) => resolve(dictionaries[lang], key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
