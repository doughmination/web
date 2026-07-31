/* blog/next.config.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

/* Compiles .css.ts files to static CSS at build time — zero runtime. `mode:
 * "auto"` enables the Turbopack integration on Next >= 16 (and falls back to
 * webpack below that), so `dev`/`build` run under Turbopack while `dev:webpack`
 * stays available as an escape hatch. */
const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: {
    mode: "auto",
  },
});

const nextConfig: NextConfig = {
  /* Emit a self-contained production server (.next/standalone) so the Docker
   * runtime image only needs the built app — no full node_modules. */
  output: "standalone",

  reactStrictMode: true,
};

export default withVanillaExtract(nextConfig);
