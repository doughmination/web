/* personal/src/app/layout.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata, Viewport } from "next";
import NavBridge from "./_components/NavBridge";
import SoundFX from "./SoundFX";
import Providers from "./providers";
import SettingsMenu from "@components/chrome/SettingsMenu";
import NavMenu from "@components/chrome/NavMenu";
import { MenusProvider } from "@components/chrome/MenusProvider";
import SiteChrome from "@components/chrome/SiteChrome";
import { LanguageProvider } from "@/i18n/LanguageProvider";
// One fixed palette. Importing for side effects emits the :root token block at
// build time; see src/styles/themes.css.ts.
import "@styles/themes.css";
// Global rules migrated from public/css to Vanilla Extract, one file at a time.
// Import order here IS the cascade order, so keep it matching main.css.
import "@styles/fonts.css";
import "@styles/base.css";
import "@styles/bg-music.css";
import "@styles/cat-picker.css";
import "@styles/layout.css";
import "@styles/nav.css";
import "@styles/visitor-counter.css";
import "@styles/sections.css";
import "@styles/scroll-wrap.css";
// Last, so its media queries override the base rules above.
import "@styles/responsive.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://doughmination.gay"),
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "The homepage and hub for everything Clove Nytrix Doughmination Twilight — projects, music, Discord presence, dev stats, and more.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
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
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        type: "image/png"
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "The homepage and hub for everything Clove Nytrix Doughmination Twilight — projects, music, Discord presence, dev stats, and more.",
    url: "https://doughmination.gay",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@DoughminCEO",
    creator: "@DoughminCEO",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "The homepage and hub for everything Clove Nytrix Doughmination Twilight — projects, music, Discord presence, dev stats, and more.",
    images: ["https://m.doughmination.gay/img/avatars/favicon.png"],
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
        <link rel="preconnect" href="https://m.doughmination.gay" crossOrigin="" />
        <link rel="dns-prefetch" href="https://m.doughmination.gay" />
      </head>
      <body>
        {/* Active language (localStorage-persisted, browser-detected on first
            visit). Wraps everything below, not just Providers' children —
            NavMenu and SettingsMenu need translations too and both render
            outside Providers. See src/i18n/LanguageProvider.tsx. */}
        <LanguageProvider>
          {/* The two top-left menus share one open/closed state so only one is
              ever open — opening the cog closes the burger and vice versa. */}
          <MenusProvider>
            {/* Page nav (React-owned). Desktop shows a hamburger that opens icon
                dots then telescopes them into labels; mobile is a wrapping row. */}
            <NavMenu />

            {/* Chrome, now in React (cat + music bridge to core.ts). Cog sits
                beside the burger on desktop. */}
            <SettingsMenu />
          </MenusProvider>

          {/* Routes core.ts's nav clicks through Next's client router so the
              layout (and bg-music audio) never unloads between pages. */}
          <NavBridge />

          {/* Wrapper data layer: one REST client + socket shared by every
              migrated widget (Fronting first). See providers.tsx. */}
          <Providers>{children}</Providers>

          {/* Persistent chrome, ported into the bundle: nav builder, oneko cat, and
              bg music. Runs once, client-only, via SiteChrome. (Realtime now lives
              in the wrapper's shared socket via Providers, not here.) */}
          <SiteChrome catSrc="https://m.doughmination.gay/img/oneko/classic.png" />

          <SoundFX />
        </LanguageProvider>
      </body>
    </html>
  );
}
