/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import useTheme from "@/lib/useTheme";
import * as s from "./components.css";

const THEME_ORDER = ["mocha", "macchiato", "frappe", "latte"] as const;

const THEME_META = {
  latte: { icon: "🌻", label: "Latte" },
  frappe: { icon: "🪴", label: "Frappe" },
  macchiato: { icon: "🌺", label: "Macchiato" },
  mocha: { icon: "🌿", label: "Mocha" },
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
    <Button onClick={cycleTheme} variant="outline" size="sm" className={s.themeToggleButton}>
      <div className={s.themeToggleInner}>
        <span className={s.themeToggleIcon}>{icon}</span>
        <span className={s.themeToggleLabel}>{label}</span>
      </div>
    </Button>
  );
};

export default ThemeToggle;
