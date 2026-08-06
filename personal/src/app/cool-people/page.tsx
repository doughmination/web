/* personal/src/app/cool-people/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import FriendsGrid from "@scripts/FriendsGrid";
import { Tr, TrLink } from "@components/chrome/i18nText";
import "@styles/presence-card.css";
import "@styles/pages/cool-people.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "Cool people Clove Nytrix Doughmination Twilight knows — friends, mutuals, and creators worth checking out, with links to their sites.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "friends",
    "cool people",
    "mutuals",
    "links",
  ],
  alternates: { canonical: "https://doughmination.gay/cool-people" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "Cool people Clove Nytrix Doughmination Twilight knows — friends, mutuals, and creators worth checking out, with links to their sites.",
    url: "https://doughmination.gay/cool-people",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
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
          <h1><Tr k="coolPeople.title" /></h1>
          <p className="tagline">
            <Tr k="coolPeople.tagline" />
          </p>
        </header>

        <FriendsGrid />

        <p className="friends-disclaimer">
          <TrLink
            k="coolPeople.presenceCredit"
            href="https://doughmination.uk"
            linkText="Doughmination Restful"
          />
        </p>
      </main>

    </>
  );
}
