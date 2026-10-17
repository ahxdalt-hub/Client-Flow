"use client";

import type { ReactNode } from "react";

import { ButtonLink } from "../ui";
import { track } from "@/lib/analytics-client";
import { play } from "@/lib/sound";

/**
 * The one buy button used across the site.
 *
 * Every purchase click funnels through here so `purchase_click` is recorded
 * with the location it came from — which is the only way to learn which
 * placement actually sells: hero, header, sticky bar, footer or checkout.
 * Before this existed the hero's primary CTA carried a `data-analytics`
 * attribute that nothing read, so the highest-intent click on the site was
 * invisible in the funnel.
 */
export function BuyCta({
  location,
  children,
  size = "lg",
  variant = "primary",
  className,
  /** Play the "pop" confirmation. Off for compact chrome like the header. */
  sound = true,
}: {
  /** Where this button lives — recorded as `purchase_click.location`. */
  location: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "ghost";
  className?: string;
  sound?: boolean;
}) {
  return (
    <ButtonLink
      href="/checkout"
      variant={variant}
      size={size}
      className={className}
      data-sound="off"
      onClick={() => {
        if (sound) play("pop");
        track("purchase_click", { location });
      }}
    >
      {children}
    </ButtonLink>
  );
}
