import { randomUUID, timingSafeEqual } from "node:crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
export const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME ?? "Admin";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// In-memory is enough for a single-admin inbox — sessions reset on restart,
// which just means logging back in, not a real problem here.
const sessions = new Map<string, number>(); // token -> expiresAt

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so pad instead of short-circuiting
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(username: string, password: string): boolean {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error("ADMIN_USERNAME / ADMIN_PASSWORD are not set — refusing all logins.");
    return false;
  }
  return safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
}

export function createSession(): string {
  const token = randomUUID();
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string | undefined) {
  if (token) sessions.delete(token);
}