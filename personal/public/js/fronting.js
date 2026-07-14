/* fronting.js
 *
 * Homepage "who's fronting" box. Subscribes to the shared realtime client
 * (window.DM, see realtime.js) for the current fronter(s) and renders a small
 * card. Switches arrive as live pushes over the site-wide socket; if that's
 * down, DM transparently falls back to polling /v2/plural/fronters (30s). */
(function fronting() {
  "use strict";

  const mount = document.getElementById("fronting");
  if (!mount) return;

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

  /* Subscribe via the shared realtime client. The handler fires immediately
   * with the current snapshot (if the socket already delivered one), then again
   * on every fronter change. DM.on is page-scoped: it auto-unsubscribes on soft
   * navigation, so nothing lingers after the homepage unmounts. */
  if (window.DM) {
    window.DM.on("fronters", function (data) {
      render((data && data.members) || []);
    });
  } else {
    /* realtime.js somehow absent — degrade to a single direct fetch so the box
     * still paints rather than staying hidden. */
    fetch("https://doughmination.uk/v2/plural/fronters", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) render(j.members || []); })
      .catch(function () {});
  }
})();