/* status/src/lib/recorder.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Background sampler. Started once from instrumentation on server boot; checks
 * every service on an interval and appends the outcome to the daily history.
 * Runs even when nobody is viewing the page, so the 90-day bars stay honest.
 */

import { listServices } from "./store";
import { checkAll } from "./health";
import { recordSample } from "./history";

let started = false;

const INTERVAL_MS = 5 * 60 * 1000;

export function startRecorder(): void {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      const services = await listServices();
      const results = await checkAll(services);
      await recordSample(results);
    } catch {
      // Skip a bad cycle; the next tick tries again.
    }
  };

  void run();
  setInterval(() => void run(), INTERVAL_MS);
}
