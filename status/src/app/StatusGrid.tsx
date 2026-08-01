/* status/src/app/StatusGrid.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/StatusGrid.tsx — client: polls /api/health and renders the cards. */

"use client";

import {
  CSSProperties,
  useEffect,
  useState,
} from "react";

import {
  grid,
  card,
  cardTop,
  cardName,
  cardUrl,
  cardMeta,
  dot,
  dotChecking,
  banner,
  checks,
  checkLine,
  checkLabel,
  uptimeWrap,
  uptimeBar,
  uptimeCell,
  uptimeMeta,
} from "@styles/status.css";
import type {
  HealthResult,
  Reach,
  DayUptime,
  HistoryResponse,
} from "@lib/services";

// Re-check every 30 seconds; refresh the 90-day history every 5 minutes.
const POLL_MS = 30000;
const HISTORY_MS = 5 * 60 * 1000;

const colorUp = "#5bfaad";
const colorDown = "#f5a9b8";
const colorMuted = "#9aa3c2";

function reachColor(state: Reach): string {
  if (state === "up") return colorUp;
  if (state === "down") return colorDown;
  return colorMuted;
}

function accessibleLabel(state: Reach): string {
  if (state === "up") return "yes";
  if (state === "down") return "no";
  if (state === "na") return "n/a";
  return "checking";
}

function backendLabel(state: Reach, detail: string | null): string {
  if (state === "na") return "n/a";
  if (state === "checking") return "checking";
  const word = state === "up" ? "up" : "down";
  // Skip the redundant "running" note; show anything more specific.
  if (detail && detail !== "running") return `${word} (${detail})`;
  return word;
}

// A service is "in trouble" if either configured check is down.
function isDown(result: HealthResult): boolean {
  return result.accessible === "down" || result.backend === "down";
}

function Dot({ state }: { state: Reach }) {
  const color = reachColor(state);
  return (
    <span
      className={dot}
      style={{ color, background: color } as CSSProperties}
    />
  );
}

// 90 empty days, used before history loads or for brand-new services.
const emptyHistory: DayUptime[] = Array.from({ length: 90 }, (_, index) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - (89 - index));
  return {
    date: date.toISOString().slice(0, 10),
    ratio: null,
  };
});

function cellColor(ratio: number | null): string {
  if (ratio === null) return "#232838"; // no data — matches border
  if (ratio >= 0.999) return colorUp;
  if (ratio >= 0.95) return "#8fe6b0"; // dim green
  if (ratio >= 0.5) return "#f0c674"; // amber
  return colorDown;
}

function UptimeBar({ days }: { days: DayUptime[] }) {
  const withData = days.filter((day) => day.ratio !== null);
  const average =
    withData.length > 0
      ? withData.reduce((sum, day) => sum + (day.ratio ?? 0), 0) /
        withData.length
      : null;

  return (
    <div className={uptimeWrap}>
      <div className={uptimeBar}>
        {days.map((day) => (
          <span
            key={day.date}
            className={uptimeCell}
            style={{ background: cellColor(day.ratio) } as CSSProperties}
            title={
              day.ratio === null
                ? `${day.date} · no data`
                : `${day.date} · ${(day.ratio * 100).toFixed(1)}% up`
            }
          />
        ))}
      </div>
      <div className={uptimeMeta}>
        <span>90 days ago</span>
        <span>
          {average === null ? "no history yet" : `${(average * 100).toFixed(2)}% uptime`}
        </span>
        <span>today</span>
      </div>
    </div>
  );
}

export default function StatusGrid() {
  const [results, setResults] = useState<HealthResult[]>([]);
  const [history, setHistory] = useState<HistoryResponse>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const data = (await response.json()) as { results: HealthResult[] };
        if (alive) {
          setResults(data.results);
          setLoaded(true);
        }
      } catch {
        // Leave the last known state on screen if a poll fails.
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadHistory() {
      try {
        const response = await fetch("/api/history", { cache: "no-store" });
        const data = (await response.json()) as { history: HistoryResponse };
        if (alive) setHistory(data.history);
      } catch {
        // Bars just stay empty if history can't load.
      }
    }

    loadHistory();
    const timer = setInterval(loadHistory, HISTORY_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const downCount = results.filter(isDown).length;
  const allUp = loaded && downCount === 0;

  return (
    <>
      <div
        className={banner}
        style={
          {
            borderColor: allUp ? colorUp : downCount ? colorDown : undefined,
          } as CSSProperties
        }
      >
        <span
          className={loaded ? dot : dotChecking}
          style={
            {
              color: allUp ? colorUp : downCount ? colorDown : colorMuted,
              background: allUp ? colorUp : downCount ? colorDown : colorMuted,
            } as CSSProperties
          }
        />
        {!loaded && "Checking services…"}
        {loaded && allUp && "All systems operational"}
        {loaded &&
          downCount > 0 &&
          `${downCount} service${downCount === 1 ? "" : "s"} need attention`}
      </div>

      <div className={grid}>
        {results.map((result) => (
          <article key={result.id} className={card}>
            <div className={cardTop}>
              <span className={cardName}>{result.name}</span>
            </div>

            {result.url && <span className={cardUrl}>{result.url}</span>}

            <div className={checks}>
              <span className={checkLine}>
                <Dot state={result.accessible} />
                <span className={checkLabel}>Accessible:</span>
                <span style={{ color: reachColor(result.accessible) }}>
                  {accessibleLabel(result.accessible)}
                </span>
              </span>

              <span className={checkLine}>
                <Dot state={result.backend} />
                <span className={checkLabel}>Backend:</span>
                <span style={{ color: reachColor(result.backend) }}>
                  {backendLabel(result.backend, result.backendDetail)}
                </span>
              </span>
            </div>

            <div className={cardMeta}>
              <span>
                {result.status !== null ? `HTTP ${result.status}` : "—"}
              </span>
              <span>
                {result.latencyMs !== null ? `${result.latencyMs} ms` : "—"}
              </span>
            </div>

            <UptimeBar days={history[result.id] ?? emptyHistory} />
          </article>
        ))}
      </div>
    </>
  );
}
