/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
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
    icon: "https://c.stupid.cat/assets/favicon/avatar.png",
    apple: "https://c.stupid.cat/assets/favicon/avatar.png",
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
        url: "https://c.stupid.cat/assets/favicon/avatar.png",
        width: 1200,
        height: 630,
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
    images: ["https://c.stupid.cat/assets/favicon/avatar.png"],
    site: "@doughmination",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8b5cf6",
};

// Apply the saved theme before first paint to avoid a flash of the default flavor
const themeInitScript = `
try {
  var t = localStorage.getItem('theme');
  var valid = ['cherry', 'toxic', 'lemon', 'estrogen', 'cyberpunk'];
  document.documentElement.setAttribute('data-flavor', valid.indexOf(t) !== -1 ? t : 'cherry');
} catch (e) {
  document.documentElement.setAttribute('data-flavor', 'cherry');
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-flavor="cherry" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
