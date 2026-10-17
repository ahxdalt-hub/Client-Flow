"use client";

import { useEffect } from "react";

import { play, unlockAudio } from "@/lib/sound";

/**
 * One delegated listener pair for the whole site's interaction sound.
 *
 * Attaching per-element hover handlers is what makes sites feel laggy, so
 * instead we listen once on the document and resolve the target with
 * `closest()`. Hover is naturally throttled inside `play("hover")`.
 *
 * Opt out of the click sound on any element with `data-sound="off"` (used
 * where a richer custom sound plays instead, e.g. order success).
 */

const HOVER_SELECTOR = "[data-sound-hover], .btn, nav a";
const CLICK_SELECTOR = "a[href], button, summary, [role='button']";

export function InteractionSounds() {
  useEffect(() => {
    let lastHovered: Element | null = null;

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const el = target?.closest?.(HOVER_SELECTOR) ?? null;
      if (!el || el === lastHovered) return;
      lastHovered = el;
      play("hover");
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const el = target?.closest?.(HOVER_SELECTOR) ?? null;
      if (el && el === lastHovered) lastHovered = null;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const el = target?.closest?.(CLICK_SELECTOR) ?? null;
      if (!el) return;
      if (el.getAttribute("data-sound") === "off") return;
      const isBusy = el.classList.contains("btn");
      play(isBusy ? "click" : "press");
    };

    const unlock = () => unlockAudio();

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    // Capture phase: fire even if a handler calls stopPropagation.
    document.addEventListener("click", onClick, true);
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return null;
}
