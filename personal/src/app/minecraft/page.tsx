/* personal/src/app/minecraft/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import MinecraftAccounts from "@scripts/MinecraftAccounts";
import { Tr } from "@components/chrome/i18nText";
import "@styles/stage.css";
import "@styles/pages/minecraft.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "All of Clove's Minecraft Accounts and Data",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "minecraft",
    "mojang",
    "skyblock",
  ],
  alternates: { canonical: "https://doughmination.gay/minecraft" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "All of Clove's Minecraft Accounts and Data",
    url: "https://doughmination.gay/minecraft",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

type Uid32 = string & { readonly __brand: "Uid32" };

type McAccount = {
  role: "main" | "alt" | "furina" | "rose" | "luna" | "uzi";
  uid: Uid32;
};

function uid(value: string): Uid32 {
  if (!/^[0-9a-f]{32}$/.test(value)) {
    throw new Error(`Invalid Minecraft UID: "${value}"`);
  }
  return value as Uid32;
}

const MC_UUIDS: McAccount[] = [
  {
    role: "main",
    uid: uid("79ef438d69ea473c99cd6a5ec34c6736")
  }, // TransCatgorl
  {
    role: "furina",
    uid: uid("d20b556ae2cc452dab726ae082d439af")
  }, // FontaineDeFurina
  {
    role: "luna",
    uid: uid("d9ca235297fd4686b680e497432fb719")
  }, // MidnightCyan
  {
    role: "uzi",
    uid: uid("5387502156ff4f229cd1d1b95293c1ec")
  }, // RealUziDoorman
  {
    role: "alt",
    uid: uid("c6230d8f1b72449ba2db4c7e4ba9303a")
  }, // Doughmination
  {
    role: "alt",
    uid: uid("536a2d64b89a423b9fa51ee182f7a118")
  }, // Genderfae
  {
    role: "alt",
    uid: uid("b046a090cc0845e68e1c2635f4fbda5c")
  }, // GothCuddles
  {
    role: "alt",
    uid: uid("25335e08ea4f4a1880741435df784297")
  }, // LesbianGothMommy
  {
    role: "alt",
    uid: uid("9f34197705164a05b6753a69fff675f7")
  }, // MeowingForHRT
  {
    role: "alt",
    uid: uid("28a75bbea78f4f7db1bea90e9d38f189")
  }, // SpankedByGoths
  {
    role: "alt",
    uid: uid("1bd448116a6e4912ab6772849bc89018")
  }, // TransGothicGirl
];

export default function MinecraftPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />

      {/* mc-heads.net renders the body/head/player images */}
      <link rel="preconnect" href="https://mc-heads.net" crossOrigin="" />
      <link rel="dns-prefetch" href="https://mc-heads.net" />

      <main className="presence-stage">
        <div className="presence-intro">
          <h1><Tr k="minecraftPage.title" /></h1>
          <p><Tr k="minecraftPage.intro" /></p>
        </div>

        <MinecraftAccounts accounts={MC_UUIDS} />
      </main>
    </>
  );
}
