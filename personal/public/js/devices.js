/* devices.js — homepage "devices" box.
 * Subscribes via window.DM (core.js) and renders each device: battery bar,
 * percentage, charging/low-power tags, wifi, and a relative "updated" time. */
(function devices() {
  "use strict";

  const mount = document.getElementById("devices");
  if (!mount) return;

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
    if (lvl == null) return "dev-unknown";
    if (lvl <= 20) return "dev-low";
    if (lvl <= 50) return "dev-mid";
    return "dev-ok";
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
  card.id = "devices";
  card.className = "devices-card";
  card.hidden = true;
  card.setAttribute("aria-label", "Device status");
  card.innerHTML =
    '<div class="dev-head">' +
    '<span class="dev-icon" aria-hidden="true"></span>' +
    '<span class="dev-label">Devices</span>' +
    '</div>' +
    '<div class="dev-rows"></div>';
  mount.replaceWith(card);

  const rowsEl = card.querySelector(".dev-rows");

  function rowHtml(d) {
    const lvl = clampLevel(d.level);
    const cls = levelClass(lvl);
    const charging = d.charging === true;
    const pct = lvl == null ? "—" : lvl + "%";
    const width = lvl == null ? 0 : lvl;
    const when = relTime(d.updated_at);

    /* Small meta chips shown under the bar. */
    const meta = [];
    if (charging) {
      meta.push('<span class="dev-tag dev-charging" title="Charging">⚡ Charging</span>');
    }
    if (d.lowPowerMode === true) {
      meta.push('<span class="dev-tag dev-lowpower" title="Low Power Mode">🔋 Low Power</span>');
    }
    if (d.wifi) {
      meta.push('<span class="dev-tag dev-wifi" title="Wi-Fi network">📶 ' + esc(d.wifi) + '</span>');
    }
    if (when) {
      meta.push('<span class="dev-when">' + esc(when) + '</span>');
    }

    return '<div class="dev-row ' + cls + (charging ? ' is-charging' : '') + '">' +
      '<div class="dev-main">' +
      '<span class="dev-name">' + esc(deviceName(d.device)) + '</span>' +
      '<span class="dev-track" role="img" aria-label="' + esc(pct) + (charging ? ", charging" : "") + '">' +
      '<span class="dev-fill" style="width: ' + width + '%"></span>' +
      '</span>' +
      '<span class="dev-pct">' + (charging ? '<span class="dev-bolt" aria-hidden="true">⚡</span>' : '') + esc(pct) + '</span>' +
      '</div>' +
      (meta.length ? '<div class="dev-meta">' + meta.join("") + '</div>' : '') +
      '</div>';
  }

  function render(data) {
    /* API returns an object keyed by device id: { iphone: {...}, ... }. */
    const list = data && typeof data === "object"
      ? Object.keys(data).map(function (k) {
          const v = data[k] || {};
          return {
            device: v.device || k,
            level: v.level,
            updated_at: v.updated_at,
            charging: v.charging,
            lowPowerMode: v.lowPowerMode,
            wifi: v.wifi,
          };
        })
      : [];
    if (!list.length) {
      rowsEl.innerHTML = '<span class="dev-empty">no devices reporting</span>';
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

  /* Subscribe via DM: fires with the current value, then on every change.
   * Page-scoped, so it auto-unsubscribes on navigation. */
  if (window.DM) {
    window.DM.on("devices", function (data) { render(data); });
  } else {
    /* No DM — one-shot fetch so the box still paints. */
    fetch("https://doughmination.uk/v2/devices", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) render(j); })
      .catch(function () {});
  }
})();
