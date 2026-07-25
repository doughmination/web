// Typed wrappers around the JSON API.

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  durationS: number | null;
  coverUrl: string | null;
  streamUrl: string;
  uploadedBy: string | null;
};

export type Playlist = {
  id: string;
  name: string;
};

export type PlaylistDetail = Playlist & {
  songs: Song[];
};

export type Me = {
  id: string;
  email: string | null;
  name: string | null;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  async me(): Promise<Me | null> {
    const res = await fetch("/api/me");
    const data = await json<{ user: Me | null }>(res);
    return data.user;
  },

  logout(): Promise<Response> {
    return fetch("/api/auth/logout", { method: "POST" });
  },

  listSongs(query?: string): Promise<Song[]> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    return fetch(`/api/songs${qs}`).then(json<Song[]>);
  },

  uploadSong(form: FormData): Promise<Song> {
    return fetch("/api/songs", { method: "POST", body: form }).then(json<Song>);
  },

  deleteSong(id: string): Promise<Response> {
    return fetch(`/api/songs/${id}`, { method: "DELETE" });
  },

  listPlaylists(): Promise<Playlist[]> {
    return fetch("/api/playlists").then(json<Playlist[]>);
  },

  createPlaylist(name: string): Promise<Playlist> {
    return fetch("/api/playlists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(json<Playlist>);
  },

  getPlaylist(id: string): Promise<PlaylistDetail> {
    return fetch(`/api/playlists/${id}`).then(json<PlaylistDetail>);
  },

  deletePlaylist(id: string): Promise<Response> {
    return fetch(`/api/playlists/${id}`, { method: "DELETE" });
  },

  addToPlaylist(playlistId: string, songId: string): Promise<Response> {
    return fetch(`/api/playlists/${playlistId}/songs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ songId }),
    });
  },

  removeFromPlaylist(playlistId: string, songId: string): Promise<Response> {
    return fetch(`/api/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
    });
  },
};
