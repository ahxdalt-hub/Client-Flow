import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui";
import { ArticleBody, RelatedLinks } from "@/components/blog/article-body";
import { ARTICLES, getArticle } from "@/content/blog";
import { absolute, articleJsonLd, breadcrumbJsonLd, jsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const path = `/blog/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: absolute(path),
      publishedTime: article.published,
      modifiedTime: article.updated,
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
    { name: article.h1, path: `/blog/${article.slug}` },
  ];

  const related = article.related
    .map((s) => getArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({ href: `/blog/${a.slug}`, label: a.h1 }));

  return (
    <div className="border-b border-line">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(trail)) }}
      />
      <Container className="py-16 md:py-24">
        <article className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <Link href="/blog" className="hover:text-ink">
              Guides
            </Link>
          </nav>

          <p className="eyebrow">{article.audience}</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">
            {article.h1}
          </h1>

          <p className="mt-5 text-[0.82rem] text-muted">
            By ClientFlow · Published{" "}
            <time dateTime={article.published}>{formatDate(article.published)}</time>
            {article.updated !== article.published ? (
              <>
                {" "}
                · Last updated{" "}
                <time dateTime={article.updated}>{formatDate(article.updated)}</time>
              </>
            ) : null}{" "}
            · {article.readingTime}
          </p>

          <p className="mt-6 border-l-2 border-line-strong pl-5 text-[1.05rem] leading-relaxed text-ink/80">
            {article.summary}
          </p>

          <div className="mt-10">
            <ArticleBody blocks={article.body} />
          </div>

          <RelatedLinks links={related} />

          <div className="mt-12 border-t border-line pt-8">
            <p className="text-[0.85rem] text-muted">
              Written by the team behind ClientFlow — a ₹299 downloadable
              toolkit for Indian freelancers. Updated{" "}
              <time dateTime={article.updated}>{formatDate(article.updated)}</time>.
            </p>
          </div>
        </article>
      </Container>
    </div>
  );
}
