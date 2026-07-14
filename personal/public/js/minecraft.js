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
  // skinview3d ships as a self-contained UMD bundle (Three.js included). It's
  // ~470KB, so it's copied into /js and lazy-loaded only when the 3D tab is
  // first opened rather than on every page load. On load it exposes the
  // `skinview3d` global.
  var SKINVIEW_SRC = "/js/skinview3d.bundle.js";
  var skinviewPromise = null;
  function loadSkinview() {
    if (window.skinview3d) return Promise.resolve(window.skinview3d);
    if (skinviewPromise) return skinviewPromise;
    skinviewPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = SKINVIEW_SRC;
      s.async = true;
      s.addEventListener("load", function () {
        if (window.skinview3d) resolve(window.skinview3d);
        else reject(new Error("skinview3d missing global"));
      }, { once: true });
      s.addEventListener("error", function () {
        skinviewPromise = null;
        reject(new Error("skinview3d failed to load"));
      }, { once: true });
      document.head.appendChild(s);
    });
    return skinviewPromise;
  }

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
  function cap(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }

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
    ".mc-d-head{display:flex;gap:.9rem;align-items:center;margin-bottom:1rem}",
    ".mc-hero{height:190px;width:auto;flex:none}",
    ".mc-d-title{display:flex;flex-direction:column;gap:.4rem;min-width:0}",
    ".mc-skull{width:52px;height:52px;flex:none}",
    ".mc-d-name{font-size:1.3rem;font-weight:700;word-break:break-word}",
    ".mc-d-role{align-self:flex-start;font-size:.72rem;font-weight:600;letter-spacing:.03em;padding:.15rem .6rem;border-radius:999px;color:var(--base,#1e1e2e)}",
    ".mc-hat{align-self:flex-start;cursor:pointer;font:inherit;font-size:.75rem;padding:.3rem .6rem;border-radius:8px;border:1px solid var(--surface1,#45475a);background:var(--surface0,#313244);color:var(--text,#cdd6f4)}",
    ".mc-hat:hover{background:var(--surface1,#45475a)}",
    // tabs
    ".mc-tabs{display:flex;gap:.35rem;margin-bottom:1rem;border-bottom:1px solid var(--surface1,#45475a)}",
    ".mc-tab{flex:1;cursor:pointer;font:inherit;font-size:.82rem;font-weight:600;padding:.55rem .4rem;border:none;background:none;color:var(--subtext0,#a6adc8);border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .12s ease,border-color .12s ease}",
    ".mc-tab:hover{color:var(--text,#cdd6f4)}",
    ".mc-tab.is-active{color:var(--text,#cdd6f4);border-bottom-color:var(--mauve,#cba6f7)}",
    ".mc-panel{display:none}",
    ".mc-panel.is-active{display:block}",
    ".mc-ext-hero{display:flex;flex-direction:column;align-items:center;gap:.6rem;margin-bottom:1rem}",
    // 3D viewer
    ".mc-3d-wrap{position:relative;display:flex;justify-content:center;align-items:center;min-height:400px;margin-bottom:.5rem}",
    ".mc-3d-canvas{max-width:100%;border-radius:12px;background:var(--surface0,#313244);border:1px solid var(--surface1,#45475a);cursor:grab;touch-action:none}",
    ".mc-3d-canvas:active{cursor:grabbing}",
    ".mc-3d-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--subtext0,#a6adc8);font-size:.9rem;pointer-events:none}",
    // A class-level `display:flex` outranks the UA [hidden] rule, so hide it
    // explicitly when the `hidden` attribute is set.
    ".mc-3d-loading[hidden]{display:none}",
    ".mc-3d-hint{text-align:center;font-size:.72rem;color:var(--subtext0,#a6adc8);margin:0 0 .75rem}",
    ".mc-ctl-group{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-bottom:.6rem}",
    // Zero-size full-width flex item: forces whatever follows onto a new line.
    ".mc-flex-break{flex-basis:100%;height:0;margin:0;padding:0;border:0}",
    ".mc-ctl-label{width:100%;text-align:center;font-size:.68rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--subtext0,#a6adc8);margin-bottom:.1rem}",
    ".mc-pill{cursor:pointer;font:inherit;font-size:.75rem;padding:.32rem .7rem;border-radius:999px;border:1px solid var(--surface1,#45475a);background:var(--surface0,#313244);color:var(--text,#cdd6f4);transition:background .12s ease,border-color .12s ease}",
    ".mc-pill:hover{background:var(--surface1,#45475a)}",
    ".mc-pill.is-active{background:var(--mauve,#cba6f7);border-color:var(--mauve,#cba6f7);color:var(--base,#1e1e2e)}",
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
        '<img class="mc-skull" alt="head" referrerpolicy="no-referrer">' +
        '<div class="mc-d-title">' +
          '<span class="mc-d-role"></span>' +
          '<span class="mc-d-name"></span>' +
        '</div>' +
      '</div>' +
      '<div class="mc-tabs" role="tablist">' +
        '<button class="mc-tab is-active" type="button" role="tab" data-tab="ext">Overview</button>' +
        '<button class="mc-tab" type="button" role="tab" data-tab="model">3D Model</button>' +
        '<button class="mc-tab" type="button" role="tab" data-tab="hypixel">Hypixel</button>' +
      '</div>' +
      '<div class="mc-panels">' +
        // --- Overview (the old extended view, minus Hypixel) ---
        '<div class="mc-panel is-active" data-panel="ext">' +
          '<div class="mc-ext-hero">' +
            '<img class="mc-hero" alt="" referrerpolicy="no-referrer">' +
            '<button class="mc-hat" type="button"></button>' +
          '</div>' +
          '<div class="mc-tex"></div>' +
          '<div class="mc-rows"></div>' +
          '<a class="mc-namemc" target="_blank" rel="noopener noreferrer">View on NameMC ↗</a>' +
        '</div>' +
        // --- 3D model ---
        '<div class="mc-panel" data-panel="model">' +
          '<div class="mc-3d-wrap">' +
            '<canvas class="mc-3d-canvas"></canvas>' +
            '<div class="mc-3d-loading">Loading 3D…</div>' +
          '</div>' +
          '<p class="mc-3d-hint">Drag to spin · scroll to zoom</p>' +
          '<div class="mc-cape-select mc-ctl-group"></div>' +
          '<div class="mc-anim-select mc-ctl-group"></div>' +
        '</div>' +
        // --- Hypixel ---
        '<div class="mc-panel" data-panel="hypixel">' +
          '<div class="mc-section-t">Hypixel Stats</div>' +
          '<div class="mc-soon">Coming soon ✨</div>' +
        '</div>' +
      '</div>' +
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
    canvas: overlay.querySelector(".mc-3d-canvas"),
    loading: overlay.querySelector(".mc-3d-loading"),
    capeSel: overlay.querySelector(".mc-cape-select"),
    animSel: overlay.querySelector(".mc-anim-select"),
  };
  var currentState = null;
  var showHat = true;
  var lastFocus = null;

  // full-body "player" render is the Overview hero and "head" is the skull; the
  // hat toggle swaps both to their /nohelm overlay so the second (hat) layer is
  // dropped from the body and the head in step.
  function updateRenders() {
    if (!currentState) return;
    dlg.hero.src = renderUrl(baseRender(currentState, "player"), 360, !showHat);
    dlg.skull.src = renderUrl(baseRender(currentState, "head"), 104, !showHat);
    dlg.hat.textContent = showHat ? "🎩 Hide hat layer" : "🎩 Show hat layer";
  }
  dlg.hat.addEventListener("click", function () { showHat = !showHat; updateRenders(); });

  // ---- 3D model tab (skinview3d, lazy-loaded) -------------------------------
  var viewer = null;      // active SkinViewer, or null
  var threeDBuilt = false; // whether the 3D tab has been initialised for the
                           // currently-open account

  function dispose3D() {
    if (viewer) { try { viewer.dispose(); } catch { /* already gone */ } viewer = null; }
    threeDBuilt = false;
    if (dlg.capeSel) dlg.capeSel.innerHTML = "";
    if (dlg.animSel) dlg.animSel.innerHTML = "";
  }

  // Build the cape + animation controls once the viewer exists. Kept in a
  // closure so each open gets fresh state (selected cape, elytra, animation).
  function build3DControls(sv, d) {
    var capes = capeList(d);
    var capeOptions = [{ label: "No cape", url: null }].concat(capes.map(function (c, i) {
      return { label: c.name ? cap(c.name) : (capes.length > 1 ? "Cape " + (i + 1) : "Cape"), url: c.url };
    }));
    var capeIdx = capes.length ? 1 : 0; // default to the first real cape
    var elytraOn = false;

    function applyCape() {
      if (!viewer) return;
      var opt = capeOptions[capeIdx];
      if (!opt || !opt.url) { viewer.resetCape(); return; }
      var back = elytraOn ? "elytra" : "cape";
      // WebGL can only sample a cross-origin-clean texture, so load the cape
      // ourselves with CORS enabled and hand skinview3d the ready image. (The
      // 2D Overview preview renders a tainted image fine; the 3D model can't.)
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        if (!viewer || capeOptions[capeIdx] !== opt) return; // selection moved on
        try {
          var p = viewer.loadCape(img, { backEquipment: back });
          if (p && p.catch) p.catch(function () {});
        } catch { /* skinview3d rejected the source */ }
      };
      img.onerror = function () {
        // Nearly always the cape host not sending Access-Control-Allow-Origin.
        console.warn("[minecraft] cape texture blocked for WebGL (likely missing CORS header): " + opt.url);
      };
      img.src = opt.url;
    }

    // cape pills
    dlg.capeSel.innerHTML = "";
    if (capeOptions.length > 1) {
      var capeLbl = document.createElement("span");
      capeLbl.className = "mc-ctl-label";
      capeLbl.textContent = "Cape";
      dlg.capeSel.appendChild(capeLbl);
    }
    capeOptions.forEach(function (opt, i) {
      if (capeOptions.length <= 1) return; // no cape at all -> hide the row
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mc-pill" + (i === capeIdx ? " is-active" : "");
      b.textContent = opt.label;
      b.addEventListener("click", function () {
        capeIdx = i;
        dlg.capeSel.querySelectorAll(".mc-pill:not(.mc-elytra)").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        applyCape();
      });
      dlg.capeSel.appendChild(b);
    });
    // elytra toggle (only meaningful when a cape exists) — always on its own
    // line via a full-width flex break before it.
    if (capes.length) {
      var brk = document.createElement("span");
      brk.className = "mc-flex-break";
      brk.setAttribute("aria-hidden", "true");
      dlg.capeSel.appendChild(brk);
      var el = document.createElement("button");
      el.type = "button";
      el.className = "mc-pill mc-elytra";
      el.textContent = "🪽 Elytra";
      el.addEventListener("click", function () {
        elytraOn = !elytraOn;
        el.classList.toggle("is-active", elytraOn);
        if (elytraOn && capeIdx === 0) {
          // elytra needs a cape texture; snap to the first real cape
          capeIdx = 1;
          var pills = dlg.capeSel.querySelectorAll(".mc-pill:not(.mc-elytra)");
          pills.forEach(function (x, ix) { x.classList.toggle("is-active", ix === 1); });
        }
        applyCape();
      });
      dlg.capeSel.appendChild(el);
    }
    applyCape();

    // animation pills
    var animOptions = [
      { label: "Idle", make: function () { return new sv.IdleAnimation(); } },
      { label: "Walk", make: function () { return new sv.WalkingAnimation(); } },
      { label: "Run",  make: function () { return new sv.RunningAnimation(); } },
      { label: "Spin", make: function () { return null; }, spin: true },
      { label: "None", make: function () { return null; } },
    ];
    var animIdx = 0; // idle by default
    function applyAnim() {
      if (!viewer) return;
      var opt = animOptions[animIdx];
      viewer.animation = opt.make();
      viewer.autoRotate = !!opt.spin;
    }
    dlg.animSel.innerHTML = "";
    var animLbl = document.createElement("span");
    animLbl.className = "mc-ctl-label";
    animLbl.textContent = "Animation";
    dlg.animSel.appendChild(animLbl);
    animOptions.forEach(function (opt, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mc-pill" + (i === animIdx ? " is-active" : "");
      b.textContent = opt.label;
      b.addEventListener("click", function () {
        animIdx = i;
        dlg.animSel.querySelectorAll(".mc-pill").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        applyAnim();
      });
      dlg.animSel.appendChild(b);
    });
    applyAnim();
  }

  // Initialise the 3D viewer for the current account. Called the first time the
  // 3D tab is shown per open; skinview3d is fetched on demand.
  function open3D() {
    if (threeDBuilt || !currentState) return;
    threeDBuilt = true;
    var d = currentState.data;
    var opened = currentState;
    dlg.loading.hidden = false;
    dlg.loading.textContent = "Loading 3D…";
    loadSkinview().then(function (sv) {
      // Bail if the modal was closed or switched accounts while loading.
      if (currentState !== opened) return;
      if (!d.skin_url) { dlg.loading.textContent = "No skin available"; return; }
      viewer = new sv.SkinViewer({ canvas: dlg.canvas, width: 300, height: 400 });
      viewer.controls.enableZoom = true;
      viewer.autoRotateSpeed = 1.2;
      viewer.loadSkin(d.skin_url, { model: d.skin_model === "slim" ? "slim" : "default" })
        .then(function () { dlg.loading.hidden = true; })
        .catch(function () { dlg.loading.textContent = "Couldn't load skin"; });
      build3DControls(sv, d);
    }).catch(function () {
      dlg.loading.hidden = false;
      dlg.loading.textContent = "3D viewer failed to load";
    });
  }

  // ---- tab switching --------------------------------------------------------
  function setTab(name) {
    overlay.querySelectorAll(".mc-tab").forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    overlay.querySelectorAll(".mc-panel").forEach(function (p) {
      p.classList.toggle("is-active", p.dataset.panel === name);
    });
    if (name === "model") open3D();
  }
  overlay.querySelector(".mc-tabs").addEventListener("click", function (e) {
    var tab = e.target.closest(".mc-tab");
    if (tab) setTab(tab.dataset.tab);
  });

  function openModal(state) {
    var accountChanged = currentState !== state;
    currentState = state;
    showHat = true;
    // A fresh open (or a different account) starts on Overview with no live
    // 3D viewer; re-opening the same account after its fetch lands keeps things
    // in sync without tearing down a viewer the user may be interacting with.
    if (accountChanged || overlay.hidden) { dispose3D(); setTab("ext"); }
    var d = state.data;
    // Same account refreshed while open: if the 3D tab was initialised before
    // the skin arrived (no viewer got built), let it rebuild on next visit.
    if (!accountChanged && !overlay.hidden && threeDBuilt && !viewer && d.skin_url) dispose3D();
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
    dispose3D(); // free the WebGL context so we don't leak canvases
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

    // Minecraft profiles barely change, so fetch through the shared realtime
    // client's cache: it persists across soft-navigation and (via sessionStorage)
    // across reloads, so revisiting the page re-uses the data with zero requests
    // instead of re-hitting the API 12 times every visit. Falls back to a direct
    // one-shot fetch if realtime.js isn't present.
    var profile = window.DM
      ? window.DM.request("minecraft", { uuid: uid }, { maxAge: 1800000, persist: true })
      : fetch(API_BASE + encodeURIComponent(uid), { cache: "no-store" })
          .then(function (r) { return r.ok ? r.json().catch(function () { return null; }) : null; })
          .then(function (j) { return j && j.success ? j.data : null; });

    profile
      .then(function (data) {
        if (!data) return;
        state.data = data;
        if (data.name) nameEl.textContent = data.name;
        bodyEl.src = renderUrl(baseRender(state, "body"), 300, false);
        var capes = capeList(data);
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
