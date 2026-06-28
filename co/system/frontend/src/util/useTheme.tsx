/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { useEffect, useState } from 'react';

const THEMES = ['mocha', 'macchiato', 'frappe', 'latte'] as const;
type Theme = typeof THEMES[number];

const isValidTheme = (value: string | null): value is Theme =>
  !!value && THEMES.includes(value as Theme);

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to mocha
    const saved = localStorage.getItem('theme');
    return isValidTheme(saved) ? saved : 'mocha';
  });

  useEffect(() => {
    // Apply theme via data-flavor attribute (matches the html[data-flavor="..."]
    // selectors used in src/css/themes/*.css)
    document.documentElement.setAttribute('data-flavor', theme);

    // Store theme in localStorage
    localStorage.setItem('theme', theme);

    // Dispatch a custom event to notify theme change
    const event = new CustomEvent('themeChanged', { detail: { theme } });
    document.dispatchEvent(event);
  }, [theme]);

  return [theme, setTheme] as const;
};

export default useTheme;