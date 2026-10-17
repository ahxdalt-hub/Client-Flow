import Link from "next/link";

import { Logo } from "../logo";
import { FooterYear } from "./footer-year";
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
      { href: "/#pricing", label: "Pricing" },
      { href: "/sample", label: "Free sample" },
      { href: "/checkout", label: "Buy now" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Support" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
      { href: "/sitemap.xml", label: "Sitemap" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-paper">
      {/* A whisper of warm light so the footer doesn't read as a hard slab. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(192,86,47,0.06),transparent_70%)]"
      />

      <Container className="relative py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-muted">
              A practical client acquisition toolkit for India&apos;s freelancers
              and small studios. Built to be used, not admired.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
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

        <Divider className="my-10" />

        <div className="flex flex-col gap-3 text-[0.8rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <FooterYear /> {CONTACT.business}. All rights reserved.
          </p>
          <p>
            Support:{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="underline underline-offset-2 hover:text-ink"
            >
              {CONTACT.email}
            </a>
          </p>
        </div>

        <p className="mt-3 text-[0.72rem] text-muted/70">
          Photography via Unsplash.
        </p>
      </Container>
    </footer>
  );
}
