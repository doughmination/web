/* personal/src/i18n/locales/en.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * The English strings, and the canonical shape every other locale dictionary
 * must satisfy (see locales/ja.ts, locales/es.ts). Currently covers the
 * always-mounted chrome (nav + settings flyout); page content isn't wired up
 * to translations yet — see the i18n README for how to extend this.
 */

const en = {
  nav: {
    home: "Home",
    coolPeople: "Cool People",
    devInfo: "Dev Info",
    discord: "Discord",
    servers: "Servers",
    projects: "Projects",
    music: "Music",
    webring: "88x31",
    guestbook: "Guestbook",
    selfies: "Selfies",
    minecraft: "Minecraft",
    genshin: "Genshin",
  },
  settings: {
    title: "Settings",
    catCollection: "Cat collection",
    openCatCollection: "Open cat collection",
    showCat: "Show cat",
    hideCat: "Hide cat",
    playMusic: "Play background music",
    pauseMusic: "Pause background music",
    language: "Language",
  },
} as const;

export default en;

// `typeof en` alone would pin Dictionary to en's literal strings (e.g.
// nav.home: "Home" exactly), which every other locale would then fail to
// satisfy. Widen keeps the object *shape* — used to derive "nav.home"-style
// key paths in translate.ts — while relaxing each leaf back to `string`.
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof en>;
