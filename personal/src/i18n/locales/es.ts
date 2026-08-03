/* personal/src/i18n/locales/es.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Dictionary } from "./en";

const es = {
  nav: {
    home: "Inicio",
    coolPeople: "Gente Guay",
    devInfo: "Info de Dev",
    discord: "Discord",
    servers: "Servidores",
    projects: "Proyectos",
    music: "Música",
    webring: "88x31",
    guestbook: "Libro de Visitas",
    selfies: "Selfies",
    minecraft: "Minecraft",
    genshin: "Genshin",
  },
  settings: {
    title: "Ajustes",
    catCollection: "Colección de gatos",
    openCatCollection: "Abrir colección de gatos",
    showCat: "Mostrar gato",
    hideCat: "Ocultar gato",
    playMusic: "Reproducir música de fondo",
    pauseMusic: "Pausar música de fondo",
    language: "Idioma",
  },
} as const satisfies Dictionary;

export default es;
