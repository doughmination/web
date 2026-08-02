/* personal/src/scripts/GenshinGallery.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useGenshinRoster } from "@doughmination/react-api";
import Model3D from "@components/chrome/Model3D";

export type Character = {
  name: string;
  model: string;
  /**
   * Enka avatarId for this character — used to pull live owned/level status
   * from the API. Omit for characters not present in Enka's current
   * catalog (e.g. not yet added there); those fall back to `tier`/`level`
   * below and are tracked manually until they show up live.
   */
  avatarId?: string;
  /**
   * Fallback tier, used only while live data is loading/unavailable, or for
   * characters with no `avatarId` at all. Once matched against the live
   * roster, owned/not-owned status comes from the API instead.
   */
  tier: "owned" | "want";
  /** Fallback level (1-90), same caveat as `tier` above. */
  level?: number;
};

const TIER_LABEL: Record<Character["tier"], string> = {
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
    return {
      cap: MAX_LEVEL,
      floor: ASCENSION_CAPS.at(-2)!,
      fill: 1,
      maxed: true,
    };
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

/**
 * Display order: want tier first, then owned sorted by level (highest
 * first), with same-level/tier characters ordered alphabetically by name.
 */
const TIER_ORDER: Record<Character["tier"], number> = { want: 0, owned: 1 };
function orderCharacters(characters: Character[]): Character[] {
  return [...characters].sort((a, b) => {
    if (TIER_ORDER[a.tier] !== TIER_ORDER[b.tier]) {
      return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    }
    if ((b.level ?? 0) !== (a.level ?? 0)) {
      return (b.level ?? 0) - (a.level ?? 0);
    }
    return a.name.localeCompare(b.name);
  });
}

export default function GenshinGallery({
  uid,
  characters,
}: {
  uid: string;
  characters: Character[];
}) {
  // The API caches per-UID on Enka's own ttl, so this is cheap to leave on
  // its default staleTime — no need to poll aggressively for a gallery page.
  const { data: roster } = useGenshinRoster(uid);

  const merged = characters.map((c): Character => {
    if (!c.avatarId || !roster) return c;
    const live = roster.characters.find((r) => r.id === c.avatarId);
    if (!live) return c;
    return {
      ...c,
      tier: live.owned ? "owned" : "want",
      level: live.owned ? live.level ?? undefined : undefined,
    };
  });
  const ordered = orderCharacters(merged);

  return (
    <>
      {roster?.partial && (
        <p className="genshin-partial-note" role="note">
          Showing live data from my pinned in-game Character Showcase — a few
          owned characters outside it may not be reflected yet.
        </p>
      )}

      <div className="genshin-grid">
        {ordered.map((c) => {
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
                  poster="/favicon.png"
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
    </>
  );
}
