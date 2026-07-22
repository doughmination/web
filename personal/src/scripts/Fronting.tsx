/* src/scripts/Fronting.tsx
 * ESAL-2.3
 */

"use client";

import type { CSSProperties } from "react";
import { useDMFeed } from "./useDMFeed";

type Member = {
  name?: string;
  display_name?: string;
  color?: string | null;
  avatar_url?: string | null;
  pronouns?: string | null;
};
type Fronters = { members?: Member[] };

/* member.color is a 6-char hex with no leading #, and may be null. */
function colorHex(c?: string | null): string | undefined {
  return /^[0-9a-fA-F]{6}$/.test(c || "") ? "#" + c : undefined;
}

export default function Fronting() {
  const data = useDMFeed<Fronters>(
    "fronters",
    "https://doughmination.uk/v2/plural/fronters",
    (raw) => (raw && typeof raw === "object" ? (raw as Fronters) : null),
  );

  // The card shell renders immediately, even before the feed delivers. Returning
  // null here instead would collapse the card to zero height and shove every
  // element below it down once data lands — that was ~half the homepage CLS.
  const loading = !data;
  const members = data && Array.isArray(data.members) ? data.members : [];

  return (
    <section className="fronting-card" aria-label="Currently fronting" aria-busy={loading}>
      <div className="fr-head">
        <span className="fr-dot" aria-hidden="true" />
        <span className="fr-label">Currently fronting</span>
      </div>
      <div className={loading ? "fr-members is-fetching" : "fr-members"}>
        {loading ? (
          <span className="fr-empty">loading data…</span>
        ) : members.length === 0 ? (
          <span className="fr-empty">no one is currently fronting</span>
        ) : (
          members.map((m, i) => {
            const name = m.display_name || m.name || "Unknown";
            const accent = colorHex(m.color);
            return (
              <div
                key={i}
                className="fr-member"
                style={accent ? ({ "--fr-accent": accent } as CSSProperties) : undefined}
              >
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="fr-av"
                    src={m.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <span className="fr-av fr-av--empty" aria-hidden="true" />
                )}
                <span className="fr-meta">
                  <span className="fr-name">{name}</span>
                  {m.pronouns ? <span className="fr-pronouns">{m.pronouns}</span> : null}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
