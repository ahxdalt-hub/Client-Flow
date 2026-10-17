"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <p className="rounded-xl border border-line bg-paper p-4 text-[0.88rem] leading-relaxed text-muted">
        <span className="font-mono text-ink">ADMIN_SECRET</span> is not set on this
        deployment, so the dashboard is disabled. Generate one and add it to your
        environment, then redeploy — see <span className="font-mono">.env.example</span>.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const secret = String(new FormData(e.currentTarget).get("secret") ?? "");
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label
        htmlFor="admin-secret"
        className="mb-1.5 block text-[0.82rem] font-semibold text-ink"
      >
        Admin key
      </label>
      <input
        id="admin-secret"
        name="secret"
        type="password"
        autoComplete="current-password"
        required
        className="h-12 w-full rounded-xl border border-line-strong bg-paper px-4 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
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
        {busy ? "Checking…" : "Open dashboard"}
      </Button>
    </form>
  );
}
