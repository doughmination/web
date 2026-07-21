import type { Metadata } from "next";
import Model3D from "@components/chrome/Model3D";
import "@styles/pages/genshin.css";

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
  /** Adventure level 1–90. Only rendered for owned characters. */
  level?: number;
};

const TIER_LABEL: Record<NonNullable<Character["tier"]>, string> = {
  owned: "Owned",
  want: "Want",
};

/** Genshin ascension level caps. 90 is the ceiling. */
const ASCENSION_CAPS = [20, 40, 50, 60, 70, 80, 90] as const;
const MAX_LEVEL = 90;

/**
 * Where a level sits within its current ascension phase.
 * Returns the phase bounds and a 0–1 fill for the progress bar.
 */
function ascensionProgress(level: number) {
  const clamped = Math.min(Math.max(level, 1), MAX_LEVEL);
  if (clamped >= MAX_LEVEL) {
    return { cap: MAX_LEVEL, floor: ASCENSION_CAPS.at(-2)!, fill: 1, maxed: true };
  }
  const cap = ASCENSION_CAPS.find((c) => c > clamped)!;
  const capIndex = ASCENSION_CAPS.indexOf(cap);
  const floor = capIndex === 0 ? 1 : ASCENSION_CAPS[capIndex - 1];
  return {
    cap,
    floor,
    fill: (clamped - floor) / (cap - floor),
    maxed: false,
  };
}

// Models converted from MMD (.pmx) to .glb via scripts/pmx2glb.py.
// Attribution handled separately — names only here.
// Kept alphabetical by name; display order (want first) is derived below.
const CHARACTERS: Character[] = [
  { name: "Aino", model: "/models/aino.glb", tier: "owned", level: 20 },
  { name: "Amber", model: "/models/amber.glb", tier: "owned", level: 40 },
  { name: "Barbara", model: "/models/barbara.glb", tier: "owned", level: 1 },
  { name: "Diona", model: "/models/diona.glb", tier: "owned", level: 40 },
  { name: "Fischl", model: "/models/fischl.glb", tier: "owned", level: 38 },
  { name: "Furina", model: "/models/furina.glb", tier: "want" },
  { name: "Hu Tao", model: "/models/hutao.glb", tier: "want" },
  { name: "Kaeya", model: "/models/kaeya.glb", tier: "owned", level: 40 },
  { name: "Lisa", model: "/models/lisa.glb", tier: "owned", level: 20 },
  { name: "Lumine", model: "/models/lumine.glb", tier: "owned", level: 56 },
  { name: "Noelle", model: "/models/noelle.glb", tier: "owned", level: 20 },
  { name: "Prune", model: "/models/prune.glb", tier: "owned", level: 39 },
  { name: "Sandrone", model: "/models/sandrone.glb", tier: "owned", level: 20 },
  { name: "Sucrose", model: "/models/sucrose.glb", tier: "owned", level: 13 },
  { name: "Yumemizuki Mizuki", model: "/models/yumemizuki.glb", tier: "owned", level: 55 },
];

// TODO: Add Freminent (lvl 1)

/**
 * Display order: want tier first, then owned sorted by level (highest first),
 * with same-level characters ordered alphabetically by name.
 */
const TIER_ORDER: Record<Character["tier"], number> = { want: 0, owned: 1 };
const ORDERED_CHARACTERS = [...CHARACTERS].sort((a, b) => {
  if (TIER_ORDER[a.tier] !== TIER_ORDER[b.tier]) {
    return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
  }
  if ((b.level ?? 0) !== (a.level ?? 0)) {
    return (b.level ?? 0) - (a.level ?? 0);
  }
  return a.name.localeCompare(b.name);
});

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
        {ORDERED_CHARACTERS.map((c) => {
          const showLevel = c.tier === "owned" && typeof c.level === "number";
          const progress = showLevel ? ascensionProgress(c.level!) : null;

          return (
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
                {progress && (
                  <div className="genshin-level">
                    <div className="genshin-level-row">
                      <span className="genshin-level-value">Lv. {c.level}</span>
                      <span className="genshin-level-cap">
                        {progress.maxed ? "Max" : `→ ${progress.cap}`}
                      </span>
                    </div>
                    <div
                      className={`genshin-level-track${progress.maxed ? " maxed" : ""}`}
                      role="progressbar"
                      aria-valuemin={progress.floor}
                      aria-valuemax={progress.cap}
                      aria-valuenow={c.level}
                      aria-label={`${c.name} progress to level ${progress.cap}`}
                    >
                      <span
                        className="genshin-level-fill"
                        style={{ width: `${Math.round(progress.fill * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
