/* personal/src/app/selfies/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import SelfiesGallery from "@scripts/SelfiesGallery";
import "@styles/pages/selfies.css";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description: "Browse a gallery of selfies from Clove Twilight.",
  keywords: [
    "Clove Twilight",
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
    title: "Clove Twilight",
    description: "Browse a gallery of selfies from Clove Twilight.",
    url: "https://doughmination.gay/selfies",
    locale: "en_GB",
    images: [
      {
        url: "https://doughmination.gay/assets/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

export default function SelfiesPage() {
  return (
    <>
      <div className="hub selfies-wrap">
        <header className="hub-header">
          <h1>Selfies</h1>
          <p className="tagline">
            A gallery of my selfies — tap any photo to view it full size
          </p>
        </header>

        {/* Grid + lightbox rendered client-side from selfies.json. */}
        <SelfiesGallery />
      </div>
    </>
  );
}
