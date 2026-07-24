import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: {
    mode: "auto",
  },
});

// "standalone" makes Next emit .next/standalone/server.js — what the
// Dockerfile copies and runs.
const nextConfig: NextConfig = {
  output: "standalone",
};

export default withVanillaExtract(nextConfig);