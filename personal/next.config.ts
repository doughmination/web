import type { NextConfig } from "next";

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
};

export default nextConfig;
