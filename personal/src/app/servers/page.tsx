import type { Metadata } from "next";
import ServersGuilds from "@scripts/ServersGuilds";
// Shared card styles first, page overrides second — that's the cascade order.
import "@/styles/stage.css";
import "@/styles/pages/guilds.css";

export const metadata: Metadata = {
  title: "Servers | Clove Twilight",
  description:
    "Discord servers Clove Twilight is part of — live member counts via Doughmination Restful.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "Discord",
    "servers",
    "guilds",
    "Doughmination",
    "Restful",
  ],
  alternates: { canonical: "https://c.stupid.cat/servers" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Servers | Clove Twilight",
    description:
      "Discord servers Clove Twilight is part of — live member counts via Doughmination Restful.",
    url: "https://c.stupid.cat/servers",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
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
          <h1>Servers</h1>
          <p>Discord servers I&apos;m part of, live via Doughmination Restful.</p>
        </div>

        <ServersGuilds />
      </main>
    </>
  );
}
