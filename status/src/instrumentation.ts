/* status/src/instrumentation.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Next runs register() once on server boot — start the uptime recorder. */

export async function register(): Promise<void> {
  // Only in the Node.js server runtime (not edge / build).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startRecorder } = await import("./lib/recorder");
  startRecorder();
}
