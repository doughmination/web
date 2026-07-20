"use client";

import PresenceCard from "./PresenceCard";

/* /discord — the owner's own full presence card. Hardcoded DUID so the mount
   needs no query string. The card is a plain component now (it used to be an
   imperative factory that replaced a throwaway mount node), so there's no
   wrapper or manual teardown left here — PresenceCard owns its own feed,
   timers and cleanup. */

const MY_DISCORD_USER_ID = "1464890289922641993";

export default function OwnerDiscordCard() {
  return <PresenceCard userId={MY_DISCORD_USER_ID} />;
}
