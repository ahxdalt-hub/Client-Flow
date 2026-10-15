/**
 * Dataset CLI: validate a research CSV and export the customer-facing
 * CSV/XLSX plus a JSON validation report.
 *
 * Usage:
 *   node scripts/dataset/run.ts --input <file.csv> [options]
 *
 * Options:
 *   --out-dir <dir>       Output directory (default: dist/dataset)
 *   --prefix <name>       Output file prefix (default: marketloom-shopify-research-v1)
 *   --fixture             Mark the report as fixture/test data
 *   --include-internal    Keep source_reference / qc_notes in the export
 *   --check-urls          Probe store URLs (failures go to manual review only)
 *   --allow-invalid       Export valid rows even when errors exist
 *
 * Exit codes: 0 exports written · 1 validation failed · 2 usage/pipeline error.
 */

import path from "node:path";
import process from "node:process";

import { runDatasetPipeline } from "../../src/lib/dataset/pipeline.ts";

type Args = {
  input?: string;
  outDir: string;
  prefix: string;
  fixture: boolean;
  includeInternal: boolean;
  checkUrls: boolean;
  allowInvalid: boolean;
};

function parseArgs(argv: string[]): Args | { error: string } {
  const args: Args = {
    outDir: "dist/dataset",
    prefix: "marketloom-shopify-research-v1",
    fixture: false,
    includeInternal: false,
    checkUrls: false,
    allowInvalid: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case "--input":
        if (!value) return { error: "--input requires a path" };
        args.input = value;
        i += 1;
        break;
      case "--out-dir":
        if (!value) return { error: "--out-dir requires a path" };
        args.outDir = value;
        i += 1;
        break;
      case "--prefix":
        if (!value) return { error: "--prefix requires a value" };
        args.prefix = value;
        i += 1;
        break;
      case "--fixture":
        args.fixture = true;
        break;
      case "--include-internal":
        args.includeInternal = true;
        break;
      case "--check-urls":
        args.checkUrls = true;
        break;
      case "--allow-invalid":
        args.allowInvalid = true;
        break;
      case "--help":
      case "-h":
        return { error: "help" };
      default:
        return { error: `unknown argument: ${flag}` };
    }
  }

  if (!args.input) return { error: "--input is required" };
  return args;
}

function printSummary(result: Awaited<ReturnType<typeof runDatasetPipeline>>): void {
  const { report } = result;
  const lines = [
    `Source:          ${report.source}${report.fixtureData ? "  (FIXTURE DATA)" : ""}`,
    `Rows:            ${report.rowCounts.total} total · ${report.rowCounts.valid} valid · ${report.rowCounts.invalid} invalid`,
    `Duplicate URLs:  ${report.duplicates.storeUrlCount}`,
    `Duplicate rows:  ${report.duplicates.recordCount}`,
    `Errors:          ${report.errors.length}`,
    `Warnings:        ${report.warnings.length}`,
    `Manual review:   ${report.manualReview.count} URL(s)`,
  ];

  const missing = Object.entries(report.missingFields);
  if (missing.length > 0) {
    lines.push(
      `Missing fields:  ${missing.map(([field, count]) => `${field}=${count}`).join(", ")}`,
    );
  }
  if (report.columns.missingRequired.length > 0) {
    lines.push(`Missing columns: ${report.columns.missingRequired.join(", ")}`);
  }
  if (report.exports) {
    lines.push(
      `Exports:         ${report.exports.csvPath} (${report.exports.csvBytes} bytes)`,
      `                 ${report.exports.xlsxPath} (${report.exports.xlsxBytes} bytes)`,
      `Records exported: ${report.exports.recordCount} × ${report.exports.columnCount} columns`,
    );
  }
  lines.push(`Report:          ${result.reportPath}`);
  lines.push(`Status:          ${result.status}`);

  console.log(lines.join("\n"));

  const notable = [...report.errors.slice(0, 20), ...report.warnings.slice(0, 10)];
  if (notable.length > 0) {
    console.log("\nFindings:");
    for (const issue of notable) {
      console.log(
        `  [${issue.severity}] line ${issue.line}${issue.field ? ` (${issue.field})` : ""} ${issue.code}: ${issue.message}`,
      );
    }
    const remaining = report.errors.length - 20;
    if (remaining > 0) console.log(`  … and ${remaining} more error(s)`);
  }

  if (report.manualReview.entries.length > 0) {
    console.log("\nManual review (a failed request is not proof a store is invalid):");
    for (const entry of report.manualReview.entries) {
      console.log(`  ${entry.url} — ${entry.reason}`);
    }
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  if ("error" in parsed) {
    if (parsed.error !== "help") console.error(`Error: ${parsed.error}\n`);
    console.error(
      "Usage: node scripts/dataset/run.ts --input <file.csv> [--out-dir <dir>] [--prefix <name>]\n" +
        "                                 [--fixture] [--include-internal] [--check-urls] [--allow-invalid]",
    );
    process.exitCode = parsed.error === "help" ? 0 : 2;
    return;
  }

  if (!parsed.input) {
    console.error("Error: --input is required\n");
    console.error(
      "Usage: node scripts/dataset/run.ts --input <file.csv> [--out-dir <dir>] [--prefix <name>]\n" +
        "                                 [--fixture] [--include-internal] [--check-urls] [--allow-invalid]",
    );
    process.exitCode = 2;
    return;
  }

  try {
    const result = await runDatasetPipeline({
      input: path.resolve(parsed.input),
      outDir: path.resolve(parsed.outDir),
      prefix: parsed.prefix,
      fixtureData: parsed.fixture,
      includeInternal: parsed.includeInternal,
      checkUrls: parsed.checkUrls,
      allowInvalid: parsed.allowInvalid,
    });
    printSummary(result);
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error("Pipeline failed:", error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}

void main();
