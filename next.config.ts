import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /**
   * Cache Components (PPR) hangs on the Cloudflare Workers runtime — Next.js
   * itself warns it cannot guarantee Cache Components there, and page renders
   * stall until workerd cancels them. Disabled so pages render on workerd;
   * the small in-isolate cache in src/lib/social-proof.ts replaces `"use cache"`.
   */
  cacheComponents: false,
  images: {
    /**
     * Next 16 restricts optimisation to an allow-list and defaults it to [75].
     * Kept so Image `quality` props stay valid, but optimisation is disabled:
     * Cloudflare Workers have no Node image optimiser, so the source images
     * (already correctly sized) are served as-is, rather than requiring
     * Cloudflare Images. See opennext.js.org/cloudflare/howtos/image.
     */
    qualities: [75, 90],
    unoptimized: true,
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
};

export default nextConfig;

// Makes Cloudflare bindings available to `next dev`; no-op in production builds.
initOpenNextCloudflareForDev();
