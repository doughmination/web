/* presenceCard.ts — shared Discord presence-card core (ported from discord.js).
 *
 * This is the common file behind two React components:
 *   - OwnerDiscordCard.tsx  (/discord)      one full card
 *   - FriendsGrid.tsx       (/cool-people)  a grid of mini cards
 *
 * The card is heavily imperative — a live WebSocket presence feed, a 1s ticker,
 * canvas album-art accent extraction, dozens of DOM render branches — so it
 * stays as a factory (`createPresenceCard`) that builds into a mount element.
 * The React components own the mount points and lifecycle. */

// Loose shapes: this consumes a very dynamic third-party (Discord) payload.
type Dict = Record<string, unknown>;
interface SelfJson {
  success?: boolean;
  data?: Dict;
}
export interface PresenceOpts {
  userId?: string | null;
  mount: HTMLElement;
  mini?: boolean;
  tier?: string | null;
  link?: string | null;
  pollMs?: number;
  fallbackName?: string;
  fallbackUser?: string | null;
  fallbackImg?: string | null;
}

const g = (o: unknown, k: string): unknown =>
  o && typeof o === "object" ? (o as Dict)[k] : undefined;

export function createPresenceCard(opts: PresenceOpts): HTMLElement | null {
  const DISCORD_USER_ID = opts.userId || null;
  const mount = opts.mount;
  if (!mount) return null;
  if (!DISCORD_USER_ID && !opts.fallbackName) return null;

  const card = document.createElement("div");
  if (!opts.mini) card.id = "discord";
  card.className =
    "presence-card" + (opts.mini ? " is-mini" : "") + (opts.tier ? " tier-" + opts.tier : "");
  card.style.fontFamily = "'DDN gg sans', sans-serif";
  card.hidden = true;
  card.innerHTML =
    '<img class="pc-banner" alt="" referrerpolicy="no-referrer" hidden>' +
    '<div class="pc-head">' +
    '<span class="pc-avatar">' +
    '<img class="pc-av-img" alt="" referrerpolicy="no-referrer" crossorigin="anonymous">' +
    '<img class="pc-av-deco" alt="" aria-hidden="true" hidden>' +
    '<span class="pc-status" aria-hidden="true"></span>' +
    "</span>" +
    '<span class="pc-id">' +
    '<span class="pc-name-row">' +
    '<span class="pc-name"></span>' +
    '<span class="pc-tag" hidden></span>' +
    "</span>" +
    '<span class="pc-sub-row">' +
    '<span class="pc-user"></span>' +
    '<span class="pc-status-text"></span>' +
    '<span class="pc-pronouns" hidden></span>' +
    '<span class="pc-timezone" hidden></span>' +
    '<span class="pc-premium" hidden></span>' +
    '<span class="pc-platforms" aria-hidden="true"></span>' +
    "</span>" +
    '<span class="pc-meta" hidden></span>' +
    '<span class="pc-badges" aria-hidden="true"></span>' +
    "</span>" +
    '<button class="pc-star" type="button" aria-label="show wishlist" title="wishlist"><i class="bi bi-star-fill" aria-hidden="true"></i></button>' +
    "</div>" +
    '<div class="pc-bio" hidden></div>' +
    '<div class="pc-connections" hidden></div>' +
    '<div class="pc-sections"></div>' +
    '<div class="pc-wishlist" id="pc-wishlist"></div>';
  mount.replaceWith(card);

  const q = <T extends Element = HTMLElement>(sel: string) => card.querySelector(sel) as T | null;
  const avImg = q<HTMLImageElement>(".pc-av-img")!;
  const avDeco = q<HTMLImageElement>(".pc-av-deco")!;
  const nameEl = q(".pc-name")!;
  const tagEl = q(".pc-tag")!;
  const userEl = q(".pc-user")!;
  const platformsEl = q(".pc-platforms")!;
  const statusTextEl = q(".pc-status-text");
  const STATUS_TITLE: Record<string, string> = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
    streaming: "Streaming",
  };
  const metaEl = q(".pc-meta")!;
  const badgesEl = q(".pc-badges");
  const sections = q(".pc-sections")!;
  const idEl = q(".pc-id")!;
  const starBtn = q<HTMLButtonElement>(".pc-star");
  const wishlistEl = q(".pc-wishlist");
  const bannerEl = q<HTMLImageElement>(".pc-banner");
  const bioEl = q(".pc-bio");
  const connectionsEl = q(".pc-connections");
  const pronounsEl = q(".pc-pronouns");
  const timezoneEl = q(".pc-timezone");
  const premiumEl = q(".pc-premium");
  let tzOffsetMin: number | null = null;
  let tzName: string | null = null;

  if (opts.link) {
    nameEl.classList.add("pc-name--link");
    nameEl.setAttribute("role", "link");
    nameEl.setAttribute("tabindex", "0");
    const goLink = () => window.open(opts.link!, "_blank", "noopener");
    nameEl.addEventListener("click", goLink);
    nameEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goLink();
      }
    });
  }
  if (opts.fallbackName) {
    nameEl.textContent = opts.fallbackName;
    avImg.src = opts.fallbackImg || avatarUrl({ id: DISCORD_USER_ID });
    card.dataset.status = "offline";
    card.hidden = false;
  }
  if (opts.fallbackUser) userEl.textContent = "@" + opts.fallbackUser;

  // ---- wishlist -----------------------------------------------------------
  let wishlistItems: Dict[] | null = null;
  const WL_TYPE_LABEL: Record<string, string> = {
    avatar_decoration: "Decoration",
    profile_effect: "Effect",
    nameplate: "Nameplate",
    bundle: "Bundle",
    variants_group: "Variants",
    external_sku: "Item",
  };
  const CURRENCY_SYMBOL: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    aud: "A$",
    cad: "C$",
  };
  function fmtPrice(p: Dict | undefined): string | null {
    if (!p || typeof p.amount !== "number") return null;
    const exp = typeof p.exponent === "number" ? p.exponent : 2;
    const v = ((p.amount as number) / Math.pow(10, exp)).toFixed(exp);
    const sym = CURRENCY_SYMBOL[String(p.currency || "").toLowerCase()];
    return sym ? sym + v : v + " " + String(p.currency || "").toUpperCase();
  }
  function wlImg(w: Dict): string | null {
    const url = (w.static_image_url as string) || (w.animated_image_url as string);
    if (!url) return null;
    if (w.type === "avatar_decoration" || w.type === "profile_effect" || /avatar-decoration-presets/.test(url))
      return url;
    return proxyImg(url, { w: 64 }) || url;
  }
  function renderWishlist() {
    if (!wishlistEl) return;
    const items = Array.isArray(wishlistItems) ? wishlistItems : [];
    let body: string;
    if (items.length) {
      body = items
        .map((w) => {
          const ic = wlImg(w);
          const typeLabel = WL_TYPE_LABEL[String(w.type)] || "";
          const price = fmtPrice(w.price as Dict);
          return (
            '<span class="pc-wl-item' +
            (w.is_owned ? " is-owned" : "") +
            '">' +
            (ic
              ? '<img class="pc-wl-ic" src="' +
                esc(ic) +
                '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">'
              : "") +
            '<span class="pc-wl-text">' +
            '<span class="pc-wl-name">' +
            esc((w.name as string) || "Collectible") +
            "</span>" +
            (typeLabel ? '<span class="pc-wl-type">' + esc(typeLabel) + "</span>" : "") +
            "</span>" +
            (price ? '<span class="pc-wl-price">' + esc(price) + "</span>" : "") +
            "</span>"
          );
        })
        .join("");
    } else {
      body =
        '<p class="pc-wl-empty">nothing on the wishlist yet <i class="bi bi-stars" aria-hidden="true"></i></p>';
    }
    wishlistEl.innerHTML = '<div class="pc-wishlist-title">Wishlist</div>' + body;
  }
  if (starBtn) {
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = card.classList.toggle("show-wishlist");
      starBtn.classList.toggle("on", open);
      starBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) renderWishlist();
    });
  }

  let latest: Dict | null = null;
  let customNode: HTMLElement | null = null;
  let ticker: ReturnType<typeof setInterval> | null = null;
  let selfTimer: ReturnType<typeof setInterval> | null = null;
  let dmOff: (() => void) | undefined;

  // ---- helpers ------------------------------------------------------------
  function fmt(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  function elapsedStr(start: number): string {
    const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  }
  function clamp(n: number, lo: number, hi: number) {
    return Math.min(Math.max(n, lo), hi);
  }
  function fmtSinceDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  function proxyImg(url: string, o?: { w?: number }): string {
    if (!url) return url;
    if (!/^https:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(url)) return url;
    const src = url.replace(/^https:\/\//, "");
    let query = "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=webp";
    if (o && o.w) query += "&w=" + o.w + "&dpr=2&fit=cover";
    return query;
  }
  function avatarUrl(u: { id?: string | null; avatar?: string }): string {
    if (!u || !u.avatar) return proxyImg("https://cdn.discordapp.com/embed/avatars/0.png");
    const ext = String(u.avatar).startsWith("a_") ? "gif" : "png";
    return proxyImg(
      `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=128`,
      { w: 80 },
    );
  }
  function emojiUrl(e: { id?: string; animated?: boolean } | undefined): string | null {
    if (!e || !e.id) return null;
    return proxyImg(`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}?size=32`);
  }
  function assetUrl(appId: string, asset: string): string | null {
    if (!asset) return null;
    if (String(asset).startsWith("mp:")) return proxyImg("https://media.discordapp.net/" + asset.slice(3));
    return proxyImg(`https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`);
  }
  function esc(str: unknown): string {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function intToHex(n: number): string {
    return "#" + (Number(n) >>> 0).toString(16).padStart(6, "0").slice(-6);
  }
  function guildBadgeUrl(pg: Dict): string | null {
    if (!pg || !pg.badge || !pg.identity_guild_id) return null;
    return proxyImg(
      `https://cdn.discordapp.com/guild-tag-badges/${pg.identity_guild_id}/${pg.badge}.png?size=24`,
    );
  }
  const PLATFORM_ICONS: Record<string, { bi: string; label: string }> = {
    desktop: { bi: "laptop", label: "Desktop" },
    mobile: { bi: "phone", label: "Mobile" },
    web: { bi: "globe", label: "Web" },
  };
  function platIcon(key: string): string {
    const p = PLATFORM_ICONS[key];
    return (
      '<i class="pc-plat bi bi-' +
      p.bi +
      '" title="' +
      p.label +
      '" role="img" aria-label="' +
      p.label +
      '"></i>'
    );
  }
  function platformIcons(d: Dict): string {
    let html = "";
    if (d.active_on_discord_desktop) html += platIcon("desktop");
    if (d.active_on_discord_mobile) html += platIcon("mobile");
    if (d.active_on_discord_web || d.active_on_discord_embedded) html += platIcon("web");
    return html;
  }
  const BADGE_FLAGS: [number, string, string][] = [
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
  function renderBadges(flags: number): string {
    flags = Number(flags) || 0;
    let html = "";
    for (const [bit, name, hash] of BADGE_FLAGS) {
      if (flags & bit) {
        html +=
          '<img class="pc-badge" src="' +
          proxyImg("https://cdn.discordapp.com/badge-icons/" + hash + ".png") +
          '" alt="' +
          esc(name) +
          '" title="' +
          esc(name) +
          '" onerror="this.remove()">';
      }
    }
    return html;
  }
  let doughBadges: Dict[] | null = null;
  let clientBadges: Dict[] | null = null;
  let lastFlags = 0;
  function renderDoughBadges(): string {
    return (doughBadges || [])
      .map((b) => {
        const img =
          '<img class="pc-badge" data-badge-id="' +
          esc(b.id) +
          '" src="' +
          proxyImg("https://cdn.discordapp.com/badge-icons/" + esc(b.icon) + ".png") +
          '" alt="' +
          esc(b.description || b.id) +
          '" title="' +
          esc(b.description || b.id) +
          '" onerror="this.remove()">';
        return b.link
          ? '<a class="pc-badge-link" tabindex="-1" href="' +
              esc(b.link) +
              '" target="_blank" rel="noopener">' +
              img +
              "</a>"
          : img;
      })
      .join("");
  }
  function renderClientBadges(): string {
    if (!clientBadges || !clientBadges.length) return "";
    return clientBadges
      .map(
        (b) =>
          '<img class="pc-badge pc-badge--client" data-badge-id="' +
          esc(b.id) +
          '" src="' +
          esc(b.icon_url) +
          '" alt="' +
          esc(b.tooltip || "") +
          '" title="' +
          esc(b.tooltip || "") +
          '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">',
      )
      .join("");
  }
  function paintBadges() {
    if (!badgesEl) return;
    badgesEl.innerHTML =
      (doughBadges && doughBadges.length ? renderDoughBadges() : renderBadges(lastFlags)) +
      renderClientBadges();
  }
  function rgbTriplet(n: number): string {
    n = Number(n) >>> 0;
    return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
  }
  function applyProfileGradient(colors: number[]) {
    if (!colors || colors.length < 2) return;
    card.style.setProperty("--pc-grad-1-rgb", rgbTriplet(colors[0]));
    card.style.setProperty("--pc-grad-2-rgb", rgbTriplet(colors[1]));
    card.classList.add("has-profile-grad");
  }
  function bannerUrl(id: string, hash: string): string | null {
    if (!id || !hash) return null;
    const animated = String(hash).startsWith("a_");
    const url =
      "https://cdn.discordapp.com/banners/" + id + "/" + hash + (animated ? "" : ".png") + "?size=600";
    return proxyImg(url, { w: 600 });
  }
  function applyBanner(url: string | null, fallbackColor: string | null) {
    if (!bannerEl) return;
    if (url) {
      bannerEl.src = url;
      bannerEl.hidden = false;
      bannerEl.onerror = () => {
        bannerEl.hidden = true;
        card.classList.remove("has-banner");
      };
      card.classList.add("has-banner");
    } else if (fallbackColor) {
      bannerEl.hidden = true;
      card.style.setProperty("--pc-banner-color", fallbackColor);
      card.classList.add("has-banner-color");
    }
  }
  function renderBio(text: unknown) {
    if (!bioEl) return;
    const raw = text == null ? "" : String(text).trim();
    if (!raw) {
      bioEl.hidden = true;
      return;
    }
    const EMOJI = /<(a)?:(\w+):(\d+)>/g;
    const URL = /https?:\/\/[^\s<]+/g;
    let html = "";
    let i = 0;
    while (i < raw.length) {
      EMOJI.lastIndex = i;
      URL.lastIndex = i;
      const em = EMOJI.exec(raw);
      const ur = URL.exec(raw);
      let hit: RegExpExecArray | null = null;
      let kind: string | null = null;
      if (em && (!ur || em.index <= ur.index)) {
        hit = em;
        kind = "emoji";
      } else if (ur) {
        hit = ur;
        kind = "url";
      }
      if (!hit) {
        html += esc(raw.slice(i));
        break;
      }
      html += esc(raw.slice(i, hit.index));
      if (kind === "emoji") {
        const url = emojiUrl({ id: hit[3], animated: hit[1] === "a" });
        html += url
          ? '<img class="pc-bio-emoji" src="' +
            esc(url) +
            '" alt=":' +
            esc(hit[2]) +
            ':" title=":' +
            esc(hit[2]) +
            ':" loading="lazy">'
          : esc(hit[0]);
      } else {
        html +=
          '<a class="pc-bio-link" href="' +
          esc(hit[0]) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(hit[0]) +
          "</a>";
      }
      i = hit.index + hit[0].length;
    }
    bioEl.innerHTML = html;
    bioEl.hidden = false;
  }
  const CONNECTION_URLS: Record<string, (n: string, id?: string) => string> = {
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
  const CONNECTION_ICON: Record<string, { bi?: string; img?: string }> = {
    "amazon-music": { bi: "amazon" },
    facebook: { bi: "facebook" },
    ebay: { img: "/assets/socials/ebay.svg" },
    tiktok: { bi: "tiktok" },
    bungie: { img: "/assets/socials/bungie.svg" },
    playstation: { bi: "playstation" },
    paypal: { bi: "paypal" },
    instagram: { bi: "instagram" },
    xbox: { bi: "xbox" },
    crunchyroll: { img: "/assets/socials/crunchyroll.svg" },
    battlenet: { img: "/assets/socials/battlenet.svg" },
    github: { bi: "github" },
    epicgames: { img: "/assets/socials/epic.svg" },
    riotgames: { img: "/assets/socials/riot.svg" },
    leagueoflegends: { img: "/assets/socials/league.svg" },
    steam: { bi: "steam" },
    roblox: { img: "/assets/socials/roblox.svg" },
    twitter: { bi: "twitter-x" },
    bluesky: { bi: "bluesky" },
    mastodon: { bi: "mastodon" },
    twitch: { bi: "twitch" },
    youtube: { bi: "youtube" },
    reddit: { bi: "reddit" },
    spotify: { bi: "spotify" },
    discord: { bi: "discord" },
    linkedin: { bi: "linkedin" },
    domain: { bi: "globe" },
  };
  function connIcon(type: string): string {
    const def = CONNECTION_ICON[String(type || "").toLowerCase()] || { bi: "globe" };
    if (def.img) {
      return (
        '<img class="pc-conn-ic" src="' +
        esc(def.img) +
        '" alt="' +
        esc(type) +
        '" title="' +
        esc(type) +
        '" loading="lazy" onerror="this.remove()">'
      );
    }
    return (
      '<i class="pc-conn-ic bi bi-' +
      esc(def.bi) +
      '" title="' +
      esc(type) +
      '" role="img" aria-label="' +
      esc(type) +
      '"></i>'
    );
  }
  function isRealName(v: unknown): boolean {
    if (v == null) return false;
    const n = String(v).trim().toLowerCase();
    return n !== "" && n !== "null" && n !== "undefined";
  }
  function renderConnections(accounts: Dict[] | undefined) {
    if (!connectionsEl) return;
    const list = (accounts || []).filter((a) => a && isRealName(a.name));
    if (!list.length) {
      connectionsEl.hidden = true;
      return;
    }
    connectionsEl.innerHTML = list
      .map((a) => {
        const maker = CONNECTION_URLS[a.type as string];
        const url = maker ? maker(a.name as string, a.id as string) : null;
        const inner =
          connIcon(a.type as string) +
          '<span class="pc-conn-name">' +
          esc(a.name) +
          "</span>" +
          (a.verified
            ? '<span class="pc-conn-check" title="Verified"><i class="bi bi-patch-check-fill" aria-hidden="true"></i></span>'
            : "");
        return url
          ? '<a class="pc-conn" href="' +
              esc(url) +
              '" target="_blank" rel="noopener">' +
              inner +
              "</a>"
          : '<span class="pc-conn">' + inner + "</span>";
      })
      .join("");
    connectionsEl.hidden = false;
  }

  // ---- album-art -> Catppuccin accent -------------------------------------
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
  let lastArtUrl: string | null = null;
  function resetAccent() {
    lastArtUrl = null;
    card.style.removeProperty("--dc-accent");
    card.classList.remove("has-accent");
  }
  function applyAccent(url: string) {
    if (!url || url === lastArtUrl) return;
    lastArtUrl = url;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
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
          resetAccent();
          return;
        }
        r = Math.round(r / count);
        gg = Math.round(gg / count);
        b = Math.round(b / count);
        const near = nearestAccent(r, gg, b);
        const rgb = near ? `${near.r}, ${near.g}, ${near.b}` : `${r}, ${gg}, ${b}`;
        card.style.setProperty("--dc-accent", rgb);
        card.classList.add("has-accent");
      } catch {
        resetAccent();
      }
    };
    img.onerror = resetAccent;
    img.src = url;
  }

  // ---- row builders -------------------------------------------------------
  function rowText(kind: string, title: string, sub: string, extra?: string): string {
    return (
      '<span class="pc-row-text">' +
      '<span class="pc-row-kind">' +
      esc(kind) +
      "</span>" +
      '<span class="pc-row-title">' +
      esc(title) +
      "</span>" +
      '<span class="pc-row-sub">' +
      esc(sub) +
      "</span>" +
      (extra || "") +
      "</span>"
    );
  }
  function customRow(a: Dict): HTMLElement {
    const row = document.createElement("div");
    row.className = "pc-row pc-custom";
    const eu = emojiUrl(a.emoji as { id?: string; animated?: boolean });
    row.innerHTML =
      (eu
        ? '<img class="pc-emoji" src="' + eu + '" alt="">'
        : '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>') +
      '<span class="pc-custom-text">' +
      esc(a.state || "") +
      "</span>";
    return row;
  }
  function spotifyRow(s: Dict): HTMLElement {
    const row = document.createElement("a") as HTMLAnchorElement;
    row.className = "pc-row pc-spotify";
    row.target = "_blank";
    row.rel = "noopener";
    row.href = s.track_id ? "https://open.spotify.com/track/" + s.track_id : "https://open.spotify.com/";
    if (s.album) row.title = (s.song || "") + " — " + s.album;
    const ts = s.timestamps as { start?: number; end?: number } | undefined;
    if (ts && ts.start) row.dataset.start = String(ts.start);
    if (ts && ts.end) row.dataset.end = String(ts.end);
    row.innerHTML =
      (s.album_art_url ? '<img class="pc-art" src="' + esc(s.album_art_url) + '" alt="">' : "") +
      rowText(
        "Listening to Spotify",
        (s.song as string) || "",
        (s.artist as string) || "",
        '<span class="pc-progress" aria-hidden="true">' +
          '<span class="pc-bar"><span class="pc-fill"></span></span>' +
          '<span class="pc-times"><span class="pc-cur">0:00</span><span class="pc-dur">0:00</span></span>' +
          "</span>",
      );
    return row;
  }
  function activityRow(a: Dict): HTMLElement {
    const isCode = /visual studio code|vscode/i.test((a.name as string) || "");
    const row = document.createElement("div");
    row.className = "pc-row pc-row--stack " + (isCode ? "pc-dev" : "pc-game");
    const ts = a.timestamps as { start?: number } | undefined;
    if (ts && ts.start) row.dataset.elapsedStart = String(ts.start);
    const assets = (a.assets as Dict) || {};
    const large = assets.large_image && assetUrl(a.application_id as string, assets.large_image as string);
    const small = assets.small_image && assetUrl(a.application_id as string, assets.small_image as string);
    const iconHtml = large
      ? '<span class="pc-ic-wrap">' +
        '<img class="pc-row-ic-img" src="' +
        esc(large) +
        '" alt="">' +
        (small
          ? '<img class="pc-ic-badge" src="' +
            esc(small) +
            '" alt="" title="' +
            esc(assets.small_text || "") +
            '" onerror="this.remove()">'
          : "") +
        "</span>"
      : '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>';
    let kind = isCode ? "Coding" : "Playing " + ((a.name as string) || "");
    const party = a.party as { size?: number[] } | undefined;
    if (party && party.size && party.size.length === 2 && party.size[1]) {
      kind += " · " + party.size[0] + " of " + party.size[1];
    }
    const main = document.createElement("div");
    main.className = "pc-row-link";
    main.innerHTML =
      iconHtml +
      rowText(
        kind,
        (a.details as string) || (isCode ? "" : (a.name as string)) || "",
        (a.state as string) || (assets.large_text as string) || "",
        '<span class="pc-row-elapsed"></span>',
      );
    row.appendChild(main);
    const buttons = a.buttons as (string | { label?: string })[] | undefined;
    if (buttons && buttons.length) {
      const bwrap = document.createElement("div");
      bwrap.className = "pc-buttons";
      buttons.forEach((label) => {
        const b = document.createElement("span");
        b.className = "pc-btn";
        b.textContent = typeof label === "string" ? label : label?.label || "Open";
        bwrap.appendChild(b);
      });
      row.appendChild(bwrap);
    }
    return row;
  }
  function streamRow(a: Dict): HTMLElement {
    const hasUrl = !!a.url;
    const row = document.createElement(hasUrl ? "a" : "div") as HTMLAnchorElement;
    row.className = "pc-row pc-stream";
    if (hasUrl) {
      row.target = "_blank";
      row.rel = "noopener";
      row.href = a.url as string;
    }
    const url = a.url as string | undefined;
    const platform = url && /twitch/i.test(url) ? "Twitch" : url && /youtube/i.test(url) ? "YouTube" : "Live";
    const assets = (a.assets as Dict) || {};
    const thumb = assets.large_image_url ? proxyImg(assets.large_image_url as string, { w: 240 }) : null;
    const iconHtml = thumb
      ? '<img class="pc-stream-thumb" src="' +
        esc(thumb) +
        "\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\" onerror=\"this.replaceWith(Object.assign(document.createElement('span'),{className:'pc-row-ic pc-dot'}))\">"
      : '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>';
    row.innerHTML =
      iconHtml +
      rowText("Streaming on " + platform, (a.details as string) || (a.name as string) || "", (a.state as string) || "");
    return row;
  }
  const NAME_FONTS: Record<number, string> = {
    3: "'DDN Sakura', cursive",
    4: "'DDN Jellybean', cursive",
    6: "'DDN Modern', sans-serif",
    7: "'DDN Medieval', serif",
    8: "'DDN 8Bit', monospace",
    10: "'DDN Vampyre', serif",
    11: "'DDN gg sans', sans-serif",
    12: "'DDN Tempo', serif",
  };

  // ---- render -------------------------------------------------------------
  function render(d: Dict | null) {
    if (!d) return;
    latest = d;
    const u = (d.discord_user as Dict) || {};
    const status = (d.discord_status as string) || "offline";
    const acts = (d.activities as Dict[]) || [];
    const isStreaming = acts.some((a) => a.type === 1);
    const effectiveStatus = isStreaming ? "streaming" : status;
    card.dataset.status = effectiveStatus;
    card.dataset.realStatus = status;
    if (statusTextEl) statusTextEl.textContent = STATUS_TITLE[effectiveStatus] || "Offline";

    avImg.src = avatarUrl(u as { id?: string; avatar?: string });
    const deco = u.avatar_decoration_data as { asset?: string; url?: string } | undefined;
    if (deco && (deco.url || deco.asset)) {
      avDeco.src = deco.url || `https://cdn.discordapp.com/avatar-decoration-presets/${deco.asset}.png`;
      avDeco.hidden = false;
    } else {
      avDeco.hidden = true;
    }
    nameEl.textContent =
      (u.display_name as string) || (u.global_name as string) || (u.username as string) || "Discord User";
    userEl.textContent = u.username ? "@" + u.username : "";

    const styles = u.display_name_styles as { colors?: number[]; font_id?: number } | undefined;
    const nameStyle = (nameEl as HTMLElement).style;
    if (styles && styles.colors && styles.colors.length) {
      const cols = styles.colors.map(intToHex);
      nameStyle.backgroundImage =
        "linear-gradient(90deg, " + (cols.length === 1 ? cols[0] + "," + cols[0] : cols.join(", ")) + ")";
      nameEl.classList.add("is-gradient");
    } else {
      nameStyle.backgroundImage = "";
      nameEl.classList.remove("is-gradient");
    }
    nameStyle.fontFamily = (styles && NAME_FONTS[styles.font_id as number]) || "";

    const pg = u.primary_guild as Dict | undefined;
    if (pg && pg.tag && pg.identity_enabled) {
      const badge = guildBadgeUrl(pg);
      tagEl.innerHTML =
        (badge ? '<img class="pc-tag-badge" src="' + badge + '" alt="" onerror="this.remove()">' : "") +
        '<span class="pc-tag-text">' +
        esc(pg.tag) +
        "</span>";
      tagEl.hidden = false;
    } else {
      tagEl.hidden = true;
    }

    platformsEl.innerHTML = platformIcons(d);
    lastFlags = (u.public_flags as number) || 0;
    paintBadges();

    const loc = g(d.kv, "location") as string | undefined;
    if (loc) {
      metaEl.innerHTML =
        '<span class="pc-pin" aria-hidden="true"><i class="bi bi-geo-alt-fill"></i></span>' + esc(loc);
      metaEl.hidden = false;
    } else {
      metaEl.hidden = true;
    }

    sections.innerHTML = "";
    if (customNode) {
      customNode.remove();
      customNode = null;
    }
    const custom = acts.find((a) => a.type === 4);
    if (custom && (custom.state || (custom.emoji && (custom.emoji as Dict).id))) {
      customNode = customRow(custom);
      idEl.appendChild(customNode);
    }
    card.classList.toggle("has-custom", !!customNode);

    if (d.listening_to_spotify && d.spotify) {
      sections.appendChild(spotifyRow(d.spotify as Dict));
      applyAccent((d.spotify as Dict).album_art_url as string);
    } else {
      resetAccent();
    }
    acts.filter((a) => a.type === 0).forEach((a) => sections.appendChild(activityRow(a)));
    acts.filter((a) => a.type === 1).forEach((a) => sections.appendChild(streamRow(a)));

    card.classList.toggle("has-sections", sections.children.length > 0);
    updateTimes();
    if (tzOffsetMin != null || sections.querySelector("[data-start], [data-elapsed-start]")) startTicker();
    else stopTicker();
    card.hidden = false;
  }

  function updateClock() {
    if (!timezoneEl || tzOffsetMin == null) return;
    const local = new Date(Date.now() + tzOffsetMin * 60000);
    const hh = String(local.getUTCHours()).padStart(2, "0");
    const mm = String(local.getUTCMinutes()).padStart(2, "0");
    timezoneEl.innerHTML = '<i class="bi bi-clock" aria-hidden="true"></i> ' + hh + ":" + mm;
  }
  function updateTimes() {
    updateClock();
    const sp = sections.querySelector(".pc-spotify[data-start][data-end]") as HTMLElement | null;
    if (sp) {
      const start = +sp.dataset.start!;
      const end = +sp.dataset.end!;
      if (end > start) {
        const elapsed = clamp(Date.now() - start, 0, end - start);
        const fill = sp.querySelector(".pc-fill") as HTMLElement | null;
        const cur = sp.querySelector(".pc-cur");
        const dur = sp.querySelector(".pc-dur");
        if (fill) fill.style.width = clamp((elapsed / (end - start)) * 100, 0, 100) + "%";
        if (cur) cur.textContent = fmt(elapsed);
        if (dur) dur.textContent = fmt(end - start);
      }
    }
    sections.querySelectorAll("[data-elapsed-start]").forEach((row) => {
      const lbl = row.querySelector(".pc-row-elapsed");
      if (lbl) lbl.textContent = elapsedStr(+(row as HTMLElement).dataset.elapsedStart!);
    });
  }
  function startTicker() {
    if (!ticker) ticker = setInterval(updateTimes, 1000);
  }
  function stopTicker() {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  const SELF_BASE = "https://doughmination.uk/v2/discord/users/";
  const SELF_POLL_MS = opts.pollMs || 20000;

  function mapSelfHostToPresence(j: SelfJson): Dict {
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
        id: u.id || DISCORD_USER_ID,
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

  function renderFromSelfHost(j: SelfJson) {
    const data = j.data || {};
    const u = (data.user as Dict) || {};
    const tz = data.timezone as { utc_offset_minutes?: number; timezone?: string } | undefined;
    if (tz && typeof tz.utc_offset_minutes === "number") {
      tzOffsetMin = tz.utc_offset_minutes;
      tzName = tz.timezone || null;
    } else {
      tzOffsetMin = null;
      tzName = null;
    }
    render(mapSelfHostToPresence(j));
    if (Array.isArray(data.badges) && (data.badges as Dict[]).length) doughBadges = data.badges as Dict[];
    clientBadges = Array.isArray(data.clientBadges) ? (data.clientBadges as Dict[]) : null;
    paintBadges();
    if (Array.isArray(u.theme_colors)) applyProfileGradient(u.theme_colors as number[]);
    applyBanner(
      bannerUrl((u.id as string) || DISCORD_USER_ID || "", u.banner as string),
      typeof u.accent_color === "number" ? intToHex(u.accent_color as number) : null,
    );
    renderBio(u.bio);
    renderConnections(data.connected_accounts as Dict[]);
    if (pronounsEl) {
      const pron = (u.pronouns as string) || (data.pronoundb as string) || "";
      if (pron) {
        pronounsEl.textContent = pron;
        pronounsEl.hidden = false;
      } else {
        pronounsEl.hidden = true;
      }
    }
    if (timezoneEl) {
      if (tzOffsetMin != null) {
        updateClock();
        const off = tzOffsetMin;
        const sign = off >= 0 ? "+" : "-";
        const oh = String(Math.floor(Math.abs(off) / 60)).padStart(2, "0");
        const om = String(Math.abs(off) % 60).padStart(2, "0");
        (timezoneEl as HTMLElement).title = (tzName ? tzName + " " : "") + "(UTC" + sign + oh + ":" + om + ")";
        timezoneEl.hidden = false;
      } else {
        timezoneEl.hidden = true;
      }
    }
    if (premiumEl) {
      const prem = u.premium as Dict | undefined;
      const NITRO_LABEL: Record<string, string> = { nitro: "Nitro", classic: "Nitro Classic", basic: "Nitro Basic" };
      let html = "";
      if (prem) {
        const label = NITRO_LABEL[prem.type as string];
        if (label) {
          const since = prem.since ? " · since " + fmtSinceDate(prem.since as string) : "";
          html += '<span class="pc-nitro" title="' + esc(label + since) + '">' + esc(label) + "</span>";
        }
        if (prem.guild_since) {
          html +=
            '<span class="pc-boost" title="' +
            esc("Boosting since " + fmtSinceDate(prem.guild_since as string)) +
            '" aria-label="Server booster"><i class="bi bi-gem" aria-hidden="true"></i></span>';
        }
      }
      if (html) {
        premiumEl.innerHTML = html;
        premiumEl.hidden = false;
      } else {
        premiumEl.hidden = true;
      }
    }
    wishlistItems = Array.isArray(data.wishlist) ? (data.wishlist as Dict[]) : null;
    if (card.classList.contains("show-wishlist")) renderWishlist();
  }

  let lastSelfJ: SelfJson | null = null;
  function loadSelfHosted(): Promise<boolean> {
    return fetch(SELF_BASE + DISCORD_USER_ID, { cache: "no-store" })
      .then((r) => (r.ok ? r.json().catch(() => null) : null))
      .then((j: SelfJson | null) => {
        if (!j || !j.success || !j.data || !j.data.user) return false;
        lastSelfJ = j;
        renderFromSelfHost(j);
        return true;
      })
      .catch(() => false);
  }
  function pollSelfHost() {
    if (!document.hidden) loadSelfHosted();
  }

  if (DISCORD_USER_ID) {
    if (window.DM) {
      loadSelfHosted();
      const off = window.DM.on("presence:" + DISCORD_USER_ID, (v: unknown) => {
        const data = g(v, "data") as Dict | undefined;
        if (!data || !lastSelfJ || !lastSelfJ.data) return;
        lastSelfJ.data.presence = data;
        renderFromSelfHost(lastSelfJ);
      });
      if (typeof off === "function") dmOff = off;
    } else {
      loadSelfHosted();
      selfTimer = setInterval(pollSelfHost, SELF_POLL_MS);
    }
  }

  const onVis = () => {
    if (!document.hidden && latest) updateTimes();
  };
  document.addEventListener("visibilitychange", onVis);

  // teardown handle for React unmount (stashed on the element)
  (card as unknown as { __destroy?: () => void }).__destroy = () => {
    stopTicker();
    if (selfTimer) clearInterval(selfTimer);
    if (dmOff) dmOff();
    document.removeEventListener("visibilitychange", onVis);
  };
  return card;
}

export function destroyCard(el: HTMLElement | null) {
  (el as unknown as { __destroy?: () => void })?.__destroy?.();
}
