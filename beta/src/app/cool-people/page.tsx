import type { Metadata } from "next";
import PageScripts from "../_components/PageScripts";

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
      <link rel="preconnect" href="https://restful.doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://restful.doughmination.uk" />
      <link rel="preconnect" href="https://wsrv.nl" />
      <link rel="dns-prefetch" href="https://wsrv.nl" />
      <link rel="preconnect" href="https://cdn.discordapp.com" />
      <link rel="dns-prefetch" href="https://cdn.discordapp.com" />
      <link rel="preconnect" href="https://i.scdn.co" />
      <link rel="dns-prefetch" href="https://i.scdn.co" />
      <link rel="preconnect" href="https://media.discordapp.net" />
      <link rel="dns-prefetch" href="https://media.discordapp.net" />
      {/* Fetch the presence script during hydration, not after it */}
      <link rel="preload" href="/js/discord.js" as="script" />

      <main className="hub friends-wrap">
        <header className="hub-header">
          <h1>Cool People</h1>
          <p className="tagline">
            This is where people I know can be put up on my site, click their
            profiles for their pages
          </p>
        </header>

        <div id="friends-discord"></div>

        <p className="friends-disclaimer">
          Presence data is served by{" "}
          <a
            href="https://restful.doughmination.uk"
            target="_blank"
            rel="noopener"
          >
            Doughmination Restful
          </a>
          .
        </p>
      </main>

      {/* Presence card factory + friends grid auto-mount on #friends-discord */}
      <PageScripts scripts={["/js/discord.js"]} />
    </>
  );
}
