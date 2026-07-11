/* selfies.js
 *
 * Renders the /selfies gallery from a manifest at
 * /assets/selfies/selfies.json. The manifest is either an array of
 * filename strings, or an array of {"src", "alt", "caption"} objects,
 * and is shown in list order (newest first goes at the top of the list).
 * "alt" is for screen readers, "caption" is optional and shown on the
 * page. Click any thumbnail to open it full size in a lightbox. */
(function selfies() {
  "use strict";

  const MANIFEST = "/assets/selfies/selfies.json";
  const FOLDER = "/assets/selfies/";
  const root = document.getElementById("selfies-root");
  if (!root) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- helpers ---- */
  /* Resolve a manifest src to a usable URL. */
  function resolveSrc(s) {
    if (typeof s !== "string") return "";
    s = s.trim();
    if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s;
    return FOLDER + s.replace(/^\.?\//, "");
  }

  /* Normalise a manifest entry into { src, alt, caption }, or null if unusable. */
  function normalize(entry, i) {
    let raw = "";
    let alt = "";
    let caption = "";
    if (typeof entry === "string") {
      raw = entry;
    } else if (entry && typeof entry === "object" && entry.src) {
      raw = entry.src;
      alt = typeof entry.alt === "string" ? entry.alt : "";
      caption = typeof entry.caption === "string" ? entry.caption.trim() : "";
    }
    if (typeof raw !== "string" || !raw.trim()) return null;
    const src = resolveSrc(raw);
    if (!src) return null;
    if (!alt) alt = caption || "Selfie " + (i + 1) + " of Clove Twilight";
    return { src, alt, caption };
  }

  function showMessage(text) {
    root.innerHTML = "";
    const p = document.createElement("p");
    p.className = "selfie-empty";
    p.textContent = text;
    root.appendChild(p);
  }

  /* ---- lightbox ---- */
  let items = [];
  let current = 0;
  let lastFocus = null;

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Selfie viewer");
  lb.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="Close (Esc)">&times;</button>' +
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous selfie">&#8249;</button>' +
    '<figure class="lightbox-figure">' +
    '<img class="lightbox-img" alt="">' +
    '<figcaption class="lightbox-caption" hidden></figcaption>' +
    "</figure>" +
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Next selfie">&#8250;</button>';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector(".lightbox-img");
  const lbCap = lb.querySelector(".lightbox-caption");
  const btnClose = lb.querySelector(".lightbox-close");
  const btnPrev = lb.querySelector(".lightbox-prev");
  const btnNext = lb.querySelector(".lightbox-next");

  function preload(i) {
    if (i < 0 || i >= items.length) return;
    const img = new Image();
    img.src = items[i].src;
  }

  function render(i) {
    current = (i + items.length) % items.length; /* wrap around */
    const it = items[current];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    if (it.caption) {
      lbCap.textContent = it.caption;
      lbCap.hidden = false;
    } else {
      lbCap.textContent = "";
      lbCap.hidden = true;
    }
    const multiple = items.length > 1;
    btnPrev.hidden = !multiple;
    btnNext.hidden = !multiple;
    if (multiple) {
      preload(current + 1);
      preload(current - 1);
    }
  }

  function open(i) {
    lastFocus = document.activeElement;
    render(i);
    lb.hidden = false;
    if (!reduceMotion) lb.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    btnClose.focus();
  }

  function close() {
    lb.hidden = true;
    lb.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    lbImg.removeAttribute("src");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  const next = () => render(current + 1);
  const prev = () => render(current - 1);

  btnClose.addEventListener("click", close);
  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);
  /* Click on the dim backdrop (but not the image, caption, or buttons) closes. */
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  /* ---- grid ---- */
  function buildGrid(list) {
    root.innerHTML = "";
    const frag = document.createDocumentFragment();
    list.forEach((it, i) => {
      const fig = document.createElement("figure");
      fig.className = "selfie-item";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "selfie-thumb";
      btn.setAttribute("aria-label", "Open " + (it.caption || it.alt));

      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.alt;
      img.loading = i < 4 ? "eager" : "lazy";
      img.decoding = "async";
      /* If an image fails to load, drop its tile so the grid stays clean. */
      img.addEventListener("error", () => fig.remove());

      btn.appendChild(img);
      btn.addEventListener("click", () => open(i));
      fig.appendChild(btn);

      if (it.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "selfie-caption";
        cap.textContent = it.caption;
        fig.appendChild(cap);
      }

      frag.appendChild(fig);
    });
    root.appendChild(frag);
  }

  /* ---- load ---- */
  root.setAttribute("aria-busy", "true");
  fetch(MANIFEST, { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("manifest " + r.status);
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error("manifest is not an array");
      items = data.map(normalize).filter(Boolean);
      if (!items.length) {
        showMessage("No selfies yet, check back soon! 📸");
        return;
      }
      buildGrid(items);
    })
    .catch((err) => {
      console.error("Could not load selfies:", err);
      showMessage("Couldn't load the selfies right now.");
    })
    .finally(() => root.removeAttribute("aria-busy"));
})();