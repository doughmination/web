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

function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

export default function NavMenu() {
  const current = normalize(usePathname());

  function handleToggleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      playOpenSound();
    } else {
      playCloseSound();
    }
  }

  return (
    <header className="nav">
      <input
        type="checkbox"
        id="nav-toggle"
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        onChange={handleToggleChange}
      />
      <label htmlFor="nav-toggle" className="nav-burger" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </label>

      <nav className="nav-links">
        {navItems.map(({ label, href, Icon }) => {
          const external = href.startsWith("http");
          const selected = !external && normalize(href) === current;
          const className = `nav-link${selected ? " selected" : ""}`;

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
              href={href}
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