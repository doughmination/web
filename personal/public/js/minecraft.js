// minecraft.js — Minecraft account cards, built the same way the guilds grid
// is: a config list of { role, uid } pairs (source of truth lives in
// src/app/minecraft/page.tsx and is handed over on window.__MC_ACCOUNTS__),
// each resolved live via the Doughmination Restful API and rendered into
// #my-minecraft. Clicking a card opens a detail pop-out with everything the
// API knows about that account (plus a Hypixel stats placeholder).
//
// HTML usage:
//   <div id="my-minecraft"></div>
//
// API: GET https://doughmination.uk/v2/minecraft/general/:uuid
//   -> { success: true, data: {
//        uuid, uuid_short, name, skin_url, skin_model, cape_url,
//        render: { face, face_flat, head, head_flat, body, body_flat,
//                  player, player_flat, combo, skin },
//        updated_at
//      } }
//   Renders come from mc-heads.net; the URL grammar is
//   /{type}/{uuid}/{size}/{overlay}, e.g. /player/<uid>/360/nohelm.

(function () {
  "use strict";

  var API_BASE = "https://doughmination.uk/v2/minecraft/general/";
  var MC_HEADS = "https://mc-heads.net/";

  // Source of truth is the MC_UUIDS array in page.tsx, serialized onto the
  // window by a PageScripts inline entry that runs just before this file.
  var ACCOUNTS = Array.isArray(window.__MC_ACCOUNTS__) ? window.__MC_ACCOUNTS__ : [];

  // Friendly label + accent (a Catppuccin theme var name) per role. Anything
  // not listed here falls back to the "alt" styling.
  var ROLE_META = {
    main:    { label: "Main",   accent: "saphire" },
    furina:  { label: "Furina", accent: "sky" },
    rose:    { label: "Rose",   accent: "pink" },
    luna:    { label: "Luna",   accent: "teal" },
    uzi:     { label: "Uzi",    accent: "mauve" },
    alt:     { label: "Alt",    accent: "maroon" },
  };

  var root = document.getElementById("my-minecraft");
  if (!root) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shortUuid(uid) { return String(uid || "").replace(/-/g, ""); }
  function roleMeta(role) { return ROLE_META[role] || ROLE_META.alt; }

  // Base render URL for a card, preferring the API's own render.* URLs and
  // falling back to a constructed mc-heads URL (used before the fetch lands).
  function baseRender(state, kind) {
    var r = state.data && state.data.render;
    if (r && r[kind]) return r[kind];
    return MC_HEADS + kind + "/" + state.uid;
  }
  // Re-grammar an mc-heads render URL with a size and optional no-helm overlay:
  //   /{type}/{uuid}[/{size}][/nohelm]
  function renderUrl(base, size, flat) {
    if (!base) return base;
    var u = base.replace(/\/+$/, "").replace(/\/nohelm$/, "");
    if (size) u += "/" + size;
    if (flat) u += "/nohelm";
    return u;
  }

  // Normalize capes to a { url, name } list. Handles today's single `cape_url`
  // string, the upcoming array form (`capes` or `cape_url` as an array), and
  // array items that are either plain URL strings or objects.
  function capeList(d) {
    var c = d && (d.capes != null ? d.capes : d.cape_url);
    if (!c) return [];
    var arr = Array.isArray(c) ? c : [c];
    return arr.map(function (x) {
      if (typeof x === "string") return { url: x, name: null };
      if (x && typeof x === "object") return { url: x.url || x.cape_url || x.texture || null, name: x.name || x.title || x.source || null };
      return null;
    }).filter(function (x) { return x && x.url; });
  }

  // The cape URLs are raw cape/elytra texture sheets, not rendered models. The
  // visible cape face is the (1,1)→10x16 block, so crop just that region onto a
  // canvas — nearest-neighbour so it stays crisp. Vanilla Minecraft cape sheets
  // are a 64x32 grid (2:1), but OptiFine capes use a 46x22 grid (~2.09:1), so
  // the horizontal scale differs; pick the grid from the texture's aspect.
  var CAPE_W = 60, CAPE_H = 96; // display px, 10:16 cape proportions
  function capeGridWidth(w, h) {
    var ratio = w / h;
    return Math.abs(ratio - 46 / 22) < Math.abs(ratio - 64 / 32) ? 46 : 64;
  }
  function drawCapeFront(canvas, url) {
    var img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onload = function () {
      var scale = img.naturalWidth / capeGridWidth(img.naturalWidth, img.naturalHeight);
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 1 * scale, 1 * scale, 10 * scale, 16 * scale, 0, 0, canvas.width, canvas.height);
    };
    img.src = url;
  }

  // ---- injected styles (keeps this page free of its own .css file) ----------
  var style = document.createElement("style");
  style.textContent = [
    "#my-minecraft{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;width:100%;max-width:960px;margin:0 auto}",
    ".mc-card{display:flex;flex-direction:column;align-items:center;gap:.6rem;padding:1.1rem 1rem 1.2rem;border-radius:14px;background:var(--surface0,#313244);border:1px solid var(--surface1,#45475a);text-decoration:none;color:var(--text,#cdd6f4);box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}",
    ".mc-card:hover,.mc-card:focus-visible{transform:translateY(-3px);box-shadow:0 8px 22px rgba(0,0,0,.28);outline:none}",
    ".mc-role{align-self:flex-start;font-size:.72rem;font-weight:600;letter-spacing:.03em;padding:.15rem .55rem;border-radius:999px;color:var(--base,#1e1e2e)}",
    ".mc-body{height:150px;width:auto}",
    ".mc-name{font-weight:600;font-size:1rem;text-align:center;word-break:break-word}",
    ".mc-cape{font-size:.72rem;color:var(--subtext0,#a6adc8)}",
    // modal
    ".mc-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.25rem;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .16s ease}",
    ".mc-overlay.is-open{opacity:1;pointer-events:auto}",
    ".mc-dialog{position:relative;width:100%;max-width:460px;max-height:90vh;overflow:auto;background:var(--base,#1e1e2e);border:1px solid var(--surface1,#45475a);border-radius:18px;padding:1.4rem;box-shadow:0 20px 60px rgba(0,0,0,.5);transform:translateY(12px) scale(.98);transition:transform .16s ease}",
    ".mc-overlay.is-open .mc-dialog{transform:none}",
    ".mc-close{position:absolute;top:.8rem;right:.8rem;width:30px;height:30px;border:none;border-radius:50%;background:var(--surface0,#313244);color:var(--text,#cdd6f4);font-size:1.1rem;line-height:1;cursor:pointer}",
    ".mc-close:hover{background:var(--surface1,#45475a)}",
    ".mc-d-head{display:flex;gap:1rem;align-items:center;margin-bottom:1rem}",
    ".mc-hero{height:190px;width:auto;flex:none}",
    ".mc-d-title{display:flex;flex-direction:column;gap:.4rem;min-width:0}",
    ".mc-skull{width:52px;height:52px;flex:none}",
    ".mc-d-name{font-size:1.3rem;font-weight:700;word-break:break-word}",
    ".mc-d-role{align-self:flex-start;font-size:.72rem;font-weight:600;letter-spacing:.03em;padding:.15rem .6rem;border-radius:999px;color:var(--base,#1e1e2e)}",
    ".mc-hat{align-self:flex-start;cursor:pointer;font:inherit;font-size:.75rem;padding:.3rem .6rem;border-radius:8px;border:1px solid var(--surface1,#45475a);background:var(--surface0,#313244);color:var(--text,#cdd6f4)}",
    ".mc-hat:hover{background:var(--surface1,#45475a)}",
    ".mc-rows{display:flex;flex-direction:column;gap:.5rem;margin:.25rem 0 1rem}",
    ".mc-row{display:flex;justify-content:space-between;gap:1rem;font-size:.85rem;padding:.4rem .65rem;border-radius:9px;background:var(--surface0,#313244)}",
    ".mc-row-k{color:var(--subtext0,#a6adc8)}",
    ".mc-row-v{font-family:var(--mono,ui-monospace,monospace);word-break:break-all;text-align:right}",
    ".mc-copy{cursor:pointer;border:none;background:none;color:inherit;font:inherit;text-align:right;padding:0}",
    ".mc-copy:hover{color:var(--mauve,#cba6f7)}",
    ".mc-tex{display:flex;gap:.75rem;margin-bottom:1rem}",
    ".mc-tex figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:.3rem}",
    ".mc-tex img,.mc-tex canvas{image-rendering:pixelated;background:var(--surface0,#313244);border-radius:8px;border:1px solid var(--surface1,#45475a)}",
    ".mc-cape-cv{width:60px;height:96px}",
    ".mc-tex figcaption{font-size:.7rem;color:var(--subtext0,#a6adc8)}",
    ".mc-section-t{font-size:.8rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--subtext0,#a6adc8);margin:0 0 .5rem}",
    ".mc-soon{padding:1rem;border-radius:12px;border:1px dashed var(--surface1,#45475a);background:var(--surface0,#313244);color:var(--subtext0,#a6adc8);text-align:center;font-size:.9rem;margin-bottom:1rem}",
    ".mc-namemc{display:inline-block;width:100%;box-sizing:border-box;text-align:center;padding:.65rem;border-radius:10px;background:var(--surface0,#313244);color:var(--text,#cdd6f4);text-decoration:none;font-weight:600;font-size:.9rem}",
    ".mc-namemc:hover{background:var(--surface1,#45475a)}",
    // The shared body is a centered flex column, so .presence-stage sizes to its
    // content and the grid overflows the viewport on narrow screens (4 columns
    // spilling off-screen). Pin the stage to full width so the grid lays out
    // against the viewport instead of its own content width.
    ".presence-stage{width:100%;box-sizing:border-box}",
    // Phones: tighten padding, allow 2 columns, and top-align so the shared
    // vertical centering doesn't clip the top rows off-screen.
    "@media (max-width:480px){" +
      ".presence-stage{padding:10px;justify-content:flex-start}" +
      ".presence-intro{max-width:100%}" +
      "#my-minecraft{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.65rem}" +
    "}",
  ].join("\n");
  document.head.appendChild(style);

  // ---- shared modal (built once, reused for every card) ---------------------
  var overlay = document.createElement("div");
  overlay.className = "mc-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="mc-dialog">' +
      '<button class="mc-close" type="button" aria-label="Close">✕</button>' +
      '<div class="mc-d-head">' +
        '<img class="mc-hero" alt="" referrerpolicy="no-referrer">' +
        '<div class="mc-d-title">' +
          '<img class="mc-skull" alt="head" referrerpolicy="no-referrer">' +
          '<span class="mc-d-role"></span>' +
          '<span class="mc-d-name"></span>' +
          '<button class="mc-hat" type="button"></button>' +
        '</div>' +
      '</div>' +
      '<div class="mc-tex"></div>' +
      '<div class="mc-rows"></div>' +
      '<div class="mc-section-t">Hypixel Stats</div>' +
      '<div class="mc-soon">Coming soon ✨</div>' +
      '<a class="mc-namemc" target="_blank" rel="noopener noreferrer">View on NameMC ↗</a>' +
    '</div>';
  document.body.appendChild(overlay);

  var dlg = {
    hero: overlay.querySelector(".mc-hero"),
    skull: overlay.querySelector(".mc-skull"),
    role: overlay.querySelector(".mc-d-role"),
    name: overlay.querySelector(".mc-d-name"),
    hat: overlay.querySelector(".mc-hat"),
    tex: overlay.querySelector(".mc-tex"),
    rows: overlay.querySelector(".mc-rows"),
    namemc: overlay.querySelector(".mc-namemc"),
  };
  var currentState = null;
  var showHat = true;
  var lastFocus = null;

  // full-body "player" render is the modal hero and "head" is the skull; the
  // hat toggle swaps both to their /nohelm overlay so the second (hat) layer is
  // dropped from the body and the head in step.
  function updateRenders() {
    if (!currentState) return;
    dlg.hero.src = renderUrl(baseRender(currentState, "player"), 360, !showHat);
    dlg.skull.src = renderUrl(baseRender(currentState, "head"), 104, !showHat);
    dlg.hat.textContent = showHat ? "🎩 Hide hat layer" : "🎩 Show hat layer";
  }
  dlg.hat.addEventListener("click", function () { showHat = !showHat; updateRenders(); });

  function openModal(state) {
    currentState = state;
    showHat = true;
    var d = state.data;
    var meta = roleMeta(state.cfg.role);
    var accent = "var(--" + meta.accent + ")";

    dlg.role.textContent = meta.label;
    dlg.role.style.background = accent;
    dlg.name.textContent = d.name || "Loading…";
    dlg.namemc.href = "https://namemc.com/profile/" + encodeURIComponent(state.uid);
    updateRenders();

    // texture previews: skin as its raw sheet, capes cropped to the cape face
    var capes = capeList(d);
    dlg.tex.innerHTML = d.skin_url
      ? '<figure><img src="' + esc(d.skin_url) + '" alt="skin texture" width="80" height="80" referrerpolicy="no-referrer"><figcaption>Skin</figcaption></figure>'
      : "";
    var dpr = window.devicePixelRatio || 1;
    capes.forEach(function (c, i) {
      var label = c.name
        ? c.name.charAt(0).toUpperCase() + c.name.slice(1)
        : (capes.length > 1 ? "Cape " + (i + 1) : "Cape");
      var fig = document.createElement("figure");
      var cv = document.createElement("canvas");
      cv.className = "mc-cape-cv";
      cv.width = CAPE_W * dpr;
      cv.height = CAPE_H * dpr;
      var cap = document.createElement("figcaption");
      cap.textContent = label;
      fig.appendChild(cv);
      fig.appendChild(cap);
      dlg.tex.appendChild(fig);
      drawCapeFront(cv, c.url);
    });
    dlg.tex.hidden = !d.skin_url && capes.length === 0;

    // data rows
    var dashed = d.uuid || state.cfg.uid;
    var capeVal = capes.length === 0 ? "None" : capes.length === 1 ? "Yes" : capes.length + " capes";
    var rows = [
      ["Username", esc(d.name || "—")],
      ["Skin model", esc(d.skin_model ? (d.skin_model === "slim" ? "Slim (Alex)" : "Classic (Steve)") : "—")],
      [capes.length > 1 ? "Capes" : "Cape", capeVal],
    ];
    var rowsHtml = rows.map(function (r) {
      return '<div class="mc-row"><span class="mc-row-k">' + r[0] + '</span><span class="mc-row-v">' + r[1] + "</span></div>";
    }).join("");
    // UUID row is click-to-copy
    rowsHtml +=
      '<div class="mc-row"><span class="mc-row-k">UUID</span>' +
      '<button class="mc-copy mc-row-v" type="button" title="Click to copy" data-copy="' + esc(dashed) + '">' + esc(dashed) + "</button></div>";
    dlg.rows.innerHTML = rowsHtml;

    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    overlay.querySelector(".mc-close").focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    var done = function () {
      overlay.hidden = true;
      overlay.removeEventListener("transitionend", done);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    overlay.addEventListener("transitionend", done);
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target.closest(".mc-close")) { closeModal(); return; }
    var copyBtn = e.target.closest(".mc-copy");
    if (copyBtn && navigator.clipboard) {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(function () { copyBtn.textContent = prev; }, 1200);
      }).catch(function () {});
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  // ---- build one account card ----------------------------------------------
  function createAccountCard(cfg) {
    var uid = shortUuid(cfg.uid);
    var meta = roleMeta(cfg.role);
    var accent = "var(--" + meta.accent + ")";

    // Seeded state, replaced/enriched when the fetch resolves. Clicking before
    // the fetch lands still opens the modal with what we have.
    var state = { uid: uid, cfg: cfg, data: { uuid: cfg.uid } };

    var card = document.createElement("a");
    card.className = "mc-card";
    card.style.borderTop = "3px solid " + accent;
    // Keep a real href for no-JS fallback, but intercept the click for the modal.
    card.href = "https://namemc.com/profile/" + encodeURIComponent(uid);
    card.dataset.uuid = uid;

    card.innerHTML =
      '<span class="mc-role" style="background:' + accent + '">' + esc(meta.label) + "</span>" +
      '<img class="mc-body" alt="" referrerpolicy="no-referrer" src="' + esc(renderUrl(baseRender(state, "body"), 300, false)) + '">' +
      '<span class="mc-name">' + esc(cfg.uid) + "</span>" +
      '<span class="mc-cape" hidden>🧣 has a cape</span>';

    card.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(state);
    });

    root.appendChild(card);

    var nameEl = card.querySelector(".mc-name");
    var bodyEl = card.querySelector(".mc-body");
    var capeEl = card.querySelector(".mc-cape");

    // Minecraft profile data barely changes, so a single fetch is enough
    // (no polling like the live Discord presence cards).
    fetch(API_BASE + encodeURIComponent(uid), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
      .then(function (j) {
        if (!j || !j.success || !j.data) return;
        state.data = j.data;
        if (j.data.name) nameEl.textContent = j.data.name;
        bodyEl.src = renderUrl(baseRender(state, "body"), 300, false);
        var capes = capeList(j.data);
        capeEl.hidden = capes.length === 0;
        capeEl.textContent = capes.length + (capes.length === 1 ? " cape" : " capes");
        // keep an open modal for this account in sync with the fresh data
        if (currentState === state && !overlay.hidden) openModal(state);
      })
      .catch(function () { /* keep the seeded placeholder */ });

    return card;
  }

  ACCOUNTS.forEach(createAccountCard);
})();
