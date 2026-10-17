import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

/**
 * Transactional and private routes. These are excluded from crawling, but the
 * real protection is authorization — `/api/download/*` verifies a signed
 * token, and `/admin` verifies a session cookie. robots.txt is a hint, never
 * an access-control mechanism.
 *
 * Nothing here blocks script, style or image assets: crawlers need them to
 * render the page, and Google's guidance is explicit that blocking CSS or JS
 * is a mistake.
 */
const PRIVATE_ROUTES = ["/api/", "/checkout", "/order/", "/recover", "/admin"];

/**
 * AI assistants and answer engines that fetch a page on a user's behalf.
 * Being readable by them is the point of the AI-discoverability work, so they
 * are named explicitly rather than left to the wildcard.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Google-NotebookLM",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "DuckAssistBot",
  "meta-externalagent",
  "meta-externalfetcher",
];

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_ROUTES },
      { userAgent: AI_AGENTS, allow: "/", disallow: PRIVATE_ROUTES },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
