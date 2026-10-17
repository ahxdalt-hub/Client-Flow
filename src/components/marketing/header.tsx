"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "../logo";
import { SoundToggle } from "./sound-toggle";
import { ButtonLink, Container } from "../ui";
import { ScrollProgress, useScrolledPast } from "../motion";

const NAV = [
  { href: "/#inside", label: "What's inside" },
  { href: "/sample", label: "Free sample" },
  { href: "/contact", label: "Support" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(10);

  // Lock scroll while the mobile menu is open (external system sync)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={
        "sticky top-0 z-40 border-b border-line backdrop-blur-md transition-[background-color,box-shadow] duration-500 " +
        (scrolled
          ? "bg-ivory/80 shadow-[0_1px_0_rgba(20,17,14,0.03),0_14px_34px_-24px_rgba(20,17,14,0.4)]"
          : "bg-ivory/55")
      }
    >
      <Container>
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link href="/" aria-label="ClientFlow home">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="rounded-full px-4 py-2 text-[0.88rem] font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <SoundToggle />
            <ButtonLink href="/checkout" variant="primary" size="sm" className="hidden sm:inline-flex">
              Get the kit — ₹299
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center rounded-full border border-line lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {open ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h12" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Reading progress — sits on the header's bottom edge */}
      <ScrollProgress className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />

      {/* Mobile nav */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="fixed inset-x-0 top-[4.25rem] z-30 h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-line bg-ivory lg:hidden"
        >
          <Container className="py-6">
            <ul className="flex flex-col gap-1">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="animate-fade-up block rounded-xl px-3 py-3 text-lg font-medium hover:bg-paper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink href="/checkout" variant="primary" size="lg" className="w-full">
                Get the kit — ₹299
              </ButtonLink>
              <ButtonLink href="/sample" variant="ghost" size="md" className="w-full">
                Try the free sample first
              </ButtonLink>
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
