/* src/scripts/ServersGuilds.tsx
 * ESAL-2.3
 */

"use client";

import { useEffect, useState } from "react";

/* Ported from guilds.js — Discord server cards, each resolved live via the
   Doughmination Restful API (through DM's cache, or a direct fetch fallback). */

type GuildCfg = { name: string; invite: string; role?: string };
type GuildData = {
  name?: string;
  icon_url?: string | null;
  banner_url?: string | null;
  description?: string | null;
  member_count?: number;
  online_count?: number;
};

const GUILDS: GuildCfg[] = [
  {
    name: "Doughmination",
    invite: "KuVW2zSyTU",
    role: "owner"
  },
  {
    name: "Girls",
    invite: "TransRights",
    role: "mod"
  },
  {
    name: "Lanyard",
    invite: "Lanyard",
    role: "member"
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
  {
    name: "Discord Previews",
    invite: "discord-603970300668805120",
    role: "member"
  },
  {
    name: "Global Badges",
    invite: "JsgsS8kzz8",
    role: "member"
  },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  mod: "Mod",
  member: "Member",
};

const GUILD_BASE = "https://doughmination.uk/v2/discord/guilds/";

/* Discord CDN accepts ?size=<power of 2>; ensure a resolution big enough. */
function withSize(url: string, size: number): string {
  if (!url) return url;
  if (/[?&]size=\d+/.test(url)) return url.replace(/([?&])size=\d+/, `$1size=${size}`);
  return url + (url.indexOf("?") === -1 ? "?" : "&") + "size=" + size;
}

function GuildCard({ cfg }: { cfg: GuildCfg }) {
  const [d, setD] = useState<GuildData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apply = (data: GuildData | null) => {
      if (!cancelled && data) setD(data);
    };
    const dm = window.DM;
    if (dm?.request) {
      dm.request("guild", { id: cfg.invite }, { maxAge: 300000, persist: true })
        .then((data) => apply(data as GuildData | null))
        .catch(() => {});
    } else {
      fetch(GUILD_BASE + encodeURIComponent(cfg.invite), { cache: "no-store" })
        .then((r) => (r.ok ? r.json().catch(() => null) : null))
        .then((j) => {
          if (j && j.success && j.data) apply(j.data as GuildData);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [cfg.invite]);

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
