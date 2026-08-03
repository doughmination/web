/* personal/src/components/chrome/navItems.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* The site nav, in TS (was public/nav.json). Icons from react-bootstrap-icons. */

import type { ComponentType } from "react";
import {
  House,
  People,
  CodeSlash,
  Discord,
  HddNetwork,
  Kanban,
  MusicNoteBeamed,
  Grid,
  Book,
  Camera,
  Boxes,
  Controller,
} from "react-bootstrap-icons";
import type { TranslationKey } from "@/i18n/translate";

interface IconProps {
  size?: number | string;
  className?: string;
  color?: string;
}

export interface NavItem {
  // A translation key rather than a literal string — NavMenu resolves it
  // through useLanguage()'s t() at render time, so the label follows the
  // active language. See src/i18n/locales/en.ts for the English text.
  labelKey: TranslationKey;
  href: string;
  Icon: ComponentType<IconProps>;
}

export const navItems: NavItem[] = [
  {
    labelKey: "nav.home",
    href: "/",
    Icon: House,
  },
  {
    labelKey: "nav.coolPeople",
    href: "/cool-people",
    Icon: People,
  },
  {
    labelKey: "nav.devInfo",
    href: "/dev-info",
    Icon: CodeSlash,
  },
  {
    labelKey: "nav.discord",
    href: "/discord",
    Icon: Discord,
  },
  {
    labelKey: "nav.servers",
    href: "/servers",
    Icon: HddNetwork,
  },
  {
    labelKey: "nav.projects",
    href: "/projects",
    Icon: Kanban,
  },
  {
    labelKey: "nav.music",
    href: "/music",
    Icon: MusicNoteBeamed,
  },
  {
    labelKey: "nav.webring",
    href: "/88x31",
    Icon: Grid,
  },
  {
    labelKey: "nav.guestbook",
    href: "/guestbook",
    Icon: Book,
  },
  {
    labelKey: "nav.selfies",
    href: "/selfies",
    Icon: Camera,
  },
  {
    labelKey: "nav.minecraft",
    href: "/minecraft",
    Icon: Boxes,
  },
  {
    labelKey: "nav.genshin",
    href: "/genshin",
    Icon: Controller,
  },
];
