"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/* Ported from heatmap.js + dev-info.js — the contribution heatmap and the
   WakaTime coding stats. Same page, so one component (renders both). */

/* ======================================================================
 * Contribution heatmap
 * ==================================================================== */

type HeatDay = { sources: Record<string, number>; contributions: number; date: string };
type Week = HeatDay[];

function sundayOf(date: Date | number): Date {
  const sunday = new Date(date);
  sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
  sunday.setUTCHours(0, 0, 0, 0);
  return sunday;
}
function level(n: number): number {
  if (n === 0) return 0;
  if (n < 3) return 1;
  if (n < 6) return 2;
  if (n < 10) return 3;
  return 4;
}
function emptyWeekFrom(sunday: Date): Week {
  let dayCount = 7;
  const thisSunday = sundayOf(new Date());
  if (thisSunday.getTime() === sunday.getTime()) dayCount = new Date().getUTCDay() + 1;
  const week: Week = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(sunday);
    d.setUTCDate(d.getUTCDate() + i);
    week.push({ sources: {}, contributions: 0, date: d.toISOString().slice(0, 10) });
  }
  return week;
}
type Source = { timestamp: number; contributions: number };
function buildHeatmapData(sources: Record<string, Source[]>): Week[] {
  const weeks = new Map<number, Week>();
  for (const sourceName of Object.keys(sources)) {
    const source = (sources[sourceName] || []).slice().sort((a, b) => a.timestamp - b.timestamp);
    for (const day of source) {
      const sunday = sundayOf(day.timestamp * 1000);
      const key = Math.floor(sunday.getTime() / 1000);
      if (!weeks.has(key)) weeks.set(key, emptyWeekFrom(sunday));
      if (day.contributions > 0) {
        const week = weeks.get(key)!;
        const idx = new Date(day.timestamp * 1000).getUTCDay();
        week[idx].contributions += day.contributions;
        week[idx].sources[sourceName] = (week[idx].sources[sourceName] || 0) + day.contributions;
      }
    }
  }
  return [...weeks.entries()].sort(([a], [b]) => a - b).map(([, w]) => w);
}

const NEUTRAL = "#20262e";
const THEMES: Record<string, string[]> = {
  forest: ["#232a33", "#173f2c", "#1e7349", "#34ab68", "#5ce897"],
  rainbow: [NEUTRAL, "#e40303", "#ff8c00", "#ffed00", "#2ecc40"],
  trans: [NEUTRAL, "#5bcefa", "#f5a9b8", "#fbd3dc", "#ffffff"],
};
function resolveTheme(theme: string): string[] {
  return THEMES[theme] || THEMES.rainbow;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Heatmap({
  theme = "trans",
  url = "https://doughmination.uk/v2/contribapi",
}: {
  theme?: string;
  url?: string;
}) {
  const [state, setState] = useState<
    { weeks: Week[]; total: number; since: string | null } | "loading" | "error"
  >("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((payload) => {
        const data =
          payload && Object.prototype.hasOwnProperty.call(payload, "success")
            ? payload.data || {}
            : payload;
        const weeks = buildHeatmapData(data);
        let total = 0;
        weeks.forEach((w) => w.forEach((d) => (total += d.contributions)));
        const since = weeks.length ? weeks[0][0].date : null;
        setState({ weeks, total, since });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setState("error");
      });
    return () => controller.abort();
  }, [url]);

  const palette = resolveTheme(theme);
  const rootStyle: CSSProperties & Record<string, string> = {} as CSSProperties &
    Record<string, string>;
  palette.forEach((c, i) => {
    if (c) rootStyle[`--contrib-${i}`] = c;
  });

  const monthOf = (week: Week) => new Date(week[0].date + "T00:00:00Z").getUTCMonth();

  return (
    <div className="ch-root" style={rootStyle}>
      <p className="ch-count">
        {state === "loading"
          ? "Loading…"
          : state === "error"
            ? "Couldn't load contributions."
            : `${state.total} contributions since ${state.since}`}
      </p>

      {state !== "loading" && state !== "error" ? (
        <div className="ch-scroll">
          <div className="ch-months">
            {state.weeks.map((week, w) => {
              const m = monthOf(week);
              const prevM = w > 0 ? monthOf(state.weeks[w - 1]) : -1;
              return <span key={w}>{m !== prevM ? MONTHS[m] : ""}</span>;
            })}
          </div>
          <div className="ch-body">
            <div className="ch-weekdays">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
            <div className="ch-grid">
              {state.weeks.map((week, w) =>
                week.map((day, di) => {
                  const breakdown = Object.entries(day.sources)
                    .map(([n, v]) => `${n}: ${v}`)
                    .join(", ");
                  return (
                    <div
                      key={`${w}-${di}`}
                      className={`ch-day l${level(day.contributions)}`}
                      title={
                        `${day.contributions} contributions on ${day.date}` +
                        (breakdown ? ` (${breakdown})` : "")
                      }
                      style={{ animationDelay: `${w * 8}ms` }}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="ch-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`ch-day l${i}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ======================================================================
 * WakaTime stats
 * ==================================================================== */

const WAKATIME = {
  codingActivity: "https://wakatime.com/share/@doughmination/9dcc5b5c-ed3d-4896-bfa3-87737fa70930.json",
  languages: "https://wakatime.com/share/@doughmination/8354e3f8-b458-452b-aa06-839f303d4904.json",
  categories: "https://wakatime.com/share/@doughmination/c54fcd4e-91b3-46ab-8e7e-82226491ec0f.json",
  editors: "https://wakatime.com/share/@doughmination/38dba24b-d2de-4d50-9b09-83642c01c33e.json",
  operatingSystems: "https://wakatime.com/share/@doughmination/a69f00cb-e38e-4de1-aa42-eec71dc6d658.json",
};
const MAX_ROWS = 8;

type CatItem = { name?: string; total_seconds?: number; percent?: number; color?: string; text?: string };
type WeekDay = { label: string; short: string; total: number };
/* null = loading, "error" = failed, array = data */
type Section<T> = T[] | "error" | null;

function fmt(seconds: number): string {
  const s = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h && m) return `${h} hr${h > 1 ? "s" : ""} ${m} min${m > 1 ? "s" : ""}`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min${m === 1 ? "" : "s"}`;
}
function pctLabel(p: number): string {
  return (p < 10 ? Math.round(p * 10) / 10 : Math.round(p)) + "%";
}
function valueLabel(d: CatItem, hasSeconds: boolean): string {
  if (hasSeconds && (d.total_seconds || 0) > 0) return d.text || fmt(d.total_seconds || 0);
  if (typeof d.percent === "number") return pctLabel(d.percent);
  if (d.text) return d.text;
  return fmt(d.total_seconds || 0);
}

interface WakaJson {
  data?: unknown;
  human_readable_range?: string;
  range?: { text?: string; date?: string };
}
function asCategorical(json: WakaJson | null): CatItem[] {
  let data = json?.data;
  if (!Array.isArray(data)) return [];
  if (data.length && data[0] && (data[0] as CatItem).name === undefined && Array.isArray(data[0])) {
    data = data[0] as unknown[];
  }
  return (data as Record<string, unknown>[]).map((d) => ({
    name: d.name as string,
    total_seconds: typeof d.total_seconds === "number" ? d.total_seconds : (d.seconds as number) || 0,
    percent: d.percent as number,
    color: d.color as string,
    text: d.text as string,
  }));
}
function asDays(json: WakaJson | null): WeekDay[] {
  const data = json?.data;
  if (!Array.isArray(data)) return [];
  const out: WeekDay[] = [];
  for (const d of data as Record<string, unknown>[]) {
    let seconds = 0;
    let dateStr = "";
    const gt = d.grand_total as { total_seconds?: number } | undefined;
    if (gt && typeof gt.total_seconds === "number") seconds = gt.total_seconds;
    else if (typeof d.total_seconds === "number") seconds = d.total_seconds;
    const range = d.range as { date?: string; text?: string } | undefined;
    if (range && (range.date || range.text)) dateStr = range.date || range.text || "";
    else if (d.date) dateStr = d.date as string;
    const dateForParse = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr + "T12:00:00" : dateStr;
    const dt = dateStr ? new Date(dateForParse) : null;
    const label = dt && !isNaN(dt.getTime()) ? dt.toDateString() : dateStr || "";
    const short =
      dt && !isNaN(dt.getTime())
        ? dt.toLocaleDateString(undefined, { weekday: "short" })
        : label.slice(0, 3) || "?";
    out.push({ label, short, total: seconds });
  }
  return out;
}

/* JSONP loader — WakaTime share endpoints have no CORS, so we inject a script. */
let seq = 0;
function jsonp(url: string, timeoutMs = 12000): Promise<WakaJson> {
  return new Promise((resolve, reject) => {
    const cb = `__wakatime_cb_${++seq}`;
    const script = document.createElement("script");
    const w = window as unknown as Record<string, unknown>;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timed out"));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      try {
        delete w[cb];
      } catch {
        w[cb] = undefined;
      }
      script.parentNode?.removeChild(script);
    }
    w[cb] = (data: WakaJson) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("failed to load"));
    };
    const sep = url.indexOf("?") === -1 ? "?" : "&";
    script.src = `${url}${sep}callback=${cb}`;
    document.head.appendChild(script);
  });
}

function Bars({ items }: { items: CatItem[] }) {
  const hasSeconds = items.some((d) => (d.total_seconds || 0) > 0);
  const rows = items
    .filter((d) => (d.total_seconds || 0) > 0 || (d.percent || 0) > 0)
    .sort((a, b) =>
      hasSeconds
        ? (b.total_seconds || 0) - (a.total_seconds || 0)
        : (b.percent || 0) - (a.percent || 0),
    )
    .slice(0, MAX_ROWS);
  if (!rows.length) return <p className="waka-empty">No data yet.</p>;
  const max =
    rows.reduce((acc, d) => Math.max(acc, hasSeconds ? d.total_seconds || 0 : d.percent || 0), 0) ||
    1;
  return (
    <>
      {rows.map((d, i) => {
        const basis = hasSeconds ? d.total_seconds || 0 : d.percent || 0;
        const pct = Math.max(2, Math.round((basis / max) * 100));
        return (
          <div className="waka-bar-row" key={i}>
            <span className="waka-bar-name" title={d.name || ""}>
              {d.name || "Unknown"}
            </span>
            <span className="waka-bar-track">
              <span
                className="waka-bar-fill"
                style={{ width: `${pct}%`, background: d.color || undefined }}
              />
            </span>
            <span className="waka-bar-val">{valueLabel(d, hasSeconds)}</span>
          </div>
        );
      })}
    </>
  );
}

function BarSection({ id, title, state }: { id: string; title: string; state: Section<CatItem> }) {
  if (state === null) return null; // still loading -> keep hidden (matches the old JS)
  return (
    <details className="waka-section" id={id}>
      <summary className="section-title">{title}</summary>
      <div className="waka-bars">
        {state === "error" ? (
          <p className="waka-empty">Couldn&apos;t load this chart.</p>
        ) : (
          <Bars items={state} />
        )}
      </div>
    </details>
  );
}

function WakaContent() {
  const [meta, setMeta] = useState("");
  const [days, setDays] = useState<Section<WeekDay>>(null);
  const [langs, setLangs] = useState<Section<CatItem>>(null);
  const [cats, setCats] = useState<Section<CatItem>>(null);
  const [editors, setEditors] = useState<Section<CatItem>>(null);
  const [os, setOs] = useState<Section<CatItem>>(null);

  useEffect(() => {
    let cancelled = false;
    const setMetaFrom = (json: WakaJson) => {
      const r = json?.human_readable_range || json?.range?.text;
      if (r && !cancelled) setMeta(`Range: ${r}`);
    };
    const load = (url: string, onData: (j: WakaJson) => void, onErr: () => void) => {
      jsonp(url)
        .then((json) => {
          if (cancelled) return;
          setMetaFrom(json);
          onData(json);
        })
        .catch(() => {
          if (!cancelled) onErr();
        });
    };
    load(WAKATIME.codingActivity, (j) => setDays(asDays(j)), () => setDays("error"));
    load(WAKATIME.languages, (j) => setLangs(asCategorical(j)), () => setLangs("error"));
    load(WAKATIME.categories, (j) => setCats(asCategorical(j)), () => setCats("error"));
    load(WAKATIME.editors, (j) => setEditors(asCategorical(j)), () => setEditors("error"));
    load(WAKATIME.operatingSystems, (j) => setOs(asCategorical(j)), () => setOs("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const haveDays = Array.isArray(days);
  const total = haveDays ? days.reduce((a, d) => a + d.total, 0) : 0;
  const weekMax = haveDays ? days.reduce((a, d) => Math.max(a, d.total), 0) || 1 : 1;

  return (
    <div id="waka-content">
      {meta ? <p className="waka-meta">{meta}</p> : null}

      <div className="waka-section waka-total" id="waka-total">
        <div className="waka-total-num">{haveDays ? fmt(total) : "—"}</div>
        <div className="waka-total-sub">
          {haveDays ? `across the last ${days.length} days` : "total coding time"}
        </div>
        <div className="waka-week">
          {days === "error" ? (
            <p className="waka-empty">No activity data yet.</p>
          ) : haveDays ? (
            days.map((d, i) => {
              const h = Math.max(3, Math.round((d.total / weekMax) * 100));
              return (
                <div className="waka-day" key={i}>
                  <div className="waka-day-track">
                    <div
                      className="waka-day-fill"
                      style={{ height: `${h}%` }}
                      title={`${d.label}: ${fmt(d.total)}`}
                    />
                  </div>
                  <span className="waka-day-label">{d.short}</span>
                </div>
              );
            })
          ) : null}
        </div>
      </div>

      <BarSection id="waka-section-languages" title="Languages" state={langs} />
      <BarSection id="waka-section-categories" title="Categories" state={cats} />
      <div className="waka-grid2">
        <BarSection id="waka-section-editors" title="Editors" state={editors} />
        <BarSection id="waka-section-os" title="Operating Systems" state={os} />
      </div>

      <p className="waka-credit">
        Tracked automatically with{" "}
        <a href="https://wakatime.com" target="_blank" rel="noopener">
          wakatime
        </a>
        .
      </p>
    </div>
  );
}

export default function DevInfo() {
  return (
    <>
      <div id="contrib">
        <Heatmap theme="trans" />
      </div>
      <WakaContent />
    </>
  );
}
