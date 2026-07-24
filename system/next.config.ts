/* Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

/* Compiles .css.ts files to static CSS at build time — zero runtime. The plugin
 * only wires up Turbopack when explicitly opted in; `mode: "auto"` enables it on
 * Next >= 16 and falls back to webpack below that. */
const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: {
    mode: "auto",
  },
});

const nextConfig: NextConfig = {
  /* Emit a self-contained production server (.next/standalone) so the Docker
   * runtime image only needs the built app — no full node_modules. */
  output: "standalone",

  // Allows overriding the build output dir (e.g. in sandboxed CI environments)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default withVanillaExtract(nextConfig);
