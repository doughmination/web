/* location.js — homepage "location" card.
 * The devices feed (window.DM "devices") carries the iPhone's current location
 * (iPhone entry only). It may be a plain place-name string
 * ("Broxburn,Scotland,United Kingdom") or a map URL
 * ("https://maps.apple.com/?q=Broxburn"); a URL becomes a clickable link with
 * the place name pulled from its query. Hides itself when there's no location. */
(function locationCard() {
  "use strict";

  const mount = document.getElementById("location");
  if (!mount) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Treat real null/undefined AND the literal "null"/"undefined"/blank as absent. */
  function realText(v) {
    if (v == null) return "";
    const s = String(v).trim();
    const l = s.toLowerCase();
    return (l === "" || l === "null" || l === "undefined") ? "" : s;
  }

  /* "A,B,C" -> "A, B, C", dropping any empty/null-ish parts. */
  function fmtLocation(raw) {
    return String(raw)
      .split(",")
      .map(function (p) { return realText(p); })
      .filter(Boolean)
      .join(", ");
  }

  /* "3m ago" / "2h ago" / "just now" from an ISO timestamp. */
  function relTime(iso) {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "";
    let s = Math.round((Date.now() - t) / 1000);
    if (s < 0) s = 0;
    if (s < 45) return "just now";
    const m = Math.round(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + "h ago";
    const d = Math.round(h / 24);
    return d + "d ago";
  }

  /* ---- build the shell ---- */
  const card = document.createElement("section");
  card.id = "location";
  card.className = "location-card";
  card.hidden = true;
  card.setAttribute("aria-label", "Current location");
  card.innerHTML =
    '<div class="loc-head">' +
    '<i class="bi bi-geo-alt-fill" aria-hidden="true"></i>' +
    '<span class="loc-label">Location</span>' +
    '</div>' +
    '<div class="loc-body"></div>';
  mount.replaceWith(card);

  const bodyEl = card.querySelector(".loc-body");

  /* location may be a plain place-name string ("Broxburn,Scotland,UK") or a map
     URL ("https://maps.apple.com/?q=Broxburn"). Return { url, label } for both. */
  function parseLocation(v) {
    const raw = realText(v);
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) {
      let label = "";
      try {
        const u = new URL(raw);
        const q = u.searchParams.get("q") || u.searchParams.get("address") ||
          u.searchParams.get("ll") || "";
        label = fmtLocation(decodeURIComponent(q.replace(/\+/g, " ")));
        if (!label) label = u.hostname.replace(/^www\./, "");
      } catch (e) { label = "View on map"; }
      return { url: raw, label: label || "View on map" };
    }
    return { url: null, label: fmtLocation(raw) };
  }

  function render(data) {
    /* Location lives on the iPhone entry only. */
    const ip = data && typeof data === "object" ? data.iphone : null;
    const loc = parseLocation(ip && ip.location);
    if (!loc || !loc.label) { card.hidden = true; return; }

    const when = ip ? relTime(ip.updated_at) : "";
    const place = loc.url
      ? '<a class="loc-place loc-link" href="' + esc(loc.url) +
        '" target="_blank" rel="noopener noreferrer">' + esc(loc.label) +
        ' <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>'
      : '<span class="loc-place">' + esc(loc.label) + '</span>';

    bodyEl.innerHTML = place +
      (when ? '<span class="loc-when">' + esc(when) + '</span>' : '');
    card.hidden = false;
  }

  /* Same feed as devices.js — DM allows multiple subscribers per topic. */
  if (window.DM) {
    window.DM.on("devices", function (data) { render(data); });
  } else {
    fetch("https://doughmination.uk/v2/devices", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) render(j); })
      .catch(function () {});
  }
})();
