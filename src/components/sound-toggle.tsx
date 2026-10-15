"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  initSoundPreference,
  isSoundEnabled,
  setSoundEnabled,
  sound,
  subscribeSound,
} from "@/lib/sound";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  return subscribeSound(callback);
}

function getSnapshot() {
  return isSoundEnabled();
}

function getServerSnapshot() {
  return true;
}

export function SoundToggle({ className }: { className?: string }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    initSoundPreference();
  }, []);

  const toggle = useCallback(() => {
    const next = !isSoundEnabled();
    if (next) {
      setSoundEnabled(true);
      sound.success();
    } else {
      sound.click();
      setSoundEnabled(false);
    }
  }, []);

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Mute sounds" : "Enable sounds"}
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-paper-raised px-3 text-[11px] font-semibold uppercase tracking-wider text-muted transition-all duration-300 hover:border-line-strong hover:text-ink active:scale-95",
        enabled && "text-ink",
        className,
      )}
      onClick={toggle}
    >
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {[3, 6, 10, 5].map((height, index) => (
          <span
            key={index}
            className={cn(
              "w-[2px] rounded-full transition-all duration-300",
              enabled ? "bg-accent" : "bg-line-strong",
            )}
            style={{
              height: enabled
                ? `${height}px`
                : index % 2 === 0
                  ? "3px"
                  : "5px",
              animation: enabled
                ? `soft-pulse ${0.9 + index * 0.18}s ease-in-out infinite`
                : undefined,
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
