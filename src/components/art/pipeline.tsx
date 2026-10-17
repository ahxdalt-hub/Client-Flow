import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";

/**
 * Decorative-but-informative pipeline: the five stages a cold prospect moves
 * through, drawn as a rail that fills on scroll with nodes popping in sequence.
 * All motion is CSS + the shared `Reveal` observer.
 */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const STAGES: { step: string; title: string; text: string; icon: ReactNode }[] = [
  {
    step: "01",
    title: "Research",
    text: "Pick one niche, list fifteen businesses from public sources.",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "First touch",
    text: "One specific observation, one clear, small ask.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Follow up",
    text: "Four scheduled nudges — timed, worded, never guesswork.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 8v4l3 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Proposal",
    text: "Ten fixed sections: scope, milestones, revisions, exclusions.",
    icon: (
      <svg {...iconProps}>
        <path d="M6 2h9l5 5v15H6z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Signed",
    text: "The tracker flips to won. The sequence starts again.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
];

export function Pipeline() {
  return (
    <Reveal className="pipeline" once y={26}>
      <div className="pipeline-rail" aria-hidden="true">
        <span className="pipeline-rail-fill" />
      </div>

      <ol className="pipeline-track">
        {STAGES.map((stage, i) => (
          <li key={stage.step} className="pipeline-stage" style={{ "--i": i } as React.CSSProperties}>
            <span className="pipeline-node">{stage.icon}</span>
            <div className="pipeline-body">
              <p className="pipeline-step">{stage.step}</p>
              <h3 className="pipeline-title">{stage.title}</h3>
              <p className="pipeline-text">{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
