/* src/app/guestbook/page.tsx
 * ESAL-2.3
 */

import type { Metadata } from "next";
import Guestbook from "@scripts/Guestbook";
import "@styles/pages/guestbook.css";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description: "Sign Clove Twilight's guestbook — leave a message and say hello.",
  keywords: ["Clove Twilight", "doughmination.gay", "guestbook", "messages", "sign"],
  alternates: { canonical: "https://doughmination.gay/guestbook" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Twilight",
    description:
      "Sign Clove Twilight's guestbook — leave a message and say hello.",
    url: "https://doughmination.gay/guestbook",
    locale: "en_GB",
    images: [
      {
        url: "https://doughmination.gay/assets/favicon.png",
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

        <Guestbook turnstileKey="0x4AAAAAAB08ZhSxKn5rAD3d" />
      </div>
    </>
  );
}
