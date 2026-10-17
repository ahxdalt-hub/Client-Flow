"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { play } from "@/lib/sound";
import { track } from "@/lib/analytics-client";
import { CONTACT } from "@/lib/pricing";

type Found = { orderId: string; downloadToken: string };

export function RecoverForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Found | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const reference = String(new FormData(e.currentTarget).get("reference") ?? "").trim();
    setBusy(true);
    track("recover_started");
    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        orderId?: string;
        downloadToken?: string;
        error?: string;
      };
      if (!res.ok || !data.orderId || !data.downloadToken) {
        throw new Error(data.error ?? "We couldn't reissue your link.");
      }
      play("success");
      track("recover_success");
      setFound({ orderId: data.orderId, downloadToken: data.downloadToken });
    } catch (err) {
      play("error");
      track("recover_failed");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (found) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6 md:p-8">
        <p className="eyebrow !text-accent">Purchase found</p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          Here&apos;s a fresh download link for order{" "}
          <span className="font-mono text-ink">{found.orderId}</span>. It stays
          valid for 30 days.
        </p>
        <a
          href={`/api/download/${found.orderId}?t=${found.downloadToken}`}
          download
          data-sound="off"
          onClick={() => play("open")}
          className="btn btn-primary mt-6 inline-flex h-[3.25rem] items-center gap-2.5 rounded-full px-8 text-[1rem] font-semibold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
          </svg>
          Download the kit (.zip)
        </a>
        <p className="mt-4 text-[0.82rem] leading-relaxed text-muted">
          Bookmark the order page at{" "}
          <span className="font-mono text-ink">/order/{found.orderId}</span> —
          it always reissues your download from your order id.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label
        htmlFor="recover-reference"
        className="mb-1.5 block text-[0.82rem] font-semibold text-ink"
      >
        Razorpay order or payment id
      </label>
      <input
        id="recover-reference"
        name="reference"
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="order_XXXXXXXXXXXXXX or pay_XXXXXXXXXXXXXX"
        required
        onFocus={() => play("click")}
        className="h-12 w-full rounded-xl border border-line-strong bg-paper px-4 font-mono text-[0.9rem] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        className="mt-6 w-full"
        aria-busy={busy}
      >
        {busy ? "Looking up your purchase…" : "Reissue my download link"}
      </Button>

      <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
        Don&apos;t have the id? Check the receipt Razorpay emailed you when you
        paid. Still stuck? Write to{" "}
        <a
          href={`mailto:${CONTACT.email}`}
          className="underline underline-offset-2 hover:text-ink"
        >
          {CONTACT.email}
        </a>{" "}
        and we&apos;ll reissue it manually.
      </p>
    </form>
  );
}
