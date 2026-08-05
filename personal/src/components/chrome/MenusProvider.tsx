/* personal/src/components/chrome/MenusProvider.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Shared open/closed state for the two top-left chrome menus — the nav
 * hamburger (NavMenu) and the settings cog (SettingsMenu). Only one may be
 * open at a time: opening one closes the other. Both components read this
 * instead of owning their own `open` flag, which is what makes them mutually
 * exclusive without either knowing about the other.
 */

"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type MenuId = "nav" | "settings";

interface MenusContextValue {
  openMenu: MenuId | null;
  isOpen: (menu: MenuId) => boolean;
  toggle: (menu: MenuId) => void;
  close: () => void;
}

const MenusContext = createContext<MenusContextValue | null>(null);

export function MenusProvider({ children }: { children: ReactNode }) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);

  const isOpen = useCallback((menu: MenuId) => openMenu === menu, [openMenu]);

  // Opening a menu replaces whatever was open, so the other one closes.
  const toggle = useCallback((menu: MenuId) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  }, []);

  const close = useCallback(() => setOpenMenu(null), []);

  const value = useMemo(
    () => ({
      openMenu,
      isOpen,
      toggle,
      close,
    }),
    [openMenu, isOpen, toggle, close],
  );

  return <MenusContext.Provider value={value}>{children}</MenusContext.Provider>;
}

export function useMenus(): MenusContextValue {
  const ctx = useContext(MenusContext);
  if (!ctx) throw new Error("useMenus must be used within a MenusProvider");
  return ctx;
}
