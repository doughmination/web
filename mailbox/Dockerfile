# mailbox/Dockerfile
# Copyright (c) 2026 Clove Nytrix Doughmination Twilight
# Licensed under the DASL-1.0 Licence.
# See LICENCE.md in the project root for full licence information.
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

RUN bun install -g @dotenvx/dotenvx

ENV NODE_ENV=production
EXPOSE 4040

CMD ["dotenvx", "run", "--", "bun", "run", "server.ts"]