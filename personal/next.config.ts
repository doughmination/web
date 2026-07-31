/* personal/next.config.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";

/* Compiles .css.ts files to static CSS at build time — zero runtime. The plugin
 * only wires up Turbopack when explicitly opted in; `mode: "auto"` enables it on
 * Next >= 16 (and falls back to webpack below that), so `dev`/`build` run under
 * Turbopack while `dev:webpack` stays available as an escape hatch. */
const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: {
    mode: "auto",
  },
});

const nextConfig: NextConfig = {
  /* Emit a self-contained production server (.next/standalone) so the Docker
   * runtime image only needs the built app — no full node_modules. */
  output: "standalone",

  /* React Strict Mode double-invokes effects in development to surface impure
   * effects. Our ported page scripts (guilds.js, discord.js, selfies.js, …) are
   * imperative and append into their mount once per run, so the double-invoke
   * renders everything twice in dev (production mounts once and is unaffected).
   * Disable it for the vanilla-script baseline; re-enable once those scripts are
   * reimplemented as idempotent React components in the CSS-Modules phase. */
  reactStrictMode: false,

  /* Let the dev server trust this machine's LAN origin so hydration + HMR
   * assets (/_next/*) load when the app is opened from another device on the
   * network (e.g. http://192.168.0.121:3000). localhost is trusted by default;
   * without this, client hydration is blocked over the IP and effect-injected
   * page scripts (PageScripts -> /js/*.js) never run. */
  allowedDevOrigins: ["192.168.0.121"],
};

export default withVanillaExtract(nextConfig);
