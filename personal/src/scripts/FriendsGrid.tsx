"use client";

import { useEffect, useRef, useState } from "react";
import {
  createPresenceCard,
  createBatchPresence,
  destroyCard,
  type BatchManager,
} from "./presenceCard";

/* /cool-people — the friends/alts grid. React renders the section/heading/grid
   structure; each member slot is a full-but-mini presence card built by the
   shared factory. One batched manager seeds every card in a single request and
   rides the site socket for live presence (see presenceCard.ts). */

type Member = {
  name: string;
  user?: string;
  img?: string;
  tier?: string;
  discordId?: string | null;
  link?: string | null;
};
type Group = { title: string; subtitle?: string; members: Member[] };

const FRIEND_POLL_MS = 60000;
const BATCH_BASE = "https://doughmination.uk/v2/discord/users";

const FRIENDS: Group[] = [
  {
    title: "Fiancée",
    members: [{ name: "Aria", tier: "wife", discordId: "1305215902685597797", link: null }],
  },
  {
    title: "Close Friends",
    members: [
      { name: "Ari", tier: "close", discordId: "1474568910736199825", link: "https://a.stupid.cat" },
      { name: "Lilly", tier: "closer", discordId: "908055723659898902", link: null },
      { name: "Ria", tier: "close", discordId: "1513506390088618145", link: null },
      { name: "Camilla", tier: "close", discordId: "1110542429838397471", link: "https://cammy-the-cat.com" },
      { name: "Saphie", tier: "close", discordId: "527709099186716673", link: null },
    ],
  },
  {
    title: "Friends",
    members: [
      { name: "Meme", tier: "friend", discordId: "812998699667161098", link: null },
      { name: "N", tier: "friend", discordId: "639399972407869450", link: null },
      { name: "Lylla", tier: "friend", discordId: "1009889543878611016", link: null },
      { name: "Simon", tier: "friend", discordId: "758466783354814514", link: null },
    ],
  },
  {
    title: "Other Peeps",
    subtitle: "You can request to be added here!",
    members: [
      { name: "furi", tier: "known", discordId: "781445370177126401", link: "https://furina.is-a.dev" },
      { name: "pokemon", tier: "known", discordId: "784443338627612673", link: "https://devmatei.com/" },
      { name: "animosity", tier: "known", discordId: "1525864258900857054", link: "https://0c6a.site/" },
      { name: "winte", tier: "known", discordId: "1357429661834936510", link: "https://buddywinte.xyz/" },
      { name: "interverti", tier: "known", discordId: "674329017339346955", link: "https://interverti.fr/" },
      { name: "schuh", tier: "known", discordId: "492707412504215552", link: "https://schuh.wtf/" },
    ],
  },
  {
    title: "Alts",
    subtitle: "My other accounts, dead or alive",
    members: [
      { name: "J", user: "real_serial_designationj", img: "/assets/alts/j.png", tier: "active-alt", discordId: "1500197577336033301", link: null },
      { name: "Uzi", user: "theuzidoorman", img: "/assets/alts/uzi.png", tier: "active-alt", discordId: "526626867973849123", link: null },
      { name: "Clove Twilight", user: "clovetwilight3", img: "/assets/alts/clovetwilight3.png", tier: "dead-alt", discordId: null, link: null },
      { name: "estrogenhrt", user: "estrogenhrt", img: "/assets/alts/estrogenhrt.png", tier: "dead-alt", discordId: "1025770042245251122", link: null },
      { name: "Clove <3", img: "/assets/alts/clove.png", tier: "dead-alt", discordId: "1125844710511104030", link: null },
      { name: "Clove ⛤", user: "greenirisluna", img: "/assets/alts/butterfly.png", tier: "dead-alt", discordId: "514994021970739201", link: null },
      { name: "Mrow", user: "arisgayasswife", img: "/assets/alts/mrow.png", tier: "dead-alt", discordId: "219480349053288450", link: null },
    ],
  },
];

function slugify(str: string) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function FriendSlot({ m, batch }: { m: Member; batch: BatchManager }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const inner = document.createElement("div");
    wrap.appendChild(inner);
    const card = createPresenceCard({
      mount: inner,
      userId: m.discordId || null,
      mini: true,
      pollMs: FRIEND_POLL_MS,
      batch,
      tier: m.tier || null,
      link: m.link || null,
      fallbackName: m.name,
      fallbackUser: !m.discordId && m.user ? m.user : null,
      fallbackImg: m.img || null,
    });
    return () => {
      destroyCard(card);
      card?.remove();
    };
  }, [m, batch]);
  return <div ref={wrapRef} style={{ display: "contents" }} />;
}

export default function FriendsGrid() {
  // Stable per-mount singleton; createBatchPresence touches no window at
  // creation, so the lazy initializer is SSR-safe.
  const [batch] = useState<BatchManager>(() => createBatchPresence(BATCH_BASE, FRIEND_POLL_MS));

  // Slots register during their own mount effects (children run before parent),
  // so by here every id is known — one request seeds them all, then poll/socket.
  useEffect(() => {
    batch.refresh().then(() => batch.start());
    const jump = () => {
      const id = (location.hash || "").slice(1);
      const target = id && document.getElementById(id);
      if (target) target.scrollIntoView();
    };
    jump();
    window.addEventListener("hashchange", jump);
    return () => {
      window.removeEventListener("hashchange", jump);
      batch.destroy();
    };
  }, [batch]);

  return (
    <>
      {FRIENDS.map((group) => (
        <section
          className="section"
          id={slugify(group.title)}
          key={group.title}
          style={{ fontFamily: "'DDN gg sans', sans-serif" }}
        >
          <h2 className="section-title">{group.title}</h2>
          {group.subtitle ? <p className="section-subtitle">{group.subtitle}</p> : null}
          <div className="friend-grid">
            {group.members.map((m, i) => (
              <FriendSlot key={(m.discordId || m.name) + i} m={m} batch={batch} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
