/* personal/src/app/guestbook/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import Guestbook from "@scripts/Guestbook";
import { Tr } from "@components/chrome/i18nText";
import "@styles/pages/guestbook.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description: "Sign Clove Nytrix Doughmination Twilight's guestbook — leave a message and say hello.",
  keywords: ["Clove Nytrix Doughmination Twilight", "doughmination.gay", "guestbook", "messages", "sign"],
  alternates: { canonical: "https://doughmination.gay/guestbook" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "Sign Clove Nytrix Doughmination Twilight's guestbook — leave a message and say hello.",
    url: "https://doughmination.gay/guestbook",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

export default function GuestbookPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://challenges.cloudflare.com" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />

      <div className="hub friends-wrap guestbook-wrap">
        <header className="hub-header">
          <h1><Tr k="guestbook.title" /></h1>
          <p className="tagline"><Tr k="guestbook.tagline" /></p>
        </header>

        <Guestbook turnstileKey="0x4AAAAAAB08ZhSxKn5rAD3d" />
      </div>
    </>
  );
}
