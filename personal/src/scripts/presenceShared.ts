/* presenceShared.ts — pure helpers, constants and data hooks behind PresenceCard.
 *
 * Split out of the old imperative presenceCard.ts so the component file stays
 * readable. Nothing here touches the DOM: it's URL builders, Discord payload
 * mapping, and the hooks that own the live feed / 1s ticker / accent extraction.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Icon } from "react-bootstrap-icons";
import {
  Amazon, Bluesky, Discord, Facebook, Github, Globe, Instagram, Laptop, Linkedin,
  Mastodon, Paypal, Phone, Playstation, Reddit, Spotify, Steam, Tiktok, Twitch,
  TwitterX, Xbox, Youtube,
} from "react-bootstrap-icons";

/** Loose shapes: this consumes a very dynamic third-party (Discord) payload. */
export type Dict = Record<string, unknown>;

export interface SelfJson {
  success?: boolean;
  data?: Dict;
}

export interface PresenceOpts {
  userId?: string | null;
  mini?: boolean;
  tier?: string | null;
  link?: string | null;
  pollMs?: number;
  fallbackName?: string;
  fallbackUser?: string | null;
  fallbackImg?: string | null;
}

export const g = (o: unknown, k: string): unknown =>
  o && typeof o === "object" ? (o as Dict)[k] : undefined;

/* ---- formatting ----------------------------------------------------------- */

export function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** `now` is passed in (from useTicker) rather than read here, so callers stay
    pure — reading the clock during render is non-idempotent. */
export function elapsedStr(start: number, now: number): string {
  const s = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

export function fmtSinceDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function intToHex(n: number): string {
  return "#" + (Number(n) >>> 0).toString(16).padStart(6, "0").slice(-6);
}

export function rgbTriplet(n: number): string {
  n = Number(n) >>> 0;
  return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
}

export function isRealName(v: unknown): boolean {
  if (v == null) return false;
  const n = String(v).trim().toLowerCase();
  return n !== "" && n !== "null" && n !== "undefined";
}

/* ---- CDN / proxy URLs ----------------------------------------------------- */

export function proxyImg(url: string, o?: { w?: number }): string {
  if (!url) return url;
  if (!/^https:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(url)) return url;
  const src = url.replace(/^https:\/\//, "");
  let query = "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=webp";
  if (o && o.w) query += "&w=" + o.w + "&dpr=2&fit=cover";
  return query;
}

export function avatarUrl(u: { id?: string | null; avatar?: string }): string {
  if (!u || !u.avatar) return proxyImg("https://cdn.discordapp.com/embed/avatars/0.png");
  const ext = String(u.avatar).startsWith("a_") ? "gif" : "png";
  return proxyImg(`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=128`, { w: 80 });
}

export function emojiUrl(e: { id?: string; animated?: boolean } | undefined): string | null {
  if (!e || !e.id) return null;
  return proxyImg(`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}?size=32`);
}

export function assetUrl(appId: string, asset: string): string | null {
  if (!asset) return null;
  if (String(asset).startsWith("mp:")) return proxyImg("https://media.discordapp.net/" + asset.slice(3));
  return proxyImg(`https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`);
}

export function guildBadgeUrl(pg: Dict): string | null {
  if (!pg || !pg.badge || !pg.identity_guild_id) return null;
  return proxyImg(
    `https://cdn.discordapp.com/guild-tag-badges/${pg.identity_guild_id}/${pg.badge}.png?size=24`,
  );
}

export function bannerUrl(id: string, hash: string): string | null {
  if (!id || !hash) return null;
  const animated = String(hash).startsWith("a_");
  const url =
    "https://cdn.discordapp.com/banners/" + id + "/" + hash + (animated ? "" : ".png") + "?size=600";
  return proxyImg(url, { w: 600 });
}

/* ---- lookup tables -------------------------------------------------------- */

export const STATUS_TITLE: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
  streaming: "Streaming",
};

export const NAME_FONTS: Record<number, string> = {
  3: "'DDN Sakura', cursive",
  4: "'DDN Jellybean', cursive",
  6: "'DDN Modern', sans-serif",
  7: "'DDN Medieval', serif",
  8: "'DDN 8Bit', monospace",
  10: "'DDN Vampyre', serif",
  11: "'DDN gg sans', sans-serif",
  12: "'DDN Tempo', serif",
};

export const BADGE_FLAGS: [number, string, string][] = [
  [1 << 0, "Discord Staff", "5e74e9b61934fc1f67c65515d1f7e60d"],
  [1 << 1, "Partnered Server Owner", "3f9748e53446a137a052f3454e2de41e"],
  [1 << 2, "HypeSquad Events", "bf01d1073931f921909045f3a39fd264"],
  [1 << 3, "Bug Hunter", "2717692c7dca7289b35297368a940dd0"],
  [1 << 6, "HypeSquad Bravery", "8a88d63823d8a71cd5e390baa45efa02"],
  [1 << 7, "HypeSquad Brilliance", "011940fd013da3f7fb926e4a1cd2e618"],
  [1 << 8, "HypeSquad Balance", "3aa41de486fa12454c3761e8e223442e"],
  [1 << 9, "Early Supporter", "7060786766c9c840eb3019e725d2b358"],
  [1 << 14, "Bug Hunter Gold", "848f79194d4be5ff5f81505cbd0ce1e6"],
  [1 << 17, "Early Verified Bot Developer", "6df5892e0f35b051f8b61eace34f4967"],
  [1 << 18, "Moderator Programs Alumni", "fee1624003e2fee35cb398e125dc479b"],
  [1 << 22, "Active Developer", "6bdc42827a38498929a4920da12695d9"],
];

/** Platform pips in the sub-row. Components now, not `bi` glyph names. */
export const PLATFORM_ICONS: Record<string, { Ic: Icon; label: string }> = {
  desktop: { Ic: Laptop, label: "Desktop" },
  mobile: { Ic: Phone, label: "Mobile" },
  web: { Ic: Globe, label: "Web" },
};

export const CONNECTION_URLS: Record<string, (n: string, id?: string) => string> = {
  tiktok: (n) => "https://tiktok.com/@" + n,
  ebay: (n) => "https://www.ebay.com/usr/" + n,
  instagram: (n) => "https://instagram.com/" + n,
  xbox: (n) => "https://www.xbox.com/en-GB/play/user/" + n,
  github: (n) => "https://github.com/" + n,
  roblox: (n, id) => "https://www.roblox.com/users/" + id + "/profile",
  epicgames: (n, id) => "https://store.epicgames.com/u/" + id,
  twitter: (n) => "https://twitter.com/" + n,
  twitch: (n) => "https://twitch.tv/" + n,
  youtube: (n, id) => "https://youtube.com/channel/" + id,
  spotify: (n, id) => "https://open.spotify.com/user/" + id,
  steam: (n, id) => "https://steamcommunity.com/profiles/" + id,
  reddit: (n) => "https://reddit.com/user/" + n,
  domain: (n) => "https://" + n,
  bluesky: (n) => "https://bsky.app/profile/" + n,
};

/** Connection glyphs: an icon component, or a local SVG file for brands
    Bootstrap Icons doesn't ship. */
export const CONNECTION_ICON: Record<string, { Ic?: Icon; img?: string }> = {
  "amazon-music": { Ic: Amazon },
  facebook: { Ic: Facebook },
  ebay: { img: "/assets/socials/ebay.svg" },
  tiktok: { Ic: Tiktok },
  bungie: { img: "/assets/socials/bungie.svg" },
  playstation: { Ic: Playstation },
  paypal: { Ic: Paypal },
  instagram: { Ic: Instagram },
  xbox: { Ic: Xbox },
  crunchyroll: { img: "/assets/socials/crunchyroll.svg" },
  battlenet: { img: "/assets/socials/battlenet.svg" },
  github: { Ic: Github },
  epicgames: { img: "/assets/socials/epic.svg" },
  riotgames: { img: "/assets/socials/riot.svg" },
  leagueoflegends: { img: "/assets/socials/league.svg" },
  steam: { Ic: Steam },
  roblox: { img: "/assets/socials/roblox.svg" },
  twitter: { Ic: TwitterX },
  bluesky: { Ic: Bluesky },
  mastodon: { Ic: Mastodon },
  twitch: { Ic: Twitch },
  youtube: { Ic: Youtube },
  reddit: { Ic: Reddit },
  spotify: { Ic: Spotify },
  discord: { Ic: Discord },
  linkedin: { Ic: Linkedin },
  domain: { Ic: Globe },
};

export const WL_TYPE_LABEL: Record<string, string> = {
  avatar_decoration: "Decoration",
  profile_effect: "Effect",
  nameplate: "Nameplate",
  bundle: "Bundle",
  variants_group: "Variants",
  external_sku: "Item",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  gbp: "£", usd: "$", eur: "€", aud: "A$", cad: "C$",
};

export function fmtPrice(p: Dict | undefined): string | null {
  if (!p || typeof p.amount !== "number") return null;
  const exp = typeof p.exponent === "number" ? p.exponent : 2;
  const v = ((p.amount as number) / Math.pow(10, exp)).toFixed(exp);
  const sym = CURRENCY_SYMBOL[String(p.currency || "").toLowerCase()];
  return sym ? sym + v : v + " " + String(p.currency || "").toUpperCase();
}

export function wlImg(w: Dict): string | null {
  const url = (w.static_image_url as string) || (w.animated_image_url as string);
  if (!url) return null;
  if (
    w.type === "avatar_decoration" ||
    w.type === "profile_effect" ||
    /avatar-decoration-presets/.test(url)
  )
    return url;
  return proxyImg(url, { w: 64 }) || url;
}

/* ---- payload mapping ------------------------------------------------------ */

/** Flatten the self-hosted API's user/presence split into the flat Lanyard-ish
    shape the card renders from. */
export function mapSelfHostToPresence(j: SelfJson, fallbackId: string | null): Dict {
  const data = j.data || {};
  const u = (data.user as Dict) || {};
  const p = (data.presence as Dict) || {};
  const plat = (p.platform as Dict) || {};
  const dec = u.avatar_decoration as { asset?: string } | undefined;
  // New API: the avatar decoration lives in data.collectibles (slot
  // "avatar_decoration") with a full image URL, not on user.avatar_decoration.
  const collectibles = data.collectibles as Dict[] | undefined;
  const decoCol = Array.isArray(collectibles)
    ? collectibles.find((c) => c.slot === "avatar_decoration" || c.type === "avatar_decoration")
    : undefined;
  const decoUrl = (decoCol && (decoCol.static_image_url || decoCol.animated_image_url)) as
    | string
    | undefined;
  const clan = u.clan as Dict | undefined;
  return {
    discord_user: {
      id: u.id || fallbackId,
      username: u.username,
      global_name: u.global_name,
      display_name: u.display_name,
      avatar: u.avatar,
      avatar_decoration_data: decoUrl
        ? { url: decoUrl }
        : dec && dec.asset
          ? { asset: dec.asset }
          : null,
      primary_guild:
        clan && clan.tag
          ? { tag: clan.tag, identity_enabled: true, badge: clan.badge, identity_guild_id: clan.guild_id }
          : null,
      display_name_styles: u.display_name_styles || null,
      public_flags: u.public_flags || 0,
    },
    discord_status: p.status || (p.online ? "online" : "offline"),
    activities: p.activities || [],
    listening_to_spotify: !!p.listening_to_spotify,
    spotify: p.spotify || null,
    active_on_discord_desktop: !!plat.desktop,
    active_on_discord_mobile: !!plat.mobile,
    active_on_discord_web: !!plat.web,
    kv: {},
  };
}

/* ---- hooks ---------------------------------------------------------------- */

const SELF_BASE = "https://doughmination.uk/v2/discord/users/";

/**
 * The live presence feed for one user.
 *
 * Mirrors the old factory exactly: load once over REST, then ride core.ts's
 * socket (window.DM) patching `data.presence` in place, or fall back to polling
 * when there's no socket. Returns the whole SelfJson so the component can read
 * badges/banner/connections as well as presence.
 */
export function usePresenceFeed(userId: string | null, pollMs = 20000): SelfJson | null {
  const [json, setJson] = useState<SelfJson | null>(null);
  // The socket sends presence-only patches, so we merge against the last full
  // payload without making it a render dependency.
  const latest = useRef<SelfJson | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let off: (() => void) | void;

    const load = () =>
      fetch(SELF_BASE + userId, { cache: "no-store" })
        .then((r) => (r.ok ? r.json().catch(() => null) : null))
        .then((j: SelfJson | null) => {
          if (cancelled || !j || !j.success || !j.data || !j.data.user) return false;
          latest.current = j;
          setJson(j);
          return true;
        })
        .catch(() => false);

    load();

    if (window.DM) {
      off = window.DM.on("presence:" + userId, (v: unknown) => {
        const data = g(v, "data") as Dict | undefined;
        const prev = latest.current;
        if (cancelled || !data || !prev || !prev.data) return;
        // New object identity so React re-renders; presence swapped, rest kept.
        const next: SelfJson = { ...prev, data: { ...prev.data, presence: data } };
        latest.current = next;
        setJson(next);
      });
    } else {
      timer = setInterval(() => {
        if (!document.hidden) load();
      }, pollMs);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (typeof off === "function") off();
    };
  }, [userId, pollMs]);

  return json;
}

/**
 * Current time in ms, re-rendering once a second while `active` — so an idle
 * card does no work at all. Also ticks on tab focus, matching the old
 * visibilitychange handler.
 *
 * The clock is an external mutable source, so this goes through
 * useSyncExternalStore rather than Date.now() in render (which is impure and
 * would make renders non-idempotent). The snapshot is floored to whole seconds
 * so it's referentially stable between ticks — returning raw Date.now() here
 * would loop forever.
 */
export function useTicker(active: boolean): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!active) return () => {};
      const id = setInterval(onChange, 1000);
      const onVis = () => { if (!document.hidden) onChange(); };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        clearInterval(id);
        document.removeEventListener("visibilitychange", onVis);
      };
    },
    [active],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => 0, // SSR: no clock; the first client tick fills it in
  );
}

/**
 * True when the user asks for reduced motion. Goes through useSyncExternalStore
 * for the same reason useTicker does — matchMedia is an external mutable source,
 * and reading it during render would be impure.
 *
 * Server snapshot is `false` so SSR matches the common case; if the user does
 * prefer reduced motion, the first client read corrects it before anything
 * animates.
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    () => false,
  );
}

/** One equipped collectible (nameplate, avatar decoration, profile effect). */
export interface Collectible {
  slot?: string;
  type?: string;
  name?: string;
  summary?: string;
  static_image_url?: string | null;
  animated_image_url?: string | null;
  video_url?: string | null;
  palette?: string | null;
}

/** Pull one equipped collectible slot out of the API's `collectibles` array. */
export function collectibleForSlot(
  collectibles: unknown,
  slot: string,
): Collectible | null {
  if (!Array.isArray(collectibles)) return null;
  const hit = (collectibles as Dict[]).find(
    (c) => c && (c.slot === slot || c.type === slot),
  );
  return (hit as Collectible | undefined) ?? null;
}

const ACCENT_VARS = [
  "rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach",
  "yellow", "green", "teal", "sky", "saphire", "blue", "lavender",
];

function hexToRgb(hex: string): [number, number, number] {
  hex = hex.trim().replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function getThemePalette(): { r: number; g: number; b: number }[] {
  const cs = getComputedStyle(document.documentElement);
  const pal: { r: number; g: number; b: number }[] = [];
  for (const name of ACCENT_VARS) {
    const v = cs.getPropertyValue("--" + name).trim();
    if (v.startsWith("#")) {
      const [r, gg, b] = hexToRgb(v);
      pal.push({ r, g: gg, b });
    }
  }
  return pal;
}

function nearestAccent(r: number, gg: number, b: number) {
  const pal = getThemePalette();
  let best: { r: number; g: number; b: number } | null = null;
  let bestD = Infinity;
  for (const c of pal) {
    const rm = (r + c.r) / 2;
    const dr = r - c.r;
    const dg = gg - c.g;
    const db = b - c.b;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

/**
 * Average the album art down to one colour, snapped to the nearest Catppuccin
 * accent in the *current* theme. Returns an "r, g, b" triplet for --dc-accent,
 * or null when there's no art or the read fails (tainted canvas, 404).
 */
export function useAlbumAccent(url: string | null | undefined): string | null {
  // Stored with the url it was derived from, so clearing on url change is a
  // pure render-time comparison rather than a setState inside the effect.
  const [got, setGot] = useState<{ url: string | null; accent: string | null }>({
    url: null,
    accent: null,
  });
  const setAccent = (accent: string | null) => setGot({ url: url ?? null, accent });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      if (cancelled) return;
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 16;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, 16, 16);
        const { data } = ctx.getImageData(0, 0, 16, 16);
        let r = 0, gg = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 125) continue;
          const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          if (lum < 24 || lum > 235) continue;
          r += data[i];
          gg += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (!count) {
          setAccent(null);
          return;
        }
        r = Math.round(r / count);
        gg = Math.round(gg / count);
        b = Math.round(b / count);
        const near = nearestAccent(r, gg, b);
        setAccent(near ? `${near.r}, ${near.g}, ${near.b}` : `${r}, ${gg}, ${b}`);
      } catch {
        setAccent(null);
      }
    };
    img.onerror = () => { if (!cancelled) setAccent(null); };
    img.src = url;

    return () => { cancelled = true; };
    // setAccent closes over `url`, which is already the dep — stable per url.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Only trust the stored accent if it belongs to the url being asked about.
  return url && got.url === url ? got.accent : null;
}
