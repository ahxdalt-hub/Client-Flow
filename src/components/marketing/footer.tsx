import Link from "next/link";

import { Logo } from "../logo";
import { FooterYear } from "./footer-year";
import { FooterScene } from "../art/footer-scene";
import { Grain } from "../art/ambient";
import { Container, Divider } from "../ui";
import { CONTACT } from "@/lib/config";

const COLUMNS: {
  title: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { href: "/#inside", label: "What's inside" },
      { href: "/sample", label: "Free sample" },
      { href: "/checkout", label: "Buy now" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/blog", label: "All guides" },
      {
        href: "/blog/how-to-find-clients-as-a-freelancer-in-india",
        label: "Finding clients in India",
      },
      {
        href: "/blog/cold-email-templates-for-freelancers",
        label: "Cold email templates",
      },
      {
        href: "/blog/how-to-follow-up-with-potential-clients",
        label: "Follow-up system",
      },
      {
        href: "/blog/freelance-lead-tracking-spreadsheet",
        label: "Lead tracking sheet",
      },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/support", label: "Open a support ticket" },
      { href: "/contact", label: "Contact" },
      { href: "/recover", label: "Recover a download" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-paper">
      <FooterScene />

      <Grain className="z-10" opacity={0.28} />

      <Container className="relative z-10 pt-16 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-muted">
              A practical client acquisition toolkit for India&apos;s freelancers
              and small studios. Built to be used, not admired.
            </p>
            <p className="mt-4 max-w-xs text-[0.8rem] leading-relaxed text-muted/80">
              ClientFlow is an independent digital product by Caelmont.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-[0.9rem] text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Divider className="mt-12 md:mt-14" />

        <div className="flex flex-col gap-5 py-7 text-[0.8rem] text-muted sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p>
              © <FooterYear /> {CONTACT.business}. All rights reserved.
            </p>
            <p className="mt-1.5 text-[0.7rem] text-muted/70">
              Photography via Unsplash.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
            <a
              href={`mailto:${CONTACT.email}`}
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Support: {CONTACT.email}
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              Back to top
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </a>
          </div>
        </div>
      </Container>

      {/* Oversized wordmark, faded into the page — the closing signature. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 select-none px-5 pb-12 pt-2 sm:px-8 lg:px-10"
      >
        <p className="display text-center text-[clamp(3rem,14vw,10rem)] leading-none tracking-[-0.02em] text-ink/[0.06]">
          ClientFlow
        </p>
      </div>
    </footer>
  );
}
