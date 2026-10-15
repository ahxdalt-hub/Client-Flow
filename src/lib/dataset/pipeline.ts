/**
 * Dataset pipeline: read CSV → validate → (optional) probe URLs → export
 * consistent UTF-8 CSV + XLSX and a JSON validation report.
 *
 * Export policy: if validation finds errors, no export files are written
 * (unless `allowInvalid` is set) so broken data can never silently become the
 * paid product. Warnings never block an export.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCsv, serializeCsv } from "./csv.ts";
import { DATASET_FIELDS, INTERNAL_FIELDS, type DatasetColumn } from "./schema.ts";
import {
  addManualReviewEntries,
  validateDataset,
  type ValidationReport,
} from "./validate.ts";
import { probeUrls, type UrlProbe } from "./url-check.ts";
import { buildXlsx } from "./xlsx.ts";

export type PipelineOptions = {
  /** Path of the source CSV to validate. */
  input: string;
  /** Directory that receives the exports and the report. */
  outDir: string;
  /** Output file prefix, e.g. `marketloom-shopify-research-v1`. */
  prefix?: string;
  fixtureData?: boolean;
  includeInternal?: boolean;
  /** Probe store URLs and record failures for manual review. */
  checkUrls?: boolean;
  /** Export valid rows even when the file has errors (never the default). */
  allowInvalid?: boolean;
  now?: Date;
  probe?: (urls: string[]) => Promise<UrlProbe[]>;
};

export type PipelineResult = {
  report: ValidationReport;
  reportPath: string;
  csvPath?: string;
  xlsxPath?: string;
  /** 0 = exports written, 1 = validation failed, 2 = pipeline error. */
  exitCode: number;
  status: "exported" | "exported_with_errors" | "validation_failed";
};

function columnsFor(includeInternal: boolean): DatasetColumn[] {
  return includeInternal
    ? [...DATASET_FIELDS, ...INTERNAL_FIELDS]
    : [...DATASET_FIELDS];
}

export async function runDatasetPipeline(
  options: PipelineOptions,
): Promise<PipelineResult> {
  const prefix = options.prefix ?? "marketloom-shopify-research-v1";
  const source = await readFile(options.input, "utf8");
  const table = parseCsv(source);

  const { report, rows } = validateDataset(table, {
    source: options.input,
    fixtureData: options.fixtureData ?? false,
    now: options.now,
  });

  if (options.checkUrls) {
    const lineByUrl = new Map<string, number[]>();
    for (const row of rows) {
      const url = row.values.store_url;
      if (!url) continue;
      const lines = lineByUrl.get(url) ?? [];
      lines.push(row.line);
      lineByUrl.set(url, lines);
    }

    const probe = options.probe ?? ((urls: string[]) => probeUrls(urls));
    const probes = await probe([...lineByUrl.keys()]);
    addManualReviewEntries(
      report,
      probes
        .filter((entry) => entry.needsManualReview)
        .map((entry) => ({
          lines: lineByUrl.get(entry.url) ?? [],
          url: entry.url,
          reason: `${entry.outcome}: ${entry.detail}`,
        })),
    );
  }

  await mkdir(options.outDir, { recursive: true });
  const reportPath = path.join(options.outDir, `${prefix}-validation-report.json`);

  const hasErrors = report.errors.length > 0;
  if (hasErrors && !options.allowInvalid) {
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    return {
      report,
      reportPath,
      exitCode: 1,
      status: "validation_failed",
    };
  }

  const columns = columnsFor(options.includeInternal ?? false);
  const header = [...columns];
  const table2 = rows.map((row) =>
    columns.map((column) => {
      if ((DATASET_FIELDS as readonly string[]).includes(column)) {
        return row.values[column as keyof typeof row.values] ?? "";
      }
      return row.internal[column as keyof typeof row.internal] ?? "";
    }),
  );

  const csv = serializeCsv(header, table2);
  const xlsx = buildXlsx(header, table2);

  const csvPath = path.join(options.outDir, `${prefix}.csv`);
  const xlsxPath = path.join(options.outDir, `${prefix}.xlsx`);
  await writeFile(csvPath, csv, "utf8");
  await writeFile(xlsxPath, xlsx);

  report.exports = {
    csvPath,
    xlsxPath,
    recordCount: table2.length,
    columnCount: header.length,
    csvBytes: Buffer.byteLength(csv, "utf8"),
    xlsxBytes: xlsx.byteLength,
    internalColumnsIncluded: options.includeInternal ?? false,
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return {
    report,
    reportPath,
    csvPath,
    xlsxPath,
    exitCode: 0,
    status: hasErrors ? "exported_with_errors" : "exported",
  };
}
