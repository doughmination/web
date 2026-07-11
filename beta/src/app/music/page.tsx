import type { Metadata } from "next";
import PageScripts from "../_components/PageScripts";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "What Clove Twilight is listening to — live now-playing track, synced lyrics, and recent plays from Last.fm.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "music",
    "now playing",
    "Last.fm",
    "lyrics",
    "scrobbles",
  ],
  alternates: { canonical: "https://c.stupid.cat/music" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "What Clove Twilight is listening to — live now-playing track, synced lyrics, and recent plays from Last.fm.",
    url: "https://c.stupid.cat/music",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

const OBSESSIONS = [
  "6vmtWuZN1IbDPhVshbeD22",
  "3s44Qv8x974tm0ueLexMWN",
  "4ujxDgeTs9YpwMKHSmZ4qc",
  "7ipaq31bGwoqfcv1cSFuJO",
];

const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function MusicPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://restful.doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://restful.doughmination.uk" />
      <link rel="preconnect" href="https://i.scdn.co" />
      <link rel="dns-prefetch" href="https://i.scdn.co" />
      <link rel="preconnect" href="https://ws.audioscrobbler.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://ws.audioscrobbler.com" />
      <link rel="preconnect" href="https://lyrics.lanyard.cafe" crossOrigin="" />
      <link rel="dns-prefetch" href="https://lyrics.lanyard.cafe" />

      <main className="music-wrap" id="music">
        <header className="music-head">
          <h1>Music</h1>
          <p>What I&apos;m listening to, with lyrics that follow along.</p>
        </header>

        {/* now playing */}
        <a className="mdc" id="dc-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mdc-art" id="dc-art" alt="" src={TRANSPARENT_GIF} />
          <div className="mdc-meta">
            <span className="mdc-state" id="dc-state">
              Connecting…
            </span>
            <span className="mdc-title" id="dc-title">
              —
            </span>
            <span className="mdc-artist" id="dc-artist"></span>
            <span className="mdc-album" id="dc-album"></span>
            <div className="mdc-progress" id="dc-progress" hidden>
              <span className="mdc-time" id="dc-cur">
                0:00
              </span>
              <span className="mdc-bar">
                <span className="mdc-fill" id="dc-fill"></span>
              </span>
              <span className="mdc-time" id="dc-dur">
                0:00
              </span>
            </div>
          </div>
        </a>

        {/* lyrics */}
        <div className="sec-row" id="lyrics-section">
          <h2 className="sec-title">Lyrics</h2>
          <button
            className="ly-lock is-locked"
            id="ly-lock"
            type="button"
            aria-pressed="true"
            hidden
          >
            <span className="ly-bars" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span className="ly-lock-label">Synced</span>
          </button>
        </div>
        <div className="lyrics is-empty" id="lyrics">
          <p className="ly-note">Waiting for a track…</p>
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
            ></iframe>
          ))}
        </div>

        {/* recently played */}
        <h2 className="sec-title" id="recently-played">
          Recently played
        </h2>
        <ul className="recent" id="recent"></ul>

        {/* top artists (hidden until Last.fm data arrives) */}
        <div id="top" hidden></div>
      </main>

      <PageScripts scripts={["/js/music.js"]} />
    </>
  );
}
