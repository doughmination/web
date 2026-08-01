/* status/src/app/api/health/stream/route.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* Public SSE stream: pushes health updates live (~15s) plus keepalive pings. */

import { subscribe } from "@lib/live";
import type { HealthResult } from "@lib/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (results: HealthResult[]) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ results })}\n\n`),
          );
        } catch {
          // Controller already closed.
        }
      };

      const unsubscribe = subscribe(send);

      // Comment pings keep the connection alive through proxies.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignore
        }
      }, 25000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
