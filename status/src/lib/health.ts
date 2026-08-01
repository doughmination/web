/* status/src/lib/health.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Two independent checks per service:
 *   - accessible: can the public URL be reached? (HTTP fetch)
 *   - backend:    is the Docker container running/healthy? (socket inspect)
 * They are reported separately, so "backend up, accessible no" is visible.
 */

import type {
  Service,
  HealthResult,
  Reach,
} from "./services";
import { inspectContainer } from "./docker";

const TIMEOUT_MS = 8000;

interface UrlCheck {
  state: Reach;
  status: number | null;
  latencyMs: number | null;
}

async function checkUrl(service: Service): Promise<UrlCheck> {
  if (!service.url) {
    return {
      state: "na",
      status: null,
      latencyMs: null,
    };
  }

  const started = Date.now();
  const limit = service.expectBelow ?? 400;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(service.url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    // Any answer (incl. 3xx redirects) below the ceiling counts as reachable.
    const isUp = response.status > 0 && response.status < limit;
    return {
      state: isUp ? "up" : "down",
      status: response.status,
      latencyMs,
    };
  } catch {
    return {
      state: "down",
      status: null,
      latencyMs: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

interface BackendCheck {
  state: Reach;
  detail: string | null;
}

async function checkBackend(service: Service): Promise<BackendCheck> {
  if (!service.container) {
    return {
      state: "na",
      detail: null,
    };
  }

  const info = await inspectContainer(service.container);

  if (!info.found) {
    return {
      state: "down",
      detail: "not found",
    };
  }
  if (!info.running) {
    return {
      state: "down",
      detail: "stopped",
    };
  }
  if (info.health === "unhealthy") {
    return {
      state: "down",
      detail: "unhealthy",
    };
  }
  return {
    state: "up",
    detail: info.health ?? "running",
  };
}

async function checkOne(service: Service): Promise<HealthResult> {
  const [url, backend] = await Promise.all([
    checkUrl(service),
    checkBackend(service),
  ]);

  return {
    id: service.id,
    name: service.name,
    url: service.url ?? null,
    container: service.container ?? null,
    accessible: url.state,
    backend: backend.state,
    backendDetail: backend.detail,
    status: url.status,
    latencyMs: url.latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

export async function checkAll(services: Service[]): Promise<HealthResult[]> {
  return Promise.all(services.map(checkOne));
}
