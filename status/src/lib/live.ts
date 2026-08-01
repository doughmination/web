/* status/src/lib/live.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Shared live-status broadcaster for the SSE endpoint. One interval checks
 * every service and fans the result out to all connected clients (and records
 * a history sample), rather than each connection running its own poll. Runs
 * only while at least one client is connected.
 */

import { listServices } from "./store";
import { checkAll } from "./health";
import { recordSample } from "./history";
import type { HealthResult } from "./services";

type Subscriber = (results: HealthResult[]) => void;

const subscribers = new Set<Subscriber>();

let timer: ReturnType<typeof setInterval> | null = null;
let last: HealthResult[] = [];

const INTERVAL_MS = 15000;

async function tick(): Promise<void> {
  try {
    const services = await listServices();
    const results = await checkAll(services);
    last = results;
    await recordSample(results);
    for (const notify of subscribers) notify(results);
  } catch {
    // Skip a bad cycle; the next tick tries again.
  }
}

export function subscribe(notify: Subscriber): () => void {
  subscribers.add(notify);

  // Give the new client the last known snapshot immediately.
  if (last.length) notify(last);

  if (!timer) {
    timer = setInterval(() => void tick(), INTERVAL_MS);
    void tick();
  }

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
