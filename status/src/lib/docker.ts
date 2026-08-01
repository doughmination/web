/* status/src/lib/docker.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Backend check: ask the Docker Engine API (over the mounted unix socket)
 * whether a container is running and, if it has a healthcheck, healthy.
 * node:http is used because global fetch cannot talk to a unix socket.
 */

import http from "node:http";

const socketPath = process.env.STATUS_DOCKER_SOCKET || "/var/run/docker.sock";

const TIMEOUT_MS = 5000;

export interface ContainerInspect {
  found: boolean;
  running: boolean;
  // "healthy" | "unhealthy" | "starting" | null (no healthcheck defined)
  health: string | null;
}

const notFound: ContainerInspect = {
  found: false,
  running: false,
  health: null,
};

export function inspectContainer(name: string): Promise<ContainerInspect> {
  return new Promise((resolve) => {
    const request = http.request(
      {
        socketPath,
        path: `/containers/${encodeURIComponent(name)}/json`,
        method: "GET",
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode !== 200) {
            resolve(notFound);
            return;
          }
          try {
            const data = JSON.parse(body) as {
              State?: {
                Running?: boolean;
                Health?: { Status?: string };
              };
            };
            resolve({
              found: true,
              running: Boolean(data.State?.Running),
              health: data.State?.Health?.Status ?? null,
            });
          } catch {
            resolve(notFound);
          }
        });
      },
    );

    request.on("error", () => resolve(notFound));
    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy();
      resolve(notFound);
    });
    request.end();
  });
}
