import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCsv, serializeCsv } from "./csv.ts";
import {
  DATASET_FIELDS,
  RESEARCH_STATUSES,
  parseContactPageUrl,
  parseResearchDate,
  parseStoreUrl,
  type DatasetField,
} from "./schema.ts";
import {
  addManualReviewEntries,
  validateDataset,
  type ManualReviewEntry,
} from "./validate.ts";

type RowInput = Partial<Record<DatasetField, string>>;

const COMPLETE_ROW: Record<DatasetField, string> = {
  store_name: "Example Store",
  store_url: "https://example-store.example",
  country_or_market: "IN",
  store_category: "Home & garden",
  public_contact_page_url: "/pages/contact",
  research_date: "2026-09-12",
  opportunity_notes: "Mobile menu missing collections links",
  research_status: "to-review",
};

function buildCsv(rows: RowInput[]): string {
  return serializeCsv(
    [...DATASET_FIELDS],
    rows.map((row) => {
      const merged = { ...COMPLETE_ROW, ...row };
      return DATASET_FIELDS.map((field) => merged[field] ?? "");
    }),
  );
}

function validateRows(rows: RowInput[]) {
  return validateDataset(parseCsv(buildCsv(rows)), { source: "test" });
}

describe("parseStoreUrl", () => {
  it("accepts absolute http(s) URLs and normalises host case", () => {
    const result = parseStoreUrl("https://Example-Store.com/");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.normalized, "https://example-store.com");
  });

  it("rejects values without a scheme", () => {
    const result = parseStoreUrl("example-store.com");
    assert.equal(result.ok, false);
  });

  it("rejects whitespace, unparseable, and non-http protocols", () => {
    assert.equal(parseStoreUrl("https://a.example/x y").ok, false);
    assert.equal(parseStoreUrl("https://").ok, false);
    assert.equal(parseStoreUrl("ftp://files.example").ok, false);
    assert.equal(parseStoreUrl("").ok, false);
  });
});

describe("parseContactPageUrl", () => {
  it("accepts absolute URLs and site-relative paths", () => {
    assert.equal(parseContactPageUrl("https://a.example/contact").ok, true);
    const relative = parseContactPageUrl("/pages/contact");
    assert.equal(relative.ok, true);
    if (relative.ok) assert.equal(relative.kind, "site_relative");
  });

  it("rejects bare hosts and protocol-relative URLs", () => {
    assert.equal(parseContactPageUrl("pages/contact").ok, false);
    assert.equal(parseContactPageUrl("//evil.example/contact").ok, false);
  });
});

describe("parseResearchDate", () => {
  it("accepts ISO dates unchanged", () => {
    const result = parseResearchDate("2026-09-12");
    assert.deepEqual(result, { ok: true, iso: "2026-09-12", changed: false });
  });

  it("normalises display dates to ISO", () => {
    const result = parseResearchDate("12 Sep 2026");
    assert.deepEqual(result, { ok: true, iso: "2026-09-12", changed: true });
  });

  it("rejects impossible and malformed dates", () => {
    assert.equal(parseResearchDate("2026-02-30").ok, false);
    assert.equal(parseResearchDate("2026-13-01").ok, false);
    assert.equal(parseResearchDate("soon").ok, false);
    assert.equal(parseResearchDate("").ok, false);
  });
});

describe("validateDataset", () => {
  it("accepts a clean file and reports row counts", () => {
    const { report, rows } = validateRows([{}, { store_name: "Second Store" }]);
    assert.equal(report.rowCounts.total, 2);
    assert.equal(report.rowCounts.valid, 2);
    assert.equal(report.rowCounts.invalid, 0);
    assert.equal(report.errors.length, 0);
    assert.equal(rows.length, 2);
  });

  it("detects duplicate store URLs across rows", () => {
    const { report, rows } = validateRows([
      { store_url: "https://dupe.example" },
      { store_url: "https://dupe.example/" },
      { store_url: "https://other.example" },
    ]);
    assert.equal(report.duplicates.storeUrlCount, 1);
    assert.deepEqual(report.duplicates.storeUrls[0]?.lines, [2, 3]);
    assert.equal(report.rowCounts.invalid, 2);
    assert.equal(rows.length, 1);
    assert.ok(
      report.errors.some(
        (issue) =>
          issue.code === "duplicate_store_url" && issue.line === 3,
      ),
    );
  });

  it("detects duplicate records with identical field values", () => {
    const { report } = validateRows([{}, {}]);
    assert.equal(report.duplicates.recordCount, 1);
    assert.deepEqual(report.duplicates.records[0]?.lines, [2, 3]);
    assert.ok(report.errors.some((issue) => issue.code === "duplicate_record"));
    assert.equal(report.rowCounts.invalid, 2);
  });

  it("reports missing required fields per field and per row", () => {
    const { report } = validateRows([
      { store_name: "", research_status: "" },
      { opportunity_notes: "" },
    ]);
    assert.equal(report.missingFields.store_name, 1);
    assert.equal(report.missingFields.research_status, 1);
    assert.equal(report.missingFields.opportunity_notes, 1);
    assert.equal(report.rowCounts.invalid, 2);
    assert.equal(report.rowCounts.valid, 0);
    const issue = report.errors.find((e) => e.field === "store_name");
    assert.equal(issue?.code, "missing_field");
    assert.equal(issue?.line, 2);
  });

  it("flags invalid store and contact URLs", () => {
    const { report } = validateRows([
      { store_url: "no-scheme.example", public_contact_page_url: "contact" },
    ]);
    const codes = report.errors.map((issue) => issue.code);
    assert.equal(codes.filter((code) => code === "invalid_url").length, 2);
    assert.equal(report.rowCounts.invalid, 1);
  });

  it("flags invalid research dates and unknown statuses", () => {
    const { report } = validateRows([
      { research_date: "not-a-date", research_status: "done" },
    ]);
    assert.ok(report.errors.some((issue) => issue.code === "invalid_date"));
    assert.ok(report.errors.some((issue) => issue.code === "invalid_status"));
    assert.ok(
      (RESEARCH_STATUSES as readonly string[]).includes("reviewed"),
    );
  });

  it("normalises display dates and warns instead of failing", () => {
    const { report, rows } = validateRows([{ research_date: "12 Sep 2026" }]);
    assert.equal(report.rowCounts.invalid, 0);
    assert.equal(rows[0]?.values.research_date, "2026-09-12");
    assert.ok(report.warnings.some((issue) => issue.code === "date_normalized"));
  });

  it("rejects inconsistent lower-case market codes", () => {
    const { report } = validateRows([{ country_or_market: "in" }]);
    assert.ok(report.errors.some((issue) => issue.code === "inconsistent_market"));
    const ok = validateRows([{ country_or_market: "India" }]);
    assert.equal(ok.report.rowCounts.invalid, 0);
  });

  it("reports a missing required column", () => {
    const table = parseCsv("store_name,store_url\nAlpha,https://a.example\n");
    const { report } = validateDataset(table, { source: "missing-columns" });
    assert.ok(report.columns.missingRequired.includes("research_date"));
    assert.ok(report.errors.some((issue) => issue.code === "missing_column"));
    assert.equal(report.rowCounts.total, 0);
  });

  it("warns on unknown columns without failing rows", () => {
    const withExtra = serializeCsv([...DATASET_FIELDS, "extra_column"], [
      [...DATASET_FIELDS.map((field) => COMPLETE_ROW[field]), "ignored"],
    ]);
    const { report } = validateDataset(parseCsv(withExtra), { source: "extra" });
    assert.deepEqual(report.columns.unknown, ["extra_column"]);
    assert.ok(report.warnings.some((issue) => issue.code === "unknown_column"));
    assert.equal(report.rowCounts.invalid, 0);
  });

  it("flags spreadsheet formula prefixes as warnings", () => {
    const { report } = validateRows([
      { opportunity_notes: "=HYPERLINK(\"http://evil.example\")" },
    ]);
    assert.ok(report.warnings.some((issue) => issue.code === "formula_prefix"));
    assert.equal(report.rowCounts.invalid, 0);
  });

  it("marks rows as invalid when any error exists on the line", () => {
    const { rows } = validateRows([
      { research_status: "bogus" },
      {},
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.line, 3);
  });
});

describe("manual review entries", () => {
  it("records probe failures without creating validation errors", () => {
    const { report } = validateRows([{}]);
    const entries: ManualReviewEntry[] = [
      {
        lines: [2],
        url: "https://example-store.example",
        reason: "timeout: no response within 8000ms",
      },
    ];
    addManualReviewEntries(report, entries);
    addManualReviewEntries(report, entries); // de-duplicated by URL
    assert.equal(report.manualReview.count, 1);
    assert.deepEqual(report.manualReview.entries[0]?.lines, [2]);
    assert.equal(report.errors.length, 0);
    assert.equal(report.rowCounts.valid, 1);
  });
});

describe("csv round-trip", () => {
  it("preserves quotes, commas, newlines, and CRLF", () => {
    const header = ["a", "b", "c"];
    const rows = [
      ['plain', 'has,comma', 'has "quote"'],
      ["multi\nline", " leading space ", "trailing space "],
    ];
    const csv = serializeCsv(header, rows);
    assert.ok(csv.includes("\r\n"));
    const parsed = parseCsv(csv);
    assert.deepEqual(parsed.header, header);
    assert.deepEqual(
      parsed.rows.map((row) => row.cells),
      rows,
    );
  });

  it("strips a UTF-8 BOM when reading", () => {
    const parsed = parseCsv("\uFEFFstore_name\nAlpha\n");
    assert.deepEqual(parsed.header, ["store_name"]);
    assert.equal(parsed.rows.length, 1);
  });

  it("reports the source line number of each record", () => {
    const parsed = parseCsv('store_name\r\n"Alpha"\r\n\r\n"Beta"\r\n');
    assert.deepEqual(
      parsed.rows.map((row) => row.line),
      [2, 4],
    );
  });
});
