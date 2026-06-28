# Copyright (c) 2026 Clove Twilight
# Licensed under the ESAL-2.0 Licence.
# See LICENCE.md in the project root for full licence information.

FROM oven/bun:1-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install ALL dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN bun run build

# Remove devDependencies to reduce image size
RUN bun install --frozen-lockfile --production

# Copy web assets
COPY web ./web

# Create cdn directory
RUN mkdir -p cdn

# Expose port
EXPOSE 5080

# Run with dotenvx
CMD ["bunx", "dotenvx", "run", "--", "bun", "dist/server.js"]