# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-2.0 Licence.
# See LICENCE.md in the project root for full licence information.

FROM oven/bun:1-slim AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source and build
COPY . .
RUN bun run build


FROM oven/bun:1-slim AS runtime

# Install curl for healthcheck, and `serve` for static hosting
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
RUN bun add -g serve

WORKDIR /app

# Only the built static assets are needed at runtime - no node_modules,
# no source, no devDependencies.
COPY --from=build /app/dist ./dist

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/ || exit 1

# -s = SPA mode (rewrites unknown routes to index.html, same as the
# try_files fallback React Router needs for client-side routing)
CMD ["serve", "-s", "dist", "-l", "5001"]