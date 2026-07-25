-- Create a dedicated Postgres role + database for the music app.
-- Run ONCE as a superuser against your existing Postgres server.
--
-- Example (server has the `db` container from ../postgres/compose.yml):
--   docker exec -i db psql -U spawn-db -d spawn-db < scripts/create-db.sql
--
-- Change the password below, then put it (URL-encoded) into MUSIC_DATABASE_URL.
-- No superuser rights are needed at runtime: gen_random_uuid() is built into
-- Postgres 13+ core, so the app role owns its own database and nothing more.

CREATE ROLE music WITH LOGIN PASSWORD 'change-me-strong';
CREATE DATABASE music OWNER music;
