/* src/app/cool-people/page.tsx
 * ESAL-2.3
 */

import type { Metadata } from "next";
import FriendsGrid from "@scripts/FriendsGrid";
import "@styles/presence-card.css";
import "@styles/pages/cool-people.css";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "Cool people Clove Twilight knows — friends, mutuals, and creators worth checking out, with links to their sites.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "friends",
    "cool people",
    "mutuals",
    "links",
  ],
  alternates: { canonical: "https://c.stupid.cat/cool-people" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "Cool people Clove Twilight knows — friends, mutuals, and creators worth checking out, with links to their sites.",
    url: "https://c.stupid.cat/cool-people",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

export default function CoolPeoplePage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://wsrv.nl" />
      <link rel="dns-prefetch" href="https://wsrv.nl" />
      <link rel="preconnect" href="https://cdn.discordapp.com" />
      <link rel="dns-prefetch" href="https://cdn.discordapp.com" />
      <link rel="preconnect" href="https://i.scdn.co" />
      <link rel="dns-prefetch" href="https://i.scdn.co" />
      <link rel="preconnect" href="https://media.discordapp.net" />
      <link rel="dns-prefetch" href="https://media.discordapp.net" />

      <main className="hub friends-wrap">
        <header className="hub-header">
          <h1>Cool People</h1>
          <p className="tagline">
            This is where people I know can be put up on my site, click their
            profiles for their pages
          </p>
        </header>

        <FriendsGrid />

        <p className="friends-disclaimer">
          Presence data is served by{" "}
          <a
            href="https://doughmination.uk"
            target="_blank"
            rel="noopener"
          >
            Doughmination Restful
          </a>
          .
        </p>
      </main>

    </>
  );
}
