/* personal/src/app/servers/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import ServersGuilds from "@scripts/ServersGuilds";
import { Tr } from "@components/chrome/i18nText";
// Shared card styles first, page overrides second — that's the cascade order.
import "@styles/stage.css";
import "@styles/pages/guilds.css";

export const metadata: Metadata = {
  title: "Servers | Clove Nytrix Doughmination Twilight",
  description:
    "Discord servers Clove Nytrix Doughmination Twilight is part of — live member counts via Doughmination Restful.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "Discord",
    "servers",
    "guilds",
    "Doughmination",
    "Restful",
  ],
  alternates: { canonical: "https://doughmination.gay/servers" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Servers | Clove Nytrix Doughmination Twilight",
    description:
      "Discord servers Clove Nytrix Doughmination Twilight is part of — live member counts via Doughmination Restful.",
    url: "https://doughmination.gay/servers",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

export default function ServersPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://cdn.discordapp.com" />
      <link rel="dns-prefetch" href="https://cdn.discordapp.com" />

      <main className="presence-stage">
        <div className="presence-intro">
          <h1><Tr k="serversPage.title" /></h1>
          <p><Tr k="serversPage.intro" /></p>
        </div>

        <ServersGuilds />
      </main>
    </>
  );
}
