/* src/scripts/presenceIcons.ts
 * ESAL-2.3
 */

/* presenceIcons.ts — inline SVG for core.ts, the legacy imperative shell.
 *
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node scripts/gen-presence-icons.mjs
 *
 * WHY THIS EXISTS: the Bootstrap Icons *webfont* is no longer loaded anywhere
 * (it went away with the react-bootstrap-icons migration), so the old
 * `<i class="bi bi-x">` markup rendered nothing at all. core.ts builds HTML
 * strings for innerHTML and so cannot use React icon components. Path data is
 * extracted verbatim from react-bootstrap-icons, so this and the components
 * used elsewhere can never drift apart.
 *
 * Everything else — including the presence card — uses the components directly.
 * If core.ts is ever ported, delete this file.
 */

export type PresenceIconName =
  | "music-note-beamed";

const PATHS: Record<PresenceIconName, string> = {
  "music-note-beamed":
    "<path d=\"M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2\"/><path fill-rule=\"evenodd\" d=\"M14 11V2h1v9zM6 3v10H5V3z\"/><path d=\"M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z\"/>",
};

/** Inline SVG replacing the old `<i class="bi bi-NAME">`.
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
