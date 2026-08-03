<div align="center">
  <img src="https://doughmination.gay/favicon.png" alt="Clove logo" width="150" />

  <h1>Web</h1>

  <p>The monorepo containing all of Clove's websites — five apps and a font archive, built with Bun and Next.js, shipped as Docker images.</p>

  <p>
    <img src="https://img.shields.io/badge/runtime-Bun-000000?style=plastic&logo=bun&logoColor=F9F1E1" alt="Bun" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=plastic&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=plastic&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=plastic&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/licence-DASL--1.0-blue?style=plastic" alt="Licence" />
  </p>
</div>

## Sites

| Name | Description | URL | Source |
| --- | --- | --- | --- |
| Info | Main link hub | [doughmination.info](https://doughmination.info) | [`info/`](./info) |
| Personal | Personal homepage and central site | [doughmination.gay](https://doughmination.gay) | [`personal/`](./personal) |
| Blog | Personal blog | [doughmination.site](https://doughmination.site) | [`blog/`](./blog) |
| System | Doughmination System frontend | [doughmination.co.uk](https://doughmination.co.uk) | [`system/`](./system) |
| Mailbox | Email mailbox | [doughmination.tech](https://doughmination.tech) | [`mailbox/`](./mailbox) |
| Status | Service status page (public) + PocketID-gated admin | [doughmination.org](https://doughmination.org) | [`status/`](./status) |
| Fonts | Comic Code font archive (static) | [fonts.doughmination.co.uk](https://fonts.doughmination.co.uk) | [`fonts/`](./fonts) |

## Repository layout

```
web/
├── personal/        Next.js — homepage & hub (doughmination.gay)
├── blog/            Next.js — blog (doughmination.site)
├── info/            Next.js — link hub (doughmination.info)
├── system/          Next.js — system frontend (doughmination.co.uk)
├── mailbox/         Bun + Hono — email inbox API/UI (doughmination.tech)
├── status/          Next.js — service status + PocketID admin (doughmination.org)
├── fonts/           Static Comic Code font archive
├── setup/           Windows setup helper (PowerShell)
├── compose.yml      Production stack (pulls doughmination/* images)
├── dev.sh           Runs all Next.js apps locally in parallel
└── .env.example     Environment template (mailbox)
```

The four Next.js apps (`personal`, `blog`, `info`, `system`) share the same stack: Next.js on Bun, styled with Vanilla Extract and Radix UI, data via TanStack Query. `mailbox` is a Bun + Hono server with Postgres, Redis, OIDC auth, and Web Push.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (latest)
- [Docker](https://www.docker.com) + Docker Compose (for the production stack)

### Local development

The four Next.js apps run together via the helper script, each on its own `300x` port:

```bash
./dev.sh
```

| App | Local URL |
| --- | --- |
| Personal | http://localhost:3000 |
| System | http://localhost:3001 |
| Info | http://localhost:3002 |
| Blog | http://localhost:3003 |
| Status | http://localhost:3004 |

To run a single app instead:

```bash
cd personal
bun install
bun dev
```

`mailbox` runs on its own and needs environment variables (see below):

```bash
cd mailbox
bun install
bun dev
```

> **Note:** `dev.sh` uses `bun install` (never `bun update`) so dependencies stay pinned to `bun.lock`. To intentionally bump versions, run `bun update` by hand — Dependabot otherwise handles routine updates.

## Environment

`mailbox` and `status` require configuration — both are documented in the single root [`.env.example`](./.env.example). For `mailbox`, copy the template to `.env` and fill in your values. For `status`, put its values (its own PocketID client, a `SESSION_SECRET`, and the `ADMIN_USERS` allowlist) in `.env.status`, which the container loads in production (see [`compose.yml`](./compose.yml)):

```bash
cp .env.example .env
```

It covers Resend (transactional email), VAPID (Web Push), OIDC (auth), Redis, and Postgres. In production, secrets are decrypted at runtime with [dotenvx](https://dotenvx.com) — the container mounts `.env` and `.env.keys` read-only (see [`compose.yml`](./compose.yml)).

## Deployment

Production containers bind to `127.0.0.1` on a sequenced `40x0` scheme and sit behind a reverse proxy. They join an external Docker network named `infra`, created once with:

```bash
docker network create infra
```

| Service | Prod port | Dev port | Image |
| --- | --- | --- | --- |
| Personal | 4050 | 3000 | `doughmination/personal` |
| Blog | 4010 | 3003 | `doughmination/blog` |
| Info | 4020 | 3002 | `doughmination/info` |
| System | 4030 | 3001 | `doughmination/system` |
| Mailbox (inbox) | 4040 | — | `doughmination/mailbox` |
| Status | 4080 | 3004 | `doughmination/status` |

Pull the latest published images and start the stack:

```bash
docker compose pull
docker compose up -d
```

`compose.yml` references the published Docker Hub images rather than building locally, so a `pull` grabs whatever the CI last pushed.

## CI/CD

GitHub Actions build and publish images automatically:

- **Per-service builds** — a push to `main` that touches a service folder (e.g. `info/**`) builds that service and pushes `doughmination/<service>` to Docker Hub, tagged `latest`, the short commit SHA, and the date. Each service has its own path-filtered workflow in [`.github/workflows/`](./.github/workflows), all calling the shared [`docker-build.yml`](./.github/workflows/docker-build.yml).
- **Dependency updates** — [Dependabot](./.github/dependabot.yml) checks Bun and Docker dependencies daily and opens one grouped PR per service for minor and patch bumps.

Publishing requires two repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.

## Tech stack

**Frameworks & languages** — Next.js, React, TypeScript, HTML5, CSS3

**Runtime & infrastructure** — Bun, Node.js, Docker, NGINX, PostgreSQL, Redis

**Libraries & tools** — Hono, Resend, Vanilla Extract, Radix UI, TanStack Query, Recharts, Sonner, JOSE, Web Push, `@doughmination/react-api`, ESLint, Turbopack

## Contributing & security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to propose changes and [SECURITY.md](./SECURITY.md) to report a vulnerability.

## Licence

Licensed under the **Doughmination Authorised Source Licence (DASL-1.0)**. See [LICENCE.md](./LICENCE.md) for the full terms.
