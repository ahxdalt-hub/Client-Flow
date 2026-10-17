import Link from "next/link";

import { ButtonLink } from "@/components/ui";
import type { Block } from "@/content/blog";

/**
 * Renders typed article blocks to semantic HTML. Everything here is server
 * rendered — no client JavaScript, no MDX — so the whole article is in the
 * initial HTML for crawlers and AI assistants.
 */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-page">
      {blocks.map((block, i) => (
        <BlockSwitch key={i} block={block} />
      ))}
    </div>
  );
}

function BlockSwitch({ block }: { block: Block }) {
  switch (block.kind) {
    case "h2":
      return <h2>{block.text}</h2>;

    case "h3":
      return <h3 className="mt-7 mb-2 text-[1.08rem] font-semibold text-ink">{block.text}</h3>;

    case "p":
      return <p>{block.text}</p>;

    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="my-3 ml-5 list-decimal space-y-1.5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );

    case "callout":
      return (
        <aside className="my-6 rounded-2xl border border-line bg-paper p-5">
          <p className="text-[0.95rem] font-semibold text-ink">{block.title}</p>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{block.text}</p>
        </aside>
      );

    case "template":
      return (
        <figure className="my-6">
          <figcaption className="eyebrow mb-3">{block.title}</figcaption>
          <pre className="overflow-x-auto rounded-2xl border border-line bg-paper p-5 font-mono text-[0.8rem] leading-relaxed text-ink whitespace-pre-wrap">
            {block.lines.join("\n")}
          </pre>
        </figure>
      );

    case "table":
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.9rem]">
            <thead>
              <tr className="border-b border-line-strong">
                {block.head.map((h) => (
                  <th key={h} scope="col" className="py-2.5 pr-4 font-semibold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-line align-top">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-3 pr-4 leading-relaxed text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "cta":
      return (
        <div className="my-8 rounded-[var(--radius-card)] border border-line bg-paper p-6">
          <p className="text-[0.95rem] leading-relaxed text-muted">{block.text}</p>
          <ButtonLink href={block.href} variant="primary" size="md" className="mt-4">
            {block.label}
          </ButtonLink>
        </div>
      );

    default:
      return null;
  }
}

/** Related-guide links rendered at the foot of an article. */
export function RelatedLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav aria-label="Related guides" className="mt-12 border-t border-line pt-8">
      <p className="eyebrow">Keep reading</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[0.95rem] text-accent underline underline-offset-2"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
