import postgres from "postgres";

import { config } from "../config.ts";

// Single shared connection pool for the whole app.
export const sql = postgres(config.databaseUrl, {
  max: 10,
  onnotice: () => {}, // silence NOTICE spam
});

// Row types mirror the schema in schema.sql.

export type User = {
  id: string;
  oidc_sub: string;
  email: string | null;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: Date;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  cover_path: string | null;
  file_path: string;
  mime: string | null;
  duration_s: number | null;
  size_bytes: string; // bigint comes back as string
  explicit: boolean;
  uploaded_by: string | null;
  created_at: Date;
};

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: Date;
};
