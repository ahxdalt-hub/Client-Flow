"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/support-topics";

/**
 * Status / priority / note editor for a single ticket. Posts to the
 * cookie-gated admin route and refreshes the server component on success.
 */
export function TicketActions({
  id,
  status,
  priority,
  adminNote,
}: {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  adminNote: string | null;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<TicketStatus>(status);
  const [nextPriority, setNextPriority] = useState<TicketPriority>(priority);
  const [note, setNote] = useState(adminNote ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
          priority: nextPriority,
          adminNote: note,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  const label = "mb-1.5 block text-[0.78rem] font-semibold text-ink";
  const control =
    "h-11 w-full rounded-xl border border-line-strong bg-paper px-3 text-[0.86rem] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ticket-status" className={label}>
            Status
          </label>
          <select
            id="ticket-status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as TicketStatus)}
            className={control}
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ticket-priority" className={label}>
            Priority
          </label>
          <select
            id="ticket-priority"
            value={nextPriority}
            onChange={(e) => setNextPriority(e.target.value as TicketPriority)}
            className={control}
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ticket-note" className={label}>
          Private note
        </label>
        <textarea
          id="ticket-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="What you did, what you told the customer, refund reference — anything you'll want next time."
          className="w-full rounded-xl border border-line-strong bg-paper px-3 py-3 text-[0.86rem] leading-relaxed text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <p className="mt-1 text-[0.72rem] text-muted">
          Only visible here, never to the customer. {note.length}/4000
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="h-11 rounded-xl bg-ink px-5 text-[0.86rem] font-semibold text-ivory disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {message ? (
          <span className="text-[0.82rem] font-semibold text-accent">{message}</span>
        ) : null}
        {error ? (
          <span role="alert" className="text-[0.82rem] font-semibold text-red-700">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
