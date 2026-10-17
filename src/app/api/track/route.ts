import { NextResponse } from "next/server";

import { logEvent } from "@/lib/orders";
import { RATE_LIMITS, checkRateLimit, clientIp } from "@/lib/rate-limit";

type TrackBody = {
  event?: unknown;
  props?: unknown;
  path?: unknown;
  sessionId?: unknown;
};

const MAX_PROPS_JSON = 2000;

export async function POST(request: Request) {
  const rate = checkRateLimit(`track:${clientIp(request)}`, RATE_LIMITS.track);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many events." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as TrackBody;
    const event = typeof body.event === "string" ? body.event.slice(0, 64) : "";
    if (!event) return NextResponse.json({}, { status: 204 });

    let props: Record<string, unknown> = {};
    if (body.props && typeof body.props === "object") {
      const json = JSON.stringify(body.props);
      if (json.length <= MAX_PROPS_JSON) props = body.props as Record<string, unknown>;
    }

    await logEvent(event, props);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Malformed" }, { status: 400 });
  }
}
