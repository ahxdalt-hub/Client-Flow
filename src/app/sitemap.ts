import { SITE } from "@/config/site";

export default function sitemap(): import("next").MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
