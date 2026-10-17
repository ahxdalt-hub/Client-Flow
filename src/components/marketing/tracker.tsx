"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics-client";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
