import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBridge from "./_components/NavBridge";
import SettingsMenu from "@/components/chrome/SettingsMenu";
import WebringDock from "@/components/chrome/WebringDock";

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
const THEME_BOOT = `try { var f = localStorage.getItem('ctpFlavor'); document.documentElement.setAttribute('data-flavor', ['mocha', 'macchiato', 'frappe', 'latte'].indexOf(f) >= 0 ? f : 'mocha'); } catch (e) { document.documentElement.setAttribute('data-flavor', 'mocha'); }`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // THEME_BOOT rewrites data-flavor from localStorage before hydration, so the
    // <html> attrs intentionally differ from the server render when a non-default
    // flavor is saved. suppressHydrationWarning marks that as expected.
    <html lang="en" data-flavor="mocha" suppressHydrationWarning>
      <head>
        {/* Warm up the API origins the client JS fetches on load */}
        <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
        <link rel="dns-prefetch" href="https://doughmination.uk" />
        <link rel="preconnect" href="https://abacus.jasoncameron.dev" crossOrigin="" />
        <link rel="dns-prefetch" href="https://abacus.jasoncameron.dev" />
        {/* Ported Catppuccin stylesheet manifest (lives in public/css) */}
        <link rel="stylesheet" href="/css/main.css" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        {/* Persistent nav shell — core.js populates .nav-links from nav.json */}
        <header className="nav">
          <nav className="nav-links"></nav>
        </header>

        {/* Routes core.js's nav clicks through Next's client router so the
            layout (and bg-music audio) never unloads between pages. */}
        <NavBridge />

        {/* Chrome, now in React (theme owned here; cat + music bridge to core.js) */}
        <SettingsMenu />
        <WebringDock />

        {children}

        {/* Persistent chrome: nav builder, theme switcher, oneko cat, bg music */}
        {/* core.js also carries the shared realtime client (window.DM) — one
            global script for all the persistent chrome + the site socket. */}
        <Script
          src="/js/core.js"
          strategy="afterInteractive"
          data-cat="/assets/oneko/classics/classic.png"
        />
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
