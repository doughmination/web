// Sessions are opaque random ids stored in Redis (server-side, revocable).
// The cookie only holds the id, so logout truly kills the session and we can
// force-logout every session for a user.
//
// The short-lived OIDC handshake values (state / nonce / PKCE verifier) stay
// as self-contained signed cookies (jose) — they don't need Redis.

import {
  SignJWT,
  jwtVerify,
} from "jose";

import { config } from "../config.ts";
import { redis } from "../redis.ts";

const key = new TextEncoder().encode(config.sessionSecret);

const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days, sliding

function sessKey(id: string): string {
  return `music:sess:${id}`;
}

function userSetKey(userId: string): string {
  return `music:usess:${userId}`;
}

function randomId(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// --- server-side sessions -------------------------------------------------

export async function createSession(userId: string): Promise<string> {
  const id = randomId();
  await redis
    .multi()
    .set(sessKey(id), userId, "EX", SESSION_TTL_SEC)
    .sadd(userSetKey(userId), id)
    .exec();
  return id;
}

// Returns the userId, refreshing the TTL (sliding expiry). Fails open to null.
export async function readSession(id: string): Promise<string | null> {
  try {
    const userId = await redis.get(sessKey(id));
    if (!userId) return null;
    await redis.expire(sessKey(id), SESSION_TTL_SEC);
    return userId;
  } catch {
    return null;
  }
}

export async function destroySession(id: string): Promise<void> {
  const userId = await redis.get(sessKey(id));
  const m = redis.multi().del(sessKey(id));
  if (userId) m.srem(userSetKey(userId), id);
  await m.exec();
}

// Force-logout every session for a user.
export async function destroyAllSessions(userId: string): Promise<void> {
  const ids = await redis.smembers(userSetKey(userId));
  const m = redis.multi();
  for (const id of ids) m.del(sessKey(id));
  m.del(userSetKey(userId));
  await m.exec();
}

// --- short-lived signed cookies (OIDC handshake) --------------------------

export async function signShortLived(value: string): Promise<string> {
  return await new SignJWT({ v: value })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(key);
}

export async function readShortLived(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    const v = payload.v;
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}

export const cookieNames = {
  session: "ms_session",
  state: "ms_oidc_state",
  nonce: "ms_oidc_nonce",
  verifier: "ms_oidc_verifier",
} as const;

export const secureCookieOpts = {
  httpOnly: true,
  sameSite: "Lax",
  path: "/",
  secure: config.isProd,
} as const;
