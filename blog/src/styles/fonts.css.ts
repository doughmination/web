/* src/styles/fonts.css.ts
 * Comic Code — the site's body/mono face, four cuts, served from the same CDN
 * as the personal site. (The DDN display fonts from the main site aren't used
 * here, so they're left out to avoid shipping unused @font-face rules.)
 */

import { globalFontFace } from "@vanilla-extract/css";

const CDN = "https://fonts.doughmination.co.uk";

const COMIC_CODE = [
  {
    file: "ComicCode-Regular_2022-05-24-151938_hsmz",
    weight: 400,
    style: "normal",
  },
  {
    file: "ComicCode-Italic_2022-05-24-151939_rdtu",
    weight: 400,
    style: "italic",
  },
  {
    file: "ComicCode-Medium_2022-05-24-151941_ugqm",
    weight: 500,
    style: "normal",
  },
  {
    file: "ComicCode-Bold_2022-05-24-152309_zqkm",
    weight: 700,
    style: "normal",
  },
] as const;

for (const { file, weight, style } of COMIC_CODE) {
  globalFontFace("Comic Code", {
    src: `url('${CDN}/${file}.woff2') format('woff2'), url('${CDN}/${file}.woff') format('woff')`,
    fontWeight: weight,
    fontStyle: style,
    // swap: show fallback text immediately rather than blocking on the webfont.
    fontDisplay: "swap",
  });
}
