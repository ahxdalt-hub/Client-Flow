import { SITE } from "@/config/site";

export default function robots(): import("next").MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/success"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
