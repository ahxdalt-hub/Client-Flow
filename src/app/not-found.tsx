import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] max-w-xl flex-col items-start justify-center py-20">
      <p className="eyebrow">404</p>
      <h1 className="display-title mt-3 text-[clamp(2rem,4.6vw,2.9rem)]">
        Page not found
      </h1>
      <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft"
        >
          Back to home
        </Link>
        <Link
          href="/sample"
          className="inline-flex items-center rounded-xl border border-line-strong bg-paper-raised px-5 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink"
        >
          View the sample
        </Link>
      </div>
    </div>
  );
}
