"use client";

import { useState } from "react";

import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({
  items,
  idBase,
  firstOpenByDefault = false,
}: {
  items: FaqItem[];
  idBase: string;
  firstOpenByDefault?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    firstOpenByDefault && items.length > 0 ? 0 : null,
  );

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${idBase}-panel-${index}`;
        const buttonId = `${idBase}-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                id={buttonId}
                className="group flex w-full items-center justify-between gap-6 py-4 text-left transition-colors sm:py-5"
                onClick={() => {
                  if (open) {
                    sound.close();
                  } else {
                    sound.open();
                  }
                  setOpenIndex(open ? null : index);
                }}
              >
                <span
                  className={cn(
                    "text-[15px] font-semibold leading-snug transition-colors sm:text-base",
                    open ? "text-accent" : "text-ink group-hover:text-accent",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors duration-300",
                    open
                      ? "border-accent bg-accent text-paper"
                      : "border-line-strong text-ink-soft group-hover:border-accent group-hover:text-accent",
                  )}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="transition-transform duration-300"
                    style={{ transform: open ? "rotate(45deg)" : "none" }}
                  >
                    <path
                      d="M6 1.5v9M1.5 6h9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={open}
              className="acc-grid"
            >
              <div className="acc-inner">
                <p className="max-w-2xl pb-5 pr-10 text-[15px] leading-relaxed text-ink-soft">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
