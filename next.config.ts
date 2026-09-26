import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone with a minimal server.js — no full node_modules
  // needs to be shipped/installed on the VPS, just this folder + .next/static + public.
  output: "standalone",
};

export default nextConfig;
