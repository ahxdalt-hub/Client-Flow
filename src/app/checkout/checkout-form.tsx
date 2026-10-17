"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";
import { PRICING } from "@/lib/pricing";

type Step = "form" | "starting" | "paying" | "verifying" | "error";

export function CheckoutForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);
  // One idempotency key per page visit: re-submits/retries reuse the same
  // Razorpay order instead of creating duplicate ones. The browser does NOT
  // decide price or success — the server computes both. Generated lazily at
  // submit time (an event, not render), stored per form instance.
  const idempotencyKey = useRef<string>("");

  function newIdempotencyKey(): string {
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
    return idempotencyKey.current;
  }

  /* Lazily inject the Razorpay Checkout script once, right before paying. */
  const loadScript = useCallback(() => {
    if (scriptLoaded.current) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );
      if (existing) {
        scriptLoaded.current = true;
        return resolve(true);
      }
      const el = document.createElement("script");
      el.src = "https://checkout.razorpay.com/v1/checkout.js";
      el.onload = () => {
        scriptLoaded.current = true;
        resolve(true);
      };
      el.onerror = () => resolve(false);
      document.body.appendChild(el);
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    setStep("starting");
    track("checkout_started");

    try {
      await loadScript();
      if (!window.Razorpay) {
        throw new Error(
          "The payment sheet couldn't load — check your connection and retry.",
        );
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, idempotencyKey: newIdempotencyKey() }),
      });
      const data = (await res.json()) as {
        error?: string;
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      };
      if (!res.ok || !data.razorpayOrderId || !data.keyId) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      setStep("paying");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount!,
        currency: data.currency!,
        name: "ClientFlow",
        description: "Outreach Kit — full toolkit download",
        order_id: data.razorpayOrderId,
        prefill: { name, email, ...(phone ? { contact: phone } : {}) },
        theme: { color: "#C0562F" },
        modal: { confirm_close: true, ondismiss: () => setStep("form") },
        handler: (response: RazorpaySuccess) => {
          setStep("verifying");
          void verify({
            ...response,
            email,
            name,
            orderId: data.razorpayOrderId!,
          });
        },
      });

      rzp.on("payment.failed", () => {
        play("error");
        setError(
          "Payment failed. Nothing has been charged twice — you can retry safely.",
        );
        setStep("form");
        track("payment_failed");
      });

      rzp.open();
    } catch (err) {
      play("error");
      setStep("form");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      track("checkout_error");
    }
  }

  async function verify(input: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    email: string;
    name: string;
    orderId: string;
  }) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: input.razorpay_order_id,
          razorpay_payment_id: input.razorpay_payment_id,
          razorpay_signature: input.razorpay_signature,
          email: input.email,
          name: input.name,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        downloadToken?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.downloadToken) {
        throw new Error(
          data.error ??
            "Payment received but verification failed — check your email for the download link, or contact support.",
        );
      }
      play("success");
      router.push(`/order/${input.orderId}?t=${data.downloadToken}`);
    } catch (err) {
      play("error");
      setStep("form");
      setError(err instanceof Error ? err.message : "Verification failed.");
      track("verify_failed");
    }
  }

  const busy = step === "starting" || step === "paying" || step === "verifying";

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="display text-[clamp(1.8rem,3.5vw,2.4rem)] text-ink">
        Almost in your folder.
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
        Enter your name and email — the download link is generated the moment
        your payment clears. {`Phone is optional, and we never email anyone
        other than order updates.`}
      </p>

      <div className="mt-8 space-y-5">
        <Field
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ananya Raman"
          required
        />
        <Field
          label="Email (for delivery)"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          required
        />
        <Field
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        className="mt-8 w-full"
        aria-busy={busy}
      >
        {step === "form" && <span>Pay ₹{PRICING.introActive ? PRICING.intro : PRICING.regular} securely</span>}
        {step === "starting" && <span>Preparing your order…</span>}
        {step === "paying" && <span>Complete the payment in the sheet…</span>}
        {step === "verifying" && <span>Verifying payment…</span>}
        {step === "error" && <span>Retry payment</span>}
      </Button>

      <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-muted">
        By paying you agree to our{" "}
        <a href="/terms" className="underline underline-offset-2 hover:text-ink">
          terms
        </a>{" "}
        and{" "}
        <a href="/refund-policy" className="underline underline-offset-2 hover:text-ink">
          refund policy
        </a>
        . VAT/GST invoice naming follows Razorpay receipt standards.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={`field-${name}`}
        className="mb-1.5 block text-[0.82rem] font-semibold text-ink"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        onFocus={() => play("click")}
        className="h-12 w-full rounded-xl border border-line-strong bg-paper px-4 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
