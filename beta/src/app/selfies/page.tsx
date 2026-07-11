import type { Metadata } from "next";
import PageScripts from "../_components/PageScripts";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description: "Browse a gallery of selfies from Clove Twilight.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "selfies",
    "photos",
    "gallery",
    "personal",
  ],
  alternates: { canonical: "https://c.stupid.cat/selfies" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description: "Browse a gallery of selfies from Clove Twilight.",
    url: "https://c.stupid.cat/selfies",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
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

        {/* Thumbnails rendered by selfies.js from /assets/selfies/selfies.json */}
        <div
          id="selfies-root"
          className="selfie-grid"
          aria-label="Selfies gallery"
        ></div>
      </div>

      <PageScripts scripts={["/js/selfies.js"]} />
    </>
  );
}
