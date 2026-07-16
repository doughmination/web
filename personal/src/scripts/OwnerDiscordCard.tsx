"use client";

import { useEffect, useRef } from "react";
import { createPresenceCard, destroyCard } from "./presenceCard";

/* /discord — the owner's own full presence card. Hardcoded DUID so the mount
   needs no query string. Wraps the imperative card factory: React owns an
   invisible wrapper (display:contents), the factory replaces a throwaway inner
   node with the card, and we tear down the card's timers/socket on unmount. */

const MY_DISCORD_USER_ID = "1464890289922641993";

export default function OwnerDiscordCard() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const inner = document.createElement("div");
    wrap.appendChild(inner);
    const card = createPresenceCard({ mount: inner, userId: MY_DISCORD_USER_ID });
    return () => {
      destroyCard(card);
      card?.remove();
    };
  }, []);

  return <div ref={wrapRef} style={{ display: "contents" }} />;
}
