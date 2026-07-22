/* src/scripts/core.ts
 * ESAL-2.3
 */

/* eslint-disable */
// @ts-nocheck
/* core.ts — the global site shell, ported verbatim from core.js: the nav
 * builder, theme boot, the bg-music gate, and the oneko cat + picker. (The
 * legacy window.DM realtime client was removed once every widget moved to
 * @doughmination/react-api's hooks + shared socket.) It is fundamentally an
 * imperative init script, so it is kept as-is and run once (client-only) from
 * SiteChrome on mount. @ts-nocheck/eslint-disable: faithful legacy port. */
// Icons are inline SVG, not the old `bi` webfont — see presenceIcons.ts.
import { icon } from "./presenceIcons";

export function initCore(catSrc: string = "/assets/oneko/classics/classic.png") {
/* Ari was here uwu
 * Professional boob lover
 * girls kissing,,, */
console.log(`
⣿⣿⣿⠏⣴⣿⣿⣿⣿⡿⠟⢹⣿⣿⣿⡿⠋⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡉⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⢇⣾⣿⣿⣿⡿⢋⢀⣴⣿⣿⡿⠋⠀⠘⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣦⣤⣀⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⡏⣼⣿⣿⣿⠏⣴⢃⣾⣿⡿⢋⣴⠟⣠⣾⣿⣿⣿⠏⢁⣼⣿⣿⣿⣿⣿⣿⠟⣿⣿⣿⠟⠂⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠟⠛⠀⠘⠛⠛⣛⣛⣋⢉⣉⣉⣛⡛⠻⠿⣿⣿
⡟⣸⣿⣿⣿⡏⡸⢡⣾⣿⢋⣤⡿⢡⣾⣿⣿⣿⠟⠁⣰⣿⠟⣹⡿⢿⣿⠋⢀⣾⣿⣿⠏⡄⢻⡆⢀⠙⣿⣿⡿⠟⢋⣩⣤⣶⣾⣿⣿⣿⠟⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶
⢠⣿⣿⣿⣿⠃⢡⣿⡟⣡⣾⠏⣰⣿⣿⣿⡿⠋⢀⣾⡿⢁⣼⠟⢠⠞⠁⣰⣿⣿⡿⢣⣾⡇⢸⣿⣾⠆⠙⠁⣰⣾⣿⣿⣿⣿⣿⣿⣿⠏⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡏⢠⣿⠏⣴⣿⠟⣰⣿⣿⣿⡿⣡⢃⣾⠟⢀⡞⠁⣴⢋⠄⣼⣿⣿⠏⣰⣿⡟⢀⡼⠋⣠⡶⠀⣴⣿⢿⣿⣿⢿⠏⣸⣿⡏⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣧⣿⠏⣼⡿⠿⢠⣿⣿⣿⡟⣰⢃⣾⠏⢀⠞⠀⡼⢡⠟⣼⣿⡟⣡⣾⣿⠏⠀⠄⠀⣾⡿⠁⣼⡿⢃⡜⣽⡏⠈⣰⡟⠀⠁⣾⣿⣿⣿⣿⣿⣿⡇⢹⣿⣿⣿⣿⣿⡇⢻
⣿⣿⣿⣿⣿⡏⣸⣿⠃⠀⣼⣿⣿⡟⣴⢃⣾⠏⠀⢀⢀⡾⢡⡟⣰⣿⢋⣴⡿⠋⠁⣀⠀⠀⣰⡿⠁⡌⡸⢁⣾⣿⡟⠀⢠⣿⡇⠀⣸⣿⣿⣿⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⡇⢸
⣿⣿⣿⣿⡿⢰⣿⠃⡆⢀⣿⣿⡟⣸⠏⣾⠏⣴⠂⠂⣾⢡⡟⣰⡟⣡⠞⣩⠄⢀⣼⠁⠀⣼⣿⠇⡼⠠⠃⣼⣿⡿⠁⢀⣾⠿⠀⠀⡏⢸⣿⣿⣿⠃⣿⣿⠇⢸⣿⣿⣿⣿⣿⡇⢸
⣿⣿⡇⢸⠇⣾⡏⣸⠃⢸⣿⡿⢱⡟⣸⡟⣼⠃⠂⣼⢃⠏⢠⠏⠰⠋⠀⢁⣠⣾⠇⠀⣼⣿⡟⠀⠁⣦⣾⣿⡿⠀⣴⡾⠀⠀⠀⠠⠁⣿⡿⢹⠉⢠⣿⣿⠀⢸⣿⣿⣿⣿⣿⡇⢸
⣿⣿⠀⣼⢰⣿⡀⡿⢀⢸⣿⢡⣿⢡⡿⠰⡏⠀⢰⠇⡞⠀⠀⣾⠞⠀⢴⣿⣿⣷⠀⣼⣿⣿⠃⠀⣸⣿⡿⡿⠀⢀⣿⠇⠀⠀⠀⠐⢀⣿⠇⡌⢠⣸⣿⡇⠀⢸⣿⣿⣿⣿⣿⠃⣸
⣿⡟⠀⡇⣸⣿⢠⡇⣏⣾⡏⣼⡇⡼⠁⠘⠁⠀⡟⡸⠀⠐⠚⢁⣦⣶⣿⣿⣿⡇⠀⣿⠇⡟⠀⠀⣿⡿⠁⠀⠀⢸⡟⠀⢰⠆⠀⡄⢸⡏⢠⠃⣿⡟⢹⡇⠀⣿⣿⣿⣿⣿⡿⠀⡏
⣿⡇⠀⡇⣿⣿⢸⡇⡟⣿⢰⣿⢡⠃⠀⠀⣰⠃⢡⠁⠈⠀⣴⣿⣿⣿⣿⣿⠟⡁⡀⢻⠀⡇⠀⢀⣿⠃⠀⠀⡄⢸⠃⠀⣿⡇⠀⠀⣼⡇⢸⢀⣿⡇⢸⠀⢀⣿⣿⣿⣿⣿⠇⢸⠁
⣿⢃⡆⡇⢿⣿⢸⣷⡇⠏⣼⡏⡌⠀⠀⠀⡏⢀⣼⡘⢀⣤⡈⠛⢿⣿⣿⣧⣾⡇⣇⠘⠀⠁⠀⢸⡏⠀⠀⣼⠃⡏⠀⢸⣿⡇⠀⠀⣿⠀⣾⣼⣿⠀⡟⠀⢸⣿⣿⣿⣿⡟⢀⡟⢠
⣿⣿⡇⡇⢸⣿⢸⠛⡇⠀⣿⠇⠁⠀⠏⣼⣷⢸⡿⢃⣾⣿⣷⣄⠀⠈⠛⢿⣿⡇⣿⡀⠀⠀⠀⠈⠀⠀⣼⣿⠀⠀⠀⣀⠙⢧⠀⠀⣿⠀⣿⣿⣿⠀⡇⠀⣼⣿⣿⣿⣿⠃⣼⠃⣾
⣿⣿⡇⠁⢸⣿⠘⠀⡇⠀⣿⠀⠀⠀⢰⣿⣿⡆⠃⣼⣿⣿⣿⣿⣷⣤⣄⣤⣽⣇⢹⡇⠀⣦⡄⠀⠀⢸⣿⡟⠀⠀⢠⣿⣷⣄⠀⠀⣿⠀⣿⣿⡇⢰⠁⠀⣿⣿⣿⣿⡟⢠⡏⢰⡿
⣿⠻⣷⠀⢸⣿⡄⠀⣷⣾⣧⠀⠀⠀⠈⣿⣿⠇⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣷⣦⡘⡷⠄⠀⣿⣿⡇⠀⣰⣾⣿⣿⣿⡇⠀⠈⠀⣿⣿⠁⠈⠀⢸⣿⣿⣿⡿⢀⣾⣧⣿⠃
⣿⡆⣿⠀⢸⣿⣇⠀⣿⣿⣿⣷⠀⢀⠀⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠻⠷⢂⣤⣼⣿⣿⣇⢀⣿⣿⣿⣿⣿⣷⠀⠀⠀⣿⣿⠀⠀⠀⣼⣿⣿⣿⠃⣸⣿⣿⠃⠀
⣿⣧⢸⡆⠘⣿⣿⠀⢻⣿⣿⡇⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣶⣶⣿⣿⣿⣿⣿⣿⣿⠘⠛⣻⣿⣿⣿⣿⡀⠀⠀⣿⡏⢠⠀⠀⣾⣿⣿⠇⠠⢿⢻⠏⠀⠀
⢹⣿⡌⣧⠀⠻⣿⣷⣾⣿⣿⡇⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠻⣿⣿⣿⣿⣷⡆⠀⢿⠃⠀⠀⠀⣿⣿⠏⠀⠀⠆⠀⠀⠀⠀
⡌⢿⣷⢹⡆⠈⢿⣿⣿⣿⣿⠧⣿⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣦⣄⡈⠛⠿⣿⣿⣷⠀⠸⠀⠀⡄⢸⣿⡏⢠⠂⠘⠀⠀⠀⠀⠀
⣷⠘⣿⡆⢿⣧⡈⠻⢿⣿⣿⠀⣿⣧⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣡⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣾⣿⡆⠀⠀⢠⠁⣸⡟⢀⠎⠀⠀⠀⠀⠀⠀⢠
⣿⣧⢹⣿⡘⣿⣷⣀⠈⣿⣿⠀⣿⣿⣧⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⢸⠀⠟⠁⡼⠀⠀⠀⠀⠀⠀⢀⣾
⣿⣿⣆⢻⣷⡘⣿⣿⡀⠘⣿⡆⢹⣿⣿⣷⡌⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠗⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⢸⠀⠀⢰⠁⠀⠀⢀⠀⠀⢀⣿⣿
⢿⢿⣿⣦⠹⣷⠸⣿⣷⠀⠹⡇⠘⣿⣿⠿⢿⣦⣙⣿⣿⣿⣿⣿⣿⣿⣿⠟⣡⣄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠸⠀⠀⠌⠀⠀⢀⠆⠀⢀⣿⣿⣿
⠀⠈⢿⣿⣷⡙⢧⠹⣿⣇⢧⠉⠀⣿⠏⣰⣶⣤⣍⡛⠿⣿⣿⣿⣿⠟⣡⣾⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠈⠀⢠⣾⣿⡿⠟
⣀⠀⠈⠻⣿⣿⣌⠣⠙⣿⡌⢧⠀⠁⣼⣿⣿⣿⣿⣿⣷⣶⣬⣭⣥⣾⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠗⠀⠀⠀⠀⠀⠀⣰⣿⡟⠁⠀⠀
⣿⣿⣶⠀⠈⠛⢿⣷⡄⠈⢿⡌⣇⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⠸⣟⡀⣀⠀⢠⣼⣿⣿⣷⣿⠀⠀
⣿⣿⣿⣿⣷⣤⡀⠉⠛⢦⣀⣿⡘⡄⢹⣬⡙⣿⣿⣿⠟⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣙⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⡙⠛⠠⠶⠃⣸⣿⣿⣿⣿⠀⠀
⣿⣿⣿⣿⣿⣿⣧⡀⠀⠰⣿⣿⣷⠸⡄⠙⣷⣼⣧⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣦⣭⣭⡉⣙⡛⠛⠿⣿⣿⣿⣿⣿⡇⠐⠄⢀⢂⡀⢘⣿⣿⣿⣿⣿⣷⡄
⣿⣿⣿⣿⣿⣿⣿⣿⣧⡀⢹⣿⣿⣧⢹⡄⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢇⣿⢿⣷⡄⠘⣿⣿⣿⣿⠇⣾⣿⣦⣤⡀⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣷⣤⣈⡙⠻⢿⡇⠀⢿⣇⢻⡆⢿⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣧⡀⡜⢁⣤⡘⣿⣿⡿⢠⣿⣿⣿⣿⠁⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⡀⠘⣿⣄⢻⡘⡇⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣸⣿⡀⠀⣷⡘⣿⠇⣼⣿⣿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⣿`);
/* mmmmmmmmmmmmmmmmm girls kissing,,,,, */

/* ===================== soft-nav plumbing (tracked listeners/timers) =====================
 * Soft navigation (bottom of this file) swaps page content without a full
 * reload, so the <audio> background-music element and the rest of the
 * persistent chrome never get torn down. Every OTHER page's own script
 * (music.js, discord.js, etc.) still needs to stop its intervals/rAF
 * loops/document+window listeners when we navigate away, or repeat visits
 * would stack duplicates. Rather than editing every page script, wrap the
 * handful of global APIs they use and record what happens while
 * `ctpTracking` is on (i.e. from the first soft navigation onward) so it
 * can all be torn down in one sweep before the next page's scripts run.
 * Everything registered *before* the first soft nav (core.js's own
 * persistent setup below) is never tracked, so it's never torn down. */
let ctpTracking = false;
const ctpDocListeners = [];
const ctpWinListeners = [];
const ctpIntervals = [];
const ctpTimeouts = [];
const ctpFrames = [];

(function ctpPatchGlobals() {
  function patchTarget(target, store) {
    const add = target.addEventListener.bind(target);
    target.addEventListener = function (type, listener, options) {
      if (ctpTracking) store.push([type, listener, options]);
      return add(type, listener, options);
    };
  }
  patchTarget(document, ctpDocListeners);
  patchTarget(window, ctpWinListeners);

  const _setInterval = window.setInterval.bind(window);
  const _setTimeout = window.setTimeout.bind(window);
  const _rAF = window.requestAnimationFrame.bind(window);
  window.setInterval = function (...args) {
    const id = _setInterval(...args);
    if (ctpTracking) ctpIntervals.push(id);
    return id;
  };
  window.setTimeout = function (...args) {
    const id = _setTimeout(...args);
    if (ctpTracking) ctpTimeouts.push(id);
    return id;
  };
  window.requestAnimationFrame = function (...args) {
    const id = _rAF(...args);
    if (ctpTracking) ctpFrames.push(id);
    return id;
  };
  /* Raw, untracked rAF for persistent chrome (e.g. the oneko cat) whose loops
   * re-schedule themselves forever. Without this they'd be swept by
   * ctpClearPageState() on a later navigation once tracking is on — freezing
   * the cat. Page scripts keep using the tracked window.requestAnimationFrame. */
  window.__ctpRawRAF = _rAF;
})();

function ctpClearPageState() {
  while (ctpDocListeners.length) { const [t, l, o] = ctpDocListeners.pop(); document.removeEventListener(t, l, o); }
  while (ctpWinListeners.length) { const [t, l, o] = ctpWinListeners.pop(); window.removeEventListener(t, l, o); }
  while (ctpIntervals.length) clearInterval(ctpIntervals.pop());
  while (ctpTimeouts.length) clearTimeout(ctpTimeouts.pop());
  while (ctpFrames.length) cancelAnimationFrame(ctpFrames.pop());
}

/* Exposed for the Next.js port: React drives page-script teardown between
 * client-side navigations (see PageScripts.tsx) instead of the old soft-nav
 * router. ctpEnableTracking() turns on the interval/listener tracking above so
 * a page's scripts can be swept on the next navigation; ctpClearPageState()
 * performs the sweep. */
window.ctpClearPageState = ctpClearPageState;
window.ctpEnableTracking = function () { ctpTracking = true; };

function wireDataHref(el) {
  /* Cursor is handled in CSS ([data-href] + [role="link"]) so the custom PNG isn't overridden. */
  if (!el.hasAttribute("role")) el.setAttribute("role", "link");
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");

  const go = () => {
    const url = el.dataset.href;
    if (!url) return;
    if (typeof window.ctpNavigate === "function") window.ctpNavigate(url);
    else location.href = url;
  };

  el.addEventListener("click", go);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
}

document.querySelectorAll("[data-href]").forEach(wireDataHref);

/* ===================== nav.js (auto nav builder) ===================== */
async function buildNav() {
  const container = document.querySelector(".nav-links");
  if (!container) return;

  let items;
  try {
    items = await fetch("/nav.json").then((r) => {
      if (!r.ok) throw new Error(`nav.json (${r.status})`);
      return r.json();
    });
  } catch (err) {
    console.error("Could not load nav.json:", err);
    return;
  }

  const currentPath = location.pathname.replace(/\/+$/, "") || "/";

  container.innerHTML = "";
  items.forEach(({ label, href }) => {
    const a = document.createElement("a");
    a.className = "nav-link";
    a.dataset.href = href;
    a.textContent = label;

    const linkPath = href.replace(/\/+$/, "") || "/";
    if (linkPath === currentPath) a.classList.add("selected");

    wireDataHref(a);
    container.appendChild(a);
  });
}

buildNav();
/* Exposed so the Next.js NavBridge can refresh the active link on client-side
 * navigation (core.js only runs buildNav once, on first load). */
window.ctpBuildNav = buildNav;

/* flavors.js + webrings.js now live as React components
 * (src/components/chrome/SettingsMenu.tsx + WebringDock.tsx). core.js still
 * owns the oneko cat, the cat-collection modal (window.toggleCatPicker), the
 * bg-music <audio>/gate (window.ctpBgm), the nav builder, and the soft-nav
 * bridge — the React chrome drives those through the window hooks below. */

/* ===================== bg-music.js (click-to-enter gate) ======================= */
(function bgMusic() {
  const ss = window.sessionStorage;
  const CONSENT_KEY = "ctpBgmConsent";
  const PLAYING_KEY = "ctpBgmPlaying";
  const TIME_KEY = "ctpBgmTime";

  const audio = document.createElement("audio");
  audio.id = "bgm";
  audio.dataset.ctpPersist = ""; /* survives soft navigation, see bottom of file */
  audio.src = "/assets/background.mp3";
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.1; /* it's background music, not the main event */
  audio.hidden = true;
  document.body.appendChild(audio);

  const savedTime = parseFloat(ss.getItem(TIME_KEY) || "0");
  if (savedTime > 0) {
    audio.addEventListener("loadedmetadata", () => {
      try { audio.currentTime = savedTime; } catch (e) { /* not seekable yet */ }
    }, { once: true });
  }

  /* The play/pause button now lives in React (SettingsMenu.tsx); core.js keeps
   * the <audio> and exposes a tiny API the button drives. */
  audio.addEventListener("play", () => { ss.setItem(PLAYING_KEY, "1"); });
  audio.addEventListener("pause", () => { ss.setItem(PLAYING_KEY, "0"); });
  window.ctpBgm = {
    toggle() {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    },
    isPaused() { return audio.paused; },
    subscribe(cb) {
      const h = () => cb(audio.paused);
      audio.addEventListener("play", h);
      audio.addEventListener("pause", h);
      cb(audio.paused);
      return () => {
        audio.removeEventListener("play", h);
        audio.removeEventListener("pause", h);
      };
    },
  };

  function saveTime() {
    if (!isNaN(audio.currentTime)) ss.setItem(TIME_KEY, String(audio.currentTime));
  }
  window.addEventListener("pagehide", saveTime);
  setInterval(saveTime, 4000);

  /* A reload (Cmd/Ctrl+R, hard or soft) counts as leaving and coming back —
   * re-show the gate. Clicking a link to another page on the site doesn't. */
  function isReload() {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav ? nav.type === "reload" : performance.navigation?.type === 1;
  }
  if (isReload()) {
    ss.removeItem(CONSENT_KEY);
    ss.removeItem(PLAYING_KEY);
  }

  if (ss.getItem(CONSENT_KEY) === "1") {
    /* Already entered earlier this session — resume without the gate.
     * A fresh page load can still block autoplay even with prior consent;
     * if so, the button just stays on ▶ until they click it. */
    if (ss.getItem(PLAYING_KEY) === "1") {
      audio.play().catch(() => { /* autoplay blocked — leave it paused */ });
    }
    return;
  }

  /* ---- first visit this session: click-to-enter gate ---- */
  const gate = document.createElement("div");
  gate.className = "bgm-gate";
  gate.dataset.ctpPersist = ""; /* survives soft navigation, see bottom of file */
  gate.setAttribute("role", "button");
  gate.tabIndex = 0;
  gate.innerHTML = `
    <div class="bgm-gate-panel">
      <p class="bgm-gate-note">${icon("music-note-beamed")} click to enter ${icon("music-note-beamed")}</p>
      <p class="bgm-gate-hint">turns on background music</p>
    </div>`;
  document.body.appendChild(gate);

  function enter() {
    ss.setItem(CONSENT_KEY, "1");
    audio.play().catch(() => { /* file missing/blocked */ });
    gate.classList.add("is-leaving");
    gate.addEventListener("transitionend", () => gate.remove(), { once: true });
  }
  gate.addEventListener("click", enter, { once: true });
  gate.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enter(); }
  });
})();

/* ===================== cat.js (oneko.js) ======================= */
/* oneko.js: https://github.com/adryd325/oneko.js */

(function oneko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const nekoEl = document.createElement("div");
  let persistPosition = true;

  let nekoPosX = 32;
  let nekoPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  /* People can hide the cat from the Settings menu; persisted in localStorage
     as "onekoHidden". When hidden we keep the element in the DOM (so the toggle
     can bring it right back) but set display:none and skip the animation. */
  let onekoHidden = false;

  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    // Was read from the <script data-cat> tag; now passed into initCore().
    let nekoFile = catSrc || "/assets/oneko/classics/classic.png";

    if (persistPosition) {
      let storedNeko = JSON.parse(window.localStorage.getItem("oneko"));
      if (storedNeko !== null) {
        nekoPosX = storedNeko.nekoPosX;
        nekoPosY = storedNeko.nekoPosY;
        mousePosX = storedNeko.mousePosX;
        mousePosY = storedNeko.mousePosY;
        frameCount = storedNeko.frameCount;
        idleTime = storedNeko.idleTime;
        idleAnimation = storedNeko.idleAnimation;
        idleAnimationFrame = storedNeko.idleAnimationFrame;
        nekoEl.style.backgroundPosition = storedNeko.bgPos;
      }
    }

    nekoEl.id = "oneko";
    nekoEl.dataset.ctpPersist = ""; /* survives soft navigation, see bottom of file */
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = 2147483647;

    nekoEl.style.backgroundImage = `url(${nekoFile})`;

    document.body.appendChild(nekoEl);

    /* Hide/show wiring. ctpSetCatHidden(bool) is what the Settings toggle calls;
       ctpIsCatHidden() lets the UI read the current state. */
    onekoHidden = window.localStorage.getItem("onekoHidden") === "1";
    nekoEl.style.display = onekoHidden ? "none" : "";
    window.ctpIsCatHidden = function () {
      return window.localStorage.getItem("onekoHidden") === "1";
    };
    window.ctpSetCatHidden = function (hidden) {
      onekoHidden = !!hidden;
      window.localStorage.setItem("onekoHidden", onekoHidden ? "1" : "0");
      nekoEl.style.display = onekoHidden ? "none" : "";
      window.dispatchEvent(new Event("ctpcathiddenchange"));
    };

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    if (persistPosition) {
      window.addEventListener("beforeunload", function (event) {
        window.localStorage.setItem("oneko", JSON.stringify({
          nekoPosX: nekoPosX,
          nekoPosY: nekoPosY,
          mousePosX: mousePosX,
          mousePosY: mousePosY,
          frameCount: frameCount,
          idleTime: idleTime,
          idleAnimation: idleAnimation,
          idleAnimationFrame: idleAnimationFrame,
          bgPos: nekoEl.style.backgroundPosition
        }));
      });
    }

    (window.__ctpRawRAF || window.requestAnimationFrame)(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    /* Stop running if the neko element is removed from the DOM. */
    if (!nekoEl.isConnected) {
      return;
    }
    /* Cat hidden: keep the loop alive (so it can be re-shown) but do no work. */
    if (onekoHidden) {
      (window.__ctpRawRAF || window.requestAnimationFrame)(onAnimationFrame);
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    (window.__ctpRawRAF || window.requestAnimationFrame)(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    /* Roughly every 20 seconds. */
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
        Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      /* Count down after being alerted, before moving. */
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  init();
})();

const BASE_SPRITE = "/assets/oneko/classics/classic.png";

let CAT_MODES = [];

const IDLE_POS = "-97px -97px"; /* idle frame, inset 1px to avoid neighbour-frame bleed */
const spriteFor = (c) => c.sprite || BASE_SPRITE;

(async function catModes() {
  try {
    /* Single flat list of cats — no categories. */
    CAT_MODES = await fetch("/cats.json").then((r) => {
      if (!r.ok) throw new Error(`cats.json (${r.status})`);
      return r.json();
    });
  } catch (err) {
    console.error("Could not load cat data:", err);
    return;
  }
  const oneko = document.getElementById("oneko");
  if (!oneko) return;

  oneko.style.pointerEvents = "auto";
  /* Cursor is handled in CSS (#oneko) so the custom pointer PNG isn't overridden. */

  const ls = window.localStorage;
  let mode = parseInt(ls.getItem("onekoMode") || "0", 10);

  const apply = (i) => {
    const c = CAT_MODES[i];
    oneko.style.backgroundImage = `url('${spriteFor(c)}')`;
    oneko.style.filter = c.filter || "none";
  };

  /* ---- picker overlay (no visible trigger, press C to find it) ---- */
  const overlay = document.createElement("div");
  overlay.className = "cat-picker";
  overlay.dataset.ctpPersist = ""; /* survives soft navigation, see bottom of file */
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="cat-picker-panel" role="dialog" aria-label="Choose a cat">
      <div class="cat-picker-head">
        <span>Cat collection</span>
        <button class="cat-picker-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="cat-grid"></div>
      <p class="cat-hint">Pick your cat &middot; press C to toggle</p>
    </div>`;
  document.body.appendChild(overlay);
  const grid = overlay.querySelector(".cat-grid");

  function makeOption(i) {
    const c = CAT_MODES[i];
    const opt = document.createElement("button");
    opt.type = "button";
    opt.className = "cat-option" + (i === mode ? " current" : "");
    opt.innerHTML = `
      <span class="cat-preview" style="background-image:url('${spriteFor(c)}');background-position:${IDLE_POS};filter:${c.filter || "none"}"></span>
      <span class="cat-name">${c.name}</span>`;
    opt.addEventListener("click", () => selectMode(i));
    return opt;
  }

  function renderGrid() {
    grid.innerHTML = "";
    /* One flat grid — every cat shown together, no category sections. */
    const items = document.createElement("div");
    items.className = "cat-section-items";
    CAT_MODES.forEach((_, i) => items.appendChild(makeOption(i)));
    grid.appendChild(items);
  }

  function selectMode(i) {
    mode = i;
    ls.setItem("onekoMode", String(i));
    apply(i);
    renderGrid();
  }

  const openPicker = () => {
    renderGrid();
    overlay.hidden = false;
  };
  const closePicker = () => (overlay.hidden = true);
  const togglePicker = () => (overlay.hidden ? openPicker() : closePicker());

  /* Let other scripts (e.g. the theme-bar button) open the cat menu. */
  window.toggleCatPicker = togglePicker;

  overlay
    .querySelector(".cat-picker-close")
    .addEventListener("click", closePicker);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePicker();
  });
  document.addEventListener("keydown", (e) => {
    /* Ignore while typing in a field or with a modifier key held. */
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if (e.key === "Escape" && !overlay.hidden) {
      closePicker();
    } else if (
      (e.key === "c" || e.key === "C") &&
      !e.ctrlKey && !e.metaKey && !e.altKey && !typing
    ) {
      togglePicker();
    }
  });

  /* ---- squeak / boop sound on click ---- */
  const boop = new Audio("/assets/oneko/boop.mp3");
  boop.preload = "auto";
  function playBoop() {
    try {
      boop.currentTime = 0; /* rewind so rapid clicks each squeak */
      boop.play().catch(() => { }); /* ignore autoplay/missing-file errors */
    } catch (e) { /* no-op */ }
  }

  /* ---- init + cat click ---- */
  if (mode < 0 || mode >= CAT_MODES.length) mode = 0; /* fall back to Classic */
  apply(mode);

  /* Clicking the cat just squeaks — no unlocks. Pick a cat from the menu. */
  oneko.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    playBoop();
  });
})();

/* ===================== soft-nav.js (pjax-lite router) =======================
 * Full page reloads kill the <audio> background music on every click
 * between pages (Chrome stutters, Firefox just stops). This intercepts
 * same-origin link clicks, fetches the target page, and swaps everything in
 * <body> EXCEPT header.nav and the chrome tagged [data-ctp-persist] (the
 * topbar, oneko, the cat picker/toast, the bgm <audio>/gate) — none of that
 * ever unloads. Each swapped-in page's own <script> tags are re-executed
 * fresh (core.js itself is skipped so the chrome above isn't rebuilt);
 * ctpClearPageState() tears down the outgoing page's intervals/rAF
 * loops/document+window listeners first so repeat visits don't stack them
 * (see the tracking patch at the top of this file). */
/* ===================== soft-nav REMOVED for the Next.js port =================
 * The original pjax-lite router fetched each target page's HTML and re-ran its
 * <script> tags to keep the bg-music <audio> alive across clicks. Against Next
 * (streamed/RSC responses) that threw "enqueue into a closed stream" and the
 * real page scripts never ran. Next owns routing now: every route is a real
 * page that loads its own <Script>s on a normal navigation. ctpNavigate falls
 * back to a plain full navigation so the core.js-built nav links still work.
 * (SPA-style navigation + persistent audio will return when page scripts are
 * reimplemented as React components in the CSS-Modules phase.) */
/* Navigation itself is owned by Next:
 *   - core.js's nav links call window.ctpNavigate (set by NavBridge.tsx to
 *     router.push, giving client-side navigation so the layout + bg-music
 *     <audio> never unload).
 *   - If ctpNavigate is unset (e.g. before hydration), wireDataHref falls back
 *     to a plain full navigation, so links always work.
 * We still intercept plain same-origin <a href> clicks (blog cards, project
 * cards, the 88x31 → /discord link, etc.) and route them through ctpNavigate
 * too, so those also stay client-side and never restart the bg music. Links
 * wired via [data-href] are handled by wireDataHref; this covers the rest. */
(function internalLinks() {
  "use strict";
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]:not([data-href])");
    if (!a) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    let dest;
    try { dest = new URL(href, location.href); } catch (err) { return; }
    if (dest.origin !== location.origin || !/^https?:$/.test(dest.protocol)) return;
    if (typeof window.ctpNavigate !== "function") return; // let the browser handle it
    e.preventDefault();
    window.ctpNavigate(dest.pathname + dest.search + dest.hash);
  });
})();

}
