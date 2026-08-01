/* status/src/lib/history.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Daily uptime history, file-backed under STATUS_DATA_DIR. Each recorded
 * sample bumps an up/total counter for the service's current day; the 90-day
 * view returns one ratio per day for the contribution-style bars.
 */

import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type {
  HealthResult,
  DayUptime,
  HistoryResponse,
} from "./services";

const dataDir = process.env.STATUS_DATA_DIR || "./data";
const historyFile = path.join(dataDir, "history.json");

// Keep a little more than we render, then prune.
const RETAIN_DAYS = 120;

interface DayCount {
  up: number;
  total: number;
}

// serviceId -> date (YYYY-MM-DD) -> counts
type HistoryFile = Record<string, Record<string, DayCount>>;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function load(): Promise<HistoryFile> {
  try {
    const raw = await readFile(historyFile, "utf8");
    return JSON.parse(raw) as HistoryFile;
  } catch {
    return {};
  }
}

async function save(data: HistoryFile): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(historyFile, JSON.stringify(data), "utf8");
}

// A sample counts only if at least one check is configured; it is "up" unless
// a configured check is down.
function sampleUp(result: HealthResult): {
  counts: boolean;
  up: boolean;
} {
  const configured = result.accessible !== "na" || result.backend !== "na";
  if (!configured) {
    return {
      counts: false,
      up: false,
    };
  }
  const down = result.accessible === "down" || result.backend === "down";
  return {
    counts: true,
    up: !down,
  };
}

function prune(data: HistoryFile): void {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - RETAIN_DAYS);
  const cutoffKey = dayKey(cutoff);

  for (const id of Object.keys(data)) {
    for (const date of Object.keys(data[id])) {
      if (date < cutoffKey) delete data[id][date];
    }
  }
}

export async function recordSample(results: HealthResult[]): Promise<void> {
  const data = await load();
  const date = dayKey(new Date());

  for (const result of results) {
    const { counts, up } = sampleUp(result);
    if (!counts) continue;

    const perService = data[result.id] ?? (data[result.id] = {});
    const day = perService[date] ?? (perService[date] = { up: 0, total: 0 });
    day.total += 1;
    if (up) day.up += 1;
  }

  prune(data);
  await save(data);
}

export async function getHistory(days = 90): Promise<HistoryResponse> {
  const data = await load();

  // Build the ordered date window (oldest first, ending today).
  const dates: string[] = [];
  const now = new Date();
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - offset);
    dates.push(dayKey(date));
  }

  const out: HistoryResponse = {};
  for (const id of Object.keys(data)) {
    out[id] = dates.map((date): DayUptime => {
      const day = data[id][date];
      const ratio = day && day.total > 0 ? day.up / day.total : null;
      return {
        date,
        ratio,
      };
    });
  }
  return out;
}
