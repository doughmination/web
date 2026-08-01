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
} from "@styles/status.css";
import type {
  HealthResult,
  Reach,
} from "@lib/services";

// Re-check every 30 seconds.
const POLL_MS = 30000;

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

export default function StatusGrid() {
  const [results, setResults] = useState<HealthResult[]>([]);
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
          </article>
        ))}
      </div>
    </>
  );
}
