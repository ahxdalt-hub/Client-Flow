import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";
import { isTicketStatus, PRIORITY_ORDER, type TicketPriority } from "@/lib/support-topics";
import { updateSupportTicket } from "@/lib/tickets";

/**
 * Admin-only: move a ticket through its lifecycle and record a note.
 * Cookie-gated with the same shared secret as the rest of /admin.
 */
export async function POST(request: Request) {
  const authed = isValidAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  let body: {
    id?: unknown;
    status?: unknown;
    adminNote?: unknown;
    priority?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Missing ticket id." }, { status: 400 });
  }

  const status = typeof body.status === "string" && isTicketStatus(body.status)
    ? body.status
    : undefined;

  const priority =
    typeof body.priority === "string" &&
    (PRIORITY_ORDER as readonly string[]).includes(body.priority)
      ? (body.priority as TicketPriority)
      : undefined;

  const adminNote =
    body.adminNote === undefined
      ? undefined
      : typeof body.adminNote === "string"
        ? body.adminNote.trim().slice(0, 4000) || null
        : null;

  if (!status && !priority && adminNote === undefined) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const ok = await updateSupportTicket(id, { status, priority, adminNote });
  if (!ok) {
    return NextResponse.json({ error: "Could not update the ticket." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
