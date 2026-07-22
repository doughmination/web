/* src/app/layout.tsx
 * ESAL-2.3
 */

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBridge from "./_components/NavBridge";
import SettingsMenu from "@components/chrome/SettingsMenu";
import WebringDock from "@components/chrome/WebringDock";
import SiteChrome from "@components/chrome/SiteChrome";
import { DEFAULT_THEME, themeBootScript } from "@lib/themes";
// Palettes now live in TypeScript. Importing for side effects emits the
// html[data-flavor="…"] blocks at build time; see src/styles/themes.css.ts.
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
  metadataBase: new URL("https://c.stupid.cat"),
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
  authors: [{ name: "doughmination" }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://c.stupid.cat",
  },
  icons: {
    icon: [
      {
        url: "/assets/favicon/favicon.svg",
        type: "image/svg+xml"
      },
      { url: "/favicon.ico" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "The homepage and hub for everything Clove Twilight — projects, music, Discord presence, dev stats, and more.",
    url: "https://c.stupid.cat",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
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
    images: ["https://c.stupid.cat/assets/favicon/favicon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5c2e7",
};

// Pre-paint theme boot: set data-flavor before first paint to avoid a flash.
// Generated from the theme registry so the valid-flavor list can't drift.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // THEME_BOOT rewrites data-flavor from localStorage before hydration, so the
    // <html> attrs intentionally differ from the server render when a non-default
    // flavor is saved. suppressHydrationWarning marks that as expected.
    <html lang="en" data-flavor={DEFAULT_THEME} suppressHydrationWarning>
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
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
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

        {children}

        {/* Persistent chrome, ported into the bundle: nav builder, oneko cat, bg
            music, and the shared realtime client (window.DM) that every widget
            subscribes to. Runs once, client-only, via SiteChrome. */}
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
