// main.js — merged Discord presence module (formerly discord.js + friends.js).
//
// Part 1: the PresenceCard factory (window.PresenceCard) + the owner's own
//         card, auto-mounted on #my-discord with a hardcoded DUID.
// Part 2: the friends/alts grid, auto-mounted on #friends-discord, built
//         from the FRIENDS list using the same factory.
//
// HTML usage:
//   <div id="my-discord"></div>        -> single full presence card (owner)
//   <div id="friends-discord"></div>   -> friend/alt grid of mini cards

(function () {
  "use strict";

  // ---- who are we showing? ------------------------------------------------
  function valid(id) { return typeof id === "string" && /^\d{5,25}$/.test(id); }
  function resolveUserId() {
    const path = location.pathname.match(/\/api\/(\d{5,25})(?:[\/?#]|$)/);
    if (path) return path[1];
    const qs = new URLSearchParams(location.search);
    const q = qs.get("u") || qs.get("id") || qs.get("user");
    if (valid(q)) return q;
    if (/^#\d{5,25}$/.test(location.hash)) return location.hash.slice(1);
    const script = document.currentScript || document.querySelector("script[data-user]");
    if (script && script.dataset && valid(script.dataset.user)) return script.dataset.user;
    const m = document.getElementById("discord");
    if (m && m.dataset && valid(m.dataset.user)) return m.dataset.user;
    if (valid(window.DISCORD_USER_ID)) return window.DISCORD_USER_ID;
    return null;
  }

  // Build one presence card. Used full-size on /discord, and as small clones
  // on /cool-people (opts.mini). Options:
  //   userId       Discord id to show (defaults to resolveUserId())
  //   mount        element to replace with the card (defaults to #discord)
  //   mini         true → adds .is-mini for smaller styling
  //   tier / link  friend tier class + optional website link on the name
  //   pollMs       presence refresh cadence (default 20s)
  //   fallbackName / fallbackImg
  //                shown immediately, and kept if the API has no data for them
  //                (lets ID-less / dead alts still render a card)
  function createPresenceCard(opts) {
    opts = opts || {};
    const DISCORD_USER_ID = opts.userId || resolveUserId();
    const mount = opts.mount || document.getElementById("discord");
    if (!mount) return null;
    if (!DISCORD_USER_ID && !opts.fallbackName) return null;

    // ---- theme: only on standalone api pages (homepage uses data-flavor) ----
    if (!document.documentElement.getAttribute("data-flavor")) {
      const t = new URLSearchParams(location.search).get("theme");
      const themes = ["mocha", "macchiato", "frappe", "latte"];
      if (!document.documentElement.getAttribute("data-theme")) {
        document.documentElement.setAttribute("data-theme", themes.indexOf(t) >= 0 ? t : "mocha");
      }
    }

    // ---- build the card -----------------------------------------------------
    const card = document.createElement("div");
    // Only the single owner card claims id="discord" (core.js + the gold-cat
    // observer key off it). Mini friend cards must not duplicate the id.
    if (!opts.mini) card.id = "discord";
    card.className = "presence-card" + (opts.mini ? " is-mini" : "") + (opts.tier ? " tier-" + opts.tier : "");
    // Discord cards default to gg sans (Discord's own font) instead of the page's
    // Comic Code. Per-name display fonts (set on .pc-name below) still override this.
    card.style.fontFamily = "'DDN gg sans', sans-serif";
    card.hidden = true;
    card.innerHTML =
      '<img class="pc-banner" alt="" referrerpolicy="no-referrer" hidden>' +
      '<div class="pc-head">' +
      '<span class="pc-avatar">' +
      '<img class="pc-av-img" alt="" referrerpolicy="no-referrer" crossorigin="anonymous">' +
      '<img class="pc-av-deco" alt="" aria-hidden="true" hidden>' +
      '<span class="pc-status" aria-hidden="true"></span>' +
      '</span>' +
      '<span class="pc-id">' +
      '<span class="pc-name-row">' +
      '<span class="pc-name"></span>' +
      '<span class="pc-tag" hidden></span>' +
      '</span>' +
      '<span class="pc-sub-row">' +
      '<span class="pc-user"></span>' +
      '<span class="pc-status-text"></span>' +
      '<span class="pc-pronouns" hidden></span>' +
      '<span class="pc-platforms" aria-hidden="true"></span>' +
      '</span>' +
      '<span class="pc-meta" hidden></span>' +
      '<span class="pc-badges" aria-hidden="true"></span>' +
      '</span>' +
      '<button class="pc-star" type="button" aria-label="show wishlist" title="wishlist">★</button>' +
      '</div>' +
      '<div class="pc-bio" hidden></div>' +
      '<div class="pc-connections" hidden></div>' +
      '<div class="pc-sections"></div>' +
      '<div class="pc-wishlist" id="pc-wishlist"></div>';
    mount.replaceWith(card);

    const avImg = card.querySelector(".pc-av-img");
    const avDeco = card.querySelector(".pc-av-deco");
    const nameEl = card.querySelector(".pc-name");
    const tagEl = card.querySelector(".pc-tag");
    const userEl = card.querySelector(".pc-user");
    const platformsEl = card.querySelector(".pc-platforms");
    const statusTextEl = card.querySelector(".pc-status-text");
    const STATUS_TITLE = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline" };
    const metaEl = card.querySelector(".pc-meta");
    const badgesEl = card.querySelector(".pc-badges");
    const sections = card.querySelector(".pc-sections");
    const idEl = card.querySelector(".pc-id");
    const starBtn = card.querySelector(".pc-star");
    const wishlistEl = card.querySelector(".pc-wishlist");
    const bannerEl = card.querySelector(".pc-banner");
    const bioEl = card.querySelector(".pc-bio");
    const connectionsEl = card.querySelector(".pc-connections");
    const pronounsEl = card.querySelector(".pc-pronouns");

    // ---- friend-card extras: name link + instant placeholder ----------------
    // Optional website link on the name (friends can have a personal site).
    if (opts.link) {
      nameEl.classList.add("pc-name--link");
      nameEl.setAttribute("role", "link");
      nameEl.setAttribute("tabindex", "0");
      const goLink = function () { window.open(opts.link, "_blank", "noopener"); };
      nameEl.addEventListener("click", goLink);
      nameEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goLink(); }
      });
    }
    // Seed a placeholder so the card shows instantly (and remains for ID-less or
    // offline dead alts the API can't fill). render() overwrites it on success.
    if (opts.fallbackName) {
      nameEl.textContent = opts.fallbackName;
      avImg.src = opts.fallbackImg || avatarUrl({ id: DISCORD_USER_ID });
      card.dataset.status = "offline";
      card.hidden = false;
    }
    // Optional @username sub-row for ID-less placeholder cards (e.g. dead alts
    // whose display name differs from their actual username). render() will
    // overwrite this with the live username if/when real API data comes in.
    if (opts.fallbackUser) {
      userEl.textContent = "@" + opts.fallbackUser;
    }

    // ---- wishlist (revealed by the star) ------------------------------------
    // Items come straight from the Doughmination Restful API (j.data.wishlist):
    // each is a resolved Shop item { sku_id, type, name, static_image_url,
    // animated_image_url, video_url, label, is_owned, price, visibility }.
    let wishlistItems = null;
    const WL_TYPE_LABEL = {
      avatar_decoration: "Decoration",
      profile_effect: "Effect",
      nameplate: "Nameplate",
      bundle: "Bundle",
      variants_group: "Variants",
      external_sku: "Item"
    };
    const CURRENCY_SYMBOL = { gbp: "£", usd: "$", eur: "€", aud: "A$", cad: "C$" };
    function fmtPrice(p) {
      if (!p || typeof p.amount !== "number") return null;
      const exp = typeof p.exponent === "number" ? p.exponent : 2;
      const v = (p.amount / Math.pow(10, exp)).toFixed(exp);
      const sym = CURRENCY_SYMBOL[(p.currency || "").toLowerCase()];
      return sym ? sym + v : v + " " + String(p.currency || "").toUpperCase();
    }
    // Pick a thumbnail and decide whether the wsrv webp proxy is safe: avatar
    // decorations and profile effects are animated APNGs the proxy mangles (the
    // same reason the avatar decoration loads raw), so those go straight to the
    // CDN; nameplates and the rest are static and proxy fine.
    function wlImg(w) {
      const url = w.static_image_url || w.animated_image_url;
      if (!url) return null;
      if (w.type === "avatar_decoration" || w.type === "profile_effect" || /avatar-decoration-presets/.test(url)) {
        return url;
      }
      return proxyImg(url, { w: 64 }) || url;
    }
    function renderWishlist() {
      if (!wishlistEl) return;
      const items = Array.isArray(wishlistItems) ? wishlistItems : [];
      let body;
      if (items.length) {
        body = items.map(function (w) {
          const ic = wlImg(w);
          const typeLabel = WL_TYPE_LABEL[w.type] || "";
          const price = fmtPrice(w.price);
          return '<span class="pc-wl-item' + (w.is_owned ? " is-owned" : "") + '">' +
            (ic ? '<img class="pc-wl-ic" src="' + esc(ic) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "") +
            '<span class="pc-wl-text">' +
            '<span class="pc-wl-name">' + esc(w.name || "Collectible") + "</span>" +
            (typeLabel ? '<span class="pc-wl-type">' + esc(typeLabel) + "</span>" : "") +
            "</span>" +
            (price ? '<span class="pc-wl-price">' + esc(price) + "</span>" : "") +
            "</span>";
        }).join("");
      } else {
        body = '<p class="pc-wl-empty">nothing on the wishlist yet ✨</p>';
      }
      wishlistEl.innerHTML = '<div class="pc-wishlist-title">Wishlist</div>' + body;
    }
    if (starBtn) {
      starBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const open = card.classList.toggle("show-wishlist");
        starBtn.classList.toggle("on", open);
        starBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) renderWishlist();
      });
    }

    let latest = null;
    let customNode = null;
    let ticker = null;
    let ws = null;
    let heartbeat = null;
    let reconnectDelay = 1000;

    // ---- small helpers ------------------------------------------------------
    function fmt(ms) {
      const total = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    function elapsedStr(start) {
      const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return h ? `${h}h ${m}m` : `${m}m`;
    }
    function clamp(n, lo, hi) { return Math.min(Math.max(n, lo), hi); }

    // pages.gay is a static host with no server-side compute, so we can't run
    // our own proxy. wsrv.nl is a free, cookieless image CDN: it re-serves the
    // image with no Set-Cookie (killing the third-party __cf_bm cookie) and can
    // convert to WebP on the fly. `opts` lets callers request a resize.
    function proxyImg(url, opts) {
      if (!url) return url;
      if (!/^https:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(url)) return url;
      const src = url.replace(/^https:\/\//, "");
      let q = "https://wsrv.nl/?url=" + encodeURIComponent(src) + "&output=webp";
      if (opts && opts.w) q += "&w=" + opts.w + "&dpr=2&fit=cover";
      return q;
    }

    function avatarUrl(u) {
      if (!u || !u.avatar) return proxyImg("https://cdn.discordapp.com/embed/avatars/0.png");
      const ext = String(u.avatar).startsWith("a_") ? "gif" : "png";
      return proxyImg(`https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=128`, { w: 80 });
    }
    function emojiUrl(e) {
      if (!e || !e.id) return null;
      return proxyImg(`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}?size=32`);
    }
    function assetUrl(appId, asset) {
      if (!asset) return null;
      if (String(asset).startsWith("mp:")) return proxyImg("https://media.discordapp.net/" + asset.slice(3));
      return proxyImg(`https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`);
    }
    function esc(str) {
      return String(str == null ? "" : str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function intToHex(n) {
      return "#" + (Number(n) >>> 0).toString(16).padStart(6, "0").slice(-6);
    }
    function guildBadgeUrl(pg) {
      if (!pg || !pg.badge || !pg.identity_guild_id) return null;
      return proxyImg(`https://cdn.discordapp.com/guild-tag-badges/${pg.identity_guild_id}/${pg.badge}.png?size=24`);
    }
    const PLATFORM_ICONS = {
      desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/></svg>',
      mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
      web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>'
    };
    function platformIcons(d) {
      let html = "";
      if (d.active_on_discord_desktop) html += '<span class="pc-plat" title="Desktop">' + PLATFORM_ICONS.desktop + "</span>";
      if (d.active_on_discord_mobile) html += '<span class="pc-plat" title="Mobile">' + PLATFORM_ICONS.mobile + "</span>";
      if (d.active_on_discord_web || d.active_on_discord_embedded) html += '<span class="pc-plat" title="Web">' + PLATFORM_ICONS.web + "</span>";
      return html;
    }
    const BADGE_FLAGS = [
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
      [1 << 22, "Active Developer", "6bdc42827a38498929a4920da12695d9"]
    ];
    function renderBadges(flags) {
      flags = Number(flags) || 0;
      let html = "";
      for (const [bit, name, hash] of BADGE_FLAGS) {
        if (flags & bit) {
          html += '<img class="pc-badge" src="' + proxyImg("https://cdn.discordapp.com/badge-icons/" + hash + ".png") +
            '" alt="' + esc(name) + '" title="' + esc(name) + '" onerror="this.remove()">';
        }
      }
      return html;
    }

    // Rich Discord badges (Nitro, boosts, quests, orbs… everything Discord
    // actually shows, which public_flags alone can't give) — resolved
    // server-side by the Doughmination Restful API, same source as the rest
    // of the profile data.
    let doughBadges = null;
    // Third-party client-mod badges (Vencord/Equicord/Aliucord/etc, via the
    // worker's data.clientBadges — separate from Discord's own badges above).
    let clientBadges = null;
    let lastFlags = 0;
    function renderDoughBadges() {
      return doughBadges.map(function (b) {
        const img = '<img class="pc-badge" data-badge-id="' + esc(b.id) + '" src="' + proxyImg("https://cdn.discordapp.com/badge-icons/" + esc(b.icon) + ".png") +
          '" alt="' + esc(b.description || b.id) + '" title="' + esc(b.description || b.id) + '" onerror="this.remove()">';
        return b.link
          ? '<a class="pc-badge-link" tabindex="-1" href="' + esc(b.link) + '" target="_blank" rel="noopener">' + img + "</a>"
          : img;
      }).join("");
    }
    // These come from an unofficial third-party aggregator (not Discord
    // itself), so they're rendered in their own pass with their own class
    // (.pc-badge--client) rather than mixed indistinguishably into the
    // regular badge markup.
    function renderClientBadges() {
      if (!clientBadges || !clientBadges.length) return "";
      return clientBadges.map(function (b) {
        return '<img class="pc-badge pc-badge--client" data-badge-id="' + esc(b.id) + '" src="' + esc(b.icon_url) +
          '" alt="' + esc(b.tooltip || "") + '" title="' + esc(b.tooltip || "") + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">';
      }).join("");
    }
    function paintBadges() {
      if (!badgesEl) return;
      badgesEl.innerHTML = (doughBadges && doughBadges.length ? renderDoughBadges() : renderBadges(lastFlags)) + renderClientBadges();
    }
    function rgbTriplet(n) {
      n = Number(n) >>> 0;
      return ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
    }
    function applyProfileGradient(colors) {
      if (!colors || colors.length < 2) return;
      card.style.setProperty("--pc-grad-1-rgb", rgbTriplet(colors[0]));
      card.style.setProperty("--pc-grad-2-rgb", rgbTriplet(colors[1]));
      card.classList.add("has-profile-grad");
    }
    // ---- banner / bio / connected accounts (extras for the /discord page) ---
    function bannerUrl(id, hash) {
      if (!id || !hash) return null;
      // Animated banners (a_) must be requested WITHOUT the .gif extension:
      // Discord's CDN throws HTTP 415 for some a_*.gif banners, but the
      // extension-less URL works (wsrv then re-serves it as cookieless webp).
      const animated = String(hash).startsWith("a_");
      const url = "https://cdn.discordapp.com/banners/" + id + "/" + hash + (animated ? "" : ".png") + "?size=600";
      return proxyImg(url, { w: 600 });
    }
    function applyBanner(url, fallbackColor) {
      if (!bannerEl) return;
      if (url) {
        bannerEl.src = url;
        bannerEl.hidden = false;
        bannerEl.onerror = function () { bannerEl.hidden = true; card.classList.remove("has-banner"); };
        card.classList.add("has-banner");
      } else if (fallbackColor) {
        bannerEl.hidden = true;
        card.style.setProperty("--pc-banner-color", fallbackColor);
        card.classList.add("has-banner-color");
      }
    }
    function renderBio(text) {
      if (!bioEl) return;
      if (text && String(text).trim()) {
        bioEl.textContent = String(text).trim();
        bioEl.hidden = false;
      } else {
        bioEl.hidden = true;
      }
    }
    // Best-effort profile links for the common connection types.
    const CONNECTION_URLS = {
      tiktok: function (n) { return "https://tiktok.com/@" + n; },
      ebay: function (n) { return "https://www.ebay.com/usr/" + n; },
      instagram: function (n) { return "https://www.instagram.com/" + n; },
      xbox: function (n) { return "https://www.xbox.com/en-GB/play/user/" + n; },
      github: function (n) { return "https://github.com/" + n; },
      roblox: function (n, id) { return "https://www.roblox.com/users/" + id + "/profile"; },
      epicgames: function (n, id) { return "https://store.epicgames.com/u/" + id; },
      twitter: function (n) { return "https://twitter.com/" + n; },
      twitch: function (n) { return "https://twitch.tv/" + n; },
      youtube: function (n, id) { return "https://youtube.com/channel/" + id; },
      spotify: function (n, id) { return "https://open.spotify.com/user/" + id; },
      steam: function (n, id) { return "https://steamcommunity.com/profiles/" + id; },
      reddit: function (n) { return "https://reddit.com/user/" + n; },
      instagram: function (n) { return "https://instagram.com/" + n; },
      domain: function (n) { return "https://" + n; },
      bluesky: function (n) { return "https://bsky.app/profile/" + n; }
    };
    // connection type -> brand SVG in /assets/socials (anything unmapped uses
    // the generic globe "site.svg")
    const CONNECTION_ICON = {
      "amazon-music": "amazon",
      facebook: "facebook",
      ebay: "ebay",
      tiktok: "tiktok",
      bungie: "bungie", //
      playstation: "playstation",
      paypal: "paypal",
      instagram: "instagram",
      xbox: "xbox",
      crunchyroll: "crunchyroll",
      battlenet: "battlenet",
      github: "github",
      epicgames: "epic",
      riotgames: "riot",
      leagueoflegends: "league",
      steam: "steam",
      roblox: "roblox",
      twitter: "twitter",
      bluesky: "bluesky",
      mastodon: "mastodon",
      twitch: "twitch",
      youtube: "youtube",
      reddit: "reddit",
      spotify: "spotify",
      discord: "discord",
      linkedin: "linkedin",
      domain: "site"
    };
    function connIcon(type) {
      const file = CONNECTION_ICON[String(type || "").toLowerCase()] || "site";
      return '<img class="pc-conn-ic" src="/assets/socials/' + file + '.svg" alt="' +
        esc(type) + '" title="' + esc(type) + '" loading="lazy" onerror="this.remove()">';
    }
    function renderConnections(accounts) {
      if (!connectionsEl) return;
      const list = (accounts || []).filter(function (a) { return a && a.name; });
      if (!list.length) { connectionsEl.hidden = true; return; }
      connectionsEl.innerHTML = list.map(function (a) {
        const maker = CONNECTION_URLS[a.type];
        const url = maker ? maker(a.name, a.id) : null;
        const inner = connIcon(a.type) +
          '<span class="pc-conn-name">' + esc(a.name) + "</span>" +
          (a.verified ? '<span class="pc-conn-check" title="Verified">✓</span>' : "");
        return url
          ? '<a class="pc-conn" href="' + esc(url) + '" target="_blank" rel="noopener">' + inner + "</a>"
          : '<span class="pc-conn">' + inner + "</span>";
      }).join("");
      connectionsEl.hidden = false;
    }

    // ---- album-art → Catppuccin accent --------------------------------------
    const ACCENT_VARS = [
      "rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach",
      "yellow", "green", "teal", "sky", "saphire", "blue", "lavender",
    ];
    function hexToRgb(hex) {
      hex = hex.trim().replace("#", "");
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      const n = parseInt(hex, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function getThemePalette() {
      const cs = getComputedStyle(document.documentElement);
      const pal = [];
      for (const name of ACCENT_VARS) {
        const v = cs.getPropertyValue("--" + name).trim();
        if (v.startsWith("#")) { const [r, g, b] = hexToRgb(v); pal.push({ r, g, b }); }
      }
      return pal;
    }
    function nearestAccent(r, g, b) {
      const pal = getThemePalette();
      let best = null, bestD = Infinity;
      for (const c of pal) {
        const rm = (r + c.r) / 2, dr = r - c.r, dg = g - c.g, db = b - c.b;
        const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
        if (d < bestD) { bestD = d; best = c; }
      }
      return best;
    }
    let lastArtUrl = null;
    function applyAccent(url) {
      if (!url || url === lastArtUrl) return;
      lastArtUrl = url;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 16;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, 16, 16);
          const { data } = ctx.getImageData(0, 0, 16, 16);
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 125) continue;
            const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            if (lum < 24 || lum > 235) continue;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
          if (!count) { resetAccent(); return; }
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          const near = nearestAccent(r, g, b);
          const rgb = near ? `${near.r}, ${near.g}, ${near.b}` : `${r}, ${g}, ${b}`;
          card.style.setProperty("--dc-accent", rgb);
          card.classList.add("has-accent");
          // Only the full-size card recolours the whole page; mini friend cards
          // keep their accent local so they don't fight over --accent-rgb.
          if (!opts.mini) document.documentElement.style.setProperty("--accent-rgb", rgb);
        } catch (e) { resetAccent(); }
      };
      img.onerror = resetAccent;
      img.src = url;
    }
    function resetAccent() {
      lastArtUrl = null;
      card.classList.remove("has-accent");
      card.style.removeProperty("--dc-accent");
      if (!opts.mini) document.documentElement.style.removeProperty("--accent-rgb");
    }

    // ---- section (row) builders --------------------------------------------
    function rowText(kind, title, sub, extra) {
      return (
        '<span class="pc-row-text">' +
        '<span class="pc-row-kind">' + esc(kind) + "</span>" +
        '<span class="pc-row-title">' + esc(title) + "</span>" +
        '<span class="pc-row-sub">' + esc(sub) + "</span>" +
        (extra || "") +
        "</span>"
      );
    }

    function customRow(a) {
      const row = document.createElement("div");
      row.className = "pc-row pc-custom";
      const eu = emojiUrl(a.emoji);
      row.innerHTML =
        (eu ? '<img class="pc-emoji" src="' + eu + '" alt="">'
          : '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>') +
        '<span class="pc-custom-text">' + esc(a.state || "") + "</span>";
      return row;
    }

    function spotifyRow(s) {
      const row = document.createElement("a");
      row.className = "pc-row pc-spotify";
      row.target = "_blank";
      row.rel = "noopener";
      row.href = s.track_id ? "https://open.spotify.com/track/" + s.track_id : "https://open.spotify.com/";
      if (s.album) row.title = (s.song || "") + " — " + s.album;
      if (s.timestamps && s.timestamps.start) row.dataset.start = s.timestamps.start;
      if (s.timestamps && s.timestamps.end) row.dataset.end = s.timestamps.end;
      row.innerHTML =
        (s.album_art_url ? '<img class="pc-art" src="' + esc(s.album_art_url) + '" alt="">' : "") +
        rowText("Listening to Spotify", s.song || "", s.artist || "",
          '<span class="pc-progress" aria-hidden="true">' +
          '<span class="pc-bar"><span class="pc-fill"></span></span>' +
          '<span class="pc-times"><span class="pc-cur">0:00</span><span class="pc-dur">0:00</span></span>' +
          "</span>");
      return row;
    }

    // Generic activity row (type 0). Discord presence exposes no link for
    // games or apps, so this renders as a non-clickable card.
    function activityRow(a) {
      const isCode = /visual studio code|vscode/i.test(a.name || "");
      const row = document.createElement("div");
      row.className = "pc-row pc-row--stack " + (isCode ? "pc-dev" : "pc-game");
      if (a.timestamps && a.timestamps.start) row.dataset.elapsedStart = a.timestamps.start;

      const large = a.assets && a.assets.large_image && assetUrl(a.application_id, a.assets.large_image);
      const small = a.assets && a.assets.small_image && assetUrl(a.application_id, a.assets.small_image);
      const iconHtml = large
        ? '<span class="pc-ic-wrap">' +
        '<img class="pc-row-ic-img" src="' + esc(large) + '" alt="">' +
        (small ? '<img class="pc-ic-badge" src="' + esc(small) + '" alt="" title="' + esc(a.assets.small_text || "") + '" onerror="this.remove()">' : "") +
        "</span>"
        : '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>';

      let kind = isCode ? "Coding" : "Playing " + (a.name || "");
      if (a.party && a.party.size && a.party.size.length === 2 && a.party.size[1]) {
        kind += " · " + a.party.size[0] + " of " + a.party.size[1];
      }

      const main = document.createElement("div");
      main.className = "pc-row-link";
      main.innerHTML = iconHtml +
        rowText(kind, a.details || (isCode ? "" : a.name) || "",
          a.state || (a.assets && a.assets.large_text) || "",
          '<span class="pc-row-elapsed"></span>');
      row.appendChild(main);

      // Discord only exposes button *labels* (not URLs) via presence, so these
      // are shown as plain (non-clickable) chips.
      if (a.buttons && a.buttons.length) {
        const bwrap = document.createElement("div");
        bwrap.className = "pc-buttons";
        a.buttons.forEach(function (label) {
          const b = document.createElement("span");
          b.className = "pc-btn";
          b.textContent = typeof label === "string" ? label : (label && label.label) || "Open";
          bwrap.appendChild(b);
        });
        row.appendChild(bwrap);
      }
      return row;
    }

    function streamRow(a) {
      const hasUrl = !!a.url;
      const row = document.createElement(hasUrl ? "a" : "div");
      row.className = "pc-row pc-stream";
      if (hasUrl) {
        row.target = "_blank";
        row.rel = "noopener";
        row.href = a.url;
      }
      const platform = (a.url && /twitch/i.test(a.url)) ? "Twitch"
        : (a.url && /youtube/i.test(a.url)) ? "YouTube" : "Live";
      row.innerHTML =
        '<span class="pc-row-ic pc-dot" aria-hidden="true"></span>' +
        rowText("Streaming on " + platform, a.details || a.name || "", a.state || "");
      return row;
    }

    // Discord display-name fonts (display_name_styles.font_id) -> our @font-face
    // families in css/fonts.css. Only ids we have a look-alike for are mapped;
    // any other id falls back to the card's normal font. (Comments = Discord's
    // underlying font; "verify" = best-guess pairing with your file names.)
    const NAME_FONTS = {
      3: "'DDN Sakura', cursive",       // 3 CHERRY_BOMB
      4: "'DDN Jellybean', cursive",    // 4 CHICLE
      6: "'DDN Modern', sans-serif",    // 6 MUSEO_MODERNO
      7: "'DDN Medieval', serif",       // 7 NEO_CASTEL
      8: "'DDN 8Bit', monospace",       // 8 PIXELIFY
      10: "'DDN Vampyre', serif",       // 10 SINISTRE
      11: "'DDN gg sans', sans-serif",  // 11 DEFAULT (Discord's normal font)
      12: "'DDN Tempo', serif",         // 12 ZILLA_SLAB
    };

    // ---- render -------------------------------------------------------------
    function render(d) {
      if (!d) return;
      latest = d;

      const u = d.discord_user || {};
      const status = d.discord_status || "offline";
      card.dataset.status = status;
      if (statusTextEl) statusTextEl.textContent = STATUS_TITLE[status] || "Offline";

      avImg.src = avatarUrl(u);
      const deco = u.avatar_decoration_data;
      if (deco && deco.asset) {
        // Load decorations straight from Discord's CDN: they're animated APNGs,
        // and the wsrv webp proxy fails on them (and would drop the animation).
        avDeco.src = `https://cdn.discordapp.com/avatar-decoration-presets/${deco.asset}.png`;
        avDeco.hidden = false;
      } else {
        avDeco.hidden = true;
      }
      nameEl.textContent = u.display_name || u.global_name || u.username || "Discord User";
      userEl.textContent = u.username ? "@" + u.username : "";

      const styles = u.display_name_styles;
      if (styles && styles.colors && styles.colors.length) {
        const cols = styles.colors.map(intToHex);
        nameEl.style.backgroundImage = "linear-gradient(90deg, " + (cols.length === 1 ? cols[0] + "," + cols[0] : cols.join(", ")) + ")";
        nameEl.classList.add("is-gradient");
      } else {
        nameEl.style.backgroundImage = "";
        nameEl.classList.remove("is-gradient");
      }
      // Custom display-name font from Discord's font_id (falls back to the
      // card's normal font when there's no style or no look-alike for that id).
      nameEl.style.fontFamily = (styles && NAME_FONTS[styles.font_id]) || "";

      const pg = u.primary_guild;
      if (pg && pg.tag && pg.identity_enabled) {
        const badge = guildBadgeUrl(pg);
        tagEl.innerHTML = (badge ? '<img class="pc-tag-badge" src="' + badge + '" alt="" onerror="this.remove()">' : "") +
          '<span class="pc-tag-text">' + esc(pg.tag) + "</span>";
        tagEl.hidden = false;
      } else {
        tagEl.hidden = true;
      }

      platformsEl.innerHTML = platformIcons(d);

      lastFlags = u.public_flags || 0;
      paintBadges();

      const loc = d.kv && d.kv.location;
      if (loc) {
        metaEl.innerHTML = '<span class="pc-pin" aria-hidden="true">📍</span>' + esc(loc);
        metaEl.hidden = false;
      } else {
        metaEl.hidden = true;
      }

      const acts = d.activities || [];

      sections.innerHTML = "";

      // The custom status renders in the identity column, directly under the
      // name, so its thought-bubble tail rises to the username (Discord-style)
      // — rather than down in the activity list.
      if (customNode) { customNode.remove(); customNode = null; }
      const custom = acts.find((a) => a.type === 4);
      if (custom && (custom.state || (custom.emoji && custom.emoji.id))) {
        customNode = customRow(custom);
        idEl.appendChild(customNode);
      }
      card.classList.toggle("has-custom", !!customNode);

      if (d.listening_to_spotify && d.spotify) {
        sections.appendChild(spotifyRow(d.spotify));
        applyAccent(d.spotify.album_art_url);
      } else {
        resetAccent();
      }

      acts.filter((a) => a.type === 0).forEach((a) => sections.appendChild(activityRow(a)));
      acts.filter((a) => a.type === 1).forEach((a) => sections.appendChild(streamRow(a)));

      card.classList.toggle("has-sections", sections.children.length > 0);
      updateTimes();
      if (sections.querySelector("[data-start], [data-elapsed-start]")) startTicker();
      else stopTicker();

      card.hidden = false;
    }

    // ---- time tickers (progress bar + elapsed labels) -----------------------
    function updateTimes() {
      const sp = sections.querySelector(".pc-spotify[data-start][data-end]");
      if (sp) {
        const start = +sp.dataset.start, end = +sp.dataset.end;
        if (end > start) {
          const elapsed = clamp(Date.now() - start, 0, end - start);
          const fill = sp.querySelector(".pc-fill");
          const cur = sp.querySelector(".pc-cur");
          const dur = sp.querySelector(".pc-dur");
          if (fill) fill.style.width = clamp((elapsed / (end - start)) * 100, 0, 100) + "%";
          if (cur) cur.textContent = fmt(elapsed);
          if (dur) dur.textContent = fmt(end - start);
        }
      }
      sections.querySelectorAll("[data-elapsed-start]").forEach((row) => {
        const lbl = row.querySelector(".pc-row-elapsed");
        if (lbl) lbl.textContent = elapsedStr(+row.dataset.elapsedStart);
      });
    }
    function startTicker() { if (!ticker) ticker = setInterval(updateTimes, 1000); }
    function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

    // ---- data source: Doughmination Restful API (sole source) ---------------
    // Returns presence + full profile (incl. theme_colors + display_name_styles)
    const SELF_BASE = "https://restful.doughmination.uk/v1/users/";
    const SELF_POLL_MS = opts.pollMs || 20000;   // presence refresh cadence
    let selfTimer = null;

    // self-host shape -> the presence-shaped object render() already understands
    function mapSelfHostToPresence(j) {
      const u = (j.data && j.data.user) || {};
      const p = (j.data && j.data.presence) || {};
      const plat = p.platform || {};
      const dec = u.avatar_decoration;
      const clan = u.clan;
      return {
        discord_user: {
          id: u.id || DISCORD_USER_ID,
          username: u.username,
          global_name: u.global_name,
          display_name: u.display_name,
          avatar: u.avatar,
          avatar_decoration_data: (dec && dec.asset) ? { asset: dec.asset } : null,
          primary_guild: (clan && clan.tag)
            ? { tag: clan.tag, identity_enabled: true, badge: clan.badge, identity_guild_id: clan.guild_id }
            : null,
          // carry the Nitro name styling through so render() can apply the
          // gradient + custom font (font_id) — without this it never reaches it
          display_name_styles: u.display_name_styles || null,
          public_flags: u.public_flags || 0
        },
        discord_status: p.status || (p.online ? "online" : "offline"),
        activities: p.activities || [],
        listening_to_spotify: !!p.listening_to_spotify,
        spotify: p.spotify || null,
        active_on_discord_desktop: !!plat.desktop,
        active_on_discord_mobile: !!plat.mobile,
        active_on_discord_web: !!plat.web,
        kv: {}
      };
    }

    function renderFromSelfHost(j) {
      const u = (j.data && j.data.user) || {};
      render(mapSelfHostToPresence(j));
      // badges arrive pre-resolved straight from the Doughmination Restful API
      if (Array.isArray(j.data.badges) && j.data.badges.length) {
        doughBadges = j.data.badges;
      }
      // Third-party client-mod badges (Vencord/Equicord/Aliucord/etc); kept
      // separate from doughBadges since it's a different, unofficial source.
      clientBadges = Array.isArray(j.data.clientBadges) ? j.data.clientBadges : null;
      paintBadges();
      // Nitro profile gradient — straight from the self-hosted API
      if (Array.isArray(u.theme_colors)) applyProfileGradient(u.theme_colors);
      // profile extras: banner rebuilt from the raw hash (dodges the animated
      // .gif 415), plus bio / connections / pronouns straight from the API
      applyBanner(
        bannerUrl(u.id || DISCORD_USER_ID, u.banner),
        (typeof u.accent_color === "number") ? intToHex(u.accent_color) : null
      );
      renderBio(u.bio);
      renderConnections(j.data.connected_accounts);
      if (pronounsEl) {
        if (u.pronouns) { pronounsEl.textContent = u.pronouns; pronounsEl.hidden = false; }
        else pronounsEl.hidden = true;
      }
      // wishlist: resolved Shop collectibles (null when the API couldn't load it).
      // Keep the panel live if it's already open when fresh data arrives.
      wishlistItems = Array.isArray(j.data.wishlist) ? j.data.wishlist : null;
      if (card.classList.contains("show-wishlist")) renderWishlist();
    }

    function loadSelfHosted() {
      return fetch(SELF_BASE + DISCORD_USER_ID, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
        .then(function (j) {
          // render whenever the API has the user; presence may be null (offline)
          if (!j || !j.success || !j.data || !j.data.user) return false;
          renderFromSelfHost(j);
          return true;
        })
        .catch(function () { return false; });
    }

    function pollSelfHost() {
      if (!document.hidden) loadSelfHosted();
    }

    // boot: poll the Doughmination Restful API (the only source now). ID-less
    // placeholder cards (e.g. dead alts) keep their seeded look — no fetch.
    if (DISCORD_USER_ID) {
      loadSelfHosted();
      selfTimer = setInterval(pollSelfHost, SELF_POLL_MS);
    }

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && latest) updateTimes();
    });

    return card;
  }  // ---- end createPresenceCard ----

  // Expose the factory so other pages (e.g. /cool-people) can build cards.
  window.PresenceCard = createPresenceCard;

  // ---- the owner's own DUID, hardcoded so #my-discord never needs a query
  // string / data attribute to know who to show. ----------------------------
  var MY_DISCORD_USER_ID = "1464890289922641993";

  // Auto-mount the standalone card whenever its placeholder exists.
  // #my-discord is the current mount point (see homepage / discord page).
  // #discord is kept for backwards compatibility with older markup.
  var myMount = document.getElementById("my-discord");
  if (myMount) {
    createPresenceCard({ mount: myMount, userId: MY_DISCORD_USER_ID });
  } else if (document.getElementById("discord")) {
    createPresenceCard({});
  }
})();

(function friends() {
  "use strict";

  /* Each friend is rendered as a full — but smaller — presence card, built by
   * the shared factory above (window.PresenceCard). Cards pull live
   * presence (status, activity, badges, banner, bio, connections, wishlist…)
   * from the same Doughmination Restful API the main card uses.
   * NOTE: now lives in the same file as the factory (formerly discord.js),
   * so load order is no longer a concern — this IIFE just runs second. */

  var FRIENDS = [
    {
      title: "Fiancée",
      members: [
        { name: "Aria", tier: "wife", discordId: "1305215902685597797", link: null }
      ]
    },
    {
      title: "Close Friends",
      members: [
        { name: "Ari", tier: "close", discordId: "1474568910736199825", link: "https://a.stupid.cat" },
        // { name: "Lilly", tier: "close", discordId: "908055723659898902", link: null }, // Currently commented out as she's blocked me and idk if I should keep her displayed </3
        { name: "Ria", tier: "close", discordId: "1513506390088618145", link: null },
        { name: "Camilla", tier: "close", discordId: "1110542429838397471", link: "https://cammy-the-cat.com" },
        { name: "Saphie", tier: "close", discordId: "527709099186716673", link: null }
      ]
    },
    {
      title: "Friends",
      members: [
        { name: "Meme", tier: "friend", discordId: "812998699667161098", link: null },
        { name: "N", tier: "friend", discordId: "639399972407869450", link: null },
        { name: "Lylla", tier: "friend", discordId: "1009889543878611016", link: null },
        { name: "Simon", tier: "friend", discordId: "758466783354814514", link: null }
      ]
    },
    {
      title: "Other Peeps",
      subtitle: "You can request to be added here!",
      members: [
        { name: "furi", tier: "known", discordId: "781445370177126401", link: "https://furina.is-a.dev" },
        { name: "pokemon", tier: "known", discordId: "784443338627612673", link: "https://devmatei.com/" }
      ]
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
        { name: "Mrow", user: "arisgayasswife", img: "/assets/alts/mrow.png", tier: "dead-alt", discordId: "219480349053288450", link: null }
      ]
    }
  ];

  var FRIEND_POLL_MS = 60000; // re-poll each live friend once a minute

  var root = document.getElementById("friends-discord");
  if (!root) return;

  // title → URL-safe anchor id, e.g. "Close Friends" -> "close-friends"
  function slugify(str) {
    return String(str == null ? "" : str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  var make = window.PresenceCard;
  if (typeof make !== "function") {
    console.error("friends.js: window.PresenceCard is missing — load /js/discord.js before /js/friends.js");
  }

  // ---- render ---------------------------------------------------------
  FRIENDS.forEach(function (group) {
    var section = document.createElement("section");
    section.className = "section";
    section.id = slugify(group.title); // anchor target, e.g. #alts
    // gg sans (Discord's font) as the default for the whole friends widget —
    // group headers, subtitles and the cards inside — over the page's Comic Code.
    section.style.fontFamily = "'DDN gg sans', sans-serif";

    var h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.textContent = group.title;
    section.appendChild(h2);

    if (group.subtitle) {
      var sub = document.createElement("p");
      sub.className = "section-subtitle";
      sub.textContent = group.subtitle;
      section.appendChild(sub);
    }

    var grid = document.createElement("div");
    grid.className = "friend-grid";

    group.members.forEach(function (m) {
      // placeholder slot — the factory replaces it with the finished card
      var slot = document.createElement("div");
      grid.appendChild(slot);

      // Always show the friendly name; for ID-less (dead alt) entries that
      // also have a stored `user`, show that as the @username sub-row too.
      if (typeof make === "function") {
        make({
          mount: slot,
          userId: m.discordId || null, // null → static placeholder card (dead alts)
          mini: true,                  // smaller styling + keeps page accent local
          pollMs: FRIEND_POLL_MS,
          tier: m.tier || null,
          link: m.link || null,
          fallbackName: m.name,        // shown instantly + kept if the API has no data
          fallbackUser: (!m.discordId && m.user) ? m.user : null,
          fallbackImg: m.img || null
        });
      } else {
        // hard fallback: at least show the name if the factory didn't load
        slot.className = "presence-card is-mini" + (m.tier ? " tier-" + m.tier : "");
        slot.dataset.status = "offline";
        slot.textContent = m.name;
      }
    });

    section.appendChild(grid);
    root.appendChild(section);
  });

  // ---- jump to anchor (sections are built after page load) ------------
  function scrollToHash() {
    var id = (location.hash || "").slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (target) target.scrollIntoView();
  }
  scrollToHash();
  window.addEventListener("hashchange", scrollToHash);
})();