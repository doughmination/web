(function (global) {
  "use strict";

  /* ---- config (from the <script> data-* attributes) ---- */
  var script =
    document.currentScript ||
    document.querySelector('script[src*="guestbook.js"]');
  var API = (script && script.dataset.api) || "";
  var TURNSTILE_KEY = (script && script.dataset.turnstileKey) || "";

  var STYLE_ID = "guestbook-styles";

  /* ---- styles (injected, mirrors the visitor-counter.js pattern) ---- */
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      ".guestbook-wrap { max-width: 640px; }",
      ".gb-form {",
      "  display: flex; flex-direction: column; gap: 0.85rem;",
      "  background: var(--surface-0); border: 1px solid var(--surface-1);",
      "  border-radius: 14px; padding: 1.1rem 1.2rem; margin-bottom: 2rem;",
      "}",
      ".gb-field { display: flex; flex-direction: column; gap: 0.3rem; position: relative; }",
      ".gb-field label { font-size: 0.8rem; color: var(--subtext-0); letter-spacing: 0.03em; }",
      ".gb-optional { color: var(--overlay-0); }",
      ".gb-form input, .gb-form textarea {",
      "  font-family: inherit; font-size: 0.95rem; color: var(--text);",
      "  background: var(--mantle); border: 1px solid var(--surface-1);",
      "  border-radius: 9px; padding: 0.55rem 0.7rem; width: 100%; resize: vertical;",
      "  transition: border-color 0.15s ease, box-shadow 0.15s ease;",
      "}",
      ".gb-form input:focus, .gb-form textarea:focus {",
      "  outline: none; border-color: var(--pink);",
      "  box-shadow: inset 0 0 0 1px var(--pink);",
      "}",
      ".gb-counter { align-self: flex-end; font-size: 0.7rem; color: var(--overlay-0); }",
      ".gb-turnstile:empty { display: none; }",
      ".gb-actions { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }",
      ".gb-form button {",
      "  font-family: inherit; font-size: 0.9rem; color: var(--crust);",
      "  background: var(--pink); border: none; border-radius: 9px;",
      "  padding: 0.55rem 1.1rem; font-weight: 700;",
      "  transition: transform 0.12s ease, opacity 0.12s ease;",
      "}",
      ".gb-form button:hover:not(:disabled) { transform: translateY(-1px); }",
      ".gb-form button:disabled { opacity: 0.55; }",
      ".gb-status { font-size: 0.82rem; color: var(--subtext-0); }",
      ".gb-status.gb-err { color: var(--red); }",
      ".gb-status.gb-ok { color: var(--green); }",
      /* honeypot: visually hidden but still in the DOM for bots */
      ".gb-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }",
      ".gb-entries { display: flex; flex-direction: column; gap: 0.9rem; padding-bottom: 4.5rem; }",
      ".gb-empty { color: var(--subtext-0); text-align: center; font-size: 0.9rem; }",
      ".gb-entry {",
      "  background: var(--surface-0); border: 1px solid var(--surface-1);",
      "  border-radius: 12px; padding: 0.85rem 1rem;",
      "  transition: border-color 0.15s ease, transform 0.15s ease;",
      "}",
      ".gb-entry:hover { border-color: var(--pink); transform: translateY(-2px); }",
      ".gb-entry-head { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.35rem; }",
      ".gb-entry-name { font-weight: 700; color: var(--pink); }",
      ".gb-entry-name a { color: inherit; text-decoration: none; border-bottom: 1px dotted var(--overlay-1); }",
      ".gb-entry-name a:hover { border-bottom-color: var(--pink); }",
      ".gb-entry-time { font-size: 0.72rem; color: var(--overlay-0); margin-left: auto; }",
      ".gb-entry-msg { color: var(--text); font-size: 0.92rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }",
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---- helpers ---- */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function relTime(ts) {
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
    try {
      return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return "";
    }
  }

  function entryHTML(e) {
    var name = esc(e.name);
    var nameHTML = e.website
      ? '<a href="' + esc(e.website) + '" target="_blank" rel="noopener nofollow ugc">' + name + "</a>"
      : name;
    return (
      '<div class="gb-entry">' +
      '<div class="gb-entry-head">' +
      '<span class="gb-entry-name">' + nameHTML + "</span>" +
      '<span class="gb-entry-time">' + esc(relTime(e.ts)) + "</span>" +
      "</div>" +
      '<div class="gb-entry-msg">' + esc(e.message) + "</div>" +
      "</div>"
    );
  }

  /* ---- rendering ---- */
  var entriesEl, formEl, statusEl, submitEl, counterEl, msgEl;

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "gb-status" + (kind ? " gb-" + kind : "");
  }

  function renderEntries(list) {
    if (!entriesEl) return;
    if (!list || !list.length) {
      entriesEl.innerHTML = '<p class="gb-empty">No messages yet, be the first to sign!</p>';
      return;
    }
    entriesEl.innerHTML = list.map(entryHTML).join("");
  }

  async function loadEntries() {
    if (!API) {
      renderEntries([]);
      setStatus("Guestbook API not configured yet.", "err");
      return;
    }
    try {
      var res = await fetch(API + "/?limit=100", { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      renderEntries(data.entries || []);
    } catch (err) {
      console.error("[guestbook] load failed", err);
      entriesEl.innerHTML = '<p class="gb-empty">Could not load messages right now.</p>';
    }
  }

  /* ---- Turnstile (optional) ---- */
  function turnstileToken() {
    try {
      if (global.turnstile && typeof global.turnstile.getResponse === "function") {
        return global.turnstile.getResponse() || "";
      }
    } catch (_) { }
    /* Fallback: the widget injects a hidden input named cf-turnstile-response. */
    var input = document.querySelector('[name="cf-turnstile-response"]');
    return input ? input.value : "";
  }

  function loadTurnstile() {
    if (!TURNSTILE_KEY) return;
    var holder = document.getElementById("gb-turnstile");
    if (holder) {
      holder.className = "cf-turnstile gb-turnstile";
      holder.setAttribute("data-sitekey", TURNSTILE_KEY);
      holder.setAttribute("data-theme", "dark");
    }
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  /* ---- submit ---- */
  async function onSubmit(ev) {
    ev.preventDefault();
    if (!API) {
      setStatus("Guestbook API not configured yet.", "err");
      return;
    }

    var payload = {
      name: formEl.name.value,
      website: formEl.website.value,
      message: formEl.message.value,
      url2: formEl.url2.value, /* honeypot */
    };

    if (!payload.name.trim() || !payload.message.trim()) {
      setStatus("Name and message are both required.", "err");
      return;
    }

    if (TURNSTILE_KEY) {
      var token = turnstileToken();
      if (!token) {
        setStatus("Please complete the captcha first.", "err");
        return;
      }
      payload.turnstileToken = token;
    }

    submitEl.disabled = true;
    setStatus("Signing…");

    try {
      var res = await fetch(API + "/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        setStatus(data.error || "Something went wrong. Try again.", "err");
        return;
      }
      setStatus("Thanks for signing! 💕", "ok");
      formEl.reset();
      if (counterEl) counterEl.textContent = "0 / 500";
      try {
        if (global.turnstile && global.turnstile.reset) global.turnstile.reset();
      } catch (_) { }
      await loadEntries();
    } catch (err) {
      console.error("[guestbook] submit failed", err);
      setStatus("Network error, please try again.", "err");
    } finally {
      submitEl.disabled = false;
    }
  }

  /* ---- init ---- */
  function init() {
    injectStyles();
    entriesEl = document.getElementById("gb-entries");
    formEl = document.getElementById("gb-form");
    statusEl = document.getElementById("gb-status");
    submitEl = document.getElementById("gb-submit");
    counterEl = document.getElementById("gb-counter");
    msgEl = document.getElementById("gb-message");

    if (msgEl && counterEl) {
      var update = function () {
        counterEl.textContent = msgEl.value.length + " / 500";
      };
      msgEl.addEventListener("input", update);
      update();
    }

    if (formEl) formEl.addEventListener("submit", onSubmit);

    loadTurnstile();
    loadEntries();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.Guestbook = { reload: loadEntries };
})(typeof window !== "undefined" ? window : this);