// Central config. Reads env once, fails fast if something required is missing.
//
// All vars are prefixed MUSIC_ because this app shares a single dotenvx .env
// with the other monorepo services (mailbox, etc). Prefixing avoids clashing
// with their OIDC_*/DATABASE_URL/etc values.

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

export const config = {
  appUrl: optional("MUSIC_APP_URL", "http://localhost:4060"),
  port: Number(optional("MUSIC_PORT", "4060")),
  isProd: process.env.NODE_ENV === "production",

  databaseUrl: required("MUSIC_DATABASE_URL"),
  redisUrl: required("MUSIC_REDIS_URL"),

  oidc: {
    issuer: required("MUSIC_OIDC_ISSUER").replace(/\/$/, ""),
    clientId: required("MUSIC_OIDC_CLIENT_ID"),
    clientSecret: required("MUSIC_OIDC_CLIENT_SECRET"),
    redirectUri: required("MUSIC_OIDC_REDIRECT_URI"),
    scope: "openid profile email",
  },

  sessionSecret: required("MUSIC_SESSION_SECRET"),

  mediaDir: optional("MUSIC_MEDIA_DIR", "./data/media"),
  maxUploadBytes: Number(optional("MUSIC_MAX_UPLOAD_MB", "200")) * 1024 * 1024,
} as const;
