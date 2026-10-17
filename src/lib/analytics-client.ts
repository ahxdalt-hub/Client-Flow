"use client";

/**
 * First-party analytics client. Fire-and-forget; never blocks or breaks UX.
 * Events land in the Supabase `analytics_events` table via /api/track
 * (silently no-op when Supabase is not configured).
 */

const SESSION_ID_KEY = "cf_sid";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

export function track(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    event,
    props: properties,
    path: window.location.pathname,
    referrer: document.referrer || null,
    sessionId: getSessionId(),
  });

  // Queued after priority so navigation taps are never delayed.
  setTimeout(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, 0);
}
