/**
 * fonts.css.ts — every @font-face on the site.
 *
 * Ported from public/css/fonts.css.
 *
 * globalFontFace (not fontFace) is deliberate: fontFace() generates a hashed
 * family name, but these families are referenced by literal string from CSS that
 * hasn't been migrated yet AND from core.ts's flavour switcher, which writes
 * font-family values at runtime. globalFontFace keeps the names literal.
 *
 * Comic Code is served from fonts.doughmination.co.uk — layout.tsx preconnects
 * to that origin, which matters because it sits behind the stylesheet on the
 * critical path.
 */
import { globalFontFace } from "@vanilla-extract/css";

const CDN = "https://fonts.doughmination.co.uk";

/** Comic Code — the site's body/mono face, four cuts. */
const COMIC_CODE = [
  { file: "ComicCode-Regular_2022-05-24-151938_hsmz", weight: 400, style: "normal" },
  { file: "ComicCode-Italic_2022-05-24-151939_rdtu", weight: 400, style: "italic" },
  { file: "ComicCode-Medium_2022-05-24-151941_ugqm", weight: 500, style: "normal" },
  { file: "ComicCode-Bold_2022-05-24-152309_zqkm", weight: 700, style: "normal" },
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

/**
 * DDN display faces — one weight each, self-hosted under /assets/fonts.
 * Selectable per-theme by core.ts's flavour switcher.
 *
 * Note "gg sans" has a space in its filename, hence the %20. Keeping the URL
 * pre-encoded avoids relying on the browser to escape it.
 */
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
    src: `url('/assets/fonts/${file}') format('woff2')`,
    fontDisplay: "swap",
  });
}
