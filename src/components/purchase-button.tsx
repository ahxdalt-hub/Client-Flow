"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { PRODUCT, SITE } from "@/config/site";
import { trackConversion } from "@/lib/analytics";
import { getCheckout } from "@/lib/checkout";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type PurchaseButtonProps = {
  label?: string;
  size?: "md" | "lg";
  block?: boolean;
  className?: string;
};

type Phase =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "payment_failed" }
  | { kind: "dismissed" }
  | { kind: "error"; message: string };

type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let checkoutScriptPromise: Promise<void> | null = null;

function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout requires a browser environment."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutScriptPromise = null;
      reject(new Error("The payment widget could not be loaded."));
    };
    document.body.appendChild(script);
  });

  return checkoutScriptPromise;
}

export function PurchaseButton({
  label = "Get the Research Pack — ₹199",
  size = "md",
  block = false,
  className,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const busyRef = useRef(false);
  const checkout = getCheckout();

  const baseClasses = cn(
    "shimmer-btn group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-ink font-semibold text-paper",
    "shadow-[0_1px_2px_rgb(25_23_19/0.18)]",
    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:bg-ink-soft hover:shadow-[0_2px_6px_rgb(25_23_19/0.22)]",
    "active:translate-y-px active:scale-[0.99]",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "md" ? "px-5 py-3 text-[15px]" : "px-7 py-4 text-base",
    block && "w-full",
    className,
  );

  const inner = (
    <>
      <span>
        {phase.kind === "creating" ? "Opening secure checkout…" : label}
      </span>
      <span
        aria-hidden
        className="inline-flex transition-transform duration-300 group-hover:translate-x-1"
      >
        <ArrowIcon />
      </span>
    </>
  );

  const startCheckout = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase({ kind: "creating" });
    trackConversion("checkout_started");

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = (await response.json().catch(() => null)) as
        | {
            state?: string;
            keyId?: string;
            orderId?: string;
            amount?: number;
            currency?: string;
            name?: string;
            description?: string;
            message?: string;
          }
        | null;

      if (!response.ok || !data || data.state !== "ok" || !data.orderId) {
        trackConversion("checkout_failed", {
          reason: data?.state ?? `http_${response.status}`,
        });
        setPhase({
          kind: "error",
          message:
            data?.message ??
            "Checkout could not be started right now. You have not been charged.",
        });
        return;
      }

      await loadRazorpayCheckoutScript();
      if (!window.Razorpay) {
        throw new Error("The payment widget could not be loaded.");
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: SITE.name,
        description: data.description ?? PRODUCT.name,
        // No prefill: we do not collect customer data we do not need.
        prefill: {},
        notes: { product_id: PRODUCT.id },
        theme: { color: "#191713" },
        handler: (response: RazorpayCheckoutResponse) => {
          trackConversion("checkout_opened", { result: "redirecting" });
          // The client never confirms the payment itself — /success verifies
          // the payment against Razorpay's API before releasing anything.
          router.push(
            `/success?payment_id=${encodeURIComponent(response.razorpay_payment_id)}`,
          );
        },
        modal: {
          ondismiss: () => {
            trackConversion("checkout_dismissed");
            sound.close();
            setPhase({ kind: "dismissed" });
            busyRef.current = false;
          },
        },
      });

      razorpay.on("payment.failed", () => {
        trackConversion("payment_failed", { surface: "checkout_modal" });
        sound.close();
        setPhase({ kind: "payment_failed" });
        busyRef.current = false;
      });

      setPhase({ kind: "idle" });
      razorpay.open();
    } catch (error) {
      console.error("[checkout] failed to open:", error);
      trackConversion("checkout_failed", { reason: "client_error" });
      setPhase({
        kind: "error",
        message:
          error instanceof Error && error.message
            ? `${error.message} You have not been charged.`
            : "Checkout could not be started. You have not been charged.",
      });
    } finally {
      if (busyRef.current) busyRef.current = false;
    }
  }, [router]);

  if (checkout.status === "ready") {
    return (
      <div className={cn(block && "w-full")}>
        <button
          type="button"
          className={baseClasses}
          disabled={phase.kind === "creating"}
          onPointerEnter={() => sound.tick()}
          onClick={() => {
            sound.confirm();
            void startCheckout();
          }}
        >
          {inner}
        </button>

        {phase.kind === "payment_failed" && (
          <div
            role="alert"
            className="card-soft mt-3 rounded-xl border border-warning-line bg-warning-soft p-4 text-sm leading-relaxed"
          >
            <p className="font-semibold text-warning-ink">
              Payment failed — you have not been charged.
            </p>
            <p className="mt-1.5 text-warning-ink/90">
              The bank or wallet declined the payment. You can try again, or
              use a different payment method in the checkout window.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startCheckout()}
                className="inline-flex items-center rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-paper transition-colors hover:bg-ink-soft"
              >
                Try again
              </button>
              <Link
                href="/contact"
                onClick={() => sound.tick()}
                className="inline-flex items-center rounded-lg px-3.5 py-2 text-[13px] font-medium text-warning-ink/80 transition-colors hover:text-warning-ink"
              >
                Contact support
              </Link>
            </div>
          </div>
        )}

        {phase.kind === "dismissed" && (
          <div
            role="status"
            className="mt-3 rounded-xl border border-line bg-paper-raised p-4 text-sm leading-relaxed text-ink-soft"
          >
            <p className="font-semibold text-ink">Checkout closed.</p>
            <p className="mt-1.5">
              No payment was made. You can reopen checkout whenever you&apos;re
              ready.
            </p>
            <button
              type="button"
              onClick={() => void startCheckout()}
              className="mt-3 inline-flex items-center rounded-lg border border-line-strong bg-paper px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
            >
              Open checkout again
            </button>
          </div>
        )}

        {phase.kind === "error" && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-warning-line bg-warning-soft p-4 text-sm leading-relaxed"
          >
            <p className="font-semibold text-warning-ink">
              Checkout unavailable
            </p>
            <p className="mt-1.5 text-warning-ink/90">{phase.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startCheckout()}
                className="inline-flex items-center rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-paper transition-colors hover:bg-ink-soft"
              >
                Try again
              </button>
              <Link
                href="/contact"
                onClick={() => sound.tick()}
                className="inline-flex items-center rounded-lg px-3.5 py-2 text-[13px] font-medium text-warning-ink/80 transition-colors hover:text-warning-ink"
              >
                Contact support
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <NotConfiguredNotice block={block} baseClasses={baseClasses} inner={inner} />;
}

function NotConfiguredNotice({
  block,
  baseClasses,
  inner,
}: {
  block: boolean;
  baseClasses: string;
  inner: React.ReactNode;
}) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className={cn(block && "w-full")}>
      <button
        type="button"
        className={baseClasses}
        aria-expanded={noticeOpen}
        onPointerEnter={() => sound.tick()}
        onClick={() => {
          if (noticeOpen) {
            sound.close();
          } else {
            sound.confirm();
            trackConversion("purchase_click", { mode: "pre_checkout" });
            trackConversion("checkout_notice_open");
          }
          setNoticeOpen((value) => !value);
        }}
      >
        {inner}
      </button>

      <div data-open={noticeOpen} inert={!noticeOpen} className="acc-grid">
        <div className="acc-inner">
          <div
            role="status"
            className="card-soft mt-3 rounded-xl p-4 text-sm leading-relaxed text-ink-soft"
          >
            <p className="font-semibold text-ink">Checkout is not live yet.</p>
            <p className="mt-1.5">
              Payments and file delivery are being set up. You can still review
              the free sample and reach out at{" "}
              <a
                href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Marketloom Research Pack")}`}
                className="font-medium text-accent underline underline-offset-4"
              >
                {SITE.contactEmail}
              </a>{" "}
              — or check the sample first.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/sample"
                onClick={() => {
                  sound.click();
                  trackConversion("sample_open", { source: "checkout_notice" });
                }}
                className="inline-flex items-center rounded-lg border border-line bg-paper-raised px-3.5 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-paper-sunken"
              >
                Explore the sample
              </Link>
              <Link
                href="/refunds"
                onClick={() => sound.tick()}
                className="inline-flex items-center rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
              >
                Refund policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="currentColor"
    >
      <path
        d="M3 8h10m0 0L9 4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
