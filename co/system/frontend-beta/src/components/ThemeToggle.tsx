/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-1.3 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import React from 'react';
import { Button } from '@components/button';
import useTheme from '@util/useTheme';

const THEME_ORDER = ['latte', 'frappe', 'macchiato', 'mocha'] as const;

const THEME_META = {
  latte: { icon: '🌻', label: 'Latte' },
  frappe: { icon: '🪴', label: 'Frappe' },
  macchiato: { icon: '🌙', label: 'Macchiato' },
  mocha: { icon: '☕', label: 'Mocha' },
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useTheme();

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIndex]);
  };

  const { icon, label } = THEME_META[theme];

  return (
    <Button
      onClick={cycleTheme}
      variant="outline"
      size="sm"
      className="relative overflow-hidden transition-all duration-300 hover:scale-105 font-comic"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Button>
  );
};

export default ThemeToggle;