import type { Metadata } from "next";
import Guestbook from "@scripts/Guestbook";
import "@/styles/pages/guestbook.css";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description: "Sign Clove Twilight's guestbook — leave a message and say hello.",
  keywords: ["Clove Twilight", "c.stupid.cat", "guestbook", "messages", "sign"],
  alternates: { canonical: "https://c.stupid.cat/guestbook" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "Sign Clove Twilight's guestbook — leave a message and say hello.",
    url: "https://c.stupid.cat/guestbook",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
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
          <h1>Guestbook</h1>
          <p className="tagline">Leave a little note before you go &lt;3</p>
        </header>

        <Guestbook
          api="https://doughmination.uk/v2/guestbook"
          turnstileKey="0x4AAAAAAB08ZhSxKn5rAD3d"
        />
      </div>
    </>
  );
}
