"use client";

import { useSyncExternalStore } from "react";
import { play, setSoundOn } from "@/lib/sound";

/** Sound toggle in the header. Persisted; synthesised tones, no assets. */

function subscribe(callback: () => void) {
  window.addEventListener("cf-sound-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("cf-sound-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem("cf_sound") === "on";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  // Must match the client's pre-hydration default (off) to avoid a hydration
  // mismatch, and so the icon never renders as a misleading "muted" state.
  return false;
}

export function SoundToggle() {
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !on;
    setSoundOn(next);
    // Confirm the change audibly when switching sounds back on.
    if (next) play("click");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-sound="off"
      aria-label={on ? "Mute interface sounds" : "Enable interface sounds"}
      aria-pressed={on}
      title={on ? "Sounds on" : "Sounds off — click to enable"}
      className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {on === false ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </svg>
      )}
    </button>
  );
}
