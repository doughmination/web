-- Create a dedicated Postgres role + database for the mailbox app.
-- Run ONCE as a superuser against your existing Postgres server.
--
-- Example (server has the `db` container from ../postgres/compose.yml):
--   docker exec -i db psql -U spawn-db -d spawn-db < mailbox/scripts/create-db.sql
--
-- Change the password below, then put it (URL-encoded) into DATABASE_URL in the
-- shared root .env. Tables are created automatically on boot by initDb().

CREATE ROLE mailbox WITH LOGIN PASSWORD 'change-me-strong';
CREATE DATABASE mailbox OWNER mailbox;
