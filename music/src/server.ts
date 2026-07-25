// App entrypoint. Wires middleware + routes, serves the built frontend.

import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import { config } from "./config.ts";
import {
  loadUser,
  isAdmin,
  type AppEnv,
} from "./auth/middleware.ts";
import { ensureMediaDirs } from "./lib/media.ts";
import { authRoutes } from "./routes/auth.ts";
import { songRoutes } from "./routes/songs.ts";
import { playlistRoutes } from "./routes/playlists.ts";

await ensureMediaDirs();

const app = new Hono<AppEnv>();

// Every request gets the current user (or null) attached.
app.use("*", loadUser);

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ user: null });
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      isAdmin: isAdmin(user),
    },
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/songs", songRoutes);
app.route("/api/playlists", playlistRoutes);

// Serve bundled frontend assets (built by `bun build` into ./dist).
app.use("/app.js", serveStatic({ path: "./dist/app.js" }));
app.use("/styles.css", serveStatic({ path: "./web/styles.css" }));
app.use("/favicon.png", serveStatic({ path: "./public/favicon.png" }));

// SPA fallback: any non-API route returns index.html.
app.get("*", serveStatic({ path: "./web/index.html" }));

console.log(`Music server on ${config.appUrl} (port ${config.port})`);

export default {
  port: config.port,
  fetch: app.fetch,
  // Allow large uploads.
  maxRequestBodySize: config.maxUploadBytes + 16 * 1024 * 1024,
};
