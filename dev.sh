#!/bin/bash

# `bun install` honours package.json + bun.lock exactly — it will NOT float
# caret-ranged deps to newer versions. `bun update` was removed on purpose: it
# re-resolved everything to "latest" on every launch, which is how `info` kept
# jumping onto Next 16.2.11 and breaking the vanilla-extract Turbopack plugin.
# If you ever genuinely want to bump versions, run `bun update` by hand.

(
  cd personal
  bun install
  PORT=3000 bun dev
) &

(
  cd system
  bun install
  PORT=3001 bun dev
) &

(
  cd info
  bun install
  PORT=3002 bun dev
) &

(
  cd blog
  bun install
  PORT=3003 bun dev
) &

wait
