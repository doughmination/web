import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBridge from "./_components/NavBridge";
import SettingsMenu from "@components/chrome/SettingsMenu";
import WebringDock from "@components/chrome/WebringDock";
import SiteChrome from "@components/chrome/SiteChrome";
import { DEFAULT_THEME, themeBootScript } from "@lib/themes";

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
      { url: "/assets/favicon/favicon.svg", type: "image/svg+xml" },
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
        {/* The webfonts sit three hops deep — HTML → main.css → fonts.css →
            here — so without this the DNS/TCP/TLS handshake can't even begin
            until two stylesheets have downloaded and parsed. */}
        <link rel="preconnect" href="https://fonts.doughmination.co.uk" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.doughmination.co.uk" />
        {/* Ported Catppuccin stylesheet manifest (lives in public/css).
            precedence="global" is load-bearing: React 19 hoists precedence-managed
            stylesheets above plain <link> tags, so without it the per-route sheets
            would cascade BEFORE this one and global styles would win. Declaring it
            here — in the layout, which renders before any page — establishes
            "global" as the first precedence tier, ahead of "page". */}
        <link rel="stylesheet" href="/css/main.css" precedence="global" />
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
