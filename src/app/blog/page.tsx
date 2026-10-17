import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui";
import { ARTICLES } from "@/content/blog";
import { breadcrumbJsonLd, absolute, jsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Freelance outreach guides",
  description:
    "Practical guides on cold email, follow-ups, proposals and lead tracking for freelancers in India — written for people with no audience and no warm intros.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Freelance outreach guides",
    description:
      "Practical guides on cold email, follow-ups, proposals and lead tracking for freelancers in India.",
    url: absolute("/blog"),
  },
};

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/blog" },
];

export default function BlogIndexPage() {
  return (
    <div className="border-b border-line">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(TRAIL)) }}
      />
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">Guides</span>
          </nav>

          <p className="eyebrow">Guides</p>
          <h1 className="display mt-4 text-[clamp(2.1rem,4.6vw,3.1rem)] text-ink">
            Client outreach, explained without the fluff.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-muted">
            Five guides on the parts of freelancing nobody teaches you: writing a
            first email someone answers, following up without chasing, quoting so
            scope stays fixed, and keeping a pipeline you can actually see. No
            signup, no gated PDFs.
          </p>

          <ul className="mt-12 space-y-4">
            {ARTICLES.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="card-lift block rounded-[var(--radius-card)] border border-line bg-paper p-6"
                >
                  <p className="eyebrow !text-[0.62rem]">
                    {article.readingTime} · {article.audience}
                  </p>
                  <h2 className="display mt-2 text-[1.3rem] text-ink">
                    {article.h1}
                  </h2>
                  <p className="mt-2.5 text-[0.92rem] leading-relaxed text-muted">
                    {article.summary}
                  </p>
                  <p className="mt-4 text-[0.85rem] font-semibold text-accent">
                    Read the guide →
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-[var(--radius-card)] border border-line bg-paper p-7">
            <p className="eyebrow">The product behind the guides</p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
              ClientFlow is a ₹299 downloadable toolkit — 20 cold email templates,
              10 WhatsApp and LinkedIn scripts, a four-step follow-up system, four
              editable proposals and a lead tracker, plus a 66-page handbook. One
              template is free to read first.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/sample"
                className="text-[0.92rem] font-semibold text-accent underline underline-offset-2"
              >
                Download the free sample
              </Link>
              <Link
                href="/"
                className="text-[0.92rem] font-semibold text-accent underline underline-offset-2"
              >
                See what&apos;s inside the kit
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
