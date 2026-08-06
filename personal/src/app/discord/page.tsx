/* personal/src/app/discord/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import PresenceDashboard from "@scripts/PresenceDashboard";
import { Tr } from "@components/chrome/i18nText";
import * as s from "@styles/presence-dashboard.css";

const MY_DISCORD_USER_ID = "1464890289922641993";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "Clove Nytrix Doughmination Twilight's live Discord presence — current status, activity, and what fae is up to right now.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "Discord",
    "presence",
    "status",
    "Doughmination",
    "Restful",
  ],
  alternates: { canonical: "https://doughmination.gay/discord" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "Clove Nytrix Doughmination Twilight's live Discord presence — current status, activity, and what fae is up to right now.",
    url: "https://doughmination.gay/discord",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

export default function DiscordPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://wsrv.nl" />
      <link rel="dns-prefetch" href="https://wsrv.nl" />
      <link rel="preconnect" href="https://cdn.discordapp.com" />
      <link rel="dns-prefetch" href="https://cdn.discordapp.com" />

      <main className={s.page}>
        <div className={s.intro}>
          <h1 className={s.introTitle}><Tr k="discordPage.title" /></h1>
          <p className={s.introSub}><Tr k="discordPage.intro" /></p>
        </div>

        <PresenceDashboard userId={MY_DISCORD_USER_ID} />
      </main>
    </>
  );
}
