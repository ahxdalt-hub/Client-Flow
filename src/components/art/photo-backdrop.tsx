import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import { Parallax } from "@/components/motion";
import { Grain } from "./ambient";

/**
 * Full-bleed photographic backdrop for a light section.
 *
 * A still photograph reads as a flat rectangle, so the picture does two
 * things here: it drifts against the scroll (a few tens of pixels, enough
 * to feel joined to the page rather than pasted on it) and it breathes on
 * a very slow zoom loop. Both are decoration — `<Parallax>` is skipped
 * under reduced motion, and `.slow-zoom` is switched off in the same
 * media query.
 *
 * How much of the picture survives is the section's decision, not this
 * component's: pass `scrim` with the gradients that hold that section's
 * type legible. The image itself carries no text and no meaning, so the
 * whole layer is aria-hidden and takes no pointer events.
 */
export function PhotoBackdrop({
  src,
  sizes = "100vw",
  quality = 75,
  /** peak parallax drift in px */
  speed = 44,
  /** breathing zoom loop */
  zoom = true,
  objectPosition,
  /** overlay gradients that keep the section's copy crisp */
  scrim,
  grain = 0.26,
  className,
}: {
  src: string;
  sizes?: string;
  quality?: 75 | 90;
  speed?: number;
  zoom?: boolean;
  objectPosition?: string;
  scrim?: ReactNode;
  grain?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("photo-bg", className)}>
      <Parallax speed={speed} className="photo-bg-parallax">
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          quality={quality}
          className={cn("photo-bg-img", zoom && "slow-zoom")}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </Parallax>
      {scrim}
      <Grain opacity={grain} />
    </div>
  );
}
