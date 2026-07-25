// Per-user playlists. A user can only see/modify their own.

import { Hono } from "hono";
import type { Context } from "hono";

import {
  sql,
  type Playlist,
  type Song,
} from "../db/index.ts";
import {
  requireAuth,
  type AppEnv,
} from "../auth/middleware.ts";

export const playlistRoutes = new Hono<AppEnv>();

playlistRoutes.use("*", requireAuth);

playlistRoutes.get("/", async (c) => {
  const user = c.get("user")!;
  const rows = await sql<Playlist[]>`
    SELECT * FROM playlists
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
  return c.json(rows);
});

playlistRoutes.post("/", async (c) => {
  const user = c.get("user")!;
  const body = await c.req
    .json<{ name?: string }>()
    .catch(() => ({}) as { name?: string });
  const name = body.name?.trim();
  if (!name) return c.json({ error: "name_required" }, 400);

  const rows = await sql<Playlist[]>`
    INSERT INTO playlists (user_id, name)
    VALUES (${user.id}, ${name})
    RETURNING *
  `;
  return c.json(rows[0]!, 201);
});

playlistRoutes.get("/:id", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  const songs = await sql<Song[]>`
    SELECT s.*, ps.position
    FROM playlist_songs ps
    JOIN songs s ON s.id = ps.song_id
    WHERE ps.playlist_id = ${pl.id}
    ORDER BY ps.position ASC, ps.song_id ASC
  `;

  return c.json({
    ...pl,
    songs: songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      durationS: s.duration_s,
      coverUrl: s.cover_path ? `/api/songs/${s.id}/cover` : null,
      streamUrl: `/api/songs/${s.id}/stream`,
    })),
  });
});

playlistRoutes.patch("/:id", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  const body = await c.req
    .json<{ name?: string }>()
    .catch(() => ({}) as { name?: string });
  const name = body.name?.trim();
  if (!name) return c.json({ error: "name_required" }, 400);

  const rows = await sql<Playlist[]>`
    UPDATE playlists SET name = ${name}
    WHERE id = ${pl.id}
    RETURNING *
  `;
  return c.json(rows[0]!);
});

playlistRoutes.delete("/:id", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  await sql`DELETE FROM playlists WHERE id = ${pl.id}`;
  return c.json({ ok: true });
});

playlistRoutes.post("/:id/songs", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  const body = await c.req
    .json<{ songId?: string }>()
    .catch(() => ({}) as { songId?: string });
  const songId = body.songId;
  if (!songId) return c.json({ error: "songId_required" }, 400);

  // Append at the end (max position + 1).
  await sql`
    INSERT INTO playlist_songs (playlist_id, song_id, position)
    VALUES (
      ${pl.id},
      ${songId},
      COALESCE(
        (SELECT MAX(position) + 1 FROM playlist_songs WHERE playlist_id = ${pl.id}),
        0
      )
    )
    ON CONFLICT (playlist_id, song_id) DO NOTHING
  `;
  return c.json({ ok: true });
});

playlistRoutes.delete("/:id/songs/:songId", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  await sql`
    DELETE FROM playlist_songs
    WHERE playlist_id = ${pl.id} AND song_id = ${c.req.param("songId")!}
  `;
  return c.json({ ok: true });
});

// --- helper ---------------------------------------------------------------

// Fetch the playlist only if it belongs to the current user.
async function owned(c: Context<AppEnv>) {
  const user = c.get("user")!;
  const rows = await sql<Playlist[]>`
    SELECT * FROM playlists
    WHERE id = ${c.req.param("id")!} AND user_id = ${user.id}
  `;
  return rows[0];
}
