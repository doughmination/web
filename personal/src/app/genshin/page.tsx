import type { Metadata } from "next";
import Model3D from "@components/chrome/Model3D";

export const metadata: Metadata = {
  title: "Genshin — Clove Twilight",
  description:
    "A little gallery of 3D renders of Genshin Impact characters Clove finds cute — spin them around.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "Genshin Impact",
    "3D models",
    "Furina",
    "Hu Tao",
    "Lumine",
  ],
  alternates: { canonical: "https://c.stupid.cat/genshin" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Genshin — Clove Twilight",
    description:
      "A little gallery of 3D renders of Genshin Impact characters Clove finds cute.",
    url: "https://c.stupid.cat/genshin",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

type Character = {
  name: string;
  model: string;
  tier: "owned" | "want";
};

const TIER_LABEL: Record<NonNullable<Character["tier"]>, string> = {
  owned: "Owned",
  want: "Want",
};

// Models converted from MMD (.pmx) to .glb via scripts/pmx2glb.py.
// Attribution handled separately — names only here.
const CHARACTERS: Character[] = [
  { name: "Furina", model: "/models/furina.glb", tier: "want" },
  { name: "Hu Tao", model: "/models/hutao.glb", tier: "want" },
  { name: "Sandrone", model: "/models/sandrone.glb", tier: "want" },
  { name: "Lumine", model: "/models/lumine.glb", tier: "owned" },
  { name: "Aino", model: "/models/aino.glb", tier: "owned" },
  { name: "Yumemizuki Mizuki", model: "/models/yumemizuki.glb", tier: "owned" },
  { name: "Prune", model: "/models/prune.glb", tier: "owned" },
  { name: "Lisa", model: "/models/lisa.glb", tier: "owned" },
  { name: "Barbara", model: "/models/barbara.glb", tier: "owned" },
  { name: "Amber", model: "/models/amber.glb", tier: "owned" },
  { name: "Sucrose", model: "/models/sucrose.glb", tier: "owned" },
  { name: "Kaeya", model: "/models/kaeya.glb", tier: "owned" },
  { name: "Diona", model: "/models/diona.glb", tier: "owned" },
  { name: "Noelle", model: "/models/noelle.glb", tier: "owned" },
  { name: "Fischl", model: "/models/fischl.glb", tier: "owned"}
];

export default function GenshinPage() {
  return (
    <main className="genshin-stage">
      <div className="genshin-intro">
        <h1>Genshin</h1>
        <p>
         My Genshin wishlist.
        </p>
      </div>

      <p className="genshin-desktop-only" role="note">
        The 3D gallery is a desktop-only feature. Open this page on a computer to
        spin the models.
      </p>

      <div className="genshin-grid">
        {CHARACTERS.map((c) => (
          <article className="genshin-card" key={c.name}>
            <div className="genshin-viewer">
              {c.tier && (
                <span className={`genshin-tag ${c.tier}`}>
                  {TIER_LABEL[c.tier]}
                </span>
              )}
              <Model3D
                src={c.model}
                poster="/assets/favicon/avatar.png"
                alt={`3D model of ${c.name} from Genshin Impact`}
              />
            </div>
            <div className="genshin-meta">
              <h2>{c.name}</h2>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
