"use client";

import { useEffect, useState } from "react";

/**
 * Client-deferred year — `new Date()` is not allowed in prerendered shells,
 * so a static fallback renders first and the live year replaces it post-hydration.
 */
export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // Deferred (not synchronous) to respect React's effect guidance.
    const t = setTimeout(() => setYear(new Date().getFullYear()), 0);
    return () => clearTimeout(t);
  }, []);

  return <>{year ?? "2026"}</>;
}
