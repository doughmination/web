# Agent instructions

Notes for any AI agent working in this repo. Written by Clove (a human), so
the tone is casual — follow the intent, not the grammar.

## Start here

- Read `README.md` first for the tech stack and how the apps fit together.
- Licence is custom: see `LICENCE.md`. Reuse the existing per-file licence
  header when creating files; never drop it when editing.
- Load the `i-have-adhd` and `dyslexia-friendly-code` skills if installed. If
  they are not, tell me, then carry on without them.

## Nginx (required for any new site)

- Make sure the `nginx-config` folder is mounted before doing web work. It is
  required — remind me if it is not. I can bypass, but ask first.
- Never assume the domain. I own many domains and may want a new one, so
  always check with me which domain a site should use.
- Every domain follows the same shape: `www` -> apex, and `http` -> `https`.
  Base new vhosts on the configs already in `sites-available/doughmination/`.
- Server-side nginx is **1.24.0 and cannot be upgraded** — don't use config
  that needs anything newer.
- If I paste an nginx mismatch/lint warning, you're expected to fix it.

## Secrets: dotenvx (required)

`@dotenvx/dotenvx` is a **required dependency** for every service that uses
secrets. The committed `.env` is encrypted; `.env.keys` (the private keys) is
gitignored and never committed. Mount both into the container read-only:

```yml
volumes:
    - "./.env:/app/.env:ro"
    - "./.env.keys:/app/.env.keys:ro"
```

Why it's done this way — don't "simplify" it away:

- Encrypted `.env` can live safely in git; secrets never sit in the image or
  in source control as plaintext.
- Keys stay in the separate `.env.keys` mount, off the host image.
- dotenvx decrypts **at runtime** — the container CMD runs through
  `dotenvx run -- <app>` (see `mailbox/Dockerfile` and `status/Dockerfile`),
  so plaintext only ever exists in the running container's memory.
- `:ro` means a compromised container can't rewrite the env or leak new keys.
- Because decryption is runtime, **do not** also use compose `env_file:` for
  the same values — that injects stale plaintext and defeats the point. Use
  the mount + dotenvx CMD only.

Per-app env var names are prefixed to avoid clashes in the shared `.env`
(e.g. `status` uses `STATUS_OIDC_CLIENT_ID`, not `OIDC_CLIENT_ID`).

## Uniform styling (every site)

All the sites — the Next apps (`personal`, `blog`, `info`, `system`, `status`),
the static ones (`mailbox`, and the separate `cdn` repo) — should look like one
family. Keep these consistent. **Code them into each site directly; do NOT
extract a shared npm/theme package.** Duplication across repos is intentional
here — favour "same code in each repo" over a shared dependency.

### Palette (dark, trans-pink)

The shared token values. In the Next apps these live in each app's Vanilla
Extract theme; in static sites they're CSS custom properties on `:root`.

```
--bg:           #0a0b10
--surface:      #12141c
--surface-hover:#1b1e2a
--text:         #f4f6fb
--muted:        #9aa3c2
--border:       #232838
--accent:       #f5a9b8
```

`viewport.themeColor` (and the static `<meta name="theme-color">`) is `#f5a9b8`.

### Trans-flag gradient title

Every site's main heading uses the same animated trans-flag gradient. Apply it
to that site's primary title (`.hub-header h1`, `pageTitle`, `.trans-title`,
etc.) — never a shared component.

```css
background-image: linear-gradient(90deg, #5BCEFA, #F5A9B8, #ffffff, #F5A9B8, #5BCEFA, #5BCEFA);
background-size: 200% 100%;
-webkit-background-clip: text;
background-clip: text;
color: transparent;
/* keyframes slide: backgroundPositionX -> 200% */
animation: slide 6s linear infinite;
```

Always add the reduced-motion guard: under
`@media (prefers-reduced-motion: reduce)` set `animation: none`.

### Font

**Comic Code** everywhere, via `@font-face` from `fonts.doughmination.co.uk`
(`ComicCode-Regular…woff2` / `ComicCode-Bold…woff2`), falling back to
`ui-monospace, monospace`. Preconnect to `m.doughmination.gay` in `<head>`.

### Link embeds (Open Graph)

Every site sets Open Graph + a `twitter:card = summary`, plus `theme-color`.
Fallback image is `https://m.doughmination.gay/img/avatars/favicon.png`. Where a
page represents a specific thing, make the tags dynamic (Next
`generateMetadata`) — e.g. `system` member pages (`[member_id]/layout.tsx`,
which uses `@doughmination/react-api/server` so it works in a server component)
and `blog` posts. The `api` worker content-negotiates `/`: browsers/crawlers get
an HTML card, API clients still get JSON.

### UI sounds

Hover / click / toggle sounds, **on by default**, muteable (persisted in
`localStorage`), silenced under `prefers-reduced-motion`. Audio streams from
`m.doughmination.gay/sfx/` (`hover.mp3`, `click.mp3`, `toggle.mp3`). Next apps
use a `SoundFX.tsx` client component mounted in the layout; static sites use a
`sfx.js` script. **Exception: the `cdn` site has no sounds** — it only *hosts*
the files for everyone else.

### Shared assets live on the CDN

Images/avatars, `.glb` models and `sfx` are served from `m.doughmination.gay`
(the `cdn` repo); fonts from `m.doughmination.gay/f`. When adding a new
site, copy the palette + trans title + font + OG + sounds from an existing one
rather than inventing a new look.
