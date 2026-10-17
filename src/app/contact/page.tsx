import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { CONTACT, REFUND_WINDOW_DAYS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Contact & support",
  description: "How to reach the ClientFlow team — support email and response times.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="border-b border-line">
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Support</p>
          <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3rem)] text-ink">
            A one-person business,
            <br />
            <span className="text-muted">with one-person service.</span>
          </h1>

          <div className="mt-10 space-y-4">
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Support — ClientFlow Outreach Kit")}`}
              className="card-lift block rounded-[var(--radius-card)] border border-line bg-paper p-6"
            >
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Email — the only channel we monitor
              </p>
              <p className="mt-1.5 text-[1.15rem] font-semibold text-accent">
                {CONTACT.email}
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                For download problems, refunds and licensing questions. Include
                your order ref (from the receipt email) when you have one — it
                makes replies faster.
              </p>
            </a>

            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Response time
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                Usually the same working day (IST), evenings and weekends
                included — we run lean and that shows up as responsiveness.
                Refund requests within the {REFUND_WINDOW_DAYS}-day window are
                always answered first.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted">
                Before you write
              </p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                Download link expired? Every purchase email contains a 30-day
                link — the text should still be in your inbox under
                &ldquo;Your ClientFlow Outreach Kit download is ready&rdquo;.
                We can always reissue it.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
