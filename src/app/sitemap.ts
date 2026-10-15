import { SITE } from "@/config/site";

const LAST_MODIFIED = "2026-10-14";

export default function sitemap(): import("next").MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  // /success is excluded on purpose: it is a post-purchase page, disallowed
  // in robots.txt and marked noindex.
  const routes = ["", "/sample", "/privacy", "/terms", "/refunds", "/contact"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(LAST_MODIFIED),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/sample" ? 0.8 : 0.4,
  }));
}
