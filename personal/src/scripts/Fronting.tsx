/* personal/src/scripts/Fronting.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import type { CSSProperties } from "react";
import { useFronters } from "@doughmination/react-api";
import { useLanguage } from "@/i18n/LanguageProvider";

// member.color is a 6-char hex with no leading #, and may be null.
function colorHex(color?: string | null): string | undefined {
  return /^[0-9a-fA-F]{6}$/.test(color || "") ? "#" + color : undefined;
}

export default function Fronting() {
  const { t } = useLanguage();

  // Seeds from GET /v2/plural/fronters, then stays live via the shared
  // socket's fronters_update event. Replaces the old useDMFeed path.
  const { data, isPending } = useFronters();

  // Keep the card shell mounted while loading — collapsing to null shoves
  // everything below down when data lands (~half the homepage CLS).
  const loading = isPending;

  const members = Array.isArray(data?.members) ? data.members : [];

  return (
    <section
      className="fronting-card"
      aria-label={t("fronting.ariaLabel")}
      aria-busy={loading}
    >
      <div className="fr-head">
        <span className="fr-dot" aria-hidden="true" />
        <span className="fr-label">{t("fronting.heading")}</span>
      </div>

      <div className={loading ? "fr-members is-fetching" : "fr-members"}>
        {loading ? (
          <span className="fr-empty">{t("fronting.loading")}</span>
        ) : members.length === 0 ? (
          <span className="fr-empty">{t("fronting.empty")}</span>
        ) : (
          members.map((member, index) => {
            const name = member.display_name || member.name || t("fronting.unknownName");
            const accent = colorHex(member.color);

            return (
              <div
                key={member.id ?? index}
                className="fr-member"
                style={
                  accent
                    ? ({ "--fr-accent": accent } as CSSProperties)
                    : undefined
                }
              >
                {member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="fr-av"
                    src={member.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <span className="fr-av fr-av--empty" aria-hidden="true" />
                )}

                <span className="fr-meta">
                  <span className="fr-name">{name}</span>
                  {member.pronouns ? (
                    <span className="fr-pronouns">{member.pronouns}</span>
                  ) : null}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
