/* personal/src/styles/fonts.css.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { globalFontFace } from "@vanilla-extract/css";

const CDN = "https://m.doughmination.gay/f";

/** Comic Code — the site's body/mono face, four cuts. */
const COMIC_CODE = [
  {
    file: "ComicCode-Regular",
    weight: 400,
    style: "normal"
  },
  {
    file: "ComicCode-Italic",
    weight: 400,
    style: "italic"
  },
  {
    file: "ComicCode-Medium",
    weight: 500,
    style: "normal"
  },
  {
    file: "ComicCode-Bold",
    weight: 700,
    style: "normal"
  },
] as const;

for (const { file, weight, style } of COMIC_CODE) {
  globalFontFace("Comic Code", {
    src: `url('${CDN}/Comic-Code/woff2/${file}.woff2') format('woff2'), url('${CDN}/Comic-Code/woff/${file}.woff') format('woff')`,
    fontWeight: weight,
    fontStyle: style,
    // swap: show fallback text immediately rather than blocking on the webfont.
    fontDisplay: "swap",
  });
}

const DDN: Array<[family: string, file: string]> = [
  ["DDN 8Bit", "8Bit.woff2"],
  ["DDN Jellybean", "Jellybean.woff2"],
  ["DDN Medieval", "Medieval.woff2"],
  ["DDN Modern", "Modern.woff2"],
  ["DDN Sakura", "Sakura.woff2"],
  ["DDN Tempo", "Tempo.woff2"],
  ["DDN Vampyre", "Vampyre.woff2"],
  ["DDN gg sans", "gg%20sans.woff2"],
];

for (const [family, file] of DDN) {
  globalFontFace(family, {
    src: `url('${CDN}/discord/${file}') format('woff2')`,
    fontDisplay: "swap",
  });
}
