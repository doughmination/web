// guilds.js — server/guild cards, built the same way the friends grid is:
// a config list of { name, invite } pairs, each resolved live via the
// Doughmination Restful API and rendered into #my-guilds.
//
// HTML usage:
//   <div id="my-guilds"></div>
//
// API: GET https://restful.doughmination.uk/v1/guilds/:guildInvite
//   -> { success: true, data: {
//        id, name, icon_url, banner_url, splash_url,
//        description, member_count, online_count
//      } }

(function () {
  "use strict";

  // ---- which servers to show -----------------------------------------------
  // `invite` is the vanity/invite code used in the API path, e.g. for
  // discord.gg/TransRights you'd use "TransRights" here.
  var GUILDS = [
    { name: "Girls", invite: "TransRights" },
    { name: "Lanyard", invite: "Lanyard" },
    { name: "is-a.dev", invite: "is-a-dev-830872854677422150"},
    { name: "Furina Mains", invite: "focalorsmains" },
    { name: "Discord Previews", invite: "discord-603970300668805120" },
    { name: "Global Badges", invite: "JsgsS8kzz8" },
  ];

  var GUILD_BASE = "https://restful.doughmination.uk/v1/guilds/";
  var GUILD_POLL_MS = 60000; // member/online counts refresh cadence

  var root = document.getElementById("my-guilds");
  if (!root) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- build one guild card -------------------------------------------------
  function createGuildCard(cfg) {
    var card = document.createElement("a");
    card.className = "guild-card";
    card.href = "https://discord.gg/" + encodeURIComponent(cfg.invite);
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.dataset.invite = cfg.invite;
    card.hidden = true; // revealed once we have data (placeholder name shows instantly below)
    card.innerHTML =
      '<img class="gc-banner" alt="" referrerpolicy="no-referrer" hidden>' +
      '<div class="gc-head">' +
      '<img class="gc-icon" alt="" referrerpolicy="no-referrer" crossorigin="anonymous" hidden>' +
      '<span class="gc-icon-fallback" aria-hidden="true" hidden></span>' +
      '<div class="gc-id">' +
      '<span class="gc-name"></span>' +
      '<span class="gc-counts"></span>' +
      '</div>' +
      '</div>' +
      '<div class="gc-desc" hidden></div>';
    root.appendChild(card);

    // instant placeholder so the page doesn't feel empty while the fetch is in flight
    var nameEl = card.querySelector(".gc-name");
    nameEl.textContent = cfg.name;
    card.hidden = false;

    var iconEl = card.querySelector(".gc-icon");
    var iconFallbackEl = card.querySelector(".gc-icon-fallback");
    var bannerEl = card.querySelector(".gc-banner");
    var countsEl = card.querySelector(".gc-counts");
    var descEl = card.querySelector(".gc-desc");

    function withSize(url, size) {
    if (!url) return url;
    // Discord CDN accepts ?size=<power of 2, up to 4096>; swap/append it so
    // we always request a resolution big enough for the card, not whatever
    // default the API happened to return.
    return url.replace(/([?&])size=\d+/, "$1size=" + size) +
      (/[?&]size=\d+/.test(url) ? "" : (url.indexOf("?") === -1 ? "?" : "&") + "size=" + size);
  }

  function render(d) {
      nameEl.textContent = d.name || cfg.name;

      if (d.icon_url) {
        iconEl.src = withSize(d.icon_url, 256);
        iconEl.hidden = false;
        iconFallbackEl.hidden = true;
      } else {
        iconEl.hidden = true;
        iconFallbackEl.textContent = (d.name || cfg.name || "?").trim().charAt(0).toUpperCase();
        iconFallbackEl.hidden = false;
      }

      if (d.banner_url) {
        bannerEl.src = withSize(d.banner_url, 1024);
        bannerEl.hidden = false;
        card.classList.remove("gc-banner-fallback");
      } else {
        bannerEl.hidden = true;
        card.classList.add("gc-banner-fallback");
      }

      var parts = [];
      if (typeof d.online_count === "number") parts.push(d.online_count.toLocaleString() + " online");
      if (typeof d.member_count === "number") parts.push(d.member_count.toLocaleString() + " members");
      if (parts.length) {
        countsEl.innerHTML =
          (typeof d.online_count === "number" ? '<span class="gc-dot" aria-hidden="true"></span>' : "") +
          esc(parts.join(" · "));
        countsEl.hidden = false;
      } else {
        countsEl.hidden = true;
      }

      if (d.description) {
        descEl.textContent = d.description;
        descEl.hidden = false;
      } else {
        descEl.hidden = true;
      }
    }

    function load() {
      return fetch(GUILD_BASE + encodeURIComponent(cfg.invite), { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
        .then(function (j) {
          if (!j || !j.success || !j.data) return false;
          render(j.data);
          return true;
        })
        .catch(function () { return false; });
    }

    load();
    var timer = setInterval(function () {
      if (!document.hidden) load();
    }, GUILD_POLL_MS);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) load();
    });

    return card;
  }

  GUILDS.forEach(createGuildCard);
})();