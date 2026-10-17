import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    /**
     * Next 16 restricts optimisation to an allow-list and defaults it to
     * [75]. The FAQ backdrop ships at quality={90} so the smooth teal
     * gradient in the photograph doesn't band, so 90 has to be listed.
     */
    qualities: [75, 90],
  },
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
