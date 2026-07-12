/* battery.js
 *
 * Homepage "device batteries" box. Polls the system's battery API for the
 * latest known level of each device and renders a small card, one row per
 * device with a fill bar, percentage and a relative "updated" timestamp.
 * Refreshes every 60s so levels stay roughly current without a reload. */
(function battery() {
  "use strict";

  const mount = document.getElementById("battery");
  if (!mount) return;

  const API = "https://doughmination.uk/v2/battery";
  const POLL_MS = 60000;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Clamp to a whole 0–100, or null if we can't make a number of it. */
  function clampLevel(n) {
    const v = Math.round(Number(n));
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : null;
  }

  /* Colour band: red when low, yellow when middling, green when healthy. */
  function levelClass(lvl) {
    if (lvl == null) return "bat-unknown";
    if (lvl <= 20) return "bat-low";
    if (lvl <= 50) return "bat-mid";
    return "bat-ok";
  }

  /* Friendly device labels; falls back to a capitalised device id. */
  const NAMES = { iphone: "iPhone", macbook: "MacBook", ipad: "iPad", pc: "PC" };
  function deviceName(id) {
    if (NAMES[id]) return NAMES[id];
    const s = String(id || "device");
    return s.charAt(0).toUpperCase() + s.slice(1);
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
  card.id = "battery";
  card.className = "battery-card";
  card.hidden = true;
  card.setAttribute("aria-label", "Device battery levels");
  card.innerHTML =
    '<div class="bat-head">' +
    '<span class="bat-icon" aria-hidden="true"></span>' +
    '<span class="bat-label">Device batteries</span>' +
    '</div>' +
    '<div class="bat-rows"></div>';
  mount.replaceWith(card);

  const rowsEl = card.querySelector(".bat-rows");

  function rowHtml(d) {
    const lvl = clampLevel(d.level);
    const cls = levelClass(lvl);
    const pct = lvl == null ? "—" : lvl + "%";
    const width = lvl == null ? 0 : lvl;
    const when = relTime(d.updated_at);
    return '<div class="bat-row ' + cls + '">' +
      '<span class="bat-name">' + esc(deviceName(d.device)) + '</span>' +
      '<span class="bat-track" role="img" aria-label="' + esc(pct) + '">' +
      '<span class="bat-fill" style="width: ' + width + '%"></span>' +
      '</span>' +
      '<span class="bat-pct">' + esc(pct) + '</span>' +
      (when ? '<span class="bat-when">' + esc(when) + '</span>' : '') +
      '</div>';
  }

  function render(data) {
    /* API returns an object keyed by device id: { iphone: {...}, ... }. */
    const list = data && typeof data === "object"
      ? Object.keys(data).map(function (k) {
          const v = data[k] || {};
          return { device: v.device || k, level: v.level, updated_at: v.updated_at };
        })
      : [];
    if (!list.length) {
      rowsEl.innerHTML = '<span class="bat-empty">no devices reporting</span>';
      card.hidden = false;
      return;
    }
    /* Stable order: highest charge first, then by name. */
    list.sort(function (a, b) {
      const la = clampLevel(a.level), lb = clampLevel(b.level);
      return (lb == null ? -1 : lb) - (la == null ? -1 : la) ||
        String(a.device).localeCompare(String(b.device));
    });
    rowsEl.innerHTML = list.map(rowHtml).join("");
    card.hidden = false;
  }

  let failed = false;
  function load() {
    fetch(API, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) throw new Error("bad response");
        render(j);
        failed = false;
      })
      .catch(function () {
        /* On the first failure, hide the box quietly. If it was already
         * showing, leave the last known levels up instead of flashing an
         * error. */
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
