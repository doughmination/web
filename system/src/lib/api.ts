/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

export const API_BASE = "https://doughmination.uk/v2/plural";

/**
 * The Doughmination API wraps most JSON responses in an envelope:
 *   { success: true, data: … } or { success: false, error: { code, message } }
 * A few endpoints (e.g. login) return flat payloads. This unwraps either shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<T = any>(json: any): T {
  if (json && typeof json === "object" && json.success === true && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

/** Extract a human-readable error message from an API error response. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorMessage(json: any, fallback: string): string {
  return json?.error?.message || json?.detail || json?.message || fallback;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
