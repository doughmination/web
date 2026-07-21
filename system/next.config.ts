/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

const withVanillaExtract = createVanillaExtractPlugin();

const nextConfig: NextConfig = {
  /* Emit a self-contained production server (.next/standalone) so the Docker
   * runtime image only needs the built app — no full node_modules. */
  output: "standalone",

  // Allows overriding the build output dir (e.g. in sandboxed CI environments)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default withVanillaExtract(nextConfig);
