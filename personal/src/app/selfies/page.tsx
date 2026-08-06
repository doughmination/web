/* personal/src/app/selfies/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import SelfiesGallery from "@scripts/SelfiesGallery";
import { Tr } from "@components/chrome/i18nText";
import "@styles/pages/selfies.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description: "Browse a gallery of selfies from Clove Nytrix Doughmination Twilight.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "selfies",
    "photos",
    "gallery",
    "personal",
  ],
  alternates: { canonical: "https://doughmination.gay/selfies" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description: "Browse a gallery of selfies from Clove Nytrix Doughmination Twilight.",
    url: "https://doughmination.gay/selfies",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

export default function SelfiesPage() {
  return (
    <>
      <div className="hub selfies-wrap">
        <header className="hub-header">
          <h1><Tr k="selfies.title" /></h1>
          <p className="tagline">
            <Tr k="selfies.tagline" />
          </p>
        </header>

        {/* Grid + lightbox rendered client-side from selfies.json. */}
        <SelfiesGallery />
      </div>
    </>
  );
}
