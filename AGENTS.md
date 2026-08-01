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
