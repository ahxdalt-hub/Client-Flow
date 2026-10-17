import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /**
   * The paid deliverable zip lives outside /public and is only served
   * through the verified /api/download route. This makes sure the file
   * is bundled with the handler on serverless deployments.
   */
  outputFileTracingIncludes: {
    "/api/download/**": ["./assets/deliverables/**"],
  },
};

export default nextConfig;
