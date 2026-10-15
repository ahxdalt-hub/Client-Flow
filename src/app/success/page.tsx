"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { trackConversion } from "@/lib/analytics";
import { sound } from "@/lib/sound";

const MAX_AUTO_RECHECKS = 6;
const AUTO_RECHECK_DELAY_MS = 3_000;

type VerifyState =
  | { kind: "checking" }
  | { kind: "no_session" }
  | { kind: "not_configured" }
  | { kind: "pending"; paymentId: string | null; attempts: number }
  | { kind: "verified"; paymentId: string; orderId: string; token: string }
  | { kind: "failed"; paymentId: string | null; detail?: string }
  | { kind: "error"; message: string };

type DownloadFile = { name: string; url: string };

type DownloadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; files: DownloadFile[]; expiresAt: string }
  | { kind: "expired" }
  | { kind: "rate_limited"; retryAfterSeconds: number }
  | { kind: "unavailable"; message: string };

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId =
    searchParams.get("payment_id") ?? searchParams.get("session_id");

  const [verify, setVerify] = useState<VerifyState>(() =>
    paymentId ? { kind: "checking" } : { kind: "no_session" },
  );
  const [download, setDownload] = useState<DownloadState>({ kind: "idle" });
  const [now, setNow] = useState(() => Date.now());
  const verifiedRef = useRef(false);

  const fetchDownload = useCallback(async (token: string) => {
    setDownload({ kind: "loading" });
    try {
      const response = await fetch(
        `/api/download?token=${encodeURIComponent(token)}`,
      );
      const data = (await response.json().catch(() => null)) as
        | {
            state?: string;
            files?: Array<{ name: string; url: string }>;
            expiresAt?: string;
            message?: string;
            retryAfterSeconds?: number;
          }
        | null;

      if (data?.state === "ready" && data.files?.length && data.expiresAt) {
        setNow(Date.now());
        setDownload({
          kind: "ready",
          files: data.files,
          expiresAt: data.expiresAt,
        });
        trackConversion("download_link_issued", { files: data.files.length });
        return;
      }
      if (data?.state === "expired_token") {
        setDownload({ kind: "expired" });
        return;
      }
      if (data?.state === "rate_limited") {
        setDownload({
          kind: "rate_limited",
          retryAfterSeconds: data.retryAfterSeconds ?? 3600,
        });
        return;
      }
      setDownload({
        kind: "unavailable",
        message:
          data?.message ??
          "Download links could not be created right now. Please retry.",
      });
    } catch {
      setDownload({
        kind: "unavailable",
        message: "Download links could not be created right now. Please retry.",
      });
    }
  }, []);

  const runVerify = useCallback(
    async (attempts: number) => {
      if (!paymentId) return;
      try {
        const response = await fetch(
          `/api/verify?payment_id=${encodeURIComponent(paymentId)}`,
        );
        const data = (await response.json().catch(() => null)) as
          | {
              state?: string;
              paymentId?: string;
              orderId?: string;
              downloadToken?: string;
              providerStatus?: string;
              reason?: string;
              missing?: string[];
              message?: string;
            }
          | null;

        switch (data?.state) {
          case "verified": {
            if (!verifiedRef.current) {
              verifiedRef.current = true;
              trackConversion("payment_verified");
              sound.success();
            }
            setVerify({
              kind: "verified",
              paymentId: data.paymentId ?? paymentId,
              orderId: data.orderId ?? "",
              token: data.downloadToken ?? "",
            });
            if (data.downloadToken) {
              void fetchDownload(data.downloadToken);
            }
            return;
          }
          case "pending": {
            trackConversion("payment_pending", { attempts });
            setVerify({
              kind: "pending",
              paymentId: data.paymentId ?? paymentId,
              attempts,
            });
            return;
          }
          case "not_configured": {
            setVerify({ kind: "not_configured" });
            return;
          }
          case "failed":
          case "not_found":
          case "unfulfillable": {
            trackConversion("payment_failed", {
              surface: "verify",
              reason: data.state,
            });
            setVerify({
              kind: "failed",
              paymentId: data.paymentId ?? paymentId,
              detail: data.reason ?? data.providerStatus,
            });
            return;
          }
          default: {
            if (response.status >= 500 && attempts < MAX_AUTO_RECHECKS) {
              setVerify({
                kind: "pending",
                paymentId,
                attempts,
              });
              return;
            }
            setVerify({
              kind: "error",
              message:
                data?.message ??
                "Verification is temporarily unavailable. Please retry.",
            });
          }
        }
      } catch {
        if (attempts < MAX_AUTO_RECHECKS) {
          setVerify({ kind: "pending", paymentId, attempts });
          return;
        }
        setVerify({
          kind: "error",
          message:
            "We could not reach the verification service. Please retry.",
        });
      }
    },
    [paymentId, fetchDownload],
  );

  useEffect(() => {
    if (!paymentId) return;
    // Deferred so the effect body itself never sets state synchronously.
    const timer = setTimeout(() => void runVerify(0), 0);
    return () => clearTimeout(timer);
  }, [paymentId, runVerify]);

  // Auto-recheck while the payment is still settling (webhook lag).
  useEffect(() => {
    if (verify.kind !== "pending") return;
    if (verify.attempts >= MAX_AUTO_RECHECKS) return;
    const timer = setTimeout(() => {
      void runVerify(verify.attempts + 1);
    }, AUTO_RECHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [verify, runVerify]);

  // Countdown for the signed download URLs (ticks only while links are live).
  useEffect(() => {
    if (download.kind !== "ready") return;
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [download.kind]);

  const secondsLeft =
    download.kind === "ready"
      ? Math.max(0, Math.ceil((Date.parse(download.expiresAt) - now) / 1000))
      : null;

  const refreshLinks = useCallback(() => {
    setDownload({ kind: "loading" });
    void runVerify(0);
  }, [runVerify]);

  return (
    <div className="container-page max-w-2xl py-16 md:py-24">
      <div className="card-soft rounded-2xl p-8 md:p-10">
        {verify.kind === "checking" && (
          <>
            <span
              aria-hidden
              className="inline-block h-2 w-24 overflow-hidden rounded-full bg-paper-sunken"
            >
              <span className="block h-full w-1/3 animate-pulse rounded-full bg-accent" />
            </span>
            <h1 className="display-title mt-6 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              Checking your payment…
            </h1>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              Verifying the payment with Razorpay before releasing the download.
            </p>
          </>
        )}

        {verify.kind === "no_session" && (
          <>
            <p className="eyebrow">No payment reference</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              This page confirms a purchase.
            </h1>
            <div className="mt-5 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              <p>
                After a successful payment, Razorpay sends you here with a
                payment reference (<code className="rounded bg-paper-sunken px-1.5 py-0.5 text-[13px]">payment_id</code>).
                Without that reference there is nothing to verify — and no
                download is released.
              </p>
              <p>
                If you completed a purchase but landed here without a
                reference, check your email for the Razorpay payment receipt
                and <Link href="/contact" className="font-medium text-accent underline underline-offset-4">contact support</Link> with the payment id.
              </p>
            </div>
          </>
        )}

        {verify.kind === "not_configured" && (
          <>
            <p className="eyebrow">Payments not configured</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              Payments aren&apos;t live yet
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              This storefront doesn&apos;t have a payment provider connected on
              the server yet, so no payments can be verified and no downloads
              are released. If you believe you were charged, contact support
              with your payment reference.
            </p>
          </>
        )}

        {verify.kind === "pending" && (
          <>
            <p className="eyebrow">Payment received — confirming</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              Finishing verification…
            </h1>
            <div className="mt-5 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              <p>
                Your payment reference was accepted and we&apos;re confirming
                it with Razorpay. This usually takes a few seconds while the
                payment settles.
              </p>
              {verify.attempts >= MAX_AUTO_RECHECKS && (
                <p className="rounded-xl border border-dashed border-warning-line bg-warning-soft p-4 text-sm text-warning-ink">
                  This is taking longer than usual. If you were charged, your
                  entitlement is safe — the server records it independently of
                  this page. You can check again, or keep the payment id handy
                  and contact support.
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runVerify(0)}
                className="inline-flex items-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft"
              >
                Check again
              </button>
              {verify.paymentId && (
                <span className="inline-flex items-center rounded-xl border border-line bg-paper-raised px-4 py-3 font-mono text-[12px] text-ink-soft">
                  {verify.paymentId}
                </span>
              )}
            </div>
          </>
        )}

        {verify.kind === "verified" && (
          <>
            <p className="eyebrow">Payment verified</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              Your download is ready
            </h1>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              Payment <span className="font-mono text-[13px] text-ink">{verify.paymentId}</span> was
              verified with Razorpay. The links below are personal, signed, and
              expire automatically.
            </p>

            <div className="mt-6 space-y-3">
              {download.kind === "loading" || download.kind === "idle" ? (
                <p role="status" className="text-sm text-ink-soft">
                  Creating secure download links…
                </p>
              ) : null}

              {download.kind === "ready" && (
                <>
                  <ul className="space-y-3">
                    {download.files.map((file) => (
                      <li key={file.url}>
                        <a
                          href={file.url}
                          rel="noopener noreferrer"
                          download
                          onClick={() => sound.click()}
                          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-paper-raised px-5 py-4 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
                        >
                          <span>{file.name}</span>
                          <span className="text-[13px] font-medium text-accent">
                            Download
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[13px] text-muted" role="status">
                    {secondsLeft !== null && secondsLeft > 0
                      ? `Links expire in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}.`
                      : "These links have expired — request fresh ones below."}
                    {" "}Links are single-purpose and bound to your payment.
                  </p>
                </>
              )}

              {download.kind === "expired" && (
                <p className="rounded-xl border border-dashed border-warning-line bg-warning-soft p-4 text-sm text-warning-ink">
                  Your download links expired. Request fresh links below — no
                  further payment is needed.
                </p>
              )}

              {download.kind === "rate_limited" && (
                <p className="rounded-xl border border-dashed border-warning-line bg-warning-soft p-4 text-sm text-warning-ink">
                  Too many link requests were made recently. Please wait a few
                  minutes and request again, or contact support if you need
                  help.
                </p>
              )}

              {download.kind === "unavailable" && (
                <p className="rounded-xl border border-dashed border-warning-line bg-warning-soft p-4 text-sm text-warning-ink">
                  {download.message}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refreshLinks}
                disabled={download.kind === "loading"}
                className="inline-flex items-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-50"
              >
                Get fresh links
              </button>
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-line-strong bg-paper-raised px-5 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted">
              Keep this page&apos;s URL (<code className="rounded bg-paper-sunken px-1 py-0.5">/success?payment_id=…</code>) to
              regenerate links later. Your Razorpay receipt email has the same
              payment id for support requests.
            </p>
          </>
        )}

        {verify.kind === "failed" && (
          <>
            <p className="eyebrow">Verification failed</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              We couldn&apos;t verify that payment
            </h1>
            <div className="mt-5 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              <p>
                The payment reference could not be confirmed as a captured
                payment for this product. No download has been released.
              </p>
              <p>
                If you were charged, contact support with your payment
                reference (
                <span className="font-mono text-[13px] text-ink">
                  {verify.paymentId ?? "unknown"}
                </span>
                ) and we&apos;ll sort it out.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runVerify(0)}
                className="inline-flex items-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft"
              >
                Check again
              </button>
            </div>
          </>
        )}

        {verify.kind === "error" && (
          <>
            <p className="eyebrow">Verification unavailable</p>
            <h1 className="display-title mt-3 text-[clamp(1.75rem,3.8vw,2.5rem)]">
              Couldn&apos;t reach verification
            </h1>
            <div className="mt-5 space-y-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
              <p>{verify.message}</p>
              <p className="rounded-xl border border-dashed border-warning-line bg-warning-soft p-4 text-sm text-warning-ink">
                If you were charged, the payment is recorded on the server and
                your entitlement is safe. Retry below, or contact support with
                your payment reference.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runVerify(0)}
                className="inline-flex items-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft"
              >
                Retry verification
              </button>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl px-1 py-1 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl px-1 py-1 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Contact support
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Downloads are only released after server-side payment verification
        against Razorpay — never based on visiting this page alone.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page max-w-2xl py-16 md:py-24">
          <p className="text-sm text-muted">Loading purchase confirmation…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
