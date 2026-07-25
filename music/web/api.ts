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
  isPublic: boolean;
};

export type PlaylistDetail = Playlist & {
  isOwner: boolean;
  ownerName: string | null;
  ownerAvatar: string | null;
  songs: Song[];
};

export type PublicPlaylist = {
  id: string;
  name: string;
  ownerName: string | null;
  ownerAvatar: string | null;
  songCount: number;
};

export type Me = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export type SyncedLine = { t: number; text: string };

export type Lyrics = {
  instrumental: boolean;
  synced: SyncedLine[];
  plain: string | null;
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

  getLyrics(songId: string): Promise<Lyrics> {
    return fetch(`/api/songs/${songId}/lyrics`).then(json<Lyrics>);
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

  searchPublicPlaylists(query?: string): Promise<PublicPlaylist[]> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    return fetch(`/api/playlists/public${qs}`).then(json<PublicPlaylist[]>);
  },

  updatePlaylist(
    id: string,
    patch: { name?: string; isPublic?: boolean },
  ): Promise<Playlist> {
    return fetch(`/api/playlists/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    }).then(json<Playlist>);
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
