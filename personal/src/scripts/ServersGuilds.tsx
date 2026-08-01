/* personal/src/scripts/ServersGuilds.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useGuild } from "@doughmination/react-api";

/* Ported from guilds.js — Discord server cards, each resolved live via the
   Doughmination API through the wrapper's useGuild hook. */

type GuildCfg = { name: string; invite: string; role?: string };

const GUILDS: GuildCfg[] = [
  {
    name: "Doughmination",
    invite: "N8gCjS294R",
    role: "owner"
  },
  {
    name: "Girls",
    invite: "K8qaKYBy6J",
    role: "mod"
  },
  {
    name: "is-a.dev",
    invite: "is-a-dev-830872854677422150",
    role: "member"
  },
  {
    name: "Furina Mains",
    invite: "focalorsmains",
    role: "member"
  },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  mod: "Mod",
  member: "Member",
};

/* Discord CDN accepts ?size=<power of 2>; ensure a resolution big enough. */
function withSize(url: string, size: number): string {
  if (!url) return url;
  if (/[?&]size=\d+/.test(url)) return url.replace(/([?&])size=\d+/, `$1size=${size}`);
  return url + (url.indexOf("?") === -1 ? "?" : "&") + "size=" + size;
}

function GuildCard({ cfg }: { cfg: GuildCfg }) {
  // Resolves the invite via the shared REST client; cached for 5 min.
  const { data: d } = useGuild(cfg.invite);

  const name = d?.name || cfg.name;
  const icon = d?.icon_url ? withSize(d.icon_url, 256) : null;
  const banner = d?.banner_url ? withSize(d.banner_url, 1024) : null;
  const roleKey = cfg.role ? cfg.role.toLowerCase() : "";

  const counts: string[] = [];
  const hasOnline = typeof d?.online_count === "number";
  if (hasOnline) counts.push(d!.online_count!.toLocaleString() + " online");
  if (typeof d?.member_count === "number") counts.push(d.member_count.toLocaleString() + " members");

  return (
    <a
      className={`guild-card${banner ? "" : " gc-banner-fallback"}`}
      href={`https://discord.gg/${encodeURIComponent(cfg.invite)}`}
      target="_blank"
      rel="noopener noreferrer"
      data-invite={cfg.invite}
    >
      {banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="gc-banner" src={banner} alt="" referrerPolicy="no-referrer" />
      ) : null}
      <div className="gc-head">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="gc-icon"
            src={icon}
            alt=""
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : (
          <span className="gc-icon-fallback" aria-hidden="true">
            {(name || "?").trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="gc-id">
          <span className="gc-name">{name}</span>
          {counts.length ? (
            <span className="gc-counts">
              {hasOnline ? <span className="gc-dot" aria-hidden="true" /> : null}
              {counts.join(" · ")}
            </span>
          ) : null}
        </div>
      </div>
      {d?.description ? <div className="gc-desc">{d.description}</div> : null}
      {cfg.role ? (
        <span className={`gc-role gc-role-${roleKey}`}>{ROLE_LABELS[roleKey] || cfg.role}</span>
      ) : null}
    </a>
  );
}

export default function ServersGuilds() {
  return (
    <div id="my-guilds" className="guild-grid">
      {GUILDS.map((g) => (
        <GuildCard key={g.invite} cfg={g} />
      ))}
    </div>
  );
}
