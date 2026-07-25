// Single-page app: library, dedicated upload, browse shared playlists,
// per-user + shared playlists, and a full player bar.

import {
  api,
  type Song,
  type Playlist,
  type Me,
  type Lyrics,
} from "./api.ts";
import {
  Player,
  formatTime,
} from "./player.ts";

const root = document.getElementById("app")!;
const player = new Player();

type View =
  | { kind: "library" }
  | { kind: "browse" }
  | { kind: "playlist"; id: string };

const state = {
  me: null as Me | null,
  songs: [] as Song[],
  playlists: [] as Playlist[],
  view: { kind: "library" } as View,
  visibleSongs: [] as Song[],
};

player.onChange = () => {
  renderPlayerBar();
  syncLyrics();
};

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
    <button class="nav-link" id="upload-btn">
      <i class="bi bi-cloud-arrow-up"></i> Upload
    </button>
    ${nav("browse", "Browse shared")}

    <div class="section-head">
      <span>Playlists</span>
      <button class="icon-btn" id="new-playlist" title="New playlist"><i class="bi bi-plus-lg"></i></button>
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
      const kind = (btn as HTMLElement).dataset.view as "library" | "browse";
      state.view = { kind };
      render();
    });
  });

  document.getElementById("upload-btn")?.addEventListener("click", openUploadModal);

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

// --- upload modal ----------------------------------------------------------

function openUploadModal(): void {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h2>Upload</h2>
        <button class="icon-btn" id="modal-close" title="Close"><i class="bi bi-x-lg"></i></button>
      </div>
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
          Title, artist, album and cover auto-fill from the file's tags if
          present. Anything you type here wins.
        </p>
        <button class="btn btn-primary" type="submit">Upload</button>
        <span id="upload-status" class="upload-status"></span>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onEsc);
  };
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onEsc);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector("#modal-close")?.addEventListener("click", close);

  const form = overlay.querySelector("#upload") as HTMLFormElement;
  const status = overlay.querySelector("#upload-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button")!;
    btn.textContent = "Uploading...";
    btn.setAttribute("disabled", "true");
    if (status) status.textContent = "";
    try {
      const song = await api.uploadSong(new FormData(form));
      await loadSongs();
      if (state.view.kind === "library") renderMain();
      close();
      flash(`Added "${song.title}" by ${song.artist}.`);
    } catch (err) {
      if (status) status.textContent = `Upload failed: ${(err as Error).message}`;
      btn.textContent = "Upload";
      btn.removeAttribute("disabled");
    }
  });
}

// Small transient toast.
function flash(msg: string): void {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
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
        : `<div class="cover cover-empty"><i class="bi bi-music-note-beamed"></i></div>`;

      const action = editablePlaylistId
        ? `<button class="icon-btn" data-remove="${s.id}" title="Remove"><i class="bi bi-x-lg"></i></button>`
        : `<button class="icon-btn" data-add="${s.id}" title="Add to playlist"><i class="bi bi-plus-lg"></i></button>`;

      const del =
        s.uploadedBy && s.uploadedBy === state.me?.id
          ? `<button class="icon-btn" data-del="${s.id}" title="Delete song"><i class="bi bi-trash-fill"></i></button>`
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

let pbSongId: string | null = null;
let seeking = false; // true while the user drags the seek slider

// Rebuild the bar only when the track changes; otherwise just update the
// dynamic bits. Re-rendering on every timeupdate would kill slider dragging
// (which is why volume/seek felt broken).
function renderPlayerBar(): void {
  const el = document.getElementById("playerbar");
  if (!el) return;

  const song = player.current;
  if (!song) {
    el.innerHTML = `<div class="pb-empty">Nothing playing</div>`;
    pbSongId = null;
    return;
  }

  if (song.id !== pbSongId || !el.querySelector(".pb-controls")) {
    mountPlayerBar(el, song);
    pbSongId = song.id;
  }
  updatePlayerBar();
}

function mountPlayerBar(el: HTMLElement, song: Song): void {
  el.innerHTML = `
    <div class="pb-song">
      ${
        song.coverUrl
          ? `<img class="cover" src="${song.coverUrl}" alt="" />`
          : `<div class="cover cover-empty"><i class="bi bi-music-note-beamed"></i></div>`
      }
      <div class="song-meta">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <span class="song-artist">${escapeHtml(song.artist)}</span>
      </div>
    </div>

    <div class="pb-controls">
      <div class="pb-buttons">
        <button class="icon-btn" id="shuffle" title="Shuffle"><i class="bi bi-shuffle"></i></button>
        <button class="icon-btn" id="prev" title="Previous"><i class="bi bi-skip-start-fill"></i></button>
        <button class="icon-btn play" id="toggle"><i class="bi bi-play-fill"></i></button>
        <button class="icon-btn" id="next" title="Next"><i class="bi bi-skip-end-fill"></i></button>
        <button class="icon-btn" id="repeat" title="Repeat"><i class="bi bi-repeat"></i></button>
      </div>
      <div class="pb-seek">
        <span class="pb-cur">0:00</span>
        <input type="range" id="seek" min="0" max="0" value="0" step="0.1" style="--pct:0%" />
        <span class="pb-dur">0:00</span>
      </div>
    </div>

    <div class="pb-right">
      <button class="icon-btn" id="lyrics-btn" title="Lyrics"><i class="bi bi-card-text"></i></button>
      <div class="pb-volume">
        <button class="icon-btn" id="mute" title="Mute"><i class="bi bi-volume-up-fill"></i></button>
        <input type="range" id="volume" min="0" max="1" step="0.01"
               value="${player.volume}" style="--pct:${player.volume * 100}%" />
      </div>
    </div>
  `;

  el.querySelector("#toggle")?.addEventListener("click", () => player.toggle());
  el.querySelector("#next")?.addEventListener("click", () => player.next());
  el.querySelector("#prev")?.addEventListener("click", () => player.prev());
  el.querySelector("#shuffle")?.addEventListener("click", () => player.toggleShuffle());
  el.querySelector("#repeat")?.addEventListener("click", () => player.cycleRepeat());

  const seek = el.querySelector("#seek") as HTMLInputElement | null;
  seek?.addEventListener("input", () => {
    seeking = true;
    const max = Number(seek.max) || 1;
    seek.style.setProperty("--pct", `${(Number(seek.value) / max) * 100}%`);
  });
  seek?.addEventListener("change", () => {
    player.seek(Number(seek.value));
    seeking = false;
  });

  const vol = el.querySelector("#volume") as HTMLInputElement | null;
  vol?.addEventListener("input", () => {
    player.setVolume(Number(vol.value));
    vol.style.setProperty("--pct", `${Number(vol.value) * 100}%`);
    updateVolumeIcon();
  });

  el.querySelector("#mute")?.addEventListener("click", () => {
    const next = player.volume > 0 ? 0 : 1;
    player.setVolume(next);
    if (vol) {
      vol.value = String(next);
      vol.style.setProperty("--pct", `${next * 100}%`);
    }
    updateVolumeIcon();
  });

  el.querySelector("#lyrics-btn")?.addEventListener("click", toggleLyrics);
}

// Update only the changing pieces — never rebuild (keeps sliders draggable).
function updatePlayerBar(): void {
  const el = document.getElementById("playerbar");
  if (!el) return;

  const toggle = el.querySelector("#toggle i");
  if (toggle) toggle.className = player.playing ? "bi bi-pause-fill" : "bi bi-play-fill";

  el.querySelector("#shuffle")?.classList.toggle("on", player.shuffle);

  const repeatBtn = el.querySelector("#repeat");
  const repeatIcon = el.querySelector("#repeat i");
  if (repeatBtn && repeatIcon) {
    repeatBtn.classList.toggle("on", player.repeat !== "off");
    repeatIcon.className = player.repeat === "one" ? "bi bi-repeat-1" : "bi bi-repeat";
    (repeatBtn as HTMLElement).title = `Repeat: ${player.repeat}`;
  }

  const { current, duration } = player.progress;
  const cur = el.querySelector(".pb-cur");
  const dur = el.querySelector(".pb-dur");
  if (cur) cur.textContent = formatTime(current);
  if (dur) dur.textContent = formatTime(duration);

  const seek = el.querySelector("#seek") as HTMLInputElement | null;
  if (seek && !seeking) {
    seek.max = String(duration || 0);
    seek.value = String(current);
    seek.style.setProperty("--pct", `${duration ? (current / duration) * 100 : 0}%`);
  }

  el.querySelector("#lyrics-btn")?.classList.toggle("on", lyricsState.open);

  updateVolumeIcon();
}

function updateVolumeIcon(): void {
  const icon = document.querySelector("#mute i");
  if (!icon) return;
  const v = player.volume;
  icon.className =
    v === 0
      ? "bi bi-volume-mute-fill"
      : v < 0.5
        ? "bi bi-volume-down-fill"
        : "bi bi-volume-up-fill";
}

// --- lyrics ----------------------------------------------------------------

const lyricsState = {
  open: false,
  songId: null as string | null,
  data: null as Lyrics | null,
  active: -1,
};

function toggleLyrics(): void {
  lyricsState.open = !lyricsState.open;
  if (lyricsState.open) {
    renderLyricsOverlay();
    void loadLyricsForCurrent();
  } else {
    document.getElementById("lyrics-overlay")?.remove();
  }
  document.getElementById("lyrics-btn")?.classList.toggle("on", lyricsState.open);
}

function renderLyricsOverlay(): void {
  let ov = document.getElementById("lyrics-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "lyrics-overlay";
    ov.className = "lyrics-overlay";
    document.body.appendChild(ov);
  }
  const song = player.current;
  ov.innerHTML = `
    <div class="ly-head">
      <div class="ly-song">
        <span class="ly-title">${song ? escapeHtml(song.title) : "—"}</span>
        <span class="ly-artist">${song ? escapeHtml(song.artist) : ""}</span>
      </div>
      <button class="icon-btn" id="ly-close" title="Close"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="ly-body" id="ly-body"><p class="ly-note">Finding lyrics…</p></div>
  `;
  ov.querySelector("#ly-close")?.addEventListener("click", toggleLyrics);
}

async function loadLyricsForCurrent(): Promise<void> {
  const song = player.current;
  const body = document.getElementById("ly-body");
  if (!song) {
    if (body) body.innerHTML = `<p class="ly-note">Play a song to see lyrics.</p>`;
    return;
  }
  lyricsState.songId = song.id;
  lyricsState.data = null;
  lyricsState.active = -1;
  try {
    lyricsState.data = await api.getLyrics(song.id);
  } catch {
    lyricsState.data = null;
  }
  // Bail if the user closed the panel or skipped tracks while we fetched.
  if (!lyricsState.open || player.current?.id !== song.id) return;
  renderLyricsBody();
}

function renderLyricsBody(): void {
  const body = document.getElementById("ly-body");
  if (!body) return;
  const d = lyricsState.data;

  if (!d || (!d.synced.length && !d.plain && !d.instrumental)) {
    body.className = "ly-body";
    body.innerHTML = `<p class="ly-note">No lyrics found for this one.</p>`;
    return;
  }
  if (d.instrumental) {
    body.className = "ly-body";
    body.innerHTML = `<p class="ly-note"><i class="bi bi-music-note-beamed"></i> Instrumental</p>`;
    return;
  }
  if (d.synced.length) {
    body.className = "ly-body is-synced";
    body.innerHTML = d.synced
      .map((l, i) => `<p class="ly-line" data-i="${i}">${escapeHtml(l.text || " ")}</p>`)
      .join("");
    return;
  }
  body.className = "ly-body";
  body.innerHTML = (d.plain ?? "")
    .split(/\r?\n/)
    .map((l) => `<p class="ly-line ly-static">${escapeHtml(l || " ")}</p>`)
    .join("");
}

// Called on every player tick: highlight + center the active synced line.
function syncLyrics(): void {
  if (!lyricsState.open) return;
  const song = player.current;
  if (!song) return;

  if (song.id !== lyricsState.songId) {
    renderLyricsOverlay();
    void loadLyricsForCurrent();
    return;
  }

  const d = lyricsState.data;
  if (!d || !d.synced.length) return;

  const posMs = player.progress.current * 1000;
  let i = -1;
  for (let k = 0; k < d.synced.length; k++) {
    if (d.synced[k]!.t <= posMs) i = k;
    else break;
  }
  if (i === lyricsState.active) return;

  const body = document.getElementById("ly-body");
  if (!body) return;
  const kids = body.children;
  if (lyricsState.active >= 0 && kids[lyricsState.active]) {
    kids[lyricsState.active]!.classList.remove("is-active");
  }
  lyricsState.active = i;
  const cur = kids[i] as HTMLElement | undefined;
  if (cur) {
    cur.classList.add("is-active");
    body.scrollTo({
      top: cur.offsetTop - body.clientHeight / 2 + cur.clientHeight / 2,
      behavior: "smooth",
    });
  }
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
