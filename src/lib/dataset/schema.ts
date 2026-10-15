/**
 * Canonical Marketloom dataset schema.
 *
 * Customer-facing fields are exactly the eight published columns, in a fixed
 * order. Internal research bookkeeping (source references, QC notes) is kept
 * in a separate list so it can be carried through validation but stripped from
 * customer exports by default.
 *
 * This module is intentionally dependency-free (no `server-only`, no framework
 * imports) so the validation pipeline and its tests can run under `node --test`.
 */

export const DATASET_FIELDS = [
  "store_name",
  "store_url",
  "country_or_market",
  "store_category",
  "public_contact_page_url",
  "research_date",
  "opportunity_notes",
  "research_status",
] as const;

export type DatasetField = (typeof DATASET_FIELDS)[number];

/**
 * Internal-only columns. Never exported to customers unless the pipeline is
 * explicitly run with `--include-internal`.
 */
export const INTERNAL_FIELDS = ["source_reference", "qc_notes"] as const;

export type InternalField = (typeof INTERNAL_FIELDS)[number];

export type DatasetColumn = DatasetField | InternalField;

export const RESEARCH_STATUSES = ["queued", "to-review", "reviewed"] as const;
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

/** Every column the pipeline understands, customer-facing order first. */
export const ALL_COLUMNS: DatasetColumn[] = [
  ...DATASET_FIELDS,
  ...INTERNAL_FIELDS,
];

/**
 * Two-letter market codes are normalised to uppercase ISO-3166 alpha-2 style
 * values; anything else is treated as a free-text market name.
 */
const TWO_LETTER_CODE = /^[A-Za-z]{2}$/;

export function isTwoLetterMarketCode(value: string): boolean {
  return TWO_LETTER_CODE.test(value.trim());
}

/**
 * Accepted research-date inputs. Exports always normalise to ISO `YYYY-MM-DD`
 * so CSV and XLSX agree byte-for-byte on values.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

export type DateParseResult =
  | { ok: true; iso: string; changed: boolean }
  | { ok: false; reason: string };

/**
 * Parses `YYYY-MM-DD` or `12 Sep 2026` (and `12 September 2026`) and returns
 * the canonical ISO date. Rejects impossible calendar dates such as
 * `2026-02-30`.
 */
export function parseResearchDate(raw: string): DateParseResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: "empty" };

  if (ISO_DATE.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const consistent =
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d;
    if (!consistent) return { ok: false, reason: "not a real calendar date" };
    return { ok: true, iso: value, changed: false };
  }

  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const monthIndex = MONTHS.indexOf(
      match[2].slice(0, 3).toLowerCase() as (typeof MONTHS)[number],
    );
    if (monthIndex === -1) {
      return { ok: false, reason: "unrecognised month name" };
    }
    const year = Number(match[3]);
    const date = new Date(Date.UTC(year, monthIndex, day));
    if (date.getUTCDate() !== day) {
      return { ok: false, reason: "not a real calendar date" };
    }
    const iso = [
      String(year).padStart(4, "0"),
      String(monthIndex + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");
    return { ok: true, iso, changed: iso !== value };
  }

  return { ok: false, reason: "expected YYYY-MM-DD or 'D MMM YYYY'" };
}

export type UrlCheckResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: string };

/**
 * Store URLs must be absolute http(s) URLs. Hosts are lower-cased and a
 * trailing slash on the root path is dropped so duplicate detection compares
 * like with like.
 */
export function parseStoreUrl(raw: string): UrlCheckResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: "empty" };
  if (/\s/.test(value)) return { ok: false, reason: "contains whitespace" };
  if (!/^https?:\/\//i.test(value)) {
    return { ok: false, reason: "missing http:// or https:// scheme" };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "not parseable as a URL" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "only http(s) URLs are accepted" };
  }
  if (!url.hostname.includes(".") || url.hostname.endsWith(".")) {
    return { ok: false, reason: "host must contain a domain name" };
  }

  url.hostname = url.hostname.toLowerCase();
  let normalized = url.toString();
  if (url.pathname === "/" && !url.search && !url.hash) {
    normalized = `${url.protocol}//${url.host}`;
  }
  return { ok: true, normalized };
}

export type ContactPageCheckResult =
  | { ok: true; normalized: string; kind: "absolute" | "site_relative" }
  | { ok: false; reason: string };

/**
 * Public contact pages may be absolute URLs or paths on the store's own site
 * (`/pages/contact`). Relative paths are relative to the row's store URL.
 */
export function parseContactPageUrl(raw: string): ContactPageCheckResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: "empty" };
  if (/\s/.test(value)) return { ok: false, reason: "contains whitespace" };

  if (/^https?:\/\//i.test(value)) {
    const absolute = parseStoreUrl(value);
    if (!absolute.ok) return { ok: false, reason: absolute.reason };
    return { ok: true, normalized: absolute.normalized, kind: "absolute" };
  }

  if (!value.startsWith("/")) {
    return {
      ok: false,
      reason: "must be an absolute http(s) URL or a path starting with /",
    };
  }
  if (value.startsWith("//")) {
    return { ok: false, reason: "protocol-relative URLs are not accepted" };
  }
  return { ok: true, normalized: value, kind: "site_relative" };
}

/** Case-insensitive field trimming used everywhere values are compared. */
export function normalizeCell(value: string): string {
  return value.replace(/^\uFEFF/, "").trim();
}
