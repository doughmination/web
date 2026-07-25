-- Idempotent schema. Safe to run repeatedly (used by migrate.ts).
-- gen_random_uuid() is built into Postgres 13+ core, so no extension is
-- needed and the app's DB role requires no superuser rights.

CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oidc_sub    text UNIQUE NOT NULL,
  email       text,
  name        text,
  username    text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Added after initial release; safe on existing databases.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

CREATE TABLE IF NOT EXISTS songs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  artist      text NOT NULL,
  album       text,
  cover_path  text,
  file_path   text NOT NULL,
  mime        text,
  duration_s  int,
  size_bytes  bigint,
  explicit    boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Added after initial release; safe on existing databases.
ALTER TABLE songs ADD COLUMN IF NOT EXISTS explicit boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS songs_title_idx  ON songs (lower(title));
CREATE INDEX IF NOT EXISTS songs_artist_idx ON songs (lower(artist));

CREATE TABLE IF NOT EXISTS playlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name        text NOT NULL,
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Added after initial release; safe on existing databases.
ALTER TABLE playlists ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS playlists_user_idx   ON playlists (user_id);
CREATE INDEX IF NOT EXISTS playlists_public_idx ON playlists (is_public) WHERE is_public;

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id uuid NOT NULL REFERENCES playlists (id) ON DELETE CASCADE,
  song_id     uuid NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
  position    int  NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id)
);
