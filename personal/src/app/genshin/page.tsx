/* personal/src/app/genshin/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import GenshinGallery, { type Character } from "@scripts/GenshinGallery";
import { Tr } from "@components/chrome/i18nText";
import "@styles/pages/genshin.css";

export const metadata: Metadata = {
  title: "Genshin — Clove Nytrix Doughmination Twilight",
  description:
    "A little gallery of 3D renders of Genshin Impact characters Clove finds cute — spin them around.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "Genshin Impact",
    "3D models",
    "Furina",
    "Hu Tao",
    "Lumine",
  ],
  alternates: { canonical: "https://doughmination.gay/genshin" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Genshin — Clove Nytrix Doughmination Twilight",
    description:
      "A little gallery of 3D renders of Genshin Impact characters Clove finds cute.",
    url: "https://doughmination.gay/genshin",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

/** My Genshin UID — live owned/level data comes from Doughmination Restful
 *  (Enka.Network passthrough), see GenshinGallery. */
const GENSHIN_UID = "691386457";

// Models converted from MMD (.pmx) to .glb via scripts/pmx2glb.py.
// Attribution handled separately — names only here.
//
// `avatarId` is Enka's numeric character id — set it and owned/level status
// comes live from the API instead of the `tier`/`level` fields below (which
// then only serve as a fallback while that loads, or if it ever errors).
// Leave `avatarId` unset for characters not in Enka's current catalog —
// Prune and Sandrone aren't turning up there yet, so those two stay manual
// for now.
// Kept alphabetical by name; display order (want first) is derived in
// GenshinGallery.
const CHARACTERS: Character[] = [
  {
    name: "Aino",
    model: "https://m.doughmination.gay/glb/aino.glb",
    avatarId: "10000121",
    tier: "owned",
    level: 20,
  },
  {
    name: "Amber",
    model: "https://m.doughmination.gay/glb/amber.glb",
    avatarId: "10000021",
    tier: "owned",
    level: 40,
  },
  {
    name: "Barbara",
    model: "https://m.doughmination.gay/glb/barbara.glb",
    avatarId: "10000014",
    tier: "owned",
    level: 1,
  },
  {
    name: "Dehya",
    model: "https://m.doughmination.gay/glb/dehya.glb",
    tier: "owned",
    avatarId: "10000079"
  },
  {
    name: "Diona",
    model: "https://m.doughmination.gay/glb/diona.glb",
    avatarId: "10000039",
    tier: "owned",
    level: 40,
  },
  {
    name: "Fischl",
    model: "https://m.doughmination.gay/glb/fischl.glb",
    avatarId: "10000031",
    tier: "owned",
    level: 38,
  },
  {
    name: "Freminet",
    model: "https://m.doughmination.gay/glb/freminet.glb",
    avatarId: "10000085",
    tier: "owned",
    level: 1,
  },
  {
    name: "Furina",
    model: "https://m.doughmination.gay/glb/furina.glb",
    avatarId: "10000089",
    tier: "want",
  },
  {
    name: "Hu Tao",
    model: "https://m.doughmination.gay/glb/hutao.glb",
    avatarId: "10000046",
    tier: "want",
  },
  {
    name: "Jahoda",
    model: "https://m.doughmination.gay/glb/jahoda.glb",
    tier: "owned",
    avatarId: "10000124"
  },
  {
    name: "Kaeya",
    model: "https://m.doughmination.gay/glb/kaeya.glb",
    avatarId: "10000015",
    tier: "owned",
    level: 40,
  },
  {
    name: "Lisa",
    model: "https://m.doughmination.gay/glb/lisa.glb",
    avatarId: "10000006",
    tier: "owned",
    level: 20,
  },
  {
    name: "Lumine",
    model: "https://m.doughmination.gay/glb/lumine.glb",
    avatarId: "10000007",
    tier: "owned",
    level: 56,
  },
  {
    name: "Noelle",
    model: "https://m.doughmination.gay/glb/noelle.glb",
    avatarId: "10000034",
    tier: "owned",
    level: 20,
  },
  {
    name: "Prune",
    model: "https://m.doughmination.gay/glb/prune.glb",
    avatarId: "10000132",
    tier: "owned",
    level: 39,
  },
  {
    name: "Sandrone",
    model: "https://m.doughmination.gay/glb/sandrone.glb",
    avatarId: "10000133",
    tier: "owned",
    level: 50,
  },
  {
    name: "Sucrose",
    model: "https://m.doughmination.gay/glb/sucrose.glb",
    avatarId: "10000043",
    tier: "owned",
    level: 13,
  },
  {
    name: "Yumemizuki Mizuki",
    model: "https://m.doughmination.gay/glb/yumemizuki.glb",
    avatarId: "10000109",
    tier: "owned",
    level: 55,
  },
];

export default function GenshinPage() {
  return (
    <main className="genshin-stage">
      <div className="genshin-intro">
        <h1><Tr k="genshin.title" /></h1>
        <p>
          <Tr k="genshin.intro" />
        </p>
      </div>

      <p className="genshin-desktop-only" role="note">
        <Tr k="genshin.desktopOnly" />
      </p>

      <GenshinGallery uid={GENSHIN_UID} characters={CHARACTERS} />
    </main>
  );
}
