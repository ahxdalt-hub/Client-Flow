import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/order/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
