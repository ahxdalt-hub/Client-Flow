import type { Metadata } from "next";

import { Container } from "@/components/ui";
import { RecoverForm } from "./recover-form";

export const metadata: Metadata = {
  title: "Recover your download link",
  description:
    "Lost your ClientFlow download link? Paste the Razorpay order or payment id from your payment receipt and we'll reissue it.",
  robots: { index: false },
};

export default function RecoverPage() {
  return (
    <div className="border-b border-line">
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Download recovery</p>
          <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3rem)] text-ink">
            Find your download link
            <br />
            <span className="text-muted">if the tab closed on you.</span>
          </h1>
          <p className="mt-6 text-[1rem] leading-relaxed text-muted">
            Your link lives in the URL you saw after paying. If you lost it,
            paste the order or payment id from your Razorpay payment receipt
            (it starts with <span className="font-mono">order_</span> or{" "}
            <span className="font-mono">pay_</span>) and we&apos;ll issue a
            fresh link for the same purchase.
          </p>

          <div className="mt-8">
            <RecoverForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
