"use client";

import * as React from "react";
import Link from "next/link";

import { Aurora } from "@/components/art/ambient";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface for server diagnostics; no user-facing stack traces.
    console.error(error);
  }, [error]);

  return (
    <div className="relative isolate overflow-hidden">
      <Aurora className="z-0 opacity-70" />

      <div className="relative z-10 mx-auto max-w-xl px-5 py-24 text-center md:py-32">
        <p className="eyebrow">Something broke</p>
        <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.4rem)] text-ink">
          That page didn&apos;t load.
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
          A short-lived error — try again. If a paid download is involved and
          it keeps failing, our support inbox is monitored daily.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="btn btn-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-[0.9rem] font-semibold"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="btn btn-ghost inline-flex h-11 items-center justify-center rounded-full px-6 text-[0.9rem] font-semibold"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
