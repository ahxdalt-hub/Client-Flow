"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CTA, SITE } from "@/config/site";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="relative block h-3.5 w-5"
    >
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-5 rounded-full bg-ink transition-transform duration-300",
          open ? "top-1.5 rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1.5 block h-[1.5px] w-5 rounded-full bg-ink transition-all duration-200",
          open ? "scale-x-0 opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-5 rounded-full bg-ink transition-transform duration-300",
          open ? "top-1.5 -rotate-45" : "top-3",
        )}
      />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${SITE.name} home`}
          onClick={() => sound.click()}
        >
          <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="text-[17px] font-semibold tracking-tight">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {SITE.nav.map((item) => {
            const basePath = item.href.split("#")[0]!;
            const active =
              basePath !== "/" && pathname.startsWith(basePath);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-paper-sunken hover:text-ink",
                  active ? "text-accent" : "text-ink-soft",
                )}
                onClick={() => sound.tick()}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <PurchaseCta label={CTA.primary.shortLabel} />
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 text-sm font-medium text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => {
            if (open) {
              sound.close();
            } else {
              sound.open();
            }
            setOpen((value) => !value);
          }}
        >
          <MenuIcon open={open} />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <div
        id="mobile-nav"
        ref={panelRef}
        data-open={open}
        inert={!open}
        className="acc-grid border-t border-line bg-paper/95 backdrop-blur-md md:hidden"
      >
        <div className="acc-inner">
          <nav
            aria-label="Mobile"
            className="container-page flex flex-col gap-1 py-4"
          >
            {SITE.nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
                style={{
                  animation: open
                    ? `rise-in 0.4s ${0.05 * (index + 1)}s var(--ease-out-soft) both`
                    : undefined,
                }}
                onClick={() => {
                  sound.tick();
                  setOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-line pt-4">
              <PurchaseCta
                label={CTA.primary.shortLabel}
                block
                onClose={() => setOpen(false)}
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function PurchaseCta({
  label,
  block = false,
  onClose,
}: {
  label: string;
  block?: boolean;
  onClose?: () => void;
}) {
  return (
    <Link
      href="/#pricing"
      onClick={() => {
        sound.click();
        onClose?.();
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-[0_1px_2px_rgb(25_23_19/0.18)] transition-colors duration-300 hover:bg-ink-soft active:translate-y-px",
        block && "w-full py-3 text-[15px]",
      )}
    >
      {label}
    </Link>
  );
}
