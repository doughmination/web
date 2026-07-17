import type { Metadata } from "next";
import Music from "@/scripts/Music";

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

// Read the Last.fm/AudioDB creds from the (dotenvx-decrypted) runtime env on
// each request and pass them to the client component, so they're never inlined
// into the build. force-dynamic stops Next prerendering this at build time,
// which would otherwise freeze whatever env was present then.
export const dynamic = "force-dynamic";

export default function MusicPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://i.scdn.co" />
      <link rel="dns-prefetch" href="https://i.scdn.co" />
      <link rel="preconnect" href="https://ws.audioscrobbler.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://ws.audioscrobbler.com" />
      <link rel="preconnect" href="https://lyrics.lanyard.cafe" crossOrigin="" />
      <link rel="dns-prefetch" href="https://lyrics.lanyard.cafe" />

      <Music
        lastfmUser={process.env.LASTFM_USER}
        lastfmKey={process.env.LASTFM_API_KEY}
        audiodbKey={process.env.THEAUDIODB_KEY}
      />
    </>
  );
}
