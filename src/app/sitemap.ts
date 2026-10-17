import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";
import { ARTICLES } from "@/content/blog";

const base = SITE.url.replace(/\/$/, "");

/**
 * Indexable pages only.
 *
 * Deliberately excluded: /checkout, /order/*, /recover and /admin — all
 * transactional or private, and all served with `noindex` (see their route
 * metadata). Query-parameter variants are never listed.
 *
 * `lastModified` is set by hand and only moved when the page's content
 * genuinely changes. A sitemap that regenerates its own timestamps on every
 * request teaches crawlers to ignore the field.
 */
const PAGES: {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", lastModified: "2026-10-17", changeFrequency: "weekly", priority: 1 },
  { path: "/sample", lastModified: "2026-10-17", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", lastModified: "2026-10-17", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", lastModified: "2026-10-17", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", lastModified: "2026-10-17", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", lastModified: "2026-10-17", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", lastModified: "2026-10-17", changeFrequency: "yearly", priority: 0.3 },
  { path: "/refund-policy", lastModified: "2026-10-17", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PAGES.map((page) => ({
    url: `${base}${page.path === "/" ? "/" : page.path}`,
    lastModified: new Date(`${page.lastModified}T00:00:00.000Z`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const articles = ARTICLES.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: new Date(`${article.updated}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
