/* personal/src/scripts/FriendsGrid.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect } from "react";
import PresenceCard from "./PresenceCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translate";

/* /cool-people — the friends/alts grid. React renders the section/heading/grid
   structure; each member slot is a full-but-mini presence card. Each card
   fetches its own /discord/users/:id (then rides the site socket for live
   presence) — the batched ?ids= call was dropped because it double-requested
   and choked the API. */

type Member = {
  name: string;
  user?: string;
  img?: string;
  tier?: string;
  discordId?: string | null;
  link?: string | null;
};
/** `id` is the stable anchor slug (kept language-independent so hash links
 *  don't break when the display title is translated); `titleKey`/`subtitleKey`
 *  point at the active locale's label. */
type Group = {
  id: string;
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  members: Member[];
};

const FRIEND_POLL_MS = 60000;

const FRIENDS: Group[] = [
  {
    id: "real-friends",
    titleKey: "coolPeople.realFriends",
    members: [{
      name: "Aria",
      tier: "wife",
      discordId: "1474568910736199825",
      link: "https://ari.rip"
    },
    {
      name: "Ria",
      tier: "close",
      discordId: "1513506390088618145",
    }
  ],
  },
  {
    id: "alts",
    titleKey: "coolPeople.alts",
    subtitleKey: "coolPeople.altsSubtitle",
    members: [
      {
        name: "J",
        user: "real_serial_designationj",
        img: "https://m.doughmination.gay/img/old-pfps/j.png",
        tier: "active-alt",
        discordId: "1500197577336033301"
      },
      {
        name: "Uzi",
        user: "theuzidoorman",
        img: "https://m.doughmination.gay/img/old-pfps/uzi.png",
        tier: "active-alt",
        discordId: "526626867973849123"
      },
      {
        name: "estrogenhrt",
        user: "estrogenhrt",
        img: "https://m.doughmination.gay/img/old-pfps/estrogenhrt.png",
        tier: "active-alt",
        discordId: "1025770042245251122"
      },
      {
        name: "Clove Nytrix Doughmination Twilight",
        user: "clovetwilight3",
        img: "https://m.doughmination.gay/img/old-pfps/clovetwilight3.png",
        tier: "dead-alt"
      },
      {
        name: "Clove <3",
        img: "https://m.doughmination.gay/img/old-pfps/clove.png",
        tier: "dead-alt",
        discordId: "1125844710511104030",
      },
      {
        name: "Clove ⛤",
        user: "greenirisluna",
        img: "https://m.doughmination.gay/img/old-pfps/butterfly.png",
        tier: "dead-alt",
        discordId: "514994021970739201",
      },
      {
        name: "Mrow",
        user: "arisgayasswife",
        img: "https://m.doughmination.gay/img/old-pfps/mrow.png",
        tier: "dead-alt",
        discordId: "219480349053288450",
      },
    ],
  },
];

function FriendSlot({ m }: { m: Member }) {
  // No batching → each card loads its own /discord/users/:id, then rides the
  // socket (or polls at pollMs when there's no socket).
  return (
    <PresenceCard
      userId={m.discordId || null}
      mini
      pollMs={FRIEND_POLL_MS}
      tier={m.tier || null}
      link={m.link || null}
      fallbackName={m.name}
      fallbackUser={!m.discordId && m.user ? m.user : null}
      fallbackImg={m.img || null}
    />
  );
}

export default function FriendsGrid() {
  const { t } = useLanguage();
  useEffect(() => {
    const jump = () => {
      const id = (location.hash || "").slice(1);
      const target = id && document.getElementById(id);
      if (target) target.scrollIntoView();
    };
    jump();
    window.addEventListener("hashchange", jump);
    return () => window.removeEventListener("hashchange", jump);
  }, []);

  return (
    <>
      {FRIENDS.map((group) => (
        <section
          className="section"
          id={group.id}
          key={group.id}
          style={{ fontFamily: "'DDN gg sans', sans-serif" }}
        >
          <h2 className="section-title">{t(group.titleKey)}</h2>
          {group.subtitleKey ? (
            <p className="section-subtitle">{t(group.subtitleKey)}</p>
          ) : null}
          <div className="friend-grid">
            {group.members.map((m, i) => (
              <FriendSlot key={(m.discordId || m.name) + i} m={m} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
