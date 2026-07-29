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
          href="https://fonts.doughmination.co.uk"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
