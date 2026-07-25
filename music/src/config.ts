// Central config. Reads env once, fails fast if something required is missing.
//
// Vars shared across the monorepo's dotenvx .env are UNPREFIXED (OIDC_ISSUER,
// REDIS_URL). Vars that must differ per app are MUSIC_-prefixed so they don't
// collide with the mailbox's values. The OIDC redirect is derived from
// MUSIC_APP_URL, and there's no session secret (sessions + the OIDC handshake
// both live in Redis).

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const appUrl = optional("MUSIC_APP_URL", "http://localhost:4060").replace(
  /\/$/,
  "",
);

export const config = {
  appUrl,
  port: Number(optional("MUSIC_PORT", "4060")),
  isProd: process.env.NODE_ENV === "production",

  databaseUrl: required("MUSIC_DATABASE_URL"),
  redisUrl: required("REDIS_URL"), // shared with the other services

  oidc: {
    issuer: required("OIDC_ISSUER").replace(/\/$/, ""), // shared PocketID
    clientId: required("MUSIC_OIDC_CLIENT_ID"), // dedicated music client
    clientSecret: required("MUSIC_OIDC_CLIENT_SECRET"),
    redirectUri: `${appUrl}/api/auth/callback`, // derived, not a separate var
    scope: "openid profile email",
  },

  mediaDir: optional("MUSIC_MEDIA_DIR", "./data/media"),
  maxUploadBytes: Number(optional("MUSIC_MAX_UPLOAD_MB", "200")) * 1024 * 1024,
} as const;
