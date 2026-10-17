import { SITE } from "@/config/site";
import { CONTACT, PRODUCT } from "./pricing";
import { FILE_COUNT, HANDBOOK_PAGES } from "./product-content";
import type { Article } from "@/content/blog";

/**
 * JSON-LD builders.
 *
 * Rules followed here on purpose:
 *  - every node describes something a visitor can actually see on the page;
 *  - no `aggregateRating`, no `review`, no invented counts or credentials;
 *  - no FAQPage markup outside the page that genuinely renders the answers.
 */

export const absolute = (path: string) =>
  `${SITE.url.replace(/\/$/, "")}${path === "/" ? "" : path}`;

/**
 * Serialises JSON-LD for a `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` does not escape `<`, so a payload containing `</script>`
 * would end the tag early. Next's own JSON-LD guide recommends replacing `<`
 * with its unicode escape — no parser reads the difference.
 */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const ORG_ID = `${absolute("/")}/#organization`;
const SITE_ID = `${absolute("/")}/#website`;

const PRODUCT_SUMMARY = `${PRODUCT.name} is a downloadable outreach toolkit for Indian freelancers and small agencies: 20 cold email templates, 10 WhatsApp and LinkedIn scripts, a four-step follow-up system, four editable proposals, a lead tracker and a ${HANDBOOK_PAGES}-page handbook across ${FILE_COUNT} files. One-time payment, no subscription.`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "ClientFlow",
    url: absolute("/"),
    logo: absolute("/logo.png"),
    description: PRODUCT_SUMMARY,
    email: CONTACT.email,
    // The relationship stated on the page footer, in machine-readable form.
    parentOrganization: { "@type": "Organization", name: "Caelmont" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT.email,
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: absolute("/"),
    name: "ClientFlow",
    inLanguage: "en-IN",
    description:
      "Outreach templates, follow-up scripts, proposals and a lead tracker for freelancers and small agencies in India.",
    publisher: { "@id": ORG_ID },
  };
}

/** BreadcrumbList for a page that renders the same trail visually. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** BlogPosting for a published guide. */
export function articleJsonLd(article: Article) {
  const path = `/blog/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absolute(path)}#article`,
    headline: article.h1,
    description: article.description,
    url: absolute(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
    datePublished: article.published,
    dateModified: article.updated,
    inLanguage: "en-IN",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    about: article.audience,
  };
}
