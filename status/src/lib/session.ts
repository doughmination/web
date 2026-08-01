/* status/src/lib/session.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Stateless cookie sessions signed with JOSE (HS256). Nothing is stored
 * server-side, so sessions survive container restarts and horizontal scaling.
 * Two cookies:
 *   - "status_pending"  short-lived, holds the PKCE state across the redirect
 *   - "status_session"  the logged-in identity
 */

import { cookies } from "next/headers";
import {
  SignJWT,
  jwtVerify,
} from "jose";

import type { Pending } from "./oidc";

const SESSION_COOKIE = "status_session";
const PENDING_COOKIE = "status_pending";

// 7 days for a login, 10 minutes for an in-flight redirect.
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PENDING_TTL_SECONDS = 60 * 10;

function secret(): Uint8Array {
  const value = process.env.STATUS_SESSION_SECRET || "";
  if (value.length < 16) {
    throw new Error(
      "STATUS_SESSION_SECRET is missing or too short (need 16+ chars)",
    );
  }
  return new TextEncoder().encode(value);
}

async function sign(
  claims: Record<string, unknown>,
  ttlSeconds: number,
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

async function verify(
  token: string | undefined,
): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---- Identity ----

export interface Identity {
  username: string;
  sub: string;
}

export async function createSession(identity: Identity): Promise<void> {
  const token = await sign({ ...identity }, SESSION_TTL_SECONDS);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function readSession(): Promise<Identity | null> {
  const jar = await cookies();
  const payload = await verify(jar.get(SESSION_COOKIE)?.value);
  if (!payload || typeof payload.username !== "string") return null;
  return {
    username: payload.username,
    sub: typeof payload.sub === "string" ? payload.sub : "",
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** True when the identity is allowed into /admin (ADMIN_USERS allowlist). */
export function isAdmin(identity: Identity | null): boolean {
  if (!identity) return false;
  const allowed = (process.env.STATUS_ADMIN_USERS || "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  // Empty allowlist = any authenticated PocketID user is fine.
  if (allowed.length === 0) return true;
  return allowed.includes(identity.username.toLowerCase());
}

// ---- Pending PKCE state ----

export async function savePending(pending: Pending): Promise<void> {
  const token = await sign({ ...pending }, PENDING_TTL_SECONDS);
  const jar = await cookies();
  jar.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_TTL_SECONDS,
  });
}

export async function takePending(): Promise<Pending | null> {
  const jar = await cookies();
  const payload = await verify(jar.get(PENDING_COOKIE)?.value);
  jar.delete(PENDING_COOKIE);
  if (
    !payload ||
    typeof payload.state !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.codeVerifier !== "string"
  ) {
    return null;
  }
  return {
    state: payload.state,
    nonce: payload.nonce,
    codeVerifier: payload.codeVerifier,
    returnTo: typeof payload.returnTo === "string" ? payload.returnTo : "/admin",
  };
}
