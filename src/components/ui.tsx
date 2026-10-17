"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ── Layout primitives ─────────────────────────────────────────── */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  id,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn("py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

/* ── Typography primitives ─────────────────────────────────────── */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display text-[clamp(1.9rem,4vw,2.9rem)] text-ink">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "line",
  className,
}: {
  children: ReactNode;
  tone?: "line" | "tint" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] uppercase",
        tone === "line" && "border border-line-strong text-muted",
        tone === "tint" && "bg-accent-tint text-accent",
        tone === "ink" && "bg-ink text-ivory",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Buttons ───────────────────────────────────────────────────── */

const base =
  "btn inline-flex items-center justify-center gap-2 rounded-full font-semibold focus-visible:outline-2 focus-visible:outline-accent";

const variants = {
  primary: "btn-primary",
  accent: "btn-accent",
  ghost: "btn-ghost",
} as const;

/**
 * `min-h-*` rather than `h-*` on purpose: a fixed height plus a wrapped label
 * clips the text out of the top and bottom of the pill. With a minimum the
 * button simply grows if a long label ever wraps in a narrow column.
 */
const sizes = {
  sm: "min-h-9 px-4 text-[0.82rem]",
  md: "min-h-11 px-6 text-[0.92rem]",
  lg: "min-h-[3.25rem] px-7 text-[1rem]",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  prefetch,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  prefetch?: boolean;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      data-sound-hover=""
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-sound-hover=""
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Misc ──────────────────────────────────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-t border-line", className)} />;
}
