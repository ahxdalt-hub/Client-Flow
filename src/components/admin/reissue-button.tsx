"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

/** Calls the admin reissue endpoint and reveals a fresh signed download link. */
export function ReissueButton({ reference }: { reference: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not reissue.");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={run} disabled={busy} aria-busy={busy}>
        {busy ? "Reissuing…" : "Reissue download link"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 text-[0.8rem] text-red-700">
          {error}
        </p>
      )}

      {url && (
        <div className="mt-3 rounded-xl border border-line bg-ivory p-3">
          <p className="text-[0.72rem] uppercase tracking-wider text-muted">
            Fresh link (30 days)
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="h-9 w-full rounded-lg border border-line bg-paper px-3 font-mono text-[0.72rem] text-ink"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.75rem] font-semibold text-ink hover:bg-paper"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
