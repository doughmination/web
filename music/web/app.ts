// Single-page app: library, dedicated upload, browse shared playlists,
// per-user + shared playlists, and a full player bar.

import {
  api,
  type Song,
  type Playlist,
  type Me,
} from "./api.ts";
import {
  Player,
  formatTime,
} from "./player.ts";

const root = document.getElementById("app")!;
const player = new Player();

type View =
  | { kind: "library" }
  | { kind: "upload" }
  | { kind: "browse" }
  | { kind: "playlist"; id: string };

const state = {
  me: null as Me | null,
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

// --- sidebar --------------------------------------------------------------

function avatarHtml(url: string | null, name: string | null, cls = ""): string {
  if (url) return `<img class="avatar ${cls}" src="${url}" alt="" />`;
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return `<div class="avatar avatar-empty ${cls}">${escapeHtml(initial)}</div>`;
}

function renderSidebar(): void {
  const el = document.getElementById("sidebar");
  if (!el) return;

  const nav = (kind: View["kind"], label: string) => `
    <button class="nav-link ${state.view.kind === kind ? "active" : ""}"
            data-view="${kind}">${label}</button>`;

  const items = state.playlists
    .map(
      (p) => `
      <li class="${activePlaylist(p.id) ? "active" : ""}">
        <button data-playlist="${p.id}">
          <span class="pl-name">${escapeHtml(p.name)}</span>
          ${p.isPublic ? `<span class="pl-badge" title="Shared">shared</span>` : ""}
        </button>
      </li>`,
    )
    .join("");

  el.innerHTML = `
    <div class="brand">Music</div>
    ${nav("library", "Library")}
    ${nav("upload", "Upload")}
    ${nav("browse", "Browse shared")}

    <div class="section-head">
      <span>Playlists</span>
      <button class="icon-btn" id="new-playlist" title="New playlist">+</button>
    </div>
    <ul class="playlists">${items}</ul>

    <div class="sidebar-foot">
      ${avatarHtml(state.me?.avatarUrl ?? null, state.me?.name ?? null, "sm")}
      <span class="me-name">${escapeHtml(
        state.me?.name ?? state.me?.email ?? "You",
      )}</span>
      <button class="link" id="logout">Log out</button>
    </div>
  `;

  el.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = (btn as HTMLElement).dataset.view as
        | "library"
        | "upload"
        | "browse";
      state.view = { kind };
      render();
    });
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

  if (state.view.kind === "library") renderLibrary(el);
  else if (state.view.kind === "upload") renderUpload(el);
  else if (state.view.kind === "browse") await renderBrowse(el);
  else await renderPlaylistView(el, state.view.id);
}

function renderLibrary(el: HTMLElement): void {
  state.visibleSongs = state.songs;
  el.innerHTML = `
    <header class="main-head">
      <h2>Library</h2>
      <input id="search" class="search" placeholder="Search title or artist" />
    </header>
    <div id="songlist">${songTableHtml(state.songs)}</div>
  `;

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

// --- dedicated upload view -------------------------------------------------

function renderUpload(el: HTMLElement): void {
  el.innerHTML = `
    <header class="main-head"><h2>Upload</h2></header>
    <form id="upload" class="upload-card">
      <label class="field">
        <span>Audio file</span>
        <input type="file" name="file" accept="audio/*" required />
      </label>
      <label class="field">
        <span>Song name <em>(required)</em></span>
        <input name="title" placeholder="e.g. Everlong" required />
      </label>
      <label class="field">
        <span>Artist <em>(required)</em></span>
        <input name="artist" placeholder="e.g. Foo Fighters" required />
      </label>
      <label class="field">
        <span>Album <em>(optional)</em></span>
        <input name="album" placeholder="optional" />
      </label>
      <label class="field">
        <span>Cover image <em>(optional)</em></span>
        <input type="file" name="cover" accept="image/*" />
      </label>
      <p class="hint">
        Title, artist, album and cover auto-fill from the file's tags if present.
        Anything you type here wins.
      </p>
      <button class="btn btn-primary" type="submit">Upload</button>
      <span id="upload-status" class="upload-status"></span>
    </form>
  `;

  const form = document.getElementById("upload") as HTMLFormElement | null;
  const status = document.getElementById("upload-status");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button")!;
    btn.textContent = "Uploading...";
    btn.setAttribute("disabled", "true");
    if (status) status.textContent = "";
    try {
      const song = await api.uploadSong(new FormData(form));
      form.reset();
      await loadSongs();
      if (status) status.textContent = `Added "${song.title}" by ${song.artist}.`;
    } catch (err) {
      if (status) status.textContent = `Upload failed: ${(err as Error).message}`;
    } finally {
      btn.textContent = "Upload";
      btn.removeAttribute("disabled");
    }
  });
}

// --- browse shared playlists ----------------------------------------------

async function renderBrowse(el: HTMLElement): Promise<void> {
  el.innerHTML = `
    <header class="main-head">
      <h2>Browse shared</h2>
      <input id="pl-search" class="search" placeholder="Search playlists or owners" />
    </header>
    <div id="pl-results"></div>
  `;

  const results = document.getElementById("pl-results")!;
  const draw = async (q?: string) => {
    const rows = await api.searchPublicPlaylists(q);
    results.innerHTML = rows.length
      ? `<div class="pl-grid">${rows
          .map(
            (p) => `
        <button class="pl-card" data-open="${p.id}">
          ${avatarHtml(p.ownerAvatar, p.ownerName)}
          <div class="pl-card-meta">
            <span class="pl-card-name">${escapeHtml(p.name)}</span>
            <span class="pl-card-sub">${escapeHtml(
              p.ownerName ?? "unknown",
            )} · ${p.songCount} song${p.songCount === 1 ? "" : "s"}</span>
          </div>
        </button>`,
          )
          .join("")}</div>`
      : `<p class="empty">No shared playlists found.</p>`;

    results.querySelectorAll("[data-open]").forEach((b) => {
      b.addEventListener("click", () => {
        state.view = { kind: "playlist", id: (b as HTMLElement).dataset.open! };
        render();
      });
    });
  };

  await draw();
  const search = document.getElementById("pl-search") as HTMLInputElement | null;
  search?.addEventListener("input", () => draw(search.value.trim() || undefined));
}

// --- playlist view ---------------------------------------------------------

async function renderPlaylistView(el: HTMLElement, id: string): Promise<void> {
  const pl = await api.getPlaylist(id);
  state.visibleSongs = pl.songs;

  const ownerControls = pl.isOwner
    ? `
      <label class="share-toggle">
        <input type="checkbox" id="share" ${pl.isPublic ? "checked" : ""} />
        Shared
      </label>
      <button class="btn" id="del-playlist">Delete</button>`
    : `<span class="owner-tag">${avatarHtml(
        pl.ownerAvatar,
        pl.ownerName,
        "sm",
      )} ${escapeHtml(pl.ownerName ?? "unknown")}</span>`;

  el.innerHTML = `
    <header class="main-head">
      <h2>${escapeHtml(pl.name)} ${
        pl.isPublic ? `<span class="pl-badge">shared</span>` : ""
      }</h2>
      <div class="head-actions">${ownerControls}</div>
    </header>
    <div id="songlist">${songTableHtml(pl.songs, pl.isOwner ? id : undefined)}</div>
  `;

  wireSongList(pl.isOwner ? id : undefined);

  document.getElementById("share")?.addEventListener("change", async (e) => {
    const on = (e.target as HTMLInputElement).checked;
    await api.updatePlaylist(id, { isPublic: on });
    await loadPlaylists();
    render();
  });

  document.getElementById("del-playlist")?.addEventListener("click", async () => {
    if (!confirm(`Delete "${pl.name}"?`)) return;
    await api.deletePlaylist(id);
    state.view = { kind: "library" };
    await loadPlaylists();
    render();
  });
}

// --- song list -------------------------------------------------------------

function songTableHtml(songs: Song[], editablePlaylistId?: string): string {
  if (songs.length === 0) return `<p class="empty">No songs yet.</p>`;

  const rows = songs
    .map((s, i) => {
      const cover = s.coverUrl
        ? `<img class="cover" src="${s.coverUrl}" alt="" />`
        : `<div class="cover cover-empty">♪</div>`;

      const action = editablePlaylistId
        ? `<button class="icon-btn" data-remove="${s.id}" title="Remove">✕</button>`
        : `<button class="icon-btn" data-add="${s.id}" title="Add to playlist">+</button>`;

      const del =
        s.uploadedBy && s.uploadedBy === state.me?.id
          ? `<button class="icon-btn" data-del="${s.id}" title="Delete song">🗑</button>`
          : "";

      return `
        <div class="song" data-play="${i}">
          ${cover}
          <div class="song-meta">
            <span class="song-title">${escapeHtml(s.title)}</span>
            <span class="song-artist">${escapeHtml(s.artist)}</span>
          </div>
          <span class="song-dur">${s.durationS ? formatTime(s.durationS) : ""}</span>
          <div class="song-actions">${action}${del}</div>
        </div>`;
    })
    .join("");

  return `<div class="songs">${rows}</div>`;
}

function wireSongList(editablePlaylistId?: string): void {
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
      if (!editablePlaylistId) return;
      await api.removeFromPlaylist(editablePlaylistId, (btn as HTMLElement).dataset.remove!);
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
  const mine = state.playlists;
  if (mine.length === 0) {
    alert("Create a playlist first.");
    return null;
  }
  const names = mine.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
  const choice = prompt(`Add to which playlist?\n${names}`);
  if (!choice) return null;
  return mine[Number(choice) - 1]?.id ?? null;
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
  const repeatIcon = player.repeat === "one" ? "🔂" : "🔁";
  const volPct = player.volume * 100;

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
        <button class="icon-btn ${player.shuffle ? "on" : ""}" id="shuffle" title="Shuffle">🔀</button>
        <button class="icon-btn" id="prev" title="Previous">⏮</button>
        <button class="icon-btn play" id="toggle">${player.playing ? "⏸" : "▶"}</button>
        <button class="icon-btn" id="next" title="Next">⏭</button>
        <button class="icon-btn ${player.repeat !== "off" ? "on" : ""}" id="repeat"
                title="Repeat: ${player.repeat}">${repeatIcon}</button>
      </div>
      <div class="pb-seek">
        <span>${formatTime(current)}</span>
        <input type="range" id="seek" min="0" max="${duration || 0}"
               value="${current}" step="0.1" style="--pct:${pct}%" />
        <span>${formatTime(duration)}</span>
      </div>
    </div>

    <div class="pb-volume">
      <span title="Volume">🔊</span>
      <input type="range" id="volume" min="0" max="1" step="0.01"
             value="${player.volume}" style="--pct:${volPct}%" />
    </div>
  `;

  document.getElementById("toggle")?.addEventListener("click", () => player.toggle());
  document.getElementById("next")?.addEventListener("click", () => player.next());
  document.getElementById("prev")?.addEventListener("click", () => player.prev());
  document.getElementById("shuffle")?.addEventListener("click", () => player.toggleShuffle());
  document.getElementById("repeat")?.addEventListener("click", () => player.cycleRepeat());

  const seek = document.getElementById("seek") as HTMLInputElement | null;
  seek?.addEventListener("input", () => player.seek(Number(seek.value)));

  const vol = document.getElementById("volume") as HTMLInputElement | null;
  vol?.addEventListener("input", () => player.setVolume(Number(vol.value)));
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
