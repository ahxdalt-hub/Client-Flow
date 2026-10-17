import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers config.
 *
 * No incremental-cache override yet: the storefront's pages are mostly static
 * and the per-request data (order status, admin) opts out of caching anyway.
 * Add an R2 incremental cache later if ISR/cache hit rates matter.
 */
export default defineCloudflareConfig();
