/* personal/src/i18n/locales/ja.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Dictionary } from "./en";

// `satisfies Dictionary` (rather than `: Dictionary`) keeps this checked
// against en.ts's exact key shape while still letting TS infer the literal
// string types, same trick as en.ts's `as const`.
const ja = {
  nav: {
    home: "ホーム",
    coolPeople: "友達",
    devInfo: "開発情報",
    discord: "Discord",
    servers: "サーバー",
    projects: "プロジェクト",
    music: "音楽",
    webring: "88x31",
    guestbook: "ゲストブック",
    selfies: "自撮り",
    minecraft: "Minecraft",
    genshin: "原神",
  },
  settings: {
    title: "設定",
    catCollection: "猫コレクション",
    openCatCollection: "猫コレクションを開く",
    showCat: "猫を表示",
    hideCat: "猫を非表示",
    playMusic: "BGMを再生",
    pauseMusic: "BGMを一時停止",
    language: "言語",
  },
} as const satisfies Dictionary;

export default ja;
