"use client";

import { Button, Container } from "@/components/ui";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";
import { CONTACT } from "@/lib/pricing";

type Status = "ready" | "pending" | "invalid";

export function OrderSuccess({
  orderId,
  token,
  status,
}: {
  orderId: string;
  token: string;
  status: Status;
}) {
  if (status === "invalid") {
    return (
      <Shell>
        <h1 className="display text-[clamp(1.8rem,3.5vw,2.3rem)] text-ink">
          That link doesn&apos;t work.
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
          Download links are tied to your order and expire after 30 days. If
          you just paid and landed here wrongly, check your email — the
          current link is in the receipt. Not arrived? Check spam, then still
          stuck? Talk to us:
        </p>
        <a
          href={`mailto:${CONTACT.email}?subject=Download link problem (order ${orderId})`}
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-[0.9rem] font-semibold text-ivory btn"
        >
          Email support
        </a>
      </Shell>
    );
  }

  if (status === "pending") {
    return (
      <Shell>
        <Tag tone="amber">Payment still confirming</Tag>
        <h1 className="display mt-5 text-[clamp(1.8rem,3.5vw,2.3rem)] text-ink">
          Almost there — confirming your payment.
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
          Razorpay has your payment and our records are catching up — usually
          a matter of seconds. Refresh this page in a moment. If it stays
          stuck for more than a minute, the receipt email is on its way
          anyway: it contains your permanent download link.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Tag tone="green">Payment received</Tag>
      <h1 className="display mt-5 text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
        Welcome aboard.
        <br />
        <span className="text-muted">Everything&apos;s in one folder.</span>
      </h1>
      <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted">
        Open <strong className="text-ink">README.md</strong> first —
        it turns the folder into a 7-day plan. The same link is in your
        inbox, and stays valid for 30 days.
      </p>

      <a
        href={`/api/download/${orderId}?t=${token}`}
        download
        data-sound="off"
        onClick={() => {
          play("success");
          track("kit_downloaded", { orderId });
        }}
        className="btn btn-primary mt-8 inline-flex h-[3.25rem] items-center gap-2.5 rounded-full px-8 text-[1rem] font-semibold"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
        </svg>
        Download the kit (.zip)
      </a>

      <p className="mt-4 text-[0.78rem] text-muted">
        Order ref: <span className="font-mono">{orderId}</span> ·{" "}
        <a
          href={`mailto:${CONTACT.email}?subject=Resend download link (${orderId})`}
          className="underline underline-offset-2 hover:text-ink"
        >
          lost the link?
        </a>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">{children}</div>
    </Container>
  );
}

function Tag({ tone, children }: { tone: "green" | "amber"; children: React.ReactNode }) {
  return (
    <span
      className={
        tone === "green"
          ? "inline-flex items-center gap-2 rounded-full bg-accent-tint px-4 py-1.5 text-[0.78rem] font-semibold text-accent"
          : "inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-[0.78rem] font-semibold text-amber-700"
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone === "green" ? "bg-accent" : "bg-amber-500"}`} />
      {children}
    </span>
  );
}
