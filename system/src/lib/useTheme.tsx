/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect, useState } from "react";

const THEMES = ["cherry", "toxic", "lemon", "estrogen", "cyberpunk"] as const;
export type Theme = (typeof THEMES)[number];

const isValidTheme = (value: string | null): value is Theme =>
  !!value && THEMES.includes(value as Theme);

const useTheme = () => {
  // SSR-safe: default to mocha on the server, hydrate the saved theme after mount.
  const [theme, setTheme] = useState<Theme>("cherry");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (isValidTheme(saved)) setTheme(saved);
  }, []);

  useEffect(() => {
    // Apply theme via data-flavor attribute (matches html[data-flavor="..."]
    // selectors generated in src/styles/theme.css.ts)
    document.documentElement.setAttribute("data-flavor", theme);
    localStorage.setItem("theme", theme);

    // Dispatch a custom event to notify theme change
    const event = new CustomEvent("themeChanged", { detail: { theme } });
    document.dispatchEvent(event);
  }, [theme]);

  return [theme, setTheme] as const;
};

export default useTheme;
