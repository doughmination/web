/* status/src/lib/oidc.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * PocketID (OIDC) core — framework-agnostic. Authorization-code flow with
 * PKCE; the ID token is verified against PocketID's JWKS with `jose`. Route
 * handlers under app/api/auth wire these into Next and own the cookies.
 * Mirrors mailbox/lib/oidc.ts so both sites share one auth shape.
 */

import crypto from "node:crypto";
import {
  createRemoteJWKSet,
  jwtVerify,
} from "jose";

// STATUS_-prefixed so this app can share the one root .env with mailbox
// without clobbering its OIDC_* / DATA_DIR values.
const OIDC = {
  issuer: (process.env.STATUS_OIDC_ISSUER || "").replace(/\/+$/, ""),
  clientId: process.env.STATUS_OIDC_CLIENT_ID || "",
  clientSecret: process.env.STATUS_OIDC_CLIENT_SECRET || "",
  redirectUri: process.env.STATUS_OIDC_REDIRECT_URI || "",
  scope: process.env.STATUS_OIDC_SCOPE || "openid profile email",
  postLogoutRedirectUri: process.env.STATUS_OIDC_POST_LOGOUT_REDIRECT_URI || "",
};

interface Discovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
}

let discovery: Discovery | null = null;
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

async function getDiscovery(): Promise<Discovery> {
  if (discovery && jwks) return discovery;

  const url = `${OIDC.issuer}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OIDC discovery failed (${res.status}) at ${url}`);
  }

  discovery = (await res.json()) as Discovery;
  jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  return discovery;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function randomToken(bytes = 32): string {
  return b64url(crypto.randomBytes(bytes));
}

function sanitizeUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pickUsername(claims: Record<string, unknown>): string {
  const email =
    typeof claims.email === "string" ? claims.email.split("@")[0] : "";
  const raw =
    (typeof claims.preferred_username === "string" &&
      claims.preferred_username) ||
    email ||
    (typeof claims.sub === "string" && claims.sub) ||
    "";
  return sanitizeUsername(String(raw));
}

export interface Pending {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
}

/** Build the PocketID authorize URL and the pending state to stash in a cookie. */
export async function buildAuthUrl(
  returnTo: string,
): Promise<{ url: string; pending: Pending }> {
  const discovered = await getDiscovery();

  const state = randomToken();
  const nonce = randomToken();
  const codeVerifier = randomToken(32);
  const codeChallenge = b64url(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );

  const url = new URL(discovered.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", OIDC.clientId);
  url.searchParams.set("redirect_uri", OIDC.redirectUri);
  url.searchParams.set("scope", OIDC.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return {
    url: url.toString(),
    pending: {
      state,
      nonce,
      codeVerifier,
      returnTo: returnTo.startsWith("/") ? returnTo : "/admin",
    },
  };
}

/** Exchange the code, verify the ID token, and return the identity. */
export async function completeLogin(
  code: string,
  pending: Pending,
): Promise<{ username: string; sub: string }> {
  const discovered = await getDiscovery();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: OIDC.redirectUri,
    client_id: OIDC.clientId,
    client_secret: OIDC.clientSecret,
    code_verifier: pending.codeVerifier,
  });

  const tokenRes = await fetch(discovered.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`token exchange failed (${tokenRes.status}): ${text}`);
  }

  const tokens = (await tokenRes.json()) as {
    id_token?: string;
  };
  if (!tokens.id_token) throw new Error("no id_token returned");

  const { payload } = await jwtVerify(tokens.id_token, jwks!, {
    issuer: discovered.issuer,
    audience: OIDC.clientId,
  });

  if (payload.nonce !== pending.nonce) throw new Error("nonce mismatch");

  const username = pickUsername(payload as Record<string, unknown>);
  if (!username) throw new Error("no usable username in token");

  return {
    username,
    sub: String(payload.sub || ""),
  };
}

/**
 * The public origin of this site (e.g. https://doughmination.org). Behind a
 * reverse proxy, request.nextUrl.origin resolves to the container's bind
 * address (0.0.0.0:PORT), so redirects must be built from this instead.
 * Derived from the configured OIDC redirect URI, or STATUS_PUBLIC_URL.
 */
export function publicOrigin(): string {
  const explicit = process.env.STATUS_PUBLIC_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  try {
    return new URL(OIDC.redirectUri).origin;
  } catch {
    return "";
  }
}

/** PocketID end-session URL for logout, if configured. */
export async function endSessionUrl(): Promise<string | null> {
  const discovered = await getDiscovery().catch(() => null);
  if (!discovered?.end_session_endpoint || !OIDC.postLogoutRedirectUri) {
    return null;
  }
  const url = new URL(discovered.end_session_endpoint);
  url.searchParams.set("post_logout_redirect_uri", OIDC.postLogoutRedirectUri);
  url.searchParams.set("client_id", OIDC.clientId);
  return url.toString();
}
