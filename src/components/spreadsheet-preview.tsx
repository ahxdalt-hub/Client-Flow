import { cn } from "@/lib/utils";

export type PreviewRow = {
  store: string;
  url: string;
  market: string;
  category: string;
  contact: string;
  researched: string;
  opportunity: string;
  status: "reviewed" | "to-review" | "queued";
};

export const ILLUSTRATIVE_ROWS: PreviewRow[] = [
  {
    store: "Example Home Goods",
    url: "example-home-goods.example",
    market: "IN",
    category: "Home & garden",
    contact: "/pages/contact",
    researched: "12 Sep 2026",
    opportunity: "Mobile menu missing collections links",
    status: "to-review",
  },
  {
    store: "Sample Skincare Co.",
    url: "sample-skincare.example",
    market: "US",
    category: "Beauty",
    contact: "/pages/help",
    researched: "12 Sep 2026",
    opportunity: "No size or routine guide on product page",
    status: "reviewed",
  },
  {
    store: "Demo Fitness Store",
    url: "demo-fitness.example",
    market: "UK",
    category: "Fitness",
    contact: "/contact",
    researched: "13 Sep 2026",
    opportunity: "Blog present but unlinked from navigation",
    status: "queued",
  },
  {
    store: "Placeholder Pet Supply",
    url: "placeholder-pets.example",
    market: "CA",
    category: "Pets",
    contact: "/pages/contact-us",
    researched: "13 Sep 2026",
    opportunity: "Collection page lacks filtering",
    status: "to-review",
  },
  {
    store: "Illustrative Coffee Brand",
    url: "illustrative-coffee.example",
    market: "AU",
    category: "Food & drink",
    contact: "/pages/about",
    researched: "14 Sep 2026",
    opportunity: "No email signup on thank-you page",
    status: "reviewed",
  },
  {
    store: "Fictional Stationery Shop",
    url: "fictional-stationery.example",
    market: "DE",
    category: "Stationery",
    contact: "/pages/kontakt",
    researched: "14 Sep 2026",
    opportunity: "Product images below common size guidelines",
    status: "queued",
  },
  {
    store: "Made-up Outdoor Gear",
    url: "madeup-outdoor.example",
    market: "US",
    category: "Outdoor",
    contact: "/pages/contact",
    researched: "15 Sep 2026",
    opportunity: "No shipping FAQ linked near add-to-cart",
    status: "to-review",
  },
];

const ROW_ALT = "bg-[#f7f4ee]";
const ROW_BASE = "bg-paper-raised";

const STATUS_STYLES: Record<PreviewRow["status"], string> = {
  reviewed: "bg-success-soft text-success",
  "to-review": "bg-accent-soft text-accent-ink",
  queued: "bg-paper-sunken text-muted",
};

const STATUS_LABEL: Record<PreviewRow["status"], string> = {
  reviewed: "Reviewed",
  "to-review": "To review",
  queued: "Queued",
};

const STATUS_DOT: Record<PreviewRow["status"], string> = {
  reviewed: "bg-success",
  "to-review": "bg-accent",
  queued: "bg-muted",
};

function StatusChip({
  status,
  dense = false,
}: {
  status: PreviewRow["status"];
  dense?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
        dense ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        STATUS_STYLES[status],
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export type ColumnKey =
  | "store"
  | "url"
  | "market"
  | "category"
  | "contact"
  | "researched"
  | "opportunity"
  | "status";

export const ALL_COLUMNS: ColumnKey[] = [
  "store",
  "url",
  "market",
  "category",
  "contact",
  "researched",
  "opportunity",
  "status",
];

const COLUMN_META: Record<
  ColumnKey,
  { label: string; className: string }
> = {
  store: { label: "Store name", className: "" },
  url: { label: "Store URL", className: "hidden sm:table-cell" },
  market: { label: "Market", className: "hidden md:table-cell" },
  category: { label: "Category", className: "hidden lg:table-cell" },
  contact: { label: "Contact page", className: "hidden xl:table-cell" },
  researched: { label: "Researched", className: "hidden md:table-cell" },
  opportunity: { label: "Opportunity notes", className: "hidden sm:table-cell" },
  status: { label: "Status", className: "" },
};

export function SpreadsheetPreview({
  rows = ILLUSTRATIVE_ROWS,
  className,
  columns = ALL_COLUMNS,
  frame = "window",
  selectedCell,
}: {
  rows?: PreviewRow[];
  className?: string;
  columns?: ColumnKey[];
  frame?: "window" | "hero";
  selectedCell?: { row: number; column: ColumnKey };
}) {
  const isHero = frame === "hero";
  const cellPad = isHero ? "px-2.5 py-2" : "px-3.5 py-3";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-paper-raised",
        "shadow-[0_1px_2px_rgb(25_23_19/0.04),0_18px_44px_-30px_rgb(25_23_19/0.3)]",
        isHero &&
          "shadow-[0_1px_2px_rgb(25_23_19/0.05),0_28px_70px_-32px_rgb(25_23_19/0.4),0_10px_28px_-18px_rgb(43_65_232/0.2)]",
        className,
      )}
    >
      {isHero ? (
        <div className="flex items-center justify-between gap-3 bg-ink px-3.5 py-2 text-paper">
          <span className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-paper/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-paper/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-paper/35" />
            </span>
            <span className="truncate font-mono text-[11px] text-paper/55">
              store-research.xlsx
            </span>
          </span>
          <span className="shrink-0 rounded-md bg-paper/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-paper/70">
            Sheet 1
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-paper-sunken/60 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="truncate font-mono text-[11px] font-medium text-muted">
              store-research.xlsx
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-warning-line bg-warning-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-ink">
            Illustrative preview
          </span>
        </div>
      )}

      <div className="table-scroll overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            Illustrative spreadsheet preview showing example research rows.
            These are fictional examples, not real store data.
          </caption>
          <thead>
            <tr aria-hidden>
              <th className="sticky left-0 z-20 w-9 border-b border-r border-line bg-paper-sunken/80" />
              {columns.map((key, index) => (
                <th
                  key={key}
                  className={cn(
                    "border-b border-r border-line/60 bg-paper-sunken/80 px-2.5 pb-1 pt-2 font-mono text-[10px] font-medium text-muted/70 last:border-r-0",
                    COLUMN_META[key].className,
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-20 w-9 border-b border-r border-line bg-paper-raised" />
              {columns.map((key) => (
                <th
                  key={key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap border-b border-r border-line/60 bg-paper-raised pb-2.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted last:border-r-0",
                    isHero ? "px-2.5" : "px-3",
                    COLUMN_META[key].className,
                  )}
                >
                  {COLUMN_META[key].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const alt = rowIndex % 2 === 1;
              const last = rowIndex === rows.length - 1;
              return (
                <tr
                  key={row.url}
                  className={cn("group transition-colors duration-150", isHero && "row-enter")}
                  style={
                    isHero
                      ? ({
                          "--row-delay": `${0.5 + rowIndex * 0.09}s`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 w-9 border-r border-line/60 p-0 text-center font-mono text-[10px] font-normal tabular-nums text-muted/70 transition-colors group-hover:bg-accent-soft/60",
                      last ? "border-b-0" : "border-b border-line/60",
                      alt ? ROW_ALT : ROW_BASE,
                    )}
                  >
                    {rowIndex + 1}
                  </th>
                  {columns.map((key) => (
                    <Cell
                      key={key}
                      column={key}
                      row={row}
                      dense={isHero}
                      alt={alt}
                      className={cn(
                        cellPad,
                        isHero && key === "store" && "!whitespace-normal",
                        last ? "border-b-0" : "border-b border-line/60",
                        "border-r border-line/60 last:border-r-0",
                        COLUMN_META[key].className,
                      )}
                      selected={
                        selectedCell?.row === rowIndex &&
                        selectedCell?.column === key
                      }
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-paper-sunken/60 px-3.5 py-2">
        <p className="font-mono text-[11px] text-muted">
          {rows.length} of {rows.length} example rows · Sheet 1 of 1
        </p>
        <p className="text-[11px] text-muted">
          Names, URLs and notes are fictional placeholders.
        </p>
      </div>
    </div>
  );
}

function Cell({
  column,
  row,
  dense,
  alt,
  className,
  selected,
}: {
  column: ColumnKey;
  row: PreviewRow;
  dense: boolean;
  alt: boolean;
  className?: string;
  selected?: boolean;
}) {
  const base = cn(
    "relative align-middle transition-colors duration-150 group-hover:bg-accent-soft/60",
    alt ? ROW_ALT : ROW_BASE,
    column === "store" && "font-semibold text-ink",
    className,
  );

  if (column === "store") {
    return (
      <th
        scope="row"
        className={cn(
          base,
          dense
            ? "w-[7.25rem] min-w-[7.25rem] max-w-[9.5rem] whitespace-normal text-[12.5px]"
            : "sticky left-9 z-10 max-w-[9.5rem] whitespace-nowrap text-[13px] sm:max-w-[13rem]",
        )}
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-paper-sunken font-mono font-bold text-muted ring-1 ring-line",
              dense ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]",
              "transition-colors duration-200 group-hover:bg-accent-soft group-hover:text-accent group-hover:ring-accent/20",
            )}
          >
            {row.store
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </span>
          <span className="truncate">{row.store}</span>
        </span>
      </th>
    );
  }

  if (column === "url") {
    return (
      <td className={base}>
        <span className="block max-w-[10.5rem] truncate font-mono text-[12px] text-accent-ink">
          {row.url}
        </span>
      </td>
    );
  }

  if (column === "market") {
    return <td className={cn(base, "whitespace-nowrap")}>{row.market}</td>;
  }

  if (column === "category") {
    return <td className={cn(base, "whitespace-nowrap")}>{row.category}</td>;
  }

  if (column === "contact") {
    return (
      <td
        className={cn(base, "whitespace-nowrap font-mono text-[12px] text-muted")}
      >
        {row.contact}
      </td>
    );
  }

  if (column === "researched") {
    return <td className={cn(base, "whitespace-nowrap")}>{row.researched}</td>;
  }

  if (column === "opportunity") {
    return (
      <td
        className={cn(
          base,
          "min-w-[8rem] max-w-[14rem] leading-snug",
          selected && "sheet-cell-selected",
        )}
      >
        {row.opportunity}
      </td>
    );
  }

  return (
    <td className={base}>
      <StatusChip status={row.status} dense={dense} />
    </td>
  );
}
