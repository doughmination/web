# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-2.0 Licence.
# See LICENCE.md in the project root for full licence information.

FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm run build


FROM node:20-slim AS runtime

ENV NODE_ENV=production \
    PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

# Install OS-level deps needed by sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY --from=build /app/dist ./dist

# Copy static files
COPY static/ ./static/

# Create necessary directories
RUN mkdir -p dough-data && chmod 755 dough-data

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:5000/api/system').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

# Run application
CMD ["pnpm", "dotenvx", "run", "--debug", "--", "node", "dist/main.js"]