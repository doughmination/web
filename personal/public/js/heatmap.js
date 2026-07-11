(function (global) {
  "use strict";

  /* ---- core logic (unchanged from the working version) ---- */
  function sundayOf(date) {
    const sunday = new Date(date);
    sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
    sunday.setUTCHours(0, 0, 0, 0);
    return sunday;
  }
  function level(contributions) {
    if (contributions === 0) return 0;
    if (contributions < 3) return 1;
    if (contributions < 6) return 2;
    if (contributions < 10) return 3;
    return 4;
  }
  function emptyWeekFrom(sunday) {
    let dayCount = 7;
    const thisSunday = sundayOf(new Date());
    if (thisSunday.getTime() === sunday.getTime())
      dayCount = new Date().getUTCDay() + 1;
    const week = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(sunday);
      date.setUTCDate(date.getUTCDate() + i);
      week.push({ sources: {}, contributions: 0, date: date.toISOString().slice(0, 10) });
    }
    return week;
  }
  function buildHeatmapData(sources) {
    const weeks = new Map();
    for (const sourceName of Object.keys(sources)) {
      const source = sources[sourceName].slice().sort((a, b) => a.timestamp - b.timestamp);
      for (const day of source) {
        const sunday = sundayOf(day.timestamp * 1000);
        const key = Math.floor(sunday.getTime() / 1000);
        if (!weeks.has(key)) weeks.set(key, emptyWeekFrom(sunday));
        if (day.contributions > 0) {
          const week = weeks.get(key);
          const idx = new Date(day.timestamp * 1000).getUTCDay();
          week[idx].contributions += day.contributions;
          if (!week[idx].sources[sourceName]) week[idx].sources[sourceName] = 0;
          week[idx].sources[sourceName] += day.contributions;
        }
      }
    }
    return [...weeks.entries()].sort(([a], [b]) => a - b).map(([, w]) => w);
  }

  /* ---- styles, injected once ---- */
  const STYLE_ID = "contrib-heatmap-styles";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
.ch-root{
  --ch-cell:13px; --ch-gap:3px; --ch-weekday-w:30px;
  --contrib-0:#232a33; --contrib-1:#173f2c; --contrib-2:#1e7349;
  --contrib-3:#34ab68; --contrib-4:#5ce897;
  --ch-muted:#8b95a1; --ch-text:#d3dae2;
  display:block; width:100%; max-width:100%; color:var(--ch-text);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
}
.ch-count{margin:0 0 14px;font-size:13px;color:var(--ch-muted);
  font-variant-numeric:tabular-nums;
  font-family:ui-monospace,"SF Mono",Menlo,monospace;}
.ch-scroll{overflow-x:auto;padding-bottom:4px;scrollbar-width:thin;scrollbar-color:var(--ch-muted) transparent;}
.ch-scroll::-webkit-scrollbar{height:8px;}
.ch-scroll::-webkit-scrollbar-thumb{background:var(--ch-muted);border-radius:4px;}
.ch-scroll::-webkit-scrollbar-track{background:transparent;}
.ch-months{display:grid;grid-auto-flow:column;grid-auto-columns:var(--ch-cell);
  gap:var(--ch-gap);margin-left:calc(var(--ch-weekday-w) + var(--ch-gap));
  margin-bottom:6px;height:14px;font-size:11px;color:var(--ch-muted);}
.ch-months span{white-space:nowrap;line-height:14px;}
.ch-body{display:flex;gap:var(--ch-gap);}
.ch-weekdays{display:grid;grid-template-rows:repeat(7,var(--ch-cell));
  gap:var(--ch-gap);width:var(--ch-weekday-w);font-size:10px;color:var(--ch-muted);}
.ch-weekdays span{line-height:var(--ch-cell);}
.ch-grid{display:grid;grid-template-rows:repeat(7,var(--ch-cell));
  grid-auto-flow:column;grid-auto-columns:var(--ch-cell);gap:var(--ch-gap);}
.ch-day{width:var(--ch-cell);height:var(--ch-cell);border-radius:3px;
  outline:1px solid rgba(255,255,255,.04);outline-offset:-1px;
  opacity:0;animation:ch-pop .4s ease forwards;}
.ch-day:hover{outline:1px solid var(--ch-text);}
.ch-day.l0{background:var(--contrib-0);} .ch-day.l1{background:var(--contrib-1);}
.ch-day.l2{background:var(--contrib-2);} .ch-day.l3{background:var(--contrib-3);}
.ch-day.l4{background:var(--contrib-4);}
.ch-legend{display:flex;align-items:center;gap:6px;margin-top:14px;
  font-size:11px;color:var(--ch-muted);}
.ch-legend .ch-day{animation:none;opacity:1;}
@keyframes ch-pop{to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.ch-day{animation:none;opacity:1;}}`;
    document.head.appendChild(s);
  }

  /* ---- pride palettes: [empty, level1, level2, level3, level4] ---- */
  const N = "#20262e"; /* shared neutral "empty" so lit cells pop on a dark card */
  const THEMES = {
    forest: ["#232a33", "#173f2c", "#1e7349", "#34ab68", "#5ce897"],
    rainbow: [N, "#e40303", "#ff8c00", "#ffed00", "#2ecc40"],
    trans: [N, "#5bcefa", "#f5a9b8", "#fbd3dc", "#ffffff"],
    bi: [N, "#0038a8", "#7a4a99", "#c0277f", "#d60270"],
    pan: [N, "#21b1ff", "#ffd800", "#ff8fc1", "#ff218c"],
    lesbian: [N, "#d52d00", "#ff9a56", "#d362a4", "#a30262"],
    nonbinary: [N, "#fcf434", "#b78fe0", "#9c59d1", "#ffffff"],
    ace: [N, "#5a5a5a", "#a3a3a3", "#cf9fe6", "#800080"],
    genderfluid: [N, "#ff75a2", "#be18d6", "#333ebd", "#ffffff"],
    genderqueer: [N, "#4a8123", "#7bbf4f", "#b57edc", "#ffffff"],
    agender: [N, "#8a8a8a", "#b9b9b9", "#b8f483", "#ffffff"],
  };

  function resolveTheme(theme) {
    if (Array.isArray(theme)) {
      return theme.length === 4 ? [N].concat(theme) : theme; /* allow 4 lit colors */
    }
    return THEMES[theme] || THEMES.rainbow;
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* Track the in-flight fetch per container so re-renders cancel cleanly. */
  const controllers = new WeakMap();
  const observers = new WeakMap();

  function render(target, options = {}) {
    const opts = Object.assign({
      url: "https://contrib.doughmination.uk/",
      theme: "rainbow",
      months: true, weekdays: true, legend: true, count: true,
      fit: false, minCell: 8, maxCell: 13, gap: 3,
    }, options);
    opts.cell = opts.cell || opts.maxCell; /* initial size before auto-fit kicks in */

    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) {
      console.warn("[heatmap] target not found:", target);
      return Promise.resolve(null);
    }

    injectStyles();

    /* Cancel a previous render on this element (route change or re-mount). */
    const prev = controllers.get(root);
    if (prev) prev.abort();
    const controller = new AbortController();
    controllers.set(root, controller);

    const prevObs = observers.get(root);
    if (prevObs) { prevObs.disconnect(); observers.delete(root); }

    /* (Re)build the shell. */
    root.classList.add("ch-root");
    root.style.setProperty("--ch-cell", opts.cell + "px");
    root.style.setProperty("--ch-gap", opts.gap + "px");
    if (!opts.weekdays) root.style.setProperty("--ch-weekday-w", "0px");
    const palette = resolveTheme(opts.theme);
    for (let i = 0; i < 5; i++) {
      if (palette[i]) root.style.setProperty("--contrib-" + i, palette[i]);
    }
    if (opts.colors) {
      for (const k of [0, 1, 2, 3, 4]) {
        if (opts.colors[k]) root.style.setProperty("--contrib-" + k, opts.colors[k]);
      }
    }
    root.replaceChildren();

    let countEl;
    if (opts.count) {
      countEl = document.createElement("p");
      countEl.className = "ch-count";
      countEl.textContent = "Loading…";
      root.appendChild(countEl);
    }

    const scroll = el("div", "ch-scroll");
    const monthsRow = opts.months ? el("div", "ch-months") : null;
    if (monthsRow) scroll.appendChild(monthsRow);

    const body = el("div", "ch-body");
    if (opts.weekdays) {
      const wd = el("div", "ch-weekdays");
      ["", "Mon", "", "Wed", "", "Fri", ""].forEach(t => {
        const s = document.createElement("span"); s.textContent = t; wd.appendChild(s);
      });
      body.appendChild(wd);
    }
    const grid = el("div", "ch-grid");
    body.appendChild(grid);
    scroll.appendChild(body);
    root.appendChild(scroll);

    if (opts.legend) {
      const lg = el("div", "ch-legend");
      lg.appendChild(textSpan("Less"));
      for (let i = 0; i <= 4; i++) lg.appendChild(el("span", "ch-day l" + i));
      lg.appendChild(textSpan("More"));
      root.appendChild(lg);
    }

    return fetch(opts.url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        const weeks = buildHeatmapData(data);
        let total = 0, prevMonth = -1;

        weeks.forEach((week, w) => {
          if (monthsRow) {
            const label = document.createElement("span");
            const m = new Date(week[0].date + "T00:00:00Z").getUTCMonth();
            if (m !== prevMonth) { label.textContent = MONTHS[m]; prevMonth = m; }
            monthsRow.appendChild(label);
          }
          for (const day of week) {
            total += day.contributions;
            const cell = el("div", "ch-day l" + level(day.contributions));
            const breakdown = Object.entries(day.sources)
              .map(([n, v]) => `${n}: ${v}`).join(", ");
            cell.title = `${day.contributions} contributions on ${day.date}`
              + (breakdown ? ` (${breakdown})` : "");
            cell.style.animationDelay = (w * 8) + "ms";
            grid.appendChild(cell);
          }
        });

        const since = weeks.length ? weeks[0][0].date : null;
        if (countEl) countEl.textContent = `${total} contributions since ${since}`;

        /* Scale the day squares so the full span fits the container width,
         * instead of overflowing past the page's content column. */
        if (opts.fit && weeks.length) {
          const fitCells = () => {
            const w = parseFloat(getComputedStyle(root).getPropertyValue("--ch-weekday-w")) || 0;
            const avail = scroll.clientWidth - (w ? w + opts.gap : 0);
            if (avail <= 0) return;
            let cell = Math.floor(avail / weeks.length) - opts.gap;
            cell = Math.max(opts.minCell, Math.min(opts.maxCell, cell));
            root.style.setProperty("--ch-cell", cell + "px");
          };
          fitCells();
          if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(fitCells);
            ro.observe(root);
            observers.set(root, ro);
          }
        }
        return { total, since, weeks };
      })
      .catch(err => {
        if (err.name === "AbortError") return null; /* superseded by a newer render */
        if (countEl) countEl.textContent = "Couldn't load contributions.";
        console.error("[heatmap]", err);
        return null;
      });
  }

  function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function textSpan(t) { const s = document.createElement("span"); s.textContent = t; return s; }

  global.ContribHeatmap = { render };
})(typeof window !== "undefined" ? window : this);