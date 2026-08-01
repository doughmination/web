/* status/src/lib/services.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Shared types for the status app. */

export interface Service {
  id: string;
  name: string;
  // Public URL for the accessibility check (optional).
  url?: string;
  // Docker container name for the backend check (optional).
  container?: string;
  // HTTP status codes below this count as "up" (default 400).
  expectBelow?: number;
}

// "up"/"down" are measured; "na" means this check is not configured for the
// service; "checking" is the initial client state before the first result.
export type Reach = "up" | "down" | "na" | "checking";

export interface HealthResult {
  id: string;
  name: string;
  url: string | null;
  container: string | null;
  // Public reachability of the URL.
  accessible: Reach;
  // Docker container state (running / healthy).
  backend: Reach;
  // Human note for the backend, e.g. "running", "unhealthy", "not found".
  backendDetail: string | null;
  status: number | null;
  latencyMs: number | null;
  checkedAt: string;
}

// One day's uptime ratio (0..1), or null when no samples were recorded.
export interface DayUptime {
  date: string;
  ratio: number | null;
}

// serviceId -> ordered list of days (oldest first).
export type HistoryResponse = Record<string, DayUptime[]>;
