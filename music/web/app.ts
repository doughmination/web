// Single-page app: login gate, library, upload, playlists, player bar.

import {
  api,
  type Song,
  type Playlist,
} from "./api.ts";
import {
  Player,
  formatTime,
} from "./player.ts";

const root = document.getElementById("app")!;
const player = new Player();

type View =
  | { kind: "library" }
  | { kind: "playlist"; id: string };

const state = {
  me: null as Awaited<ReturnType<typeof api.me>>,
  songs: [] as Song[],
  playlists: [] as Playlist[],
  view: { kind: "library" } as View,
  visibleSongs: [] as Song[],
};

player.onChange = renderPlayerBar;

// --- boot -----------------------------------------------------------------

async function boot(): Promise<void> {
  state.me = await api.me();
  if (!state.me) {
    renderLogin();
    return;
  }
  await Promise.all([loadSongs(), loadPlaylists()]);
  render();
}

async function loadSongs(): Promise<void> {
  state.songs = await api.listSongs();
}

async function loadPlaylists(): Promise<void> {
  state.playlists = await api.listPlaylists();
}

// --- top-level render ------------------------------------------------------

function render(): void {
  root.innerHTML = `
    <div class="layout">
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main" id="main"></main>
    </div>
    <div class="playerbar" id="playerbar"></div>
  `;
  renderSidebar();
  renderMain();
  renderPlayerBar();
}

function renderLogin(): void {
  root.innerHTML = `
    <div class="login">
      <h1>Music</h1>
      <p>Sign in with your passkey to continue.</p>
      <a class="btn btn-primary" href="/api/auth/login">Sign in with PocketID</a>
    </div>
  `;
}

// --- sidebar (playlists) ---------------------------------------------------

function renderSidebar(): void {
  const el = document.getElementById("sidebar");
  if (!el) return;

  const items = state.playlists
    .map(
      (p) => `
      <li class="${activePlaylist(p.id) ? "active" : ""}">
        <button data-playlist="${p.id}">${escapeHtml(p.name)}</button>
      </li>`,
    )
    .join("");

  el.innerHTML = `
    <div class="brand">Music</div>
    <button class="nav-link ${
      state.view.kind === "library" ? "active" : ""
    }" data-view="library">Library</button>

    <div class="section-head">
      <span>Playlists</span>
      <button class="icon-btn" id="new-playlist" title="New playlist">+</button>
    </div>
    <ul class="playlists">${items}</ul>

    <div class="sidebar-foot">
      <span>${escapeHtml(state.me?.name ?? state.me?.email ?? "You")}</span>
      <button class="link" id="logout">Log out</button>
    </div>
  `;

  el.querySelector("[data-view='library']")?.addEventListener("click", () => {
    state.view = { kind: "library" };
    render();
  });

  el.querySelectorAll("[data-playlist]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = { kind: "playlist", id: (btn as HTMLElement).dataset.playlist! };
      render();
    });
  });

  document.getElementById("new-playlist")?.addEventListener("click", async () => {
    const name = prompt("Playlist name?");
    if (!name?.trim()) return;
    await api.createPlaylist(name.trim());
    await loadPlaylists();
    renderSidebar();
  });

  document.getElementById("logout")?.addEventListener("click", async () => {
    const res = await api.logout();
    const data = (await res.json()) as { endSession: string | null };
    window.location.href = data.endSession ?? "/";
  });
}

// --- main area -------------------------------------------------------------

async function renderMain(): Promise<void> {
  const el = document.getElementById("main");
  if (!el) return;

  if (state.view.kind === "library") {
    renderLibrary(el);
  } else {
    await renderPlaylistView(el, state.view.id);
  }
}

function renderLibrary(el: HTMLElement): void {
  state.visibleSongs = state.songs;
  el.innerHTML = `
    <header class="main-head">
      <h2>Library</h2>
      <input id="search" class="search" placeholder="Search title or artist" />
    </header>
    ${uploadFormHtml()}
    <div id="songlist">${songTableHtml(state.songs)}</div>
  `;

  wireUploadForm();
  wireSongList();

  const search = document.getElementById("search") as HTMLInputElement | null;
  search?.addEventListener("input", async () => {
    const rows = await api.listSongs(search.value.trim() || undefined);
    state.visibleSongs = rows;
    const list = document.getElementById("songlist");
    if (list) {
      list.innerHTML = songTableHtml(rows);
      wireSongList();
    }
  });
}

async function renderPlaylistView(el: HTMLElement, id: string): Promise<void> {
  const pl = await api.getPlaylist(id);
  state.visibleSongs = pl.songs;

  el.innerHTML = `
    <header class="main-head">
      <h2>${escapeHtml(pl.name)}</h2>
      <button class="btn" id="del-playlist">Delete playlist</button>
    </header>
    <div id="songlist">${songTableHtml(pl.songs, id)}</div>
  `;

  wireSongList(id);

  document.getElementById("del-playlist")?.addEventListener("click", async () => {
    if (!confirm(`Delete "${pl.name}"?`)) return;
    await api.deletePlaylist(id);
    state.view = { kind: "library" };
    await loadPlaylists();
    render();
  });
}

// --- upload form -----------------------------------------------------------

function uploadFormHtml(): string {
  return `
    <form id="upload" class="upload">
      <input type="file" name="file" accept="audio/*" required />
      <input name="title" placeholder="Song name (required)" required />
      <input name="artist" placeholder="Artist (required)" required />
      <input name="album" placeholder="Album (optional)" />
      <label class="cover-label">
        Cover (optional)
        <input type="file" name="cover" accept="image/*" />
      </label>
      <button class="btn btn-primary" type="submit">Upload</button>
      <span class="hint">Title/artist auto-fill from the file's tags if present.</span>
    </form>
  `;
}

function wireUploadForm(): void {
  const form = document.getElementById("upload") as HTMLFormElement | null;
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button")!;
    btn.textContent = "Uploading...";
    btn.setAttribute("disabled", "true");
    try {
      await api.uploadSong(new FormData(form));
      form.reset();
      await loadSongs();
      renderMain();
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      btn.textContent = "Upload";
      btn.removeAttribute("disabled");
    }
  });
}

// --- song list -------------------------------------------------------------

function songTableHtml(songs: Song[], playlistId?: string): string {
  if (songs.length === 0) {
    return `<p class="empty">No songs yet.</p>`;
  }

  const rows = songs
    .map((s, i) => {
      const cover = s.coverUrl
        ? `<img class="cover" src="${s.coverUrl}" alt="" />`
        : `<div class="cover cover-empty">♪</div>`;

      const inPlaylist = playlistId
        ? `<button class="icon-btn" data-remove="${s.id}" title="Remove">✕</button>`
        : `<button class="icon-btn" data-add="${s.id}" title="Add to playlist">+</button>`;

      const del =
        s.uploadedBy && s.uploadedBy === state.me?.id
          ? `<button class="icon-btn" data-del="${s.id}" title="Delete">🗑</button>`
          : "";

      return `
        <div class="song" data-play="${i}">
          ${cover}
          <div class="song-meta">
            <span class="song-title">${escapeHtml(s.title)}</span>
            <span class="song-artist">${escapeHtml(s.artist)}</span>
          </div>
          <span class="song-dur">${
            s.durationS ? formatTime(s.durationS) : ""
          }</span>
          <div class="song-actions">${inPlaylist}${del}</div>
        </div>`;
    })
    .join("");

  return `<div class="songs">${rows}</div>`;
}

function wireSongList(playlistId?: string): void {
  // Play a song (and queue the rest of the visible list from there).
  document.querySelectorAll("[data-play]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".song-actions")) return;
      const i = Number((row as HTMLElement).dataset.play);
      player.playQueue(state.visibleSongs, i);
    });
  });

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const songId = (btn as HTMLElement).dataset.add!;
      const target = await pickPlaylist();
      if (target) await api.addToPlaylist(target, songId);
    });
  });

  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!playlistId) return;
      await api.removeFromPlaylist(playlistId, (btn as HTMLElement).dataset.remove!);
      renderMain();
    });
  });

  document.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Delete this song for everyone?")) return;
      await api.deleteSong((btn as HTMLElement).dataset.del!);
      await loadSongs();
      renderMain();
    });
  });
}

async function pickPlaylist(): Promise<string | null> {
  if (state.playlists.length === 0) {
    alert("Create a playlist first.");
    return null;
  }
  const names = state.playlists.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
  const choice = prompt(`Add to which playlist?\n${names}`);
  if (!choice) return null;
  const idx = Number(choice) - 1;
  return state.playlists[idx]?.id ?? null;
}

// --- player bar ------------------------------------------------------------

function renderPlayerBar(): void {
  const el = document.getElementById("playerbar");
  if (!el) return;

  const song = player.current;
  if (!song) {
    el.innerHTML = `<div class="pb-empty">Nothing playing</div>`;
    return;
  }

  const { current, duration } = player.progress;
  const pct = duration ? (current / duration) * 100 : 0;

  el.innerHTML = `
    <div class="pb-song">
      ${
        song.coverUrl
          ? `<img class="cover" src="${song.coverUrl}" alt="" />`
          : `<div class="cover cover-empty">♪</div>`
      }
      <div class="song-meta">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <span class="song-artist">${escapeHtml(song.artist)}</span>
      </div>
    </div>
    <div class="pb-controls">
      <div class="pb-buttons">
        <button class="icon-btn" id="prev">⏮</button>
        <button class="icon-btn play" id="toggle">${
          player.playing ? "⏸" : "▶"
        }</button>
        <button class="icon-btn" id="next">⏭</button>
      </div>
      <div class="pb-seek">
        <span>${formatTime(current)}</span>
        <input type="range" id="seek" min="0" max="${duration || 0}"
               value="${current}" step="0.1" style="--pct:${pct}%" />
        <span>${formatTime(duration)}</span>
      </div>
    </div>
  `;

  document.getElementById("toggle")?.addEventListener("click", () => player.toggle());
  document.getElementById("next")?.addEventListener("click", () => player.next());
  document.getElementById("prev")?.addEventListener("click", () => player.prev());

  const seek = document.getElementById("seek") as HTMLInputElement | null;
  seek?.addEventListener("input", () => player.seek(Number(seek.value)));
}

// --- utils -----------------------------------------------------------------

function activePlaylist(id: string): boolean {
  return state.view.kind === "playlist" && state.view.id === id;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

void boot();
