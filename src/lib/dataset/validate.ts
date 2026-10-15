/**
 * Dataset validation engine.
 *
 * Produces a machine-readable validation report (row counts, duplicate counts,
 * missing fields, per-row errors) plus the normalised rows that the exporter
 * writes to CSV/XLSX. Nothing here touches the network: URL reachability is an
 * optional, separate step (`url-check.ts`) whose failures are reported for
 * manual review and never treated as proof that a store is invalid.
 */

import {
  ALL_COLUMNS,
  DATASET_FIELDS,
  INTERNAL_FIELDS,
  RESEARCH_STATUSES,
  isTwoLetterMarketCode,
  normalizeCell,
  parseContactPageUrl,
  parseResearchDate,
  parseStoreUrl,
  type DatasetField,
  type InternalField,
} from "./schema.ts";
import type { ParsedCsv } from "./csv.ts";

export type IssueSeverity = "error" | "warning";

export type Issue = {
  severity: IssueSeverity;
  /** 1-based CSV line number where the problem was found. */
  line: number;
  field?: string;
  code: string;
  message: string;
};

export type DuplicateGroup = {
  key: string;
  lines: number[];
};

export type ManualReviewEntry = {
  lines: number[];
  url: string;
  reason: string;
};

export type ValidationReport = {
  generatedAt: string;
  source: string;
  fixtureData: boolean;
  columns: {
    expected: string[];
    found: string[];
    unknown: string[];
    missingRequired: string[];
  };
  rowCounts: {
    total: number;
    valid: number;
    invalid: number;
  };
  duplicates: {
    storeUrlCount: number;
    storeUrls: DuplicateGroup[];
    recordCount: number;
    records: DuplicateGroup[];
  };
  missingFields: Record<string, number>;
  errors: Issue[];
  warnings: Issue[];
  manualReview: {
    count: number;
    entries: ManualReviewEntry[];
  };
  /** Filled in by the pipeline once export files are written. */
  exports?: {
    csvPath: string;
    xlsxPath: string;
    recordCount: number;
    columnCount: number;
    csvBytes: number;
    xlsxBytes: number;
    internalColumnsIncluded: boolean;
  };
};

export type ValidatedRow = {
  line: number;
  values: Record<DatasetField, string>;
  internal: Partial<Record<InternalField, string>>;
  valid: boolean;
};

export type ValidationResult = {
  report: ValidationReport;
  rows: ValidatedRow[];
};

export type ValidateOptions = {
  source?: string;
  fixtureData?: boolean;
  now?: Date;
};

const FORMULA_PREFIX = /^[=+\t\r@]/;
const RESERVED_HOST = /^(?:[^.]+\.)?example\.(?:com|org|net|test|invalid|example)$/i;
const RESERVED_HOST_SUFFIX = /\.(?:example|test|invalid|localhost)$/i;

function blankValues(): Record<DatasetField, string> {
  const out = {} as Record<DatasetField, string>;
  for (const field of DATASET_FIELDS) out[field] = "";
  return out;
}

/**
 * Validates a parsed CSV table. `header` must contain the canonical field
 * names; internal columns are optional.
 */
export function validateDataset(
  table: ParsedCsv,
  options: ValidateOptions = {},
): ValidationResult {
  const source = options.source ?? "in-memory";
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const missingFields: Record<string, number> = {};

  const header = table.header.map((cell) => normalizeCell(cell));
  const unknownColumns = header.filter(
    (column) => column !== "" && !(ALL_COLUMNS as readonly string[]).includes(column),
  );
  const missingRequired = DATASET_FIELDS.filter((field) => !header.includes(field));

  for (const column of unknownColumns) {
    warnings.push({
      severity: "warning",
      line: 1,
      field: column,
      code: "unknown_column",
      message: `Column "${column}" is not part of the dataset schema and is ignored.`,
    });
  }
  for (const field of missingRequired) {
    errors.push({
      severity: "error",
      line: 1,
      field,
      code: "missing_column",
      message: `Required column "${field}" is missing from the header.`,
    });
  }

  const rows: ValidatedRow[] = [];
  const urlIndex = new Map<string, number[]>();
  const recordIndex = new Map<string, number[]>();

  for (const record of table.rows) {
    const rowErrors: Issue[] = [];
    const values = blankValues();
    const internal: Partial<Record<InternalField, string>> = {};

    if (record.cells.length !== header.length) {
      rowErrors.push({
        severity: "error",
        line: record.line,
        code: "row_width_mismatch",
        message: `Row has ${record.cells.length} values but the header defines ${header.length}.`,
      });
    }

    header.forEach((column, index) => {
      const value = normalizeCell(record.cells[index] ?? "");
      if ((DATASET_FIELDS as readonly string[]).includes(column)) {
        values[column as DatasetField] = value;
      } else if ((INTERNAL_FIELDS as readonly string[]).includes(column)) {
        internal[column as InternalField] = value;
      }
    });

    for (const field of DATASET_FIELDS) {
      if (!values[field]) {
        rowErrors.push({
          severity: "error",
          line: record.line,
          field,
          code: "missing_field",
          message: `Required field "${field}" is empty.`,
        });
        missingFields[field] = (missingFields[field] ?? 0) + 1;
      }
    }

    const storeUrl = parseStoreUrl(values.store_url);
    let normalizedUrl = "";
    if (values.store_url) {
      if (storeUrl.ok) {
        normalizedUrl = storeUrl.normalized;
        if (RESERVED_HOST.test(new URL(normalizedUrl).hostname) ||
            RESERVED_HOST_SUFFIX.test(new URL(normalizedUrl).hostname)) {
          warnings.push({
            severity: "warning",
            line: record.line,
            field: "store_url",
            code: "reserved_domain",
            message:
              "Host uses a reserved documentation domain — this looks like fixture data, not a real store.",
          });
        }
      } else {
        rowErrors.push({
          severity: "error",
          line: record.line,
          field: "store_url",
          code: "invalid_url",
          message: `store_url: ${storeUrl.reason}.`,
        });
      }
    }

    if (values.public_contact_page_url) {
      const contact = parseContactPageUrl(values.public_contact_page_url);
      if (!contact.ok) {
        rowErrors.push({
          severity: "error",
          line: record.line,
          field: "public_contact_page_url",
          code: "invalid_url",
          message: `public_contact_page_url: ${contact.reason}.`,
        });
      }
    }

    let researchDate = values.research_date;
    if (researchDate) {
      const parsed = parseResearchDate(researchDate);
      if (!parsed.ok) {
        rowErrors.push({
          severity: "error",
          line: record.line,
          field: "research_date",
          code: "invalid_date",
          message: `research_date: ${parsed.reason}.`,
        });
      } else {
        if (parsed.changed) {
          warnings.push({
            severity: "warning",
            line: record.line,
            field: "research_date",
            code: "date_normalized",
            message: `research_date normalised from "${researchDate}" to "${parsed.iso}".`,
          });
        }
        researchDate = parsed.iso;
      }
    }

    if (
      values.research_status &&
      !(RESEARCH_STATUSES as readonly string[]).includes(values.research_status)
    ) {
      rowErrors.push({
        severity: "error",
        line: record.line,
        field: "research_status",
        code: "invalid_status",
        message: `research_status must be one of: ${RESEARCH_STATUSES.join(", ")}.`,
      });
    }

    const market = values.country_or_market;
    if (market && isTwoLetterMarketCode(market) && market !== market.toUpperCase()) {
      rowErrors.push({
        severity: "error",
        line: record.line,
        field: "country_or_market",
        code: "inconsistent_market",
        message: `Two-letter market codes must be uppercase (received "${market}").`,
      });
    }

    for (const field of DATASET_FIELDS) {
      const value = values[field];
      if (field === "opportunity_notes" && FORMULA_PREFIX.test(value)) {
        warnings.push({
          severity: "warning",
          line: record.line,
          field,
          code: "formula_prefix",
          message:
            `Value starts with "${value[0]}" which spreadsheet apps may treat as a formula.`,
        });
      }
      if (value.length > 500) {
        warnings.push({
          severity: "warning",
          line: record.line,
          field,
          code: "value_too_long",
          message: `Value is ${value.length} characters long; consider shortening it.`,
        });
      }
    }

    if (values.store_name && values.store_name.length > 120) {
      warnings.push({
        severity: "warning",
        line: record.line,
        field: "store_name",
        code: "value_too_long",
        message: `store_name is ${values.store_name.length} characters long.`,
      });
    }

    errors.push(...rowErrors);

    if (normalizedUrl) {
      const lines = urlIndex.get(normalizedUrl) ?? [];
      lines.push(record.line);
      urlIndex.set(normalizedUrl, lines);
    }

    const recordKey = DATASET_FIELDS.map((field) =>
      field === "research_date" ? researchDate : values[field],
    )
      .join("\u0000")
      .toLowerCase();
    const keyLines = recordIndex.get(recordKey) ?? [];
    keyLines.push(record.line);
    recordIndex.set(recordKey, keyLines);

    rows.push({
      line: record.line,
      values: { ...values, research_date: researchDate },
      internal,
      valid: rowErrors.length === 0,
    });
  }

  const storeUrls: DuplicateGroup[] = [];
  for (const [key, lines] of urlIndex) {
    if (lines.length > 1) {
      storeUrls.push({ key, lines: [...lines] });
      for (const line of lines) {
        errors.push({
          severity: "error",
          line,
          field: "store_url",
          code: "duplicate_store_url",
          message: `store_url "${key}" appears ${lines.length} times (lines ${lines.join(", ")}).`,
        });
      }
    }
  }

  const records: DuplicateGroup[] = [];
  for (const [key, lines] of recordIndex) {
    if (lines.length > 1) {
      records.push({ key, lines: [...lines] });
      for (const line of lines) {
        errors.push({
          severity: "error",
          line,
          code: "duplicate_record",
          message: `Duplicate record (identical field values) on lines ${lines.join(", ")}.`,
        });
      }
    }
  }

  // Rows flagged by a duplicate error are no longer exportable.
  const errorLines = new Set(
    errors.filter((issue) => issue.severity === "error").map((issue) => issue.line),
  );
  for (const row of rows) {
    if (errorLines.has(row.line)) row.valid = false;
  }

  const validRows = rows.filter((row) => row.valid);
  const report: ValidationReport = {
    generatedAt: (options.now ?? new Date()).toISOString(),
    source,
    fixtureData: options.fixtureData ?? false,
    columns: {
      expected: [...DATASET_FIELDS],
      found: header,
      unknown: unknownColumns,
      missingRequired: [...missingRequired],
    },
    rowCounts: {
      total: rows.length,
      valid: validRows.length,
      invalid: rows.length - validRows.length,
    },
    duplicates: {
      storeUrlCount: storeUrls.length,
      storeUrls,
      recordCount: records.length,
      records,
    },
    missingFields,
    errors,
    warnings,
    manualReview: { count: 0, entries: [] },
  };

  return { report, rows: validRows };
}

/**
 * Attaches URL reachability findings as *manual review* items. A request that
 * fails, times out, or is blocked is never converted into a validation error —
 * only a human can decide whether a store is reachable.
 */
export function addManualReviewEntries(
  report: ValidationReport,
  entries: ManualReviewEntry[],
): void {
  for (const entry of entries) {
    const existing = report.manualReview.entries.find(
      (candidate) => candidate.url === entry.url,
    );
    if (existing) {
      for (const line of entry.lines) {
        if (!existing.lines.includes(line)) existing.lines.push(line);
      }
      continue;
    }
    report.manualReview.entries.push(entry);
  }
  report.manualReview.count = report.manualReview.entries.length;
}
