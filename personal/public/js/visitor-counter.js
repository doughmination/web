(function (global) {
  "use strict";

  const STYLE_ID = "visitor-counter-styles";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
.vc-root {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: "Comic Code";
}
.vc-digits {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 50px;
}
.vc-digits img {
  display: block;
  image-rendering: pixelated;
  width: 22.5px;
  height: 50px;
}
.vc-label {
  font-size: 11px;
  color: var(--ch-muted, #8b95a1);
  letter-spacing: 0.04em;
  text-transform: lowercase;
}
.vc-error {
  font-size: 11px;
  color: var(--ch-muted, #8b95a1);
}
@media (prefers-reduced-motion: reduce) {
  .vc-digits img { animation: none !important; }
}
    `;
    document.head.appendChild(s);
  }

  /* Returns the cached visitor count for this session, or null if not
   * cached. The cache key is scoped to namespace + key so multiple
   * counters don't collide. */
  function getCached(namespace, key) {
    try {
      const raw = localStorage.getItem("vc:" + namespace + ":" + key);
      if (!raw) return null;
      const { count, session } = JSON.parse(raw);
      /* Use a sessionStorage token to tell a new tab apart from a refresh.
       * A refresh keeps the same sessionStorage, a new tab starts fresh. */
      const token = sessionStorage.getItem("vc-session");
      if (token && token === session) return count;
      return null;
    } catch (_) {
      return null;
    }
  }

  function setCached(namespace, key, count) {
    try {
      /* Create (or reuse) a session token so this count is tied to the tab session. */
      let token = sessionStorage.getItem("vc-session");
      if (!token) {
        token = Math.random().toString(36).slice(2);
        sessionStorage.setItem("vc-session", token);
      }
      localStorage.setItem(
        "vc:" + namespace + ":" + key,
        JSON.stringify({ count, session: token })
      );
    } catch (_) { }
  }

  async function fetchCount(namespace, key) {
    const url = `https://abacus.jasoncameron.dev/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Abacus HTTP " + res.status);
    const data = await res.json();
    /* Abacus returns { value: <number> }. */
    if (typeof data.value !== "number") throw new Error("Unexpected response shape");
    return data.value;
  }

  function renderDigits(container, count, imgPath, imgExt) {
    container.innerHTML = "";
    const digits = String(Math.max(0, Math.floor(count))).padStart(6, "0");
    for (const d of digits) {
      const img = document.createElement("img");
      img.src = imgPath + d + imgExt;
      img.alt = d;
      img.width = 22.5;
      img.height = 50;
      container.appendChild(img);
    }
  }

  async function render(target, options) {
    const opts = Object.assign(
      {
        namespace: "clove-is-a-dev",
        key: "hits",
        imgPath: "/assets/numbers/",
        imgExt: ".png",
        label: "visitors",
      },
      options || {}
    );

    const root =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!root) {
      console.warn("[visitor-counter] target not found:", target);
      return;
    }

    injectStyles();
    root.classList.add("vc-root");
    root.innerHTML = "";

    const digitsEl = document.createElement("div");
    digitsEl.className = "vc-digits";
    root.appendChild(digitsEl);

    if (opts.label) {
      const labelEl = document.createElement("span");
      labelEl.className = "vc-label";
      labelEl.textContent = opts.label;
      root.appendChild(labelEl);
    }

    /* Try the cache first, this avoids hitting the API (and incrementing
     * the count) on every refresh. */
    const cached = getCached(opts.namespace, opts.key);
    if (cached !== null) {
      renderDigits(digitsEl, cached, opts.imgPath, opts.imgExt);
      return;
    }

    /* First visit in this session, so hit the API. */
    try {
      const count = await fetchCount(opts.namespace, opts.key);
      setCached(opts.namespace, opts.key, count);
      renderDigits(digitsEl, count, opts.imgPath, opts.imgExt);
    } catch (err) {
      console.error("[visitor-counter]", err);
      const errEl = document.createElement("span");
      errEl.className = "vc-error";
      errEl.textContent = "?? visitors";
      digitsEl.replaceWith(errEl);
      if (opts.label && root.querySelector(".vc-label")) {
        root.querySelector(".vc-label").remove();
      }
    }
  }

  /* Auto-init from script tag attributes. */
  function autoInit() {
    const script =
      document.currentScript ||
      document.querySelector('script[src*="visitor-counter"]');
    if (!script) return;

    const targetSel = script.dataset.target;
    if (!targetSel) return;

    const ns = script.dataset.namespace;
    const key = script.dataset.key;
    const imgPath = script.dataset.imgPath;
    const imgExt = script.dataset.imgExt;
    const label = script.dataset.label;

    const init = () =>
      render(targetSel, {
        ...(ns && { namespace: ns }),
        ...(key && { key }),
        ...(imgPath && { imgPath }),
        ...(imgExt && { imgExt }),
        ...(label !== undefined && { label }),
      });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  autoInit();

  global.VisitorCounter = { render };
})(typeof window !== "undefined" ? window : this);