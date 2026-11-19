import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Let other devices on my home Wi-Fi (e.g. my phone) use the dev server.
  allowedDevOrigins: ["192.168.1.*"],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
