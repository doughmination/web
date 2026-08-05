/* personal/src/components/chrome/NavMenu.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * The page nav, now React-owned (was built imperatively by core.ts from
 * nav.json). next/link gives client-side navigation so the layout — and the
 * bg-music audio — never unloads; usePathname drives the selected state.
 *
 * Desktop animation lives in nav.css.ts: the hamburger opens the items as icon
 * dots, then they telescope out into labels. Mobile keeps the wrapping row.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "./navItems";
import { playOpenSound, playCloseSound, playHoverSound, playClickSound } from "@lib/sound";
import { useLanguage } from "@/i18n/LanguageProvider";
import { localizedPath, stripLocalePrefix } from "@/i18n/config";
import { useMenus } from "./MenusProvider";

function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

export default function NavMenu() {
  const { t, lang } = useLanguage();

  // Open state is shared with SettingsMenu (see MenusProvider) so only one of
  // the two menus is ever open. The checkbox is now controlled by it; the CSS
  // in nav.css.ts still keys off :checked, which follows this value.
  const { isOpen, toggle } = useMenus();
  const navOpen = isOpen("nav");

  // Compare bare paths: strip the active locale prefix off the current URL so
  // it lines up with the navItems' bare hrefs (/discord, /music, …).
  const current = normalize(stripLocalePrefix(usePathname()));

  function handleToggleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      playOpenSound();
    } else {
      playCloseSound();
    }
    toggle("nav");
  }

  return (
    <header className="nav">
      <input
        type="checkbox"
        id="nav-toggle"
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        checked={navOpen}
        onChange={handleToggleChange}
      />
      <label
        htmlFor="nav-toggle"
        className="nav-burger"
        aria-hidden="true"
        onMouseEnter={playHoverSound}
      >
        <span></span>
        <span></span>
        <span></span>
      </label>

      <nav className="nav-links">
        {navItems.map(({ labelKey, href, Icon }) => {
          const label = t(labelKey);
          const external = href.startsWith("http");
          const selected = !external && normalize(href) === current;
          const className = `nav-link${selected ? " selected" : ""}`;

          // Internal links carry the active locale prefix; external ones don't.
          const linkHref = external ? href : localizedPath(href, lang);

          const inner = (
            <>
              <span className="nav-ico" aria-hidden="true">
                <Icon />
              </span>
              <span className="nav-label">{label}</span>
            </>
          );

          if (external) {
            return (
              <a
                key={href}
                className={className}
                href={href}
                aria-label={label}
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link
              key={href}
              className={className}
              href={linkHref}
              aria-label={label}
              onMouseEnter={playHoverSound}
              onClick={playClickSound}
            >
              {inner}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}