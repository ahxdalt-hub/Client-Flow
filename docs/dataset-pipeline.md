# Dataset pipeline

Turns raw research rows into validated, customer-facing CSV/XLSX exports plus
a JSON validation report. The pipeline **validates and normalises — it never
invents, fills, or guesses data.** Any row with an error is excluded from the
export unless `--allow-invalid` is passed explicitly.

## Run it

```bash
# Validate a research CSV and write exports + report to dist/dataset/
npm run dataset -- --input path/to/research.csv

# Typical release run
npm run dataset -- \
  --input path/to/research.csv \
  --out-dir dist/dataset \
  --prefix marketloom-shopify-research-v1 \
  --check-urls

# Demo/fixture run (clearly labelled as fixture data)
npm run dataset -- --input scripts/dataset/fixtures/fictional-records.csv --fixture
```

| Flag | Effect |
| ---- | ------ |
| `--input <file>` | Source CSV (required) |
| `--out-dir <dir>` | Output directory (default `dist/dataset`) |
| `--prefix <name>` | Output file prefix (default `marketloom-shopify-research-v1`) |
| `--fixture` | Marks the report as fixture/test data |
| `--include-internal` | Keeps `source_reference` / `qc_notes` in the export |
| `--check-urls` | Probes store URLs; failures go to manual review only |
| `--allow-invalid` | Exports valid rows even when errors exist (never use for a release) |

Exit codes: `0` exports written · `1` validation failed · `2` usage/pipeline error.

## Input schema

Customer-facing columns, in this exact order:

| Column | Rules |
| ------ | ----- |
| `store_name` | Required, non-empty |
| `store_url` | Required, absolute `http(s)://` URL; host lower-cased, root slash dropped for duplicate comparison |
| `country_or_market` | Two-letter codes normalised to uppercase (e.g. `in` → `IN`); other values kept as free text |
| `store_category` | Required, free text |
| `public_contact_page_url` | Absolute `http(s)` URL **or** a `/site-relative` path on the store's own domain |
| `research_date` | `YYYY-MM-DD` (canonical) or `D MMM YYYY` (normalised with a warning); impossible dates rejected |
| `opportunity_notes` | Required, free text |
| `research_status` | One of `queued`, `to-review`, `reviewed` |

Internal columns (validated, stripped from exports unless `--include-internal`):
`source_reference`, `qc_notes`.

Values are trimmed and BOM-stripped; cells starting with `= + - @` are
rejected (`formula_prefix`) so exports can't carry spreadsheet formulas.
Unknown columns are reported (`unknown_column`) rather than silently dropped.

## Findings: errors vs warnings vs manual review

- **Errors** block the export: missing/unknown columns, row width mismatches,
  missing fields, invalid URLs/dates/statuses, reserved-domain URLs
  (`.example`, `example.com`, …), formula prefixes, over-long values,
  duplicate store URLs, and duplicate records. Every row involved in a
  duplicate is marked invalid.
- **Warnings** never block: date normalisation notes, inconsistent market
  notation, reserved-domain notices on fixture data.
- **Manual review** (`--check-urls`): store/contact URLs are probed with
  HEAD, falling back to GET. A failed request is *not* proof a store is
  invalid (bots, geo-blocking), so failures are listed for a human to check —
  they never become validation errors.

## Outputs

Given `--prefix marketloom-shopify-research-v1`:

- `marketloom-shopify-research-v1.csv` — RFC 4180, CRLF line endings, no BOM,
  eight customer columns in fixed order
- `marketloom-shopify-research-v1.xlsx` — dependency-free XLSX writer, all
  cells stored as inline strings, same values as the CSV byte-for-byte
- `marketloom-shopify-research-v1-validation-report.json` — source, fixture
  flag, row counts (total/valid/invalid), duplicate stats, missing-field
  counts, every error/warning with line + field + code, manual-review
  entries, export byte sizes, and the run status

## Release flow

1. Run the pipeline on the real research CSV; fix every error and re-run.
2. Read the report — never ship `--allow-invalid` output.
3. Upload the CSV/XLSX to the **private** `product-downloads` bucket under a
   versioned prefix: `marketloom/v1/marketloom-shopify-research-v1.csv|.xlsx`
   (see `docs/storage.md`).
4. Register a `product_versions` row (CSV/XLSX paths, record count,
   `is_current = true`), which retires the previous current version.
5. Keep `PRODUCT_FILES` in `src/config/site.ts` in sync for unpinned
   fallback, and set `PRODUCT.version` only to the real released version.

Fixture data (`scripts/dataset/fixtures/fictional-records.csv`) uses reserved
`.example` domains, is always run with `--fixture`, and must never be
uploaded to the real product path.

## Tests

- `src/lib/dataset/validate.test.ts` — field/date/URL/duplicate rules
- `src/lib/dataset/pipeline.test.ts` — export gating, report contents,
  CSV/XLSX round-trips
- Run everything with `npm test`
