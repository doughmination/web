/* personal/src/app/music/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import Music from "@scripts/Music";
import "@styles/pages/music.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "What Clove Nytrix Doughmination Twilight is listening to — live now-playing track, synced lyrics, and recent plays from Last.fm.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "music",
    "now playing",
    "Last.fm",
    "lyrics",
    "scrobbles",
  ],
  alternates: { canonical: "https://doughmination.gay/music" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "What Clove Nytrix Doughmination Twilight is listening to — live now-playing track, synced lyrics, and recent plays from Last.fm.",
    url: "https://doughmination.gay/music",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

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

      <Music />
    </>
  );
}
