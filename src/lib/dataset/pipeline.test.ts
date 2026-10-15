import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { parseCsv } from "./csv.ts";
import { DATASET_FIELDS, INTERNAL_FIELDS } from "./schema.ts";
import { runDatasetPipeline } from "./pipeline.ts";
import { probeUrls } from "./url-check.ts";
import { readXlsxTable } from "./xlsx.ts";

const FIXTURE_PATH = fileURLToPath(
  new URL("../../../scripts/dataset/fixtures/fictional-records.csv", import.meta.url),
);

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "marketloom-dataset-"));
}

describe("dataset pipeline exports", () => {
  it("exports consistent UTF-8 CSV and XLSX from the fixture", async () => {
    const outDir = await tempDir();
    try {
      const result = await runDatasetPipeline({
        input: FIXTURE_PATH,
        outDir,
        fixtureData: true,
        now: new Date("2026-10-15T00:00:00.000Z"),
      });

      assert.equal(result.exitCode, 0);
      assert.equal(result.status, "exported");
      assert.equal(result.report.errors.length, 0);
      assert.equal(result.report.fixtureData, true);

      const csv = await readFile(result.csvPath!, "utf8");
      const xlsx = await readFile(result.xlsxPath!);

      // UTF-8 without BOM, CRLF line endings.
      assert.equal(csv.charCodeAt(0), 0x73); // "s" of store_name
      assert.ok(csv.includes("\r\n"));

      const csvTable = parseCsv(csv);
      const xlsxTable = readXlsxTable(xlsx);

      assert.deepEqual(csvTable.header, [...DATASET_FIELDS]);
      assert.deepEqual(xlsxTable.header, csvTable.header);
      assert.equal(csvTable.rows.length, xlsxTable.rows.length);
      assert.equal(csvTable.rows.length, 8);
      csvTable.rows.forEach((row, index) => {
        assert.deepEqual(xlsxTable.rows[index], row.cells);
      });

      // Research dates normalised in both formats.
      const dateColumn = csvTable.header.indexOf("research_date");
      assert.equal(csvTable.rows[6]?.cells[dateColumn], "2026-09-15");

      // Internal columns are stripped unless explicitly requested.
      const headerColumns: string[] = csvTable.header;
      for (const column of INTERNAL_FIELDS) {
        const internalColumn: string = column;
        assert.ok(!headerColumns.includes(internalColumn));
      }

      assert.equal(result.report.exports?.recordCount, 8);
      assert.equal(result.report.exports?.internalColumnsIncluded, false);
      assert.equal(result.report.exports?.columnCount, 8);

      const reportOnDisk = JSON.parse(
        await readFile(result.reportPath, "utf8"),
      );
      assert.equal(reportOnDisk.rowCounts.valid, 8);
      assert.equal(reportOnDisk.fixtureData, true);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("keeps internal columns only when includeInternal is set", async () => {
    const outDir = await tempDir();
    try {
      const result = await runDatasetPipeline({
        input: FIXTURE_PATH,
        outDir,
        includeInternal: true,
        fixtureData: true,
      });
      assert.equal(result.exitCode, 0);
      const csv = await readFile(result.csvPath!, "utf8");
      const table = parseCsv(csv);
      assert.deepEqual(table.header, [...DATASET_FIELDS, ...INTERNAL_FIELDS]);
      assert.equal(result.report.exports?.internalColumnsIncluded, true);
      assert.ok(table.rows[0]?.cells.includes("internal:fixture/note-001"));

      const xlsxTable = readXlsxTable(await readFile(result.xlsxPath!));
      assert.deepEqual(xlsxTable.header, table.header);
      assert.deepEqual(xlsxTable.rows, table.rows.map((row) => row.cells));
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("refuses to export when validation finds errors", async () => {
    const outDir = await tempDir();
    try {
      const input = path.join(outDir, "broken.csv");
      const header = [...DATASET_FIELDS].join(",");
      const valid =
        "Alpha Store,https://alpha.example,IN,Home,/contact,2026-09-12,Note,to-review";
      const duplicate =
        "Alpha Store,https://alpha.example/,IN,Home,/contact,2026-09-12,Note,to-review";
      const missing =
        "Beta Store,,US,Beauty,/help,2026-09-13,Note,reviewed";
      await writeFile(
        input,
        `${header}\n${valid}\n${duplicate}\n${missing}\n`,
        "utf8",
      );

      const result = await runDatasetPipeline({ input, outDir });
      assert.equal(result.exitCode, 1);
      assert.equal(result.status, "validation_failed");
      assert.equal(result.csvPath, undefined);
      assert.equal(result.xlsxPath, undefined);

      const files = await readdir(outDir);
      assert.ok(!files.some((name) => name.endsWith(".csv") && name !== "broken.csv"));
      assert.ok(!files.some((name) => name.endsWith(".xlsx")));

      assert.equal(result.report.duplicates.storeUrlCount, 1);
      assert.equal(result.report.missingFields.store_url, 1);
      assert.equal(result.report.rowCounts.valid, 1);
      assert.equal(result.report.rowCounts.invalid, 2);
      assert.ok(result.report.errors.some((issue) => issue.code === "duplicate_store_url"));
      assert.ok(result.report.errors.some((issue) => issue.code === "missing_field"));

      // The report is still written so the failure can be inspected.
      const reportOnDisk = JSON.parse(await readFile(result.reportPath, "utf8"));
      assert.equal(reportOnDisk.rowCounts.total, 3);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("exports only valid rows when allowInvalid is set", async () => {
    const outDir = await tempDir();
    try {
      const input = path.join(outDir, "broken.csv");
      const header = [...DATASET_FIELDS].join(",");
      await writeFile(
        input,
        `${header}\n` +
          "Alpha Store,https://alpha.example,IN,Home,/contact,2026-09-12,Note,to-review\n" +
          "Broken Store,not-a-url,IN,Home,/contact,2026-09-12,Note,to-review\n",
        "utf8",
      );

      const result = await runDatasetPipeline({ input, outDir, allowInvalid: true });
      assert.equal(result.exitCode, 0);
      assert.equal(result.status, "exported_with_errors");

      const csv = await readFile(result.csvPath!, "utf8");
      const table = parseCsv(csv);
      assert.equal(table.rows.length, 1);
      assert.equal(table.rows[0]?.cells[0], "Alpha Store");
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("records probe failures as manual review, never as errors", async () => {
    const outDir = await tempDir();
    try {
      const result = await runDatasetPipeline({
        input: FIXTURE_PATH,
        outDir,
        fixtureData: true,
        checkUrls: true,
        probe: async (urls) =>
          urls.map((url) => ({
            url,
            outcome: "timeout" as const,
            detail: "no response within 8000ms",
            needsManualReview: true,
          })),
      });

      assert.equal(result.exitCode, 0);
      assert.equal(result.report.errors.length, 0);
      assert.equal(result.report.rowCounts.valid, 8);
      assert.equal(result.report.manualReview.count, 8);
      assert.ok(
        result.report.manualReview.entries.every((entry) =>
          entry.reason.startsWith("timeout:"),
        ),
      );
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});

describe("probeUrls", () => {
  const okFetch = (status: number): typeof fetch =>
    (async () => new Response(null, { status })) as typeof fetch;

  it("marks 2xx/3xx responses as reachable", async () => {
    const [probe] = await probeUrls(["https://reachable.example"], {
      fetchImpl: okFetch(200),
      concurrency: 1,
    });
    assert.equal(probe?.outcome, "reachable");
    assert.equal(probe?.needsManualReview, false);
  });

  it("sends a GET after a HEAD-only failure and keeps it for manual review", async () => {
    const methods: string[] = [];
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      methods.push(String(init?.method ?? "GET"));
      return new Response(null, { status: methods.length === 1 ? 405 : 200 });
    }) as typeof fetch;

    const [probe] = await probeUrls(["https://headless.example"], {
      fetchImpl,
      concurrency: 1,
    });
    assert.deepEqual(methods, ["HEAD", "GET"]);
    assert.equal(probe?.outcome, "reachable");
  });

  it("treats 404 and 403 as manual review, not as proof of invalidity", async () => {
    const statuses = [404, 403];
    for (const status of statuses) {
      const [probe] = await probeUrls([`https://status-${status}.example`], {
        fetchImpl: okFetch(status),
        concurrency: 1,
      });
      assert.equal(probe?.needsManualReview, true);
      assert.ok(probe?.detail.includes("manually") || probe?.detail.includes("blocking"));
    }
  });

  it("reports network failures and timeouts for manual review", async () => {
    const networkFailure = (async () => {
      throw new Error("getaddrinfo ENOTFOUND");
    }) as typeof fetch;
    const [networkProbe] = await probeUrls(["https://down.example"], {
      fetchImpl: networkFailure,
      concurrency: 1,
    });
    assert.equal(networkProbe?.outcome, "network_error");
    assert.equal(networkProbe?.needsManualReview, true);

    const timeout = (async () => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      throw error;
    }) as typeof fetch;
    const [timeoutProbe] = await probeUrls(["https://slow.example"], {
      fetchImpl: timeout,
      concurrency: 1,
    });
    assert.equal(timeoutProbe?.outcome, "timeout");
    assert.equal(timeoutProbe?.needsManualReview, true);
  });

  it("probes each unique URL once per attempt and de-duplicates input", async () => {
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      return new Response(null, { status: 200 });
    }) as typeof fetch;

    await probeUrls(["https://a.example", "https://a.example", "https://b.example"], {
      fetchImpl,
      concurrency: 1,
    });
    assert.equal(calls, 2);
  });
});
