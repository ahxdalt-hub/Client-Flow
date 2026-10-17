import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/order/", "/recover", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
