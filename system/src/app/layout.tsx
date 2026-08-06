/* system/src/app/layout.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata, Viewport } from "next";
import "@/styles/theme.css";
import "@/styles/global.css";
import Providers from "./providers";
// import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  title: "Doughmination System | Plural System Member Tracker & Fronting Manager",
  description:
    "Real-time plural system tracker for the Doughmination System. View current fronters, system members, and track switching patterns. DID/OSDD system management made easy.",
  keywords:
    "plural system, DID, OSDD, system tracker, fronting tracker, plural community, system members, headmates, alters, Doughmination System",
  authors: [{ name: "Doughmination System" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://doughmination.co.uk/",
  },
  icons: {
    icon: "https://m.doughmination.gay/img/avatars/favicon.png",
    apple: "https://m.doughmination.gay/img/avatars/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Doughmination System",
  },
  openGraph: {
    siteName: "Doughmination System",
    title: "Doughmination System | Plural System Tracker",
    description:
      "Real-time plural system tracker. View current fronters and members of the Doughmination System.",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        width: 800,
        height: 800,
      },
    ],
    type: "website",
    url: "https://doughmination.co.uk/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Doughmination System | Plural System Tracker",
    description:
      "Real-time plural system tracker. View current fronters and members of the Doughmination System.",
    images: ["https://m.doughmination.gay/img/avatars/favicon.png"],
    site: "@doughmination",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="preconnect"
          href="https://m.doughmination.gay"
          crossOrigin=""
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
