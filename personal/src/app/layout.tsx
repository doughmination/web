/* src/app/layout.tsx
 * ESAL-2.3
 */

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBridge from "./_components/NavBridge";
import Providers from "./providers";
import SettingsMenu from "@components/chrome/SettingsMenu";
import WebringDock from "@components/chrome/WebringDock";
import SiteChrome from "@components/chrome/SiteChrome";
// One fixed palette. Importing for side effects emits the :root token block at
// build time; see src/styles/themes.css.ts.
import "@styles/themes.css";
// Global rules migrated from public/css to Vanilla Extract, one file at a time.
// Import order here IS the cascade order, so keep it matching main.css.
import "@styles/fonts.css";
import "@styles/base.css";
import "@styles/bg-music.css";
import "@styles/cat-picker.css";
import "@styles/keyring.css";
import "@styles/layout.css";
import "@styles/nav.css";
import "@styles/visitor-counter.css";
import "@styles/sections.css";
import "@styles/scroll-wrap.css";
// Last, so its media queries override the base rules above.
import "@styles/responsive.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://doughmination.gay"),
  title: "Clove Twilight",
  description:
    "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
  keywords: [
    "Clove Twilight",
    "doughmination.gay",
    "portfolio",
    "personal",
    "developer",
    "homepage",
  ],
  authors: [{ name: "doughmination" }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://doughmination.gay",
  },
  icons: {
    icon: [
      {
        url: "/assets/favicon.png",
        type: "image/png"
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Twilight",
    description:
      "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
    url: "https://doughmination.gay",
    locale: "en_GB",
    images: [
      {
        url: "https://doughmination.gay/assets/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@DoughminCEO",
    creator: "@DoughminCEO",
    title: "Clove Twilight",
    description:
      "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
    images: ["https://doughmination.gay/assets/favicon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5a9b8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Warm up the API origins the client JS fetches on load */}
        <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
        <link rel="dns-prefetch" href="https://doughmination.uk" />
        <link rel="preconnect" href="https://abacus.jasoncameron.dev" crossOrigin="" />
        <link rel="dns-prefetch" href="https://abacus.jasoncameron.dev" />
        {/* Comic Code is served from here (see styles/fonts.css.ts). Warming
            the connection early matters because the @font-face is only
            discovered once Next's CSS chunk has parsed. */}
        <link rel="preconnect" href="https://fonts.doughmination.co.uk" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.doughmination.co.uk" />
      </head>
      <body>
        {/* Persistent nav shell — core.ts populates .nav-links from nav.json */}
        <header className="nav">
          <nav className="nav-links"></nav>
        </header>

        {/* Routes core.ts's nav clicks through Next's client router so the
            layout (and bg-music audio) never unloads between pages. */}
        <NavBridge />

        {/* Chrome, now in React (theme owned here; cat + music bridge to core.ts) */}
        <SettingsMenu />
        <WebringDock />

        {/* Wrapper data layer: one REST client + socket shared by every
            migrated widget (Fronting first). See providers.tsx. */}
        <Providers>{children}</Providers>

        {/* Persistent chrome, ported into the bundle: nav builder, oneko cat, and
            bg music. Runs once, client-only, via SiteChrome. (Realtime now lives
            in the wrapper's shared socket via Providers, not here.) */}
        <SiteChrome catSrc="/assets/oneko/classics/classic.png" />
        {/* lanyard.cafe keyring (webring) */}
        <Script
          src="https://lanyard.cafe/api/embed.js"
          strategy="afterInteractive"
          data-theme="dark"
        />
      </body>
    </html>
  );
}
