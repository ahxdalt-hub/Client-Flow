import Link from "next/link";

import { SoundToggle } from "@/components/sound-toggle";
import { Logo } from "@/components/logo";
import { SITE } from "@/config/site";

export function SiteFooter() {
  const year = 2026;

  return (
    <footer className="border-t border-line bg-paper-sunken/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:gap-12 md:py-16">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted">
            {SITE.tagline} A digital research pack by {SITE.owner}.
          </p>
          <p className="text-sm">
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
            >
              {SITE.contactEmail}
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="eyebrow">Explore</h2>
          <ul className="space-y-2.5">
            {[
              { label: "Product", href: "/#included" },
              { label: "Sample", href: "/sample" },
              { label: "FAQ", href: "/#faq" },
              { label: "Pricing", href: "/#pricing" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal" className="space-y-3">
          <h2 className="eyebrow">Legal & support</h2>
          <ul className="space-y-2.5">
            {SITE.legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-soft transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.owner}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>Digital product · One-time payment · Not a subscription</p>
            <SoundToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
