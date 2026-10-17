"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/downloads", label: "Downloads" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/status", label: "Status" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Admin sections" className="lg:w-52 lg:shrink-0">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">ClientFlow</p>
          <p className="display text-[1.15rem] leading-none text-ink">Admin</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE" });
            router.refresh();
          }}
          className="text-[0.78rem] text-muted underline underline-offset-2 transition-colors hover:text-ink lg:hidden"
        >
          Sign out
        </button>
      </div>

      <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <li key={link.href} className="shrink-0 lg:shrink">
              <Link
                href={link.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex w-full items-center rounded-xl px-3.5 py-2 text-[0.85rem] font-medium transition-colors ${
                  active
                    ? "bg-ink text-ivory"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={async () => {
          await fetch("/api/admin/session", { method: "DELETE" });
          router.refresh();
        }}
        className="mt-6 hidden text-[0.8rem] text-muted underline underline-offset-2 transition-colors hover:text-ink lg:inline"
      >
        Sign out
      </button>
    </nav>
  );
}
