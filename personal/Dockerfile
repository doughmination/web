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

# Run as the non-root user that ships with the bun image, and install dotenvx
# into a bun-writable global dir. The image's default global bin is a root-owned
# system path, so a `USER bun` install fails with EACCES — point BUN_INSTALL at
# the bun user's own home instead, and put its bin on PATH so the CMD resolves.
USER bun
ENV BUN_INSTALL=/home/bun/.bun
RUN bun i -g @dotenvx/dotenvx
ENV PATH="/home/bun/.bun/bin:${PATH}"

EXPOSE 5002
CMD ["dotenvx", "run", "--", "bun", "server.js"]
