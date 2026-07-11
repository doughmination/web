/* fronting.js
 *
 * Homepage "who's fronting" box. Polls the system's PluralKit-style API
 * for the current fronter(s) and renders a small card. Each member links
 * to their page on the system site. Refreshes every 30s so switches show
 * up without needing a reload. */
(function fronting() {
  "use strict";

  const mount = document.getElementById("fronting");
  if (!mount) return;

  const API = "https://doughmination.co.uk/api/fronters";
  const POLL_MS = 30000;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* member.color is a 6-char hex string with no leading #, and may be null. */
  function colorHex(c) {
    return /^[0-9a-fA-F]{6}$/.test(c || "") ? "#" + c : null;
  }

  /* ---- build the shell ---- */
  const card = document.createElement("section");
  card.id = "fronting";
  card.className = "fronting-card";
  card.hidden = true;
  card.setAttribute("aria-label", "Currently fronting");
  card.innerHTML =
    '<div class="fr-head">' +
    '<span class="fr-dot" aria-hidden="true"></span>' +
    '<span class="fr-label">Currently fronting</span>' +
    '</div>' +
    '<div class="fr-members"></div>';
  mount.replaceWith(card);

  const membersEl = card.querySelector(".fr-members");

  function memberHtml(m) {
    const name = m.display_name || m.name || "Unknown";
    const accent = colorHex(m.color);
    const av = m.avatar_url
      ? '<img class="fr-av" src="' + esc(m.avatar_url) + '" alt="" referrerpolicy="no-referrer" loading="lazy">'
      : '<span class="fr-av fr-av--empty" aria-hidden="true"></span>';
    const pronouns = m.pronouns
      ? '<span class="fr-pronouns">' + esc(m.pronouns) + '</span>' : "";
    return '<div class="fr-member"' +
      (accent ? ' style="--fr-accent: ' + accent + '"' : "") + '>' +
      av +
      '<span class="fr-meta">' +
      '<span class="fr-name">' + esc(name) + '</span>' +
      pronouns +
      '</span>' +
      '</div>';
  }

  function render(members) {
    if (!Array.isArray(members) || !members.length) {
      /* No one registered as fronting, keep the box up but say so. */
      membersEl.innerHTML = '<span class="fr-empty">no one is currently fronting</span>';
      card.hidden = false;
      return;
    }
    membersEl.innerHTML = members.map(memberHtml).join("");
    card.hidden = false;
  }

  let failed = false;
  function load() {
    fetch(API, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) throw new Error("bad response");
        render(j.members || []);
        failed = false;
      })
      .catch(function () {
        /* On the first failure, hide the box quietly. If it was already
         * showing, leave the last known fronters up instead of flashing
         * an error. */
        if (!failed && card.hidden) card.hidden = true;
        failed = true;
      });
  }

  load();
  const timer = setInterval(load, POLL_MS);
  /* Refresh immediately when the tab becomes visible again. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) load();
  });
  window.addEventListener("beforeunload", function () { clearInterval(timer); });
})();