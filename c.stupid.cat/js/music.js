(function music() {
  "use strict";

  // ---- config -------------------------------------------------------------
  const DISCORD_ID = "1464890289922641993";
  const LFM_USER = "Real_AlexTLM";
  const LFM_KEY = "768e8bd0d366f4d6c7874740ca6610ad";
  const LFM_OK = !!(LFM_USER && LFM_KEY);

  // LRCLIB-compatible instances, tried in order; falls through on any failure.
  const LRCLIB_HOSTS = [
    "https://lrclib.schuh.wtf",
    "https://lyrics.lanyard.cafe",
    "https://lyrics.kie.ac",
    "https://api.assumi.ng/lyrics",
    "https://lyrics.aureal.dev",
    "https://lrclib.net",
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- tiny helpers -------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function mmss(ms) {
    if (!isFinite(ms) || ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }

  // ---- DOM refs -----------------------------------------------------------
  const stage = $("#music");
  if (!stage) return;
  const dcArt = $("#dc-art");
  const dcState = $("#dc-state");
  const dcTitle = $("#dc-title");
  const dcArtist = $("#dc-artist");
  const dcAlbum = $("#dc-album");
  const dcLink = $("#dc-link");
  const barFill = $("#dc-fill");
  const barCur = $("#dc-cur");
  const barDur = $("#dc-dur");
  const progress = $("#dc-progress");
  const lyricsBox = $("#lyrics");
  const lockBtn = $("#ly-lock");
  const recentBox = $("#recent");
  const topBox = $("#top");
  // transparent 1x1 — keeps <img> valid (src required) while showing the ♪
  // placeholder via CSS (.mdc-art:not(.has-art)) when there's no real art
  const BLANK_ART = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  // ---- state --------------------------------------------------------------
  // track: { song, artist, album, art, trackId, url, start, end, duration, live }
  let track = null;          // what's on the hero right now
  let lyrics = null;         // { synced:[{t,text}], plain, instrumental, key }
  let lyricsReq = 0;         // race guard for async lyric fetches
  let activeLine = -1;
  const lyricsCache = new Map(); // trackKey → normalized lyrics (instant on repeat)
  let locked = true;         // follow the current line; released when the user scrolls

  function trackKey(t) {
    return t ? [t.song, t.artist, t.album].map((x) => (x || "").toLowerCase()).join("\u241F") : "";
  }

  // =======================================================================
  // NOW PLAYING (hero)
  // =======================================================================
  function paintHero() {
    if (!track) {
      stage.classList.add("is-idle");
      dcState.textContent = "Not listening right now";
      dcTitle.textContent = "—";
      dcArtist.textContent = "";
      dcAlbum.textContent = "";
      dcArt.src = BLANK_ART;
      dcArt.classList.remove("has-art");
      dcLink.removeAttribute("href");
      dcLink.removeAttribute("target");
      dcLink.removeAttribute("rel");
      progress.hidden = true;
      return;
    }
    stage.classList.toggle("is-idle", false);
    stage.classList.toggle("is-live", !!track.live);
    dcState.textContent = track.live ? "Listening now" : "Last played";
    dcTitle.textContent = track.song || "Unknown track";
    dcArtist.textContent = track.artist || "";
    dcAlbum.textContent = track.album || "";
    if (track.art) { dcArt.src = track.art; dcArt.classList.add("has-art"); }
    else { dcArt.src = BLANK_ART; dcArt.classList.remove("has-art"); }
    if (track.url) { dcLink.href = track.url; dcLink.target = "_blank"; dcLink.rel = "noopener"; }
    else { dcLink.removeAttribute("href"); dcLink.removeAttribute("target"); dcLink.removeAttribute("rel"); }
    // progress bar only makes sense for a live track with real timestamps
    progress.hidden = !(track.live && track.start && track.end);
    if (!progress.hidden) barDur.textContent = mmss(track.duration);
  }

  function setTrack(next) {
    const changed = trackKey(next) !== trackKey(track);
    track = next;
    paintHero();
    if (changed) {
      activeLine = -1;
      loadLyrics(next);
    }
  }

  // =======================================================================
  // LYRICS (LRCLIB)
  // =======================================================================
  function parseLRC(text) {
    if (!text) return [];
    const out = [];
    const tag = /\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
    text.split(/\r?\n/).forEach((line) => {
      tag.lastIndex = 0;
      const stamps = [];
      let m, last = 0;
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

  function lyricsLoading() {
    lyricsBox.className = "lyrics is-loading";
    lyricsBox.innerHTML = '<p class="ly-note">Finding lyrics…</p>';
  }
  function lyricsEmpty(msg) {
    lyricsBox.className = "lyrics is-empty";
    lyricsBox.innerHTML = '<p class="ly-note">' + esc(msg) + "</p>";
  }
  function renderLyrics(data) {
    lyrics = data;
    activeLine = -1;
    locked = true;            // every new track starts in follow mode
    const synced = data && data.synced && data.synced.length;
    updateLock(synced);
    if (!data) { lyricsEmpty("No track playing."); return; }
    if (data.instrumental) {
      lyricsBox.className = "lyrics is-instrumental";
      lyricsBox.innerHTML = '<p class="ly-note">♪ instrumental ♪</p>';
      return;
    }
    if (synced) {
      lyricsBox.className = "lyrics is-synced";
      lyricsBox.innerHTML = data.synced
        .map((l, i) => '<p class="ly-line" data-i="' + i + '">' + (esc(l.text) || "&nbsp;") + "</p>")
        .join("");
      lyricsBox.scrollTop = 0;
      return;
    }
    if (data.plain) {
      lyricsBox.className = "lyrics is-plain";
      lyricsBox.innerHTML = data.plain.split(/\r?\n/)
        .map((l) => '<p class="ly-line ly-static">' + (esc(l) || "&nbsp;") + "</p>").join("");
      return;
    }
    lyricsEmpty("No lyrics found for this one.");
  }

  // ---- lock / follow controls --------------------------------------------
  let selfScroll = false;     // true while WE are scrolling, so we don't self-release
  function centerLine(i, smooth) {
    const el = lyricsBox.children[i];
    if (!el) return;
    const top = el.offsetTop - lyricsBox.clientHeight / 2 + el.clientHeight / 2;
    selfScroll = true;
    lyricsBox.scrollTo({ top, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    setTimeout(() => { selfScroll = false; }, smooth && !reduceMotion ? 600 : 50);
  }
  function updateLock(show) {
    if (!lockBtn) return;
    lockBtn.hidden = !show;
    lockBtn.classList.toggle("is-locked", locked);
    lockBtn.setAttribute("aria-pressed", String(locked));
    let label = lockBtn.querySelector(".ly-lock-label");
    if (!label) {
      lockBtn.innerHTML =
        '<span class="ly-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '<span class="ly-lock-label"></span>';
      label = lockBtn.querySelector(".ly-lock-label");
    }
    label.textContent = locked ? "Synced" : "Sync";
  }
  function release() {            // user took over the scroll
    if (!locked) return;
    locked = false;
    if (lockBtn) updateLock(!lockBtn.hidden);
  }
  function reLock() {             // jump back to the current line and follow again
    locked = true;
    updateLock(true);
    if (activeLine >= 0) centerLine(activeLine, true);
  }
  if (lockBtn) {
    lockBtn.addEventListener("click", () => (locked ? release() : reLock()));
  }
  // user-driven scroll intent releases the lock (programmatic scrolls don't)
  ["wheel", "touchmove"].forEach((ev) =>
    lyricsBox.addEventListener(ev, () => { if (!selfScroll) release(); }, { passive: true }));
  lyricsBox.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) release();
  });

  // LRCLIB lookups, narrowest match first. Walks the instance list until one
  // returns a hit; a 404/non-OK just means "this mirror doesn't have it" → next.
  async function lrclibGet(params) {
    const qs = new URLSearchParams(params).toString();
    for (const host of LRCLIB_HOSTS) {
      try {
        const res = await fetch(host + "/api/get?" + qs, {
          headers: { "X-User-Agent": "c.stupid.cat music (https://c.stupid.cat)" },
        });
        if (res.ok) return res.json();
      } catch (e) { /* network/CORS error → try the next instance */ }
    }
    return null;
  }
  async function lrclibSearch(track_name, artist_name) {
    const qs = new URLSearchParams({ track_name, artist_name }).toString();
    for (const host of LRCLIB_HOSTS) {
      try {
        const res = await fetch(host + "/api/search?" + qs);
        if (!res.ok) continue;
        const arr = await res.json();
        if (!Array.isArray(arr) || !arr.length) continue;
        // prefer a result that actually has synced lyrics
        return arr.find((r) => r.syncedLyrics) || arr.find((r) => r.plainLyrics) || arr[0];
      } catch (e) { /* next instance */ }
    }
    return null;
  }
  function normalize(rec) {
    if (!rec) return null;
    return {
      instrumental: !!rec.instrumental,
      synced: parseLRC(rec.syncedLyrics),
      plain: rec.plainLyrics || "",
    };
  }

  async function loadLyrics(t) {
    const myReq = ++lyricsReq;
    if (!t) { renderLyrics(null); return; }
    const key = trackKey(t);
    if (lyricsCache.has(key)) { renderLyrics(lyricsCache.get(key)); return; } // instant
    lyricsLoading();
    let rec = null;
    try {
      if (t.live && t.duration) {
        // exact-ish match using duration (±2s tolerance handled by LRCLIB)
        rec = await lrclibGet({
          track_name: t.song, artist_name: t.artist,
          album_name: t.album || "", duration: Math.round(t.duration / 1000),
        });
      }
      if (!rec) { // drop album / no-duration → fall back to search
        rec = await lrclibSearch(t.song || "", t.artist || "");
      }
    } catch (e) { rec = null; }
    if (myReq !== lyricsReq) return; // a newer track superseded us
    const data = normalize(rec);
    lyricsCache.set(key, data);
    renderLyrics(data);
  }

  // =======================================================================
  // TICKER — sync the progress bar + active lyric line to playback
  // =======================================================================
  function tick() {
    if (track && track.live && track.start && track.end) {
      const pos = clamp(Date.now() - track.start, 0, track.duration);
      // progress bar
      if (!progress.hidden) {
        barFill.style.width = (pos / track.duration) * 100 + "%";
        barCur.textContent = mmss(pos);
      }
      // active synced line
      if (lyrics && lyrics.synced && lyrics.synced.length) {
        let i = -1;
        for (let k = 0; k < lyrics.synced.length; k++) {
          if (lyrics.synced[k].t <= pos) i = k; else break;
        }
        if (i !== activeLine) {
          const lines = lyricsBox.children;
          if (activeLine >= 0 && lines[activeLine]) lines[activeLine].classList.remove("is-active");
          activeLine = i;
          if (lines[i]) {
            lines[i].classList.add("is-active");
            if (locked) centerLine(i, true);
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }

  // =======================================================================
  // PRESENCE — Doughmination Restful API
  // =======================================================================
  // Same now-playing data, pulled from the self-hosted API the rest of the
  // site uses. It's request/response (not a socket), so we poll; the tick()
  // loop interpolates the progress bar + synced lyrics smoothly between polls
  // using Spotify's start/end timestamps, so playback still feels live.
  const SELF_BASE = "https://restful.doughmination.uk/v1/users/";
  const PRESENCE_POLL_MS = 10000;
  let presenceTimer = null;

  function fromSpotify(s) {
    return {
      song: s.song, artist: s.artist, album: s.album,
      art: s.album_art_url || "",
      trackId: s.track_id || "",
      url: s.track_id ? "https://open.spotify.com/track/" + s.track_id : "",
      start: s.timestamps && s.timestamps.start,
      end: s.timestamps && s.timestamps.end,
      duration: s.timestamps ? s.timestamps.end - s.timestamps.start : 0,
      live: true,
    };
  }
  function onPresence(d) {
    if (d && d.listening_to_spotify && d.spotify) {
      setTrack(fromSpotify(d.spotify));
    } else if (track && track.live) {
      // they just stopped — fall back to the latest scrobble for the hero
      track = null;
      showIdle();
    } else if (!track) {
      showIdle();
    }
  }
  function pollPresence() {
    if (document.hidden) return;          // don't poll a backgrounded tab
    fetch(SELF_BASE + DISCORD_ID, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j || !j.success || !j.data) return;
        onPresence(j.data.presence || null);   // presence is null when offline
      })
      .catch(() => { /* network blip — keep last state, retry next poll */ });
  }
  function startPresence() {
    pollPresence();
    presenceTimer = setInterval(pollPresence, PRESENCE_POLL_MS);
    // refresh the moment the tab comes back into focus
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) pollPresence();
    });
  }

  // =======================================================================
  // LAST.FM — recently played, top artists, and the idle fallback headline
  // =======================================================================
  const LFM = "https://ws.audioscrobbler.com/2.0/";
  const LFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f"; // last.fm "no art" star
  function lfmImg(images) {
    if (!Array.isArray(images)) return "";
    const big = images[images.length - 1] || images[0] || {};
    const url = big["#text"] || "";
    return url && url.indexOf(LFM_PLACEHOLDER) === -1 ? url : "";
  }
  function timeAgo(uts) {
    const diff = Math.floor(Date.now() / 1000) - Number(uts);
    if (!isFinite(diff) || diff < 0) return "";
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return Math.floor(diff / 86400) + " day" + (diff < 172800 ? "" : "s") + " ago";
  }
  async function lfm(method, extra) {
    const qs = new URLSearchParams(Object.assign(
      { method, user: LFM_USER, api_key: LFM_KEY, format: "json" }, extra || {}
    )).toString();
    const res = await fetch(LFM + "?" + qs);
    if (!res.ok) throw new Error("last.fm " + res.status);
    return res.json();
  }

  async function showIdle() {
    // pull the latest scrobble so the page isn't a dead end when nobody's listening
    if (!LFM_OK) { paintHero(); return; }
    try {
      const data = await lfm("user.getrecenttracks", { limit: 1 });
      if (track && track.live) return; // a live presence arrived while we waited
      const t = data && data.recenttracks && data.recenttracks.track;
      const last = Array.isArray(t) ? t[0] : t;
      if (last) {
        setTrack({
          song: last.name,
          artist: last.artist && (last.artist["#text"] || last.artist.name),
          album: last.album && last.album["#text"],
          art: lfmImg(last.image),
          url: last.url || "",
          live: false,
        });
        return;
      }
    } catch (e) { /* fall through */ }
    paintHero();
  }

  async function loadRecent() {
    if (!LFM_OK) {
      recentBox.innerHTML =
        '<li class="rc-note">Add your Last.fm username + key to the ' +
        '<code>music.js</code> script tag to show recent plays.</li>';
      return;
    }
    try {
      const data = await lfm("user.getrecenttracks", { limit: 12 });
      const arr = (data && data.recenttracks && data.recenttracks.track) || [];
      const list = Array.isArray(arr) ? arr : [arr];
      if (!list.length) { recentBox.innerHTML = '<li class="rc-note">No recent scrobbles.</li>'; return; }
      recentBox.innerHTML = list.map((t) => {
        const now = t["@attr"] && t["@attr"].nowplaying === "true";
        const art = lfmImg(t.image);
        const when = now
          ? '<span class="rc-now">scrobbling now</span>'
          : '<span class="rc-when">' + esc(timeAgo(t.date && t.date.uts)) + "</span>";
        const artist = t.artist && (t.artist["#text"] || t.artist.name) || "";
        return '<li class="rc-item' + (now ? " is-now" : "") + '">' +
          '<a href="' + esc(t.url || "#") + '" target="_blank" rel="noopener">' +
          (art ? '<img class="rc-art" src="' + esc(art) + '" alt="" loading="lazy">'
            : '<span class="rc-art rc-art-blank" aria-hidden="true">♪</span>') +
          '<span class="rc-text">' +
          '<span class="rc-name">' + esc(t.name) + "</span>" +
          '<span class="rc-artist">' + esc(artist) + "</span>" +
          "</span>" + when +
          "</a></li>";
      }).join("");
    } catch (e) {
      recentBox.innerHTML = '<li class="rc-note">Couldn’t reach Last.fm just now.</li>';
    }
  }

  // Last.fm stopped serving artist images — every artist returns the same
  // placeholder star. Spotify has the photos, but its catalog API needs an
  // OAuth token (and a client secret we can't ship in a static page). So we
  // take the keyless route: MusicBrainz maps an artist name → their linked
  // Spotify page, then Spotify's own oEmbed hands back that page's picture.
  // No API key, no token, no third-party cookies. Resolves to a picture URL
  // (or "" when there's no confident match). Results are cached in
  // localStorage, so repeat visits are instant and we stay gentle on the APIs.
  const MB_ROOT = "https://musicbrainz.org/ws/2";
  const ART_CACHE_PREFIX = "cstupidcat:artimg:";
  const ART_TTL_HIT = 30 * 864e5;   // remember a found photo for 30 days
  const ART_TTL_MISS = 3 * 864e5;   // retry a miss after 3 days

  // MusicBrainz asks anonymous clients for ~1 request/second, so funnel every
  // MB call through a one-at-a-time queue spaced ~1.1s apart.
  let mbChain = Promise.resolve();
  function mbFetch(url) {
    const run = mbChain.then(() =>
      fetch(url, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );
    const gap = () => new Promise((r) => setTimeout(r, 1100));
    mbChain = run.then(gap, gap);   // pace the next call whether this one won or lost
    return run;
  }

  function artCacheGet(name) {
    try {
      const raw = localStorage.getItem(ART_CACHE_PREFIX + name.toLowerCase());
      if (!raw) return undefined;
      const hit = JSON.parse(raw);
      const ttl = hit.url ? ART_TTL_HIT : ART_TTL_MISS;
      if (Date.now() - hit.ts > ttl) return undefined;   // stale → re-resolve
      return hit.url || "";
    } catch (e) { return undefined; }
  }
  function artCacheSet(name, url) {
    try {
      localStorage.setItem(ART_CACHE_PREFIX + name.toLowerCase(),
        JSON.stringify({ url: url || "", ts: Date.now() }));
    } catch (e) { /* storage full / disabled — just skip caching */ }
  }

  // name → MusicBrainz artist MBID, but only when we're confident it's the
  // right act: an exact (case-insensitive) name match or a strong search score.
  async function mbArtistId(name) {
    const q = encodeURIComponent('artist:"' + name.replace(/"/g, " ") + '"');
    const data = await mbFetch(MB_ROOT + "/artist?query=" + q + "&limit=1&fmt=json");
    const a = data && data.artists && data.artists[0];
    if (!a) return "";
    const same = (a.name || "").toLowerCase() === name.toLowerCase();
    return (same || a.score >= 90) ? a.id : "";
  }
  // MBID → the artist's linked Spotify page (via MusicBrainz URL relationships)
  async function mbSpotifyUrl(mbid) {
    const data = await mbFetch(MB_ROOT + "/artist/" + mbid + "?inc=url-rels&fmt=json");
    const rels = (data && data.relations) || [];
    for (const r of rels) {
      const u = r && r.url && r.url.resource;
      if (u && u.indexOf("open.spotify.com/artist") !== -1) return u;
    }
    return "";
  }
  // Spotify page → its photo, via Spotify's public (keyless, CORS-open) oEmbed
  async function spotifyOembedImg(spotifyUrl) {
    try {
      const res = await fetch("https://open.spotify.com/oembed?url=" +
        encodeURIComponent(spotifyUrl));
      if (!res.ok) return "";
      const data = await res.json();
      return data.thumbnail_url || "";
    } catch (e) { return ""; }
  }

  // Public resolver used by loadTop(): artist name → picture URL ("" on miss).
  async function artistImg(name) {
    if (!name) return "";
    const cached = artCacheGet(name);
    if (cached !== undefined) return cached;     // fresh hit or fresh miss
    let url = "";
    try {
      const mbid = await mbArtistId(name);
      if (mbid) {
        const sp = await mbSpotifyUrl(mbid);
        if (sp) url = await spotifyOembedImg(sp);
      }
    } catch (e) { url = ""; }
    artCacheSet(name, url);
    return url;
  }

  async function loadTop() {
    if (!LFM_OK || !topBox) { if (topBox) topBox.hidden = true; return; }
    try {
      const data = await lfm("user.gettopartists", { period: "7day", limit: 8 });
      const arr = (data && data.topartists && data.topartists.artist) || [];
      if (!arr.length) { topBox.hidden = true; return; }
      topBox.hidden = false;
      topBox.innerHTML = '<h2 class="sec-title">Top artists · last 7 days</h2>' +
        '<ol class="top-chips">' + arr.map((a, i) =>
          '<li class="top-chip"><a href="' + esc(a.url) + '" target="_blank" rel="noopener">' +
          '<span class="top-rank">' + (i + 1) + "</span>" +
          '<span class="top-art top-art-blank" aria-hidden="true">♪</span>' +
          '<span class="top-text">' +
          '<span class="top-name">' + esc(a.name) + "</span>" +
          '<span class="top-plays">' + esc(a.playcount) + " plays</span>" +
          "</span>" +
          "</a></li>").join("") + "</ol>";
      // chips are already visible — fill in the artist images as they resolve
      const chips = topBox.querySelectorAll(".top-chip");
      arr.forEach((a, i) => {
        artistImg(a.name).then((url) => {
          if (!url) return;
          const slot = chips[i] && chips[i].querySelector(".top-art");
          if (!slot) return;
          const img = new Image();
          img.className = "top-art";
          img.alt = "";
          img.referrerPolicy = "no-referrer";
          img.src = url;
          slot.replaceWith(img);
        });
      });
    } catch (e) { topBox.hidden = true; }
  }

  // =======================================================================
  // boot
  // =======================================================================
  paintHero();
  showIdle();          // headline + lyrics before the first poll lands
  startPresence();     // takes over the hero whenever a live Spotify track is found
  loadRecent();
  loadTop();
  requestAnimationFrame(tick);
  if (LFM_OK) setInterval(loadRecent, 45000);
})();