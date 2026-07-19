# syntax=docker/dockerfile:1

# ============================================================
# Dockerfile for the c.stupid.cat rewrite (Next.js + Bun).
# Multi-stage build → lean standalone runtime, served on :5002.
#   docker build -t c-stupid-cat .
#   docker run -p 5002:5002 c-stupid-cat
# ============================================================

FROM oven/bun:1 AS base
WORKDIR /app

# ---- Dependencies (cached unless package.json / bun.lock change) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Build ----
# Node, not Bun, and deliberately so. Vanilla Extract's webpack loader calls
# setAdapter() on @vanilla-extract/css before evaluating each .css.ts file. That
# package ships separate ESM and CJS builds of its ./adapter subpath; Bun
# resolves the ESM condition where the loader took CJS, so the adapter is set on
# one module instance and read from another — the build then dies with
# "Cannot destructure property 'setAdapter' from null or undefined".
#
# The oven/bun image has no Node binary, so `bun run build` had no choice but to
# execute next under Bun. Building on a Node image avoids the dual-package
# hazard entirely. Dependencies are still installed by Bun (bun.lock stays the
# source of truth) — Node reads that node_modules tree fine.
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Next's standalone server reads PORT / HOSTNAME from the environment.
ENV PORT=5002
ENV HOSTNAME=0.0.0.0

# Standalone output: server.js + only the deps it needs, plus static assets.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER bun

EXPOSE 5002
CMD ["bun", "server.js"]
