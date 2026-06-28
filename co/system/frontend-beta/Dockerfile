# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-2.0 Licence.
# See LICENCE.md in the project root for full licence information.

FROM node:24-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME/bin"

RUN npm i -g pnpm@latest

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source and build
COPY . .
RUN pnpm run build


FROM node:24-slim AS runtime

# Install curl for healthcheck, and `serve` for static hosting
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm i -g serve

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