// Playlists. Each is owned by one user (only the owner edits). A playlist can
// be marked public ("shared") — then any signed-in user can view + play it and
// find it via search. Editing stays owner-only.

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

// My own playlists.
playlistRoutes.get("/", async (c) => {
  const user = c.get("user")!;
  const rows = await sql<Playlist[]>`
    SELECT * FROM playlists
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
  return c.json(rows.map(toPublicPlaylist));
});

// Search shared playlists by name OR owner name. Must be declared before
// "/:id" so "public" isn't captured as an id.
playlistRoutes.get("/public", async (c) => {
  const q = c.req.query("q")?.trim();
  const like = q ? `%${q.toLowerCase()}%` : null;

  const rows = await sql<
    Array<{
      id: string;
      name: string;
      owner_name: string | null;
      owner_avatar: string | null;
      song_count: string;
    }>
  >`
    SELECT
      p.id,
      p.name,
      u.name       AS owner_name,
      u.avatar_url AS owner_avatar,
      (SELECT count(*) FROM playlist_songs ps WHERE ps.playlist_id = p.id)
        AS song_count
    FROM playlists p
    JOIN users u ON u.id = p.user_id
    WHERE p.is_public
      AND (
        ${like}::text IS NULL
        OR lower(p.name) LIKE ${like}
        OR lower(coalesce(u.name, '')) LIKE ${like}
      )
    ORDER BY p.name ASC
    LIMIT 100
  `;

  return c.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      ownerName: r.owner_name,
      ownerAvatar: r.owner_avatar,
      songCount: Number(r.song_count),
    })),
  );
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
  return c.json(toPublicPlaylist(rows[0]!), 201);
});

// Viewable by the owner, or by anyone if the playlist is public.
playlistRoutes.get("/:id", async (c) => {
  const user = c.get("user")!;
  const rows = await sql<
    Array<Playlist & { owner_name: string | null; owner_avatar: string | null }>
  >`
    SELECT p.*, u.name AS owner_name, u.avatar_url AS owner_avatar
    FROM playlists p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = ${c.req.param("id")!}
  `;
  const pl = rows[0];
  if (!pl) return c.json({ error: "not_found" }, 404);

  const isOwner = pl.user_id === user.id;
  if (!isOwner && !pl.is_public) {
    return c.json({ error: "not_found" }, 404);
  }

  const songs = await sql<Array<Song & { position: number }>>`
    SELECT s.*, ps.position
    FROM playlist_songs ps
    JOIN songs s ON s.id = ps.song_id
    WHERE ps.playlist_id = ${pl.id}
    ORDER BY ps.position ASC, ps.song_id ASC
  `;

  return c.json({
    id: pl.id,
    name: pl.name,
    isPublic: pl.is_public,
    isOwner,
    ownerName: pl.owner_name,
    ownerAvatar: pl.owner_avatar,
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

// Rename and/or toggle sharing. Owner only.
playlistRoutes.patch("/:id", async (c) => {
  const pl = await owned(c);
  if (!pl) return c.json({ error: "not_found" }, 404);

  const body = await c.req
    .json<{ name?: string; isPublic?: boolean }>()
    .catch(() => ({}) as { name?: string; isPublic?: boolean });

  const name = body.name?.trim() ?? pl.name;
  const isPublic =
    typeof body.isPublic === "boolean" ? body.isPublic : pl.is_public;

  const rows = await sql<Playlist[]>`
    UPDATE playlists
    SET name = ${name}, is_public = ${isPublic}
    WHERE id = ${pl.id}
    RETURNING *
  `;
  return c.json(toPublicPlaylist(rows[0]!));
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

// --- helpers --------------------------------------------------------------

function toPublicPlaylist(p: Playlist) {
  return {
    id: p.id,
    name: p.name,
    isPublic: p.is_public,
  };
}

// Fetch the playlist only if it belongs to the current user.
async function owned(c: Context<AppEnv>) {
  const user = c.get("user")!;
  const rows = await sql<Playlist[]>`
    SELECT * FROM playlists
    WHERE id = ${c.req.param("id")!} AND user_id = ${user.id}
  `;
  return rows[0];
}
