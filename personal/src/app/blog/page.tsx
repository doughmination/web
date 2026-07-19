import type { Metadata } from "next";
import BlogCards from "@scripts/BlogCards";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "portfolio",
    "personal",
    "developer",
    "homepage",
  ],
  alternates: { canonical: "https://c.stupid.cat/blog" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
    url: "https://c.stupid.cat/blog",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

export default function BlogIndexPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/pages/blog.css" precedence="page" />
      {/* Warm up the API origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://abacus.jasoncameron.dev" crossOrigin="" />
      <link rel="dns-prefetch" href="https://abacus.jasoncameron.dev" />

      <main>
        <header className="hub-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pfp"
            src="/assets/favicon/avatar.png"
            alt="Clove Twilight avatar"
          />
          <h1>Blog</h1>
          <h2 className="pronouns">Random Yapping and Stuff</h2>
        </header>

        {/* Cards fetched from /posts.json client-side. */}
        <BlogCards />
      </main>
    </>
  );
}
