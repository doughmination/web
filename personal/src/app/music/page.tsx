import type { Metadata } from "next";
import Music from "@scripts/Music";

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

export default function MusicPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/pages/music.css" precedence="page" />
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://i.scdn.co" />
      <link rel="dns-prefetch" href="https://i.scdn.co" />
      <link rel="preconnect" href="https://ws.audioscrobbler.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://ws.audioscrobbler.com" />
      <link rel="preconnect" href="https://lyrics.lanyard.cafe" crossOrigin="" />
      <link rel="dns-prefetch" href="https://lyrics.lanyard.cafe" />

      <Music />
    </>
  );
}
