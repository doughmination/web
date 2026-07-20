/* gen-presence-icons.mjs — regenerate src/scripts/presenceIcons.ts
 *
 * core.ts is a legacy imperative script that builds HTML strings for innerHTML,
 * so it can't use react-bootstrap-icons components. This pulls the raw SVG path
 * data out of the installed package so its inline SVG and the React components
 * used everywhere else stay on one source of truth.
 *
 * The presence card used to need this too; it's a real component now
 * (PresenceCard.tsx) and imports the icon components directly, so only the
 * bg-music gate is left. If core.ts ever gets ported, this file and
 * presenceIcons.ts can both go.
 *
 * Run from the repo root:  node scripts/gen-presence-icons.mjs
 * Add an icon by putting its bootstrap-icons name in NAMES below.
 */

import fs from "node:fs";
import path from "node:path";

const ICON_DIR = "node_modules/react-bootstrap-icons/dist/icons/";
const OUT = "src/scripts/presenceIcons.ts";

/** Every icon core.ts renders as an HTML string. */
const NAMES = [
  "music-note-beamed", // bg-music click-to-enter gate
];

function extract(name) {
  const file = path.join(ICON_DIR, `${name}.js`);
  if (!fs.existsSync(file)) throw new Error(`icon not in react-bootstrap-icons: ${name}`);
  const src = fs.readFileSync(file, "utf8");
  const kids = [...src.matchAll(/React\.createElement\("(path|circle|rect)",\s*\{([\s\S]*?)\}\)/g)];
  let body = "";
  for (const [, tag, props] of kids) {
    const d = props.match(/\bd:\s*"((?:[^"\\]|\\.)*)"/);
    if (!d) continue;
    const fr = props.match(/fillRule:\s*"([^"]*)"/);
    body += `<${tag}${fr ? ` fill-rule="${fr[1]}"` : ""} d="${d[1].replace(/\\"/g, '"')}"/>`;
  }
  if (!body) throw new Error(`no path data extracted for: ${name}`);
  return body;
}

const icons = Object.fromEntries(NAMES.map((n) => [n, extract(n)]));
const keys = Object.keys(icons).sort();

const header = `/* presenceIcons.ts — inline SVG for core.ts, the legacy imperative shell.
 *
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node scripts/gen-presence-icons.mjs
 *
 * WHY THIS EXISTS: the Bootstrap Icons *webfont* is no longer loaded anywhere
 * (it went away with the react-bootstrap-icons migration), so the old
 * \`<i class="bi bi-x">\` markup rendered nothing at all. core.ts builds HTML
 * strings for innerHTML and so cannot use React icon components. Path data is
 * extracted verbatim from react-bootstrap-icons, so this and the components
 * used elsewhere can never drift apart.
 *
 * Everything else — including the presence card — uses the components directly.
 * If core.ts is ever ported, delete this file.
 */

export type PresenceIconName =
${keys.map((k) => `  | "${k}"`).join("\n")};

const PATHS: Record<PresenceIconName, string> = {
${keys.map((k) => `  "${k}":\n    ${JSON.stringify(icons[k])},`).join("\n")}
};
`;

const helper = `
/** Inline SVG replacing the old \`<i class="bi bi-NAME">\`.
 *  cls   — classes the old <i> carried (e.g. "pc-plat", "pc-conn-ic")
 *  title — tooltip, as the old markup's title attribute
 *  label — accessible name; omit both title and label for decorative icons,
 *          which then render aria-hidden like the originals did. */
export function icon(
  name: PresenceIconName,
  opts?: { cls?: string; title?: string; label?: string },
): string {
  const body = PATHS[name];
  if (!body) return "";
  const o = opts ?? {};
  const esc = (s: string) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const named = o.label != null || o.title != null;
  return (
    '<svg class="pc-ic' +
    (o.cls ? " " + esc(o.cls) : "") +
    '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"' +
    ' width="1em" height="1em" fill="currentColor"' +
    (o.title ? ' title="' + esc(o.title) + '"' : "") +
    (named
      ? ' role="img" aria-label="' + esc(o.label ?? o.title ?? "") + '"'
      : ' aria-hidden="true" focusable="false"') +
    ">" +
    body +
    "</svg>"
  );
}
`;

fs.writeFileSync(OUT, header + helper);
console.log(`wrote ${OUT} — ${keys.length} icons`);
