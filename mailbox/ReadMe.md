# Mailbox

This is a hono project for my emails.

## Tech Stack:
![Bun](https://img.shields.io/badge/Bun-000000?style=plastic&logo=bun&logoColor=F9F1E1)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=plastic&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=plastic&logo=hono&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=plastic&logo=resend&logoColor=white)
![Postgres](https://img.shields.io/badge/Postgres-4169E1?style=plastic&logo=postgresql&logoColor=white)

## Storage

State lives in Postgres (emails, attachments, settings, ownership config, and
push subscriptions). Set `DATABASE_URL` to your connection string, e.g.:

```
DATABASE_URL=postgres://user:pass@host:5432/mailbox
```

Tables are created automatically on boot (`initDb()` in `lib/db.ts`).

### Migrating from the old JSON storage

Earlier versions stored everything as JSON files on a data volume
(`emails.json`, `settings.json`, `owners.json`, `subscriptions.json`) plus loose
attachment files. To import that data into Postgres, run the one-time migration
against the old data directory before switching over:

```
DATABASE_URL=postgres://user:pass@host:5432/mailbox DATA_DIR=./data \
  bun run migrate
```

It's safe to re-run: existing email rows are left untouched, while settings and
ownership are re-imported from the files.

### In the monorepo (external `infra` Postgres)

The `inbox` service in the root `compose.yml` joins the external `infra` network
and reads `DATABASE_URL` from the shared dotenvx `.env`, so it reaches the `db`
container by hostname. One-time setup:

```
# 1. Create the dedicated role + database (as a superuser):
docker exec -i db psql -U spawn-db -d spawn-db < mailbox/scripts/create-db.sql

# 2. Set DATABASE_URL in the root .env (see ../.env.example), re-encrypt.

# 3. Import the old JSON data from the mail-data volume into Postgres,
#    using the built image so it has both the volume and the network:
docker compose run --rm inbox dotenvx run -- bun run migrate

# 4. Bring the service up on Postgres:
docker compose up -d --build inbox
```

After the import verifies, the old JSON files on the `mail-data` volume are no
longer read (only `owners.json` remains as a seed fallback) and can be archived.