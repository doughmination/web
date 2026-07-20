import type { Metadata } from "next";
import PresenceDashboard from "@scripts/PresenceDashboard";
import * as s from "@/styles/presence-dashboard.css";

const MY_DISCORD_USER_ID = "1464890289922641993";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "Clove Twilight's live Discord presence — current status, activity, and what fae is up to right now.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "Discord",
    "presence",
    "status",
    "Doughmination",
    "Restful",
  ],
  alternates: { canonical: "https://c.stupid.cat/discord" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "Clove Twilight's live Discord presence — current status, activity, and what fae is up to right now.",
    url: "https://c.stupid.cat/discord",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
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
          <h1 className={s.introTitle}>Discord</h1>
          <p className={s.introSub}>What fae is up to, live via Doughmination Restful.</p>
        </div>

        <PresenceDashboard userId={MY_DISCORD_USER_ID} />
      </main>
    </>
  );
}
