FROM oven/bun:1-slim AS build

# Build tools for native modules (better-sqlite3, bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY tsconfig.json ./
COPY src/ ./src/
RUN bun run build

# Bun doesn't need a separate prod-prune step the way pnpm does,
# but you can still strip devDependencies if desired:
RUN bun install


FROM oven/bun:1-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY static/ ./static/

RUN mkdir -p dough-data && chmod 755 dough-data
RUN chmod 755 static

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:5000/api/system').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

CMD ["bunx", "dotenvx", "run", "--", "bun", "dist/main.js"]