import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  adminCookieValue,
  isAdminConfigured,
  isValidAdminSecret,
} from "@/lib/admin-auth";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  // "/" — not "/admin" — so the browser also sends it to /api/admin/*.
  path: "/",
  maxAge: 60 * 60 * 12, // 12 hours
};

/** Log in with the shared ADMIN_SECRET; sets the derived, httpOnly cookie. */
export async function POST(request: Request) {
  const rate = checkRateLimit(`admin:${clientIp(request)}`, RATE_LIMITS.admin);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured on this deployment." },
      { status: 503 },
    );
  }

  let secret = "";
  try {
    const body = (await request.json()) as { secret?: string };
    secret = typeof body.secret === "string" ? body.secret : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidAdminSecret(secret)) {
    // Deliberately vague; the secret is the only thing that matters.
    return NextResponse.json({ error: "That key doesn't match." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminCookieValue(secret), COOKIE_OPTIONS);
  return res;
}

/** Log out — clears the cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
