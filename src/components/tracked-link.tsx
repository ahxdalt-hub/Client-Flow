"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackConversion } from "@/lib/analytics";
import { sound } from "@/lib/sound";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event: "sample_open" | "purchase_click";
  source?: string;
};

export function TrackedLink({
  event,
  source,
  onClick,
  children,
  ...rest
}: TrackedLinkProps) {
  return (
    <Link
      {...rest}
      onClick={(mouseEvent) => {
        sound.tick();
        trackConversion(event, source ? { source } : {});
        onClick?.(mouseEvent);
      }}
    >
      {children}
    </Link>
  );
}
