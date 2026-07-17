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
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

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

RUN bun i -g @dotenvx/dotenvx

EXPOSE 5002
CMD ["dotenvx", "run", "--", "bun", "server.js"]
