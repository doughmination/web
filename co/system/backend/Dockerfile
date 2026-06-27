# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-2.0 Licence.
# See LICENCE.md in the project root for full licence information.

FROM node:24-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME/bin"

RUN npm i -g pnpm@latest

# Build tools needed to compile native modules (better-sqlite3, bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm run build

# Trim devDependencies out of node_modules, keep only what's needed at runtime
RUN pnpm prune --prod


FROM node:24-slim AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME/bin"

RUN npm i -g pnpm@latest

# Install OS-level deps needed by sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files (kept for metadata / scripts referencing package.json)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy already-installed, pruned production node_modules from build stage
# (avoids recompiling native modules like better-sqlite3/bcrypt here)
COPY --from=build /app/node_modules ./node_modules

# Copy built output
COPY --from=build /app/dist ./dist

# Copy static files
COPY static/ ./static/

# Create necessary directories
RUN mkdir -p dough-data && chmod 755 dough-data
RUN chmod 755 static

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:5000/api/system').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

# Run application
CMD ["pnpm", "dotenvx", "run", "--debug", "--", "node", "dist/main.js"]