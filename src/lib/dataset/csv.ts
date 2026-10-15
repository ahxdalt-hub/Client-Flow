/**
 * Minimal RFC 4180 CSV reader/writer used by the dataset pipeline.
 *
 * - Reads: BOM, CRLF/LF, quoted fields, escaped quotes, embedded newlines.
 * - Writes: UTF-8 without BOM, CRLF line endings, quoting only where required.
 *
 * Dependency-free so it runs under `node --test` as well as in Next.js.
 */

export type ParsedCsv = {
  header: string[];
  rows: { line: number; cells: string[] }[];
};

/**
 * Parses CSV text. `line` is the 1-based source line where the record starts,
 * which is what validation reports point at.
 */
export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^\uFEFF/, "");
  const rows: { line: number; cells: string[] }[] = [];
  let header: string[] = [];

  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let recordStartLine = 1;
  let recordHasContent = false;

  const endField = () => {
    cells.push(field);
    field = "";
  };
  const endRecord = () => {
    endField();
    const isBlank = cells.length === 1 && cells[0].trim() === "";
    if (!isBlank) {
      if (header.length === 0) {
        header = cells;
      } else {
        rows.push({ line: recordStartLine, cells });
      }
    }
    cells = [];
    recordHasContent = false;
    recordStartLine = line;
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        if (char === "\n") line += 1;
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      inQuotes = true;
      recordHasContent = true;
      continue;
    }
    if (char === ",") {
      endField();
      recordHasContent = true;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      line += 1;
      endRecord();
      continue;
    }
    if (char === "\n") {
      line += 1;
      endRecord();
      continue;
    }
    field += char;
    if (char !== " " && char !== "\t") recordHasContent = true;
  }

  if (field !== "" || cells.length > 0 || recordHasContent) {
    endRecord();
  }

  return { header, rows };
}

function needsQuoting(value: string): boolean {
  return /[",\r\n]/.test(value) || value !== value.trim();
}

function quote(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Serialises a table as UTF-8 CSV (no BOM, CRLF line endings, trailing CRLF).
 */
export function serializeCsv(header: string[], rows: string[][]): string {
  const line = (cells: string[]): string =>
    cells.map((cell) => (needsQuoting(cell) ? quote(cell) : cell)).join(",");

  const lines = [line(header), ...rows.map(line)];
  return `${lines.join("\r\n")}\r\n`;
}
