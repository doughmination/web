/* src/lib/server/sso.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Admin sign-in through the Doughmination SSO (OpenID Connect, Authorization
// Code + PKCE), run entirely on the server. Who may sign in at all is decided
// by the SSO application's group lock; this file only proves who came back.
//
// The code exchange and userinfo call are server-to-server over TLS with the
// client secret, so their responses are trusted directly, as the API does.
// The session is a signed, httpOnly cookie, so no token ever reaches the page.

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { error, redirect, type Cookies, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/env';
import { SESSION_SECRET, SSO_CLIENT_ID, SSO_CLIENT_SECRET, SSO_ISSUER } from '$app/env/private';

import { authUrl, websiteUrl } from '#lib';

const SESSION_COOKIE = 'admin_session';
const LOGIN_COOKIE = 'admin_login';
const SESSION_HOURS = 12;
const LOGIN_MINUTES = 10;

export interface AdminSession {
	sub: string;
	name: string;
	exp: number;
}

interface Discovery {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	userinfo_endpoint: string;
}

function config() {
	if (!SSO_CLIENT_ID || !SSO_CLIENT_SECRET || !SESSION_SECRET) {
		error(503, 'Admin sign-in is not configured');
	}
	const issuer = (SSO_ISSUER || authUrl).replace(/\/+$/, '');
	return {
		issuer,
		clientId: SSO_CLIENT_ID,
		clientSecret: SSO_CLIENT_SECRET,
		secret: SESSION_SECRET
	};
}

let discovery: Promise<Discovery> | undefined;

function discover(issuer: string): Promise<Discovery> {
	discovery ??= fetch(`${issuer}/.well-known/openid-configuration`)
		.then((res) => {
			if (!res.ok) throw new Error(`SSO discovery failed (${res.status})`);
			return res.json() as Promise<Discovery>;
		})
		.catch((err) => {
			discovery = undefined; // retry next time
			throw err;
		});
	return discovery;
}

// ---- Signed cookies ---------------------------------------------------------

const b64url = (buf: Buffer) => buf.toString('base64url');

function sign(value: object, secret: string): string {
	const payload = b64url(Buffer.from(JSON.stringify(value)));
	return `${payload}.${b64url(createHmac('sha256', secret).update(payload).digest())}`;
}

function verify<T extends { exp: number }>(token: string | undefined, secret: string): T | null {
	const [payload, mac] = token?.split('.') ?? [];
	if (!payload || !mac) return null;
	const expected = createHmac('sha256', secret).update(payload).digest();
	const given = Buffer.from(mac, 'base64url');
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
	try {
		const value = JSON.parse(Buffer.from(payload, 'base64url').toString()) as T;
		return value.exp > Date.now() ? value : null;
	} catch {
		return null;
	}
}

const cookieOptions = (maxAge: number) =>
	({ path: '/admin', httpOnly: true, secure: !dev, sameSite: 'lax', maxAge }) as const;

// ---- Flow ---------------------------------------------------------------------

// Fixed in production rather than taken from the request's Host header
const redirectUri = (url: URL) => `${dev ? url.origin : websiteUrl}/admin/callback`;

/** Start sign-in: remember state + PKCE verifier, then send the browser to the SSO. */
export async function beginLogin({ url, cookies }: RequestEvent): Promise<never> {
	const { issuer, clientId, secret } = config();
	const doc = await discover(issuer);

	const state = b64url(randomBytes(32));
	const verifier = b64url(randomBytes(32));
	cookies.set(
		LOGIN_COOKIE,
		sign({ state, verifier, exp: Date.now() + LOGIN_MINUTES * 60_000 }, secret),
		cookieOptions(LOGIN_MINUTES * 60)
	);

	const target = new URL(doc.authorization_endpoint);
	target.search = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: redirectUri(url),
		scope: 'openid profile',
		state,
		code_challenge: b64url(createHash('sha256').update(verifier).digest()),
		code_challenge_method: 'S256'
	}).toString();
	redirect(303, target.toString(), { external: true });
}

/** Finish sign-in: check state, swap the code for tokens and open a session. */
export async function completeLogin({ url, cookies }: RequestEvent): Promise<never> {
	const { issuer, clientId, clientSecret, secret } = config();
	const login = verify<{ state: string; verifier: string; exp: number }>(
		cookies.get(LOGIN_COOKIE),
		secret
	);
	cookies.delete(LOGIN_COOKIE, { path: '/admin' });

	const denied = url.searchParams.get('error');
	if (denied)
		error(403, denied === 'access_denied' ? 'Your SSO account is not allowed here' : denied);

	const code = url.searchParams.get('code');
	if (!login || !code || url.searchParams.get('state') !== login.state) {
		error(400, 'Sign-in expired or invalid, please try again');
	}

	const doc = await discover(issuer);
	const iss = url.searchParams.get('iss');
	if (iss !== null && iss !== doc.issuer) error(400, 'Sign-in came from an unexpected issuer');

	const tokenRes = await fetch(doc.token_endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectUri(url),
			code_verifier: login.verifier,
			client_id: clientId,
			client_secret: clientSecret
		})
	});
	if (!tokenRes.ok) error(502, `The SSO rejected the sign-in (${tokenRes.status})`);
	const { access_token } = (await tokenRes.json()) as { access_token?: string };
	if (!access_token) error(502, 'The SSO did not return an access token');

	const infoRes = await fetch(doc.userinfo_endpoint, {
		headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
	});
	if (!infoRes.ok) error(502, `SSO userinfo request failed (${infoRes.status})`);
	const claims = (await infoRes.json()) as {
		sub?: string;
		name?: string;
		preferred_username?: string;
	};
	if (!claims.sub) error(502, 'The SSO did not return a subject identifier');

	const session: AdminSession = {
		sub: claims.sub,
		name: claims.name || claims.preferred_username || 'Admin',
		exp: Date.now() + SESSION_HOURS * 3_600_000
	};
	cookies.set(SESSION_COOKIE, sign(session, secret), cookieOptions(SESSION_HOURS * 3600));
	redirect(303, '/admin');
}

export function getSession(cookies: Cookies): AdminSession | null {
	return verify<AdminSession>(cookies.get(SESSION_COOKIE), config().secret);
}

/** The signed-in admin, or a redirect to sign in. */
export function requireSession(cookies: Cookies): AdminSession {
	const session = getSession(cookies);
	if (!session) redirect(303, '/admin/login');
	return session;
}

export function endSession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/admin' });
}
