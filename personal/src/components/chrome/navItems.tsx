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
  Newspaper,
  Boxes,
  Controller,
} from "react-bootstrap-icons";

interface IconProps {
  size?: number | string;
  className?: string;
  color?: string;
}

export interface NavItem {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
}

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    Icon: House,
  },
  {
    label: "Cool People",
    href: "/cool-people",
    Icon: People,
  },
  {
    label: "Dev Info",
    href: "/dev-info",
    Icon: CodeSlash,
  },
  {
    label: "Discord",
    href: "/discord",
    Icon: Discord,
  },
  {
    label: "Servers",
    href: "/servers",
    Icon: HddNetwork,
  },
  {
    label: "Projects",
    href: "/projects",
    Icon: Kanban,
  },
  {
    label: "Music",
    href: "/music",
    Icon: MusicNoteBeamed,
  },
  {
    label: "88x31",
    href: "/88x31",
    Icon: Grid,
  },
  {
    label: "Guestbook",
    href: "/guestbook",
    Icon: Book,
  },
  {
    label: "Selfies",
    href: "/selfies",
    Icon: Camera,
  },
  {
    label: "Blog",
    href: "https://doughmination.site",
    Icon: Newspaper,
  },
  {
    label: "Minecraft",
    href: "/minecraft",
    Icon: Boxes,
  },
  {
    label: "Genshin",
    href: "/genshin",
    Icon: Controller,
  },
];
