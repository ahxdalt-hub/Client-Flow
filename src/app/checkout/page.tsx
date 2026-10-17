import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutForm } from "./checkout-form";
import { Container } from "@/components/ui";
import { MODULES, INCLUDED_FILES, FILE_COUNT, SCRIPT_TOTAL } from "@/lib/product-content";

export const metadata: Metadata = {
  title: "Secure checkout",
  description:
    "Buy the ClientFlow Outreach Kit — ₹299 introductory price. UPI and cards via Razorpay, instant download.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="border-b border-line bg-ivory">
      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.82rem] text-muted">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">Checkout</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <CheckoutForm />

            {/* Order summary */}
            <aside aria-label="Order summary">
              <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-8">
                <p className="eyebrow">Order summary</p>
                <h2 className="mt-2 font-display text-[1.3rem] font-semibold text-ink">
                  ClientFlow Outreach Kit
                </h2>
                <p className="mt-1 text-[0.87rem] leading-relaxed text-muted">
                  {MODULES.length} modules · {FILE_COUNT} files · {SCRIPT_TOTAL} templates, scripts &amp;
                  proposals · free updates forever
                </p>

                <ul className="mt-5 space-y-1.5 text-[0.84rem] text-muted">
                  {MODULES.slice(0, 6).map((m) => (
                    <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-dashed border-line pb-1.5 last:border-0">
                      <span>
                        {m.index} · {m.title}
                      </span>
                      <span className="shrink-0 tabular-nums">{m.count}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
                  <span className="text-[0.9rem] font-semibold text-ink">Total due</span>
                  <span className="text-ink">
                    <span className="display text-[2rem] leading-none">₹299</span>
                    <s className="ml-2 text-[0.9rem] text-muted">₹499</s>
                  </span>
                </div>

                <details className="mt-4 text-[0.8rem] text-muted">
                  <summary className="cursor-pointer font-medium text-ink">
                    Exact files in the download
                  </summary>
                  <ul className="mt-2 space-y-1 border-t border-line pt-3 font-mono text-[0.72rem]">
                    {INCLUDED_FILES.map((f) => (
                      <li key={f.name}>{f.name}</li>
                    ))}
                  </ul>
                </details>

                <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-ivory px-4 py-3 text-center text-[0.75rem] text-muted">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Payments secured by Razorpay · card &amp; UPI data never touches our servers
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
}
