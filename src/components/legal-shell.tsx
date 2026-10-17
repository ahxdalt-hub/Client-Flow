import Link from "next/link";

import { Container, Divider } from "@/components/ui";
import { CONTACT } from "@/lib/pricing";

export const LEGAL_BASE_PATHS = [
  "/privacy",
  "/terms",
  "/refund-policy",
] as const;

export function LegalShell({
  title,
  updated,
  crumbs,
  children,
}: {
  title: string;
  updated: string;
  crumbs: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c.href}>
                <span className="mx-2" aria-hidden>
                  /
                </span>
                <span className="text-ink">{c.label}</span>
              </span>
            ))}
          </nav>

          <h1 className="display text-[clamp(2rem,4.5vw,3rem)] text-ink">{title}</h1>
          <p className="mt-3 text-[0.82rem] text-muted">Last updated: {updated}</p>
          <Divider className="my-8" />
          <div className="prose-page">{children}</div>

          <Divider className="my-10" />
          <p className="text-[0.84rem] text-muted">
            Questions about this document?{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-accent underline underline-offset-2"
            >
              {CONTACT.email}
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
