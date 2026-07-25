// Shared music library: list, upload, stream (Range), cover, delete.

import { Hono } from "hono";
import { stat, unlink } from "node:fs/promises";

import { config } from "../config.ts";
import { sql, type Song } from "../db/index.ts";
import {
  requireAuth,
  type AppEnv,
} from "../auth/middleware.ts";
import { rateLimit } from "../lib/ratelimit.ts";
import {
  ensureMediaDirs,
  extractTags,
  resolveMedia,
  saveAudio,
  saveCover,
} from "../lib/media.ts";

export const songRoutes = new Hono<AppEnv>();

// Everyone authenticated sees the whole shared library.
songRoutes.get("/", requireAuth, async (c) => {
  const q = c.req.query("q");
  const rows = q
    ? await sql<Song[]>`
        SELECT * FROM songs
        WHERE lower(title)  LIKE ${"%" + q.toLowerCase() + "%"}
           OR lower(artist) LIKE ${"%" + q.toLowerCase() + "%"}
        ORDER BY created_at DESC
      `
    : await sql<Song[]>`
        SELECT * FROM songs ORDER BY created_at DESC
      `;
  return c.json(rows.map(toPublicSong));
});

songRoutes.get("/:id", requireAuth, async (c) => {
  const song = await getSong(c.req.param("id")!);
  if (!song) return c.json({ error: "not_found" }, 404);
  return c.json(toPublicSong(song));
});

// Upload. title + artist required; cover + rest optional; tags auto-read.
songRoutes.post(
  "/",
  rateLimit({ name: "upload", limit: 30, windowSec: 60 }),
  requireAuth,
  async (c) => {
  await ensureMediaDirs();
  const user = c.get("user")!;

  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return c.json({ error: "file_required" }, 400);
  }
  if (file.size > config.maxUploadBytes) {
    return c.json({ error: "file_too_large" }, 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const tags = await extractTags(bytes, file.type);

  // Form fields win; fall back to embedded tags. title/artist are required.
  const title = (str(form.get("title")) ?? tags.title)?.trim();
  const artist = (str(form.get("artist")) ?? tags.artist)?.trim();
  if (!title || !artist) {
    return c.json({ error: "title_and_artist_required" }, 400);
  }

  const album = str(form.get("album")) ?? tags.album;
  const filePath = await saveAudio(bytes, file.name);

  // Cover priority: uploaded cover field, else embedded art.
  let coverPath: string | null = null;
  const coverFile = form.get("cover");
  if (coverFile instanceof File && coverFile.size > 0) {
    const cbytes = new Uint8Array(await coverFile.arrayBuffer());
    const ext = coverFile.type.split("/")[1] ?? "jpg";
    coverPath = await saveCover(cbytes, ext);
  } else if (tags.cover) {
    coverPath = await saveCover(tags.cover.data, tags.cover.ext);
  }

  const rows = await sql<Song[]>`
    INSERT INTO songs
      (title, artist, album, cover_path, file_path, mime, duration_s,
       size_bytes, uploaded_by)
    VALUES
      (${title}, ${artist}, ${album ?? null}, ${coverPath}, ${filePath},
       ${file.type || null}, ${tags.durationS}, ${file.size}, ${user.id})
    RETURNING *
  `;
  return c.json(toPublicSong(rows[0]!), 201);
});

// Audio streaming with HTTP Range support (seek/scrub).
songRoutes.get("/:id/stream", requireAuth, async (c) => {
  const song = await getSong(c.req.param("id")!);
  if (!song) return c.json({ error: "not_found" }, 404);

  const abs = resolveMedia(song.file_path);
  const info = await stat(abs).catch(() => null);
  if (!info) return c.json({ error: "file_missing" }, 404);

  const total = info.size;
  const mime = song.mime ?? "audio/mpeg";
  const range = c.req.header("range");

  if (!range) {
    return new Response(Bun.file(abs).stream(), {
      headers: {
        "content-type": mime,
        "content-length": String(total),
        "accept-ranges": "bytes",
      },
    });
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  const start = match?.[1] ? Number(match[1]) : 0;
  const end = match?.[2] ? Number(match[2]) : total - 1;

  if (start >= total || end >= total || start > end) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { "content-range": `bytes */${total}` },
    });
  }

  const chunk = Bun.file(abs).slice(start, end + 1);
  return new Response(chunk.stream(), {
    status: 206,
    headers: {
      "content-type": mime,
      "content-length": String(end - start + 1),
      "content-range": `bytes ${start}-${end}/${total}`,
      "accept-ranges": "bytes",
    },
  });
});

songRoutes.get("/:id/cover", requireAuth, async (c) => {
  const song = await getSong(c.req.param("id")!);
  if (!song?.cover_path) return c.json({ error: "not_found" }, 404);

  const abs = resolveMedia(song.cover_path);
  const info = await stat(abs).catch(() => null);
  if (!info) return c.json({ error: "not_found" }, 404);

  return new Response(Bun.file(abs).stream(), {
    headers: {
      "content-type": "image/*",
      "cache-control": "public, max-age=86400",
    },
  });
});

// Only the uploader may delete.
songRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user")!;
  const song = await getSong(c.req.param("id")!);
  if (!song) return c.json({ error: "not_found" }, 404);
  if (song.uploaded_by !== user.id) {
    return c.json({ error: "forbidden" }, 403);
  }

  await sql`DELETE FROM songs WHERE id = ${song.id}`;
  await unlink(resolveMedia(song.file_path)).catch(() => {});
  if (song.cover_path) {
    await unlink(resolveMedia(song.cover_path)).catch(() => {});
  }
  return c.json({ ok: true });
});

// --- helpers --------------------------------------------------------------

async function getSong(id: string): Promise<Song | undefined> {
  const rows = await sql<Song[]>`SELECT * FROM songs WHERE id = ${id}`;
  return rows[0];
}

function str(v: FormDataEntryValue | null): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

// Shape sent to the client (never expose absolute filesystem paths).
function toPublicSong(s: Song) {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album,
    durationS: s.duration_s,
    hasCover: Boolean(s.cover_path),
    coverUrl: s.cover_path ? `/api/songs/${s.id}/cover` : null,
    streamUrl: `/api/songs/${s.id}/stream`,
    uploadedBy: s.uploaded_by,
    createdAt: s.created_at,
  };
}
