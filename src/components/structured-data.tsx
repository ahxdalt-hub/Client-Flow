import { SITE } from "@/config/site";

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };

function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Site-level structured data. Built only from values already configured in
 * `@/config/site` — no invented names, URLs, or claims.
 */
export function SiteStructuredData() {
  const base = SITE.url.replace(/\/$/, "");

  const data: JsonLdValue = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE.name,
        url: `${base}/`,
        email: SITE.contactEmail,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SITE.contactEmail,
          availableLanguage: "en",
        },
      },
    ],
  };

  return <JsonLd data={data} />;
}

/**
 * FAQ schema for the homepage accordion. Mirrors the visible FAQ items
 * exactly — schema.org requires the structured data to match on-page text.
 */
export function FaqStructuredData({
  items,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  const data: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}
