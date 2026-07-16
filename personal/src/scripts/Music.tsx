"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Ported from music.js — now-playing hero, synced lyrics (LRCLIB) with a
   follow/lock scroll, recent plays + top artists (Last.fm). The per-frame
   progress bar and active-lyric highlight stay imperative (refs), which is how
   React expects animation/scroll sync to be done. */

// ---- config ---------------------------------------------------------------
const DISCORD_ID = "1464890289922641993";
const LFM_USER = "Real_AlexTLM";
const LFM_KEY = "768e8bd0d366f4d6c7874740ca6610ad";
const LFM_OK = !!(LFM_USER && LFM_KEY);
const LFM = "https://ws.audioscrobbler.com/2.0/";
const LFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";
const SELF_BASE = "https://doughmination.uk/v2/discord/users/";
const PRESENCE_POLL_MS = 10000;
const LRCLIB_HOSTS = [
  "https://lrclib.schuh.wtf",
  "https://lyrics.lanyard.cafe",
  "https://lyrics.kie.ac",
  "https://api.assumi.ng/lyrics",
  "https://lyrics.aureal.dev",
  "https://lrclib.net",
];
const BLANK_ART =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const OBSESSIONS = [
  "6vmtWuZN1IbDPhVshbeD22",
  "3s44Qv8x974tm0ueLexMWN",
  "4ujxDgeTs9YpwMKHSmZ4qc",
  "7ipaq31bGwoqfcv1cSFuJO",
];

// ---- types ----------------------------------------------------------------
type Track = {
  song?: string;
  artist?: string;
  album?: string;
  art?: string;
  trackId?: string;
  url?: string;
  start?: number;
  end?: number;
  duration: number;
  live: boolean;
};
type Synced = { t: number; text: string };
type Lyrics = { instrumental: boolean; synced: Synced[]; plain: string };
type LyricsView =
  | { kind: "note"; msg: string }
  | { kind: "loading" }
  | { kind: "instrumental" }
  | { kind: "synced"; lines: Synced[] }
  | { kind: "plain"; lines: string[] };
type RecentItem = {
  name: string;
  artist: string;
  url: string;
  art: string;
  now: boolean;
  when: string;
};
type TopArtist = { name: string; url: string; playcount: string };

// ---- helpers --------------------------------------------------------------
function mmss(ms: number): string {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function clamp(n: number, lo: number, hi: number) {
  return n < lo ? lo : n > hi ? hi : n;
}
function trackKey(t: Track | null): string {
  return t ? [t.song, t.artist, t.album].map((x) => (x || "").toLowerCase()).join("␟") : "";
}
function parseLRC(text: string): Synced[] {
  if (!text) return [];
  const out: Synced[] = [];
  const tag = /\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
  text.split(/\r?\n/).forEach((line) => {
    tag.lastIndex = 0;
    const stamps: number[] = [];
    let m: RegExpExecArray | null;
    let last = 0;
    while ((m = tag.exec(line))) {
      const mins = parseInt(m[1], 10);
      const secs = parseFloat(m[2].replace(":", "."));
      stamps.push((mins * 60 + secs) * 1000);
      last = tag.lastIndex;
    }
    if (!stamps.length) return;
    const words = line.slice(last).trim();
    stamps.forEach((t) => out.push({ t, text: words }));
  });
  out.sort((a, b) => a.t - b.t);
  return out;
}
function normalizeLyrics(rec: {
  instrumental?: boolean;
  syncedLyrics?: string;
  plainLyrics?: string;
} | null): Lyrics | null {
  if (!rec) return null;
  return {
    instrumental: !!rec.instrumental,
    synced: parseLRC(rec.syncedLyrics || ""),
    plain: rec.plainLyrics || "",
  };
}
function lyricsView(data: Lyrics | null): LyricsView {
  if (!data) return { kind: "note", msg: "No lyrics found for this one." };
  if (data.instrumental) return { kind: "instrumental" };
  if (data.synced.length) return { kind: "synced", lines: data.synced };
  if (data.plain) return { kind: "plain", lines: data.plain.split(/\r?\n/) };
  return { kind: "note", msg: "No lyrics found for this one." };
}

// ---- LRCLIB ---------------------------------------------------------------
async function lrclibGet(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  for (const host of LRCLIB_HOSTS) {
    try {
      const res = await fetch(`${host}/api/get?${qs}`, {
        headers: { "X-User-Agent": "c.stupid.cat music (https://c.stupid.cat)" },
      });
      if (res.ok) return res.json();
    } catch {
      /* try next mirror */
    }
  }
  return null;
}
async function lrclibSearch(track_name: string, artist_name: string) {
  const qs = new URLSearchParams({ track_name, artist_name }).toString();
  for (const host of LRCLIB_HOSTS) {
    try {
      const res = await fetch(`${host}/api/search?${qs}`);
      if (!res.ok) continue;
      const arr = await res.json();
      if (!Array.isArray(arr) || !arr.length) continue;
      return arr.find((r) => r.syncedLyrics) || arr.find((r) => r.plainLyrics) || arr[0];
    } catch {
      /* next */
    }
  }
  return null;
}

// ---- Last.fm --------------------------------------------------------------
function lfmImg(images: { "#text"?: string }[]): string {
  if (!Array.isArray(images)) return "";
  const big = images[images.length - 1] || images[0] || {};
  const url = big["#text"] || "";
  return url && url.indexOf(LFM_PLACEHOLDER) === -1 ? url : "";
}
function timeAgo(uts: number | string): string {
  const diff = Math.floor(Date.now() / 1000) - Number(uts);
  if (!isFinite(diff) || diff < 0) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${diff < 172800 ? "" : "s"} ago`;
}
async function lfm(method: string, extra?: Record<string, string>) {
  const qs = new URLSearchParams({
    method,
    user: LFM_USER,
    api_key: LFM_KEY,
    format: "json",
    ...(extra || {}),
  }).toString();
  const res = await fetch(`${LFM}?${qs}`);
  if (!res.ok) throw new Error(`last.fm ${res.status}`);
  return res.json();
}

// ---- artist images (TheAudioDB -> MusicBrainz -> Spotify oEmbed) ----------
const TADB_ROOT = "https://www.theaudiodb.com/api/v1/json/123";
const MB_ROOT = "https://musicbrainz.org/ws/2";
const ART_CACHE_PREFIX = "cstupidcat:artimg:";
const ART_TTL_HIT = 30 * 864e5;
const ART_TTL_MISS = 3 * 864e5;
let mbChain: Promise<unknown> = Promise.resolve();

async function tadbArtistImg(name: string): Promise<string> {
  try {
    const res = await fetch(`${TADB_ROOT}/search.php?s=${encodeURIComponent(name)}`);
    if (!res.ok) return "";
    const data = await res.json();
    const a = data?.artists?.[0];
    return a?.strArtistThumb || "";
  } catch {
    return "";
  }
}
function mbFetch(url: string): Promise<{ artists?: unknown[]; relations?: unknown[] } | null> {
  const run = mbChain.then(() =>
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  );
  const gap = () => new Promise((r) => setTimeout(r, 1100));
  mbChain = run.then(gap, gap);
  return run as Promise<{ artists?: unknown[]; relations?: unknown[] } | null>;
}
function artCacheGet(name: string): string | undefined {
  try {
    const raw = localStorage.getItem(ART_CACHE_PREFIX + name.toLowerCase());
    if (!raw) return undefined;
    const hit = JSON.parse(raw);
    const ttl = hit.url ? ART_TTL_HIT : ART_TTL_MISS;
    if (Date.now() - hit.ts > ttl) return undefined;
    return hit.url || "";
  } catch {
    return undefined;
  }
}
function artCacheSet(name: string, url: string) {
  try {
    localStorage.setItem(
      ART_CACHE_PREFIX + name.toLowerCase(),
      JSON.stringify({ url: url || "", ts: Date.now() }),
    );
  } catch {
    /* skip */
  }
}
async function mbArtistId(name: string): Promise<string> {
  const q = encodeURIComponent(`artist:"${name.replace(/"/g, " ")}"`);
  const data = await mbFetch(`${MB_ROOT}/artist?query=${q}&limit=1&fmt=json`);
  const a = data?.artists?.[0] as { name?: string; score?: number; id?: string } | undefined;
  if (!a) return "";
  const same = (a.name || "").toLowerCase() === name.toLowerCase();
  return same || (a.score || 0) >= 90 ? a.id || "" : "";
}
async function mbSpotifyUrl(mbid: string): Promise<string> {
  const data = await mbFetch(`${MB_ROOT}/artist/${mbid}?inc=url-rels&fmt=json`);
  const rels = (data?.relations || []) as { url?: { resource?: string } }[];
  for (const r of rels) {
    const u = r?.url?.resource;
    if (u && u.indexOf("open.spotify.com/artist") !== -1) return u;
  }
  return "";
}
async function spotifyOembedImg(spotifyUrl: string): Promise<string> {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.thumbnail_url || "";
  } catch {
    return "";
  }
}
async function artistImg(name: string): Promise<string> {
  if (!name) return "";
  const cached = artCacheGet(name);
  if (cached !== undefined) return cached;
  let url = await tadbArtistImg(name);
  if (!url) {
    try {
      const mbid = await mbArtistId(name);
      if (mbid) {
        const sp = await mbSpotifyUrl(mbid);
        if (sp) url = await spotifyOembedImg(sp);
      }
    } catch {
      url = "";
    }
  }
  artCacheSet(name, url);
  return url;
}

// ===========================================================================
export default function Music() {
  const [track, setTrack] = useState<Track | null>(null);
  const [ly, setLy] = useState<LyricsView>({ kind: "note", msg: "Waiting for a track…" });
  const [locked, setLocked] = useState(true);
  const [recent, setRecent] = useState<RecentItem[] | { note: string } | null>(null);
  const [top, setTop] = useState<TopArtist[] | null>(null);
  const [topImg, setTopImg] = useState<Record<string, string>>({});

  // refs used by the imperative ticker so it needn't re-subscribe each frame
  const trackRef = useRef<Track | null>(null);
  const lyRef = useRef<LyricsView>(ly);
  const lockedRef = useRef(true);
  const activeLineRef = useRef(-1);
  const selfScrollRef = useRef(false);
  const lyricsBoxRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const curRef = useRef<HTMLSpanElement | null>(null);
  const lyricsReqRef = useRef(0);
  const lyricsCache = useRef(new Map<string, Lyrics | null>());
  const reduceMotion = useRef(false);

  const centerLine = useCallback((i: number, smooth: boolean) => {
    const box = lyricsBoxRef.current;
    const el = box?.children[i] as HTMLElement | undefined;
    if (!box || !el) return;
    const top = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    selfScrollRef.current = true;
    box.scrollTo({ top, behavior: smooth && !reduceMotion.current ? "smooth" : "auto" });
    setTimeout(() => (selfScrollRef.current = false), smooth && !reduceMotion.current ? 600 : 50);
  }, []);

  // ---- lyrics loading ----
  const loadLyrics = useCallback(async (t: Track | null) => {
    const myReq = ++lyricsReqRef.current;
    activeLineRef.current = -1;
    setLocked(true);
    if (!t) {
      setLy({ kind: "note", msg: "No track playing." });
      return;
    }
    const key = trackKey(t);
    if (lyricsCache.current.has(key)) {
      setLy(lyricsView(lyricsCache.current.get(key) || null));
      return;
    }
    setLy({ kind: "loading" });
    let rec = null;
    try {
      if (t.live && t.duration) {
        rec = await lrclibGet({
          track_name: t.song || "",
          artist_name: t.artist || "",
          album_name: t.album || "",
          duration: String(Math.round(t.duration / 1000)),
        });
      }
      if (!rec) rec = await lrclibSearch(t.song || "", t.artist || "");
    } catch {
      rec = null;
    }
    if (myReq !== lyricsReqRef.current) return;
    const data = normalizeLyrics(rec);
    lyricsCache.current.set(key, data);
    setLy(lyricsView(data));
  }, []);

  const applyTrack = useCallback(
    (next: Track | null) => {
      const changed = trackKey(next) !== trackKey(trackRef.current);
      trackRef.current = next;
      setTrack(next);
      if (changed) {
        activeLineRef.current = -1;
        loadLyrics(next);
      }
    },
    [loadLyrics],
  );

  // ---- idle fallback: last scrobble as the headline ----
  const showIdle = useCallback(async () => {
    if (!LFM_OK) return;
    try {
      const data = await lfm("user.getrecenttracks", { limit: "1" });
      if (trackRef.current?.live) return;
      const t = data?.recenttracks?.track;
      const last = Array.isArray(t) ? t[0] : t;
      if (last) {
        applyTrack({
          song: last.name,
          artist: last.artist?.["#text"] || last.artist?.name,
          album: last.album?.["#text"],
          art: lfmImg(last.image),
          url: last.url || "",
          duration: 0,
          live: false,
        });
      }
    } catch {
      /* leave hero idle */
    }
  }, [applyTrack]);

  const onPresence = useCallback(
    (d: { listening_to_spotify?: boolean; spotify?: Record<string, unknown> } | null) => {
      if (d && d.listening_to_spotify && d.spotify) {
        const s = d.spotify as {
          song?: string;
          artist?: string;
          album?: string;
          album_art_url?: string;
          track_id?: string;
          timestamps?: { start?: number; end?: number };
        };
        const start = s.timestamps?.start;
        const end = s.timestamps?.end;
        applyTrack({
          song: s.song,
          artist: s.artist,
          album: s.album,
          art: s.album_art_url || "",
          trackId: s.track_id || "",
          url: s.track_id ? `https://open.spotify.com/track/${s.track_id}` : "",
          start,
          end,
          duration: start && end ? end - start : 0,
          live: true,
        });
      } else if (trackRef.current?.live) {
        trackRef.current = null;
        setTrack(null);
        showIdle();
      } else if (!trackRef.current) {
        showIdle();
      }
    },
    [applyTrack, showIdle],
  );

  // ---- recent + top ----
  const loadRecent = useCallback(async () => {
    if (!LFM_OK) {
      setRecent({ note: "Add your Last.fm username + key to show recent plays." });
      return;
    }
    try {
      const data = await lfm("user.getrecenttracks", { limit: "12" });
      const arr = data?.recenttracks?.track || [];
      const list = Array.isArray(arr) ? arr : [arr];
      if (!list.length) {
        setRecent({ note: "No recent scrobbles." });
        return;
      }
      setRecent(
        list.map((t): RecentItem => {
          const now = t["@attr"]?.nowplaying === "true";
          return {
            name: t.name,
            artist: t.artist?.["#text"] || t.artist?.name || "",
            url: t.url || "#",
            art: lfmImg(t.image),
            now,
            when: now ? "" : timeAgo(t.date?.uts),
          };
        }),
      );
    } catch {
      setRecent({ note: "Couldn’t reach Last.fm just now." });
    }
  }, []);

  const loadTop = useCallback(async () => {
    if (!LFM_OK) return;
    try {
      const data = await lfm("user.gettopartists", { period: "7day", limit: "8" });
      const arr = data?.topartists?.artist || [];
      if (!arr.length) return;
      const list: TopArtist[] = arr.map((a: { name: string; url: string; playcount: string }) => ({
        name: a.name,
        url: a.url,
        playcount: a.playcount,
      }));
      setTop(list);
      list.forEach((a) => {
        artistImg(a.name).then((url) => {
          if (url) setTopImg((m) => ({ ...m, [a.name]: url }));
        });
      });
    } catch {
      /* leave top hidden */
    }
  }, []);

  // ---- effects ----
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // keep the latest values available to the imperative ticker / handlers
  useEffect(() => {
    trackRef.current = track;
    lyRef.current = ly;
    lockedRef.current = locked;
  }, [track, ly, locked]);

  // presence: DM socket if available, else poll
  useEffect(() => {
    let off: (() => void) | void;
    let timer: ReturnType<typeof setInterval> | undefined;
    let onVis: (() => void) | undefined;
    const dm = window.DM;
    if (dm) {
      off = dm.on(`presence:${DISCORD_ID}`, (v: unknown) => {
        const val = v as { data?: Parameters<typeof onPresence>[0] } | null;
        if (val && val.data) onPresence(val.data);
      });
    } else {
      const poll = () => {
        if (document.hidden) return;
        fetch(SELF_BASE + DISCORD_ID, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => {
            if (j?.success && j.data) onPresence(j.data.presence || null);
          })
          .catch(() => {});
      };
      poll();
      timer = setInterval(poll, PRESENCE_POLL_MS);
      onVis = () => {
        if (!document.hidden) poll();
      };
      document.addEventListener("visibilitychange", onVis);
    }
    return () => {
      if (typeof off === "function") off();
      if (timer) clearInterval(timer);
      if (onVis) document.removeEventListener("visibilitychange", onVis);
    };
  }, [onPresence]);

  // boot: idle headline + recent + top; recent refresh
  useEffect(() => {
    void (async () => {
      await showIdle();
      await loadRecent();
      await loadTop();
    })();
    const t = LFM_OK ? setInterval(loadRecent, 45000) : undefined;
    return () => {
      if (t) clearInterval(t);
    };
  }, [showIdle, loadRecent, loadTop]);

  // per-frame ticker: progress bar + active synced line + follow-scroll
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = trackRef.current;
      const box = lyricsBoxRef.current;
      if (t && t.live && t.start && t.end) {
        const pos = clamp(Date.now() - t.start, 0, t.duration);
        if (fillRef.current) fillRef.current.style.width = `${(pos / t.duration) * 100}%`;
        if (curRef.current) curRef.current.textContent = mmss(pos);
        const view = lyRef.current;
        if (view.kind === "synced" && box) {
          let i = -1;
          for (let k = 0; k < view.lines.length; k++) {
            if (view.lines[k].t <= pos) i = k;
            else break;
          }
          if (i !== activeLineRef.current) {
            const kids = box.children;
            const prev = activeLineRef.current;
            if (prev >= 0 && kids[prev]) kids[prev].classList.remove("is-active");
            activeLineRef.current = i;
            if (kids[i]) {
              kids[i].classList.add("is-active");
              if (lockedRef.current) centerLine(i, true);
            }
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [centerLine]);

  // user scroll releases the lock (programmatic scrolls don't)
  const onUserScroll = () => {
    if (!selfScrollRef.current && lockedRef.current) setLocked(false);
  };

  const syncedAvailable = ly.kind === "synced";

  return (
    <main className={`music-wrap${track ? (track.live ? " is-live" : "") : " is-idle"}`} id="music">
      <header className="music-head">
        <h1>Music</h1>
        <p>What I&apos;m listening to, with lyrics that follow along.</p>
      </header>

      {/* now playing */}
      <a
        className="mdc"
        id="dc-link"
        {...(track?.url ? { href: track.url, target: "_blank", rel: "noopener" } : {})}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`mdc-art${track?.art ? " has-art" : ""}`}
          id="dc-art"
          alt=""
          src={track?.art || BLANK_ART}
        />
        <div className="mdc-meta">
          <span className="mdc-state" id="dc-state">
            {track ? (track.live ? "Listening now" : "Last played") : "Not listening right now"}
          </span>
          <span className="mdc-title" id="dc-title">
            {track ? track.song || "Unknown track" : "—"}
          </span>
          <span className="mdc-artist" id="dc-artist">
            {track?.artist || ""}
          </span>
          <span className="mdc-album" id="dc-album">
            {track?.album || ""}
          </span>
          <div
            className="mdc-progress"
            id="dc-progress"
            hidden={!(track?.live && track.start && track.end)}
          >
            <span className="mdc-time" id="dc-cur" ref={curRef}>
              0:00
            </span>
            <span className="mdc-bar">
              <span className="mdc-fill" id="dc-fill" ref={fillRef} />
            </span>
            <span className="mdc-time" id="dc-dur">
              {track ? mmss(track.duration) : "0:00"}
            </span>
          </div>
        </div>
      </a>

      {/* lyrics */}
      <div className="sec-row" id="lyrics-section">
        <h2 className="sec-title">Lyrics</h2>
        <button
          className={`ly-lock${locked ? " is-locked" : ""}`}
          id="ly-lock"
          type="button"
          aria-pressed={locked}
          hidden={!syncedAvailable}
          onClick={() => {
            if (locked) setLocked(false);
            else {
              setLocked(true);
              if (activeLineRef.current >= 0) centerLine(activeLineRef.current, true);
            }
          }}
        >
          <span className="ly-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="ly-lock-label">{locked ? "Synced" : "Sync"}</span>
        </button>
      </div>
      <div
        className={`lyrics ${
          ly.kind === "loading"
            ? "is-loading"
            : ly.kind === "instrumental"
              ? "is-instrumental"
              : ly.kind === "synced"
                ? "is-synced"
                : ly.kind === "plain"
                  ? "is-plain"
                  : "is-empty"
        }`}
        id="lyrics"
        ref={lyricsBoxRef}
        onWheel={onUserScroll}
        onTouchMove={onUserScroll}
        onKeyDown={(e) => {
          if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key))
            onUserScroll();
        }}
      >
        {ly.kind === "loading" ? (
          <p className="ly-note">Finding lyrics…</p>
        ) : ly.kind === "note" ? (
          <p className="ly-note">{ly.msg}</p>
        ) : ly.kind === "instrumental" ? (
          <p className="ly-note">
            <i className="bi bi-music-note-beamed" aria-hidden="true" /> instrumental{" "}
            <i className="bi bi-music-note-beamed" aria-hidden="true" />
          </p>
        ) : ly.kind === "synced" ? (
          ly.lines.map((l, i) => (
            <p className="ly-line" data-i={i} key={i}>
              {l.text || " "}
            </p>
          ))
        ) : (
          ly.lines.map((l, i) => (
            <p className="ly-line ly-static" key={i}>
              {l || " "}
            </p>
          ))
        )}
      </div>

      {/* current obsessions */}
      <h2 className="sec-title" id="current-obsessions">
        Current Obsessions
      </h2>
      <div className="obsessions" id="obsessions">
        {OBSESSIONS.map((id) => (
          <iframe
            key={id}
            className="obsession-embed"
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/track/${id}?utm_source=generator`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ))}
      </div>

      {/* recently played */}
      <h2 className="sec-title" id="recently-played">
        Recently played
      </h2>
      <ul className="recent" id="recent">
        {recent === null ? null : "note" in recent ? (
          <li className="rc-note">{recent.note}</li>
        ) : (
          recent.map((t, i) => (
            <li className={`rc-item${t.now ? " is-now" : ""}`} key={i}>
              <a href={t.url} target="_blank" rel="noopener">
                {t.art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="rc-art" src={t.art} alt="" loading="lazy" />
                ) : (
                  <span className="rc-art rc-art-blank" aria-hidden="true">
                    <i className="bi bi-music-note-beamed" />
                  </span>
                )}
                <span className="rc-text">
                  <span className="rc-name">{t.name}</span>
                  <span className="rc-artist">{t.artist}</span>
                </span>
                {t.now ? (
                  <span className="rc-now">scrobbling now</span>
                ) : (
                  <span className="rc-when">{t.when}</span>
                )}
              </a>
            </li>
          ))
        )}
      </ul>

      {/* top artists */}
      <div id="top" hidden={!top}>
        {top ? (
          <>
            <h2 className="sec-title">Top artists · last 7 days</h2>
            <ol className="top-chips">
              {top.map((a, i) => (
                <li className="top-chip" key={a.name + i}>
                  <a href={a.url} target="_blank" rel="noopener">
                    <span className="top-rank">{i + 1}</span>
                    {topImg[a.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="top-art" src={topImg[a.name]} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="top-art top-art-blank" aria-hidden="true">
                        <i className="bi bi-music-note-beamed" />
                      </span>
                    )}
                    <span className="top-text">
                      <span className="top-name">{a.name}</span>
                      <span className="top-plays">{a.playcount} plays</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div>
    </main>
  );
}
