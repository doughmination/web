/* info/src/app/layout.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/layout.tsx */

import type { Metadata } from "next";
import "@styles/global.css";

export const metadata: Metadata = {
  title: "Clove",
  description: "A little map to everything I make.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://m.doughmination.gay"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
