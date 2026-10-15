/**
 * Minimal in-memory Supabase/PostgREST stand-in for unit tests.
 *
 * It implements only the query-builder surface the fulfillment, storage, and
 * download code paths actually use, including the unique constraints that make
 * fulfillment idempotent:
 *
 *   orders          UNIQUE (provider, provider_order_id)
 *   orders          UNIQUE (provider_payment_id) when not null
 *   entitlements    UNIQUE (order_id)
 *   product_versions UNIQUE (product_id, version) and
 *                    UNIQUE (product_id) WHERE is_current
 *
 * Tests use it to prove duplicate webhook deliveries cannot double-fulfill,
 * without needing a real database.
 */

import { randomUUID } from "node:crypto";

export type FakeRow = Record<string, unknown>;

export type FakeDb = {
  orders: FakeRow[];
  entitlements: FakeRow[];
  download_events: FakeRow[];
  product_versions: FakeRow[];
};

export function createFakeDb(): FakeDb {
  return {
    orders: [],
    entitlements: [],
    download_events: [],
    product_versions: [],
  };
}

type Filter = {
  path: string;
  op: "eq" | "neq" | "is" | "gte";
  value: unknown;
};

type FakeError = { code: string; message: string };

type QueryResult = {
  data: FakeRow[] | FakeRow | null;
  error: FakeError | null;
  count: number | null;
};

const TABLE_KEYS: Record<string, keyof FakeDb> = {
  orders: "orders",
  entitlements: "entitlements",
  download_events: "download_events",
  product_versions: "product_versions",
};

function failure(code: string, message: string): QueryResult {
  return { data: null, error: { code, message }, count: null };
}

function toRows(payload: FakeRow | FakeRow[]): FakeRow[] {
  return Array.isArray(payload) ? payload : [payload];
}

function valueOf(row: FakeRow, path: string): unknown {
  return row[path];
}

function matches(row: FakeRow, filters: Filter[]): boolean {
  return filters.every((filter) => {
    const actual = valueOf(row, filter.path);
    switch (filter.op) {
      case "eq":
        return actual === filter.value;
      case "neq":
        return actual !== filter.value;
      case "is":
        return actual === filter.value;
      case "gte":
        return (
          typeof actual === "string" &&
          typeof filter.value === "string" &&
          actual >= filter.value
        );
      default:
        return false;
    }
  });
}

type ParsedColumns = {
  plain: string[];
  joins: { table: string; columns: string[] }[];
};

function splitColumns(columns: string): string[] {
  // Paren-aware split: `orders!inner ( id, provider_payment_id )` must stay
  // one part even though it contains a comma.
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of columns) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function parseColumns(columns: string): ParsedColumns {
  const plain: string[] = [];
  const joins: { table: string; columns: string[] }[] = [];

  for (const raw of splitColumns(columns)) {
    if (!raw || raw === "*") continue;
    const join = raw.match(/^(\w+)!inner\s*\(\s*(.+?)\s*\)$/);
    if (join) {
      joins.push({
        table: join[1],
        columns: splitColumns(join[2]),
      });
    } else {
      plain.push(raw);
    }
  }

  return { plain, joins };
}

function project(row: FakeRow, columns: string[]): FakeRow {
  if (columns.includes("*")) return { ...row };
  const out: FakeRow = {};
  for (const column of columns) out[column] = row[column];
  return out;
}

class FakeQuery {
  private readonly db: FakeDb;
  private readonly table: string;
  private kind: "select" | "insert" | "update" | "upsert" = "select";
  private payload: FakeRow | FakeRow[] | null = null;
  private upsertOptions: { onConflict?: string; ignoreDuplicates?: boolean } =
    {};
  private columns = "*";
  private head = false;
  private wantCount = false;
  private mode: "many" | "single" | "maybe" = "many";
  private filters: Filter[] = [];

  constructor(db: FakeDb, table: string) {
    this.db = db;
    this.table = table;
  }

  select(columns = "*", options?: { count?: string; head?: boolean }): this {
    this.columns = columns;
    if (options?.count === "exact") this.wantCount = true;
    if (options?.head) this.head = true;
    return this;
  }

  insert(payload: FakeRow | FakeRow[]): this {
    this.kind = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: FakeRow): this {
    this.kind = "update";
    this.payload = payload;
    return this;
  }

  upsert(
    payload: FakeRow | FakeRow[],
    options?: { onConflict?: string; ignoreDuplicates?: boolean },
  ): this {
    this.kind = "upsert";
    this.payload = payload;
    this.upsertOptions = options ?? {};
    return this;
  }

  eq(path: string, value: unknown): this {
    this.filters.push({ path, op: "eq", value });
    return this;
  }

  neq(path: string, value: unknown): this {
    this.filters.push({ path, op: "neq", value });
    return this;
  }

  is(path: string, value: unknown): this {
    this.filters.push({ path, op: "is", value });
    return this;
  }

  gte(path: string, value: unknown): this {
    this.filters.push({ path, op: "gte", value });
    return this;
  }

  single(): this {
    this.mode = "single";
    return this;
  }

  maybeSingle(): this {
    this.mode = "maybe";
    return this;
  }

  then<T1 = QueryResult, T2 = never>(
    onfulfilled?: ((value: QueryResult) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): Promise<T1 | T2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private rows(): FakeRow[] {
    return this.db[TABLE_KEYS[this.table] ?? "orders"];
  }

  private uniqueKeySets(override?: string): string[][] {
    if (override) {
      return [override.split(",").map((column) => column.trim())];
    }
    switch (this.table) {
      case "orders":
        return [
          ["provider", "provider_order_id"],
          ["provider_payment_id"],
        ];
      case "entitlements":
        return [["order_id"]];
      case "product_versions":
        return [["product_id", "version"]];
      default:
        return [];
    }
  }

  private checkUniques(
    incoming: FakeRow[],
    keySets: string[][],
    ignoreRowId?: unknown,
  ): QueryResult | null {
    const existing = this.rows();
    for (const row of incoming) {
      for (const keys of keySets) {
        const sample = keys.map((key) => row[key]);
        if (sample.every((value) => value === undefined || value === null)) {
          continue; // null/absent payment ids do not collide
        }
        const clash = existing.find(
          (candidate) =>
            candidate !== row &&
            (ignoreRowId === undefined || candidate.id !== ignoreRowId) &&
            keys.every((key) => candidate[key] === row[key]),
        );
        if (clash) {
          return failure(
            "23505",
            `duplicate key violates unique constraint (${keys.join(", ")})`,
          );
        }
      }

      if (this.table === "product_versions" && row.is_current === true) {
        const otherCurrent = existing.find(
          (candidate) =>
            candidate !== row &&
            (ignoreRowId === undefined || candidate.id !== ignoreRowId) &&
            candidate.product_id === row.product_id &&
            candidate.is_current === true,
        );
        if (otherCurrent) {
          return failure(
            "23505",
            "duplicate key violates unique constraint (product_versions_one_current_idx)",
          );
        }
      }
    }
    return null;
  }

  private materialize(row: FakeRow): FakeRow {
    const now = new Date().toISOString();
    const next: FakeRow = { ...row, id: row.id ?? randomUUID() };
    if (this.table === "orders") {
      next.created_at = next.created_at ?? now;
      next.updated_at = next.updated_at ?? now;
      next.status = next.status ?? "created";
      next.currency = next.currency ?? "INR";
      next.provider = next.provider ?? "razorpay";
    }
    if (this.table === "entitlements") {
      next.granted_at = next.granted_at ?? now;
      next.revoked_at = next.revoked_at ?? null;
      next.product_version_id = next.product_version_id ?? null;
    }
    if (this.table === "product_versions") {
      next.is_current = next.is_current ?? false;
      next.released_at = next.released_at ?? now;
      next.created_at = next.created_at ?? now;
    }
    if (this.table === "download_events") {
      next.id = this.rows().length + 1;
      next.created_at = next.created_at ?? now;
    }
    return next;
  }

  private shape(rows: FakeRow[]): QueryResult {
    if (this.mode === "maybe") {
      return { data: rows[0] ? { ...rows[0] } : null, error: null, count: null };
    }
    if (this.mode === "single") {
      if (rows.length !== 1) {
        return failure(
          "PGRST116",
          `expected a single row, received ${rows.length}`,
        );
      }
      return { data: { ...rows[0] }, error: null, count: null };
    }
    const projected = rows.map((row) =>
      project(
        row,
        this.columns
          .split(",")
          .map((column) => column.trim())
          .filter(Boolean),
      ),
    );
    return {
      data: this.head ? null : projected,
      error: null,
      count: this.wantCount ? rows.length : null,
    };
  }

  private runSelect(): QueryResult {
    const parentFilters = this.filters.filter(
      (filter) => !filter.path.includes("."),
    );
    const joinFilters = this.filters.filter((filter) =>
      filter.path.includes("."),
    );
    const filtered = this.rows().filter((row) => matches(row, parentFilters));
    const parsed = parseColumns(this.columns);

    if (parsed.joins.length > 0) {
      const joined: FakeRow[] = [];
      for (const row of filtered) {
        const related: FakeRow[] = [];
        let joinOk = true;
        for (const join of parsed.joins) {
          const tableRows = this.db[TABLE_KEYS[join.table] ?? "orders"];
          const match = tableRows.find(
            (candidate) => candidate.id === row.order_id,
          );
          if (!match) {
            joinOk = false;
            break;
          }
          // Keep the full joined row: join-side filters (e.g.
          // `orders.provider`) apply to columns that may not be selected.
          related.push(match);
        }
        if (!joinOk || related.length !== parsed.joins.length) continue;
        const shaped: FakeRow = { ...project(row, parsed.plain) };
        for (let i = 0; i < parsed.joins.length; i += 1) {
          const relatedRow = related[i];
          if (relatedRow) {
            shaped[parsed.joins[i].table] = project(
              relatedRow,
              parsed.joins[i].columns,
            );
            // Stash the full row for join-side filter evaluation below.
            shaped[`__${parsed.joins[i].table}`] = relatedRow;
          }
        }
        joined.push(shaped);
      }
      // Join filters (`orders.provider`) apply to the joined row.
      const finalRows = joined
        .filter((row) =>
          joinFilters.every((filter) => {
            const [table, column] = filter.path.split(".");
            // `eq("revoked_at", null)` must match both SQL NULL and a missing
            // JS key; the `is` handler already does this via `===`.
            if (table === undefined) {
              return matches(row, [{ ...filter, path: filter.path }]);
            }
            const source =
              (row[`__${table}`] as FakeRow | undefined) ??
              (row[table] as FakeRow | undefined);
            if (!source || !column) return false;
            return matches(source, [{ ...filter, path: column }]);
          }),
        )
        .map((row) => {
          // Strip the stashed full rows before returning.
          const clean: FakeRow = {};
          for (const [key, value] of Object.entries(row)) {
            if (!key.startsWith("__")) clean[key] = value;
          }
          return clean;
        });
      // `shape()` would re-project the join away, so handle single-row modes
      // here where the joined object is still intact.
      if (this.mode === "maybe") {
        return { data: finalRows[0] ? { ...finalRows[0] } : null, error: null, count: null };
      }
      if (this.mode === "single") {
        if (finalRows.length !== 1) {
          return failure(
            "PGRST116",
            `expected a single row, received ${finalRows.length}`,
          );
        }
        return { data: { ...finalRows[0] }, error: null, count: null };
      }
      return this.shape(finalRows);
    }

    return this.shape(filtered);
  }

  private runInsert(rows: FakeRow[]): QueryResult {
    const violation = this.checkUniques(rows, this.uniqueKeySets());
    if (violation) return violation;
    const inserted = rows.map((row) => this.materialize(row));
    this.rows().push(...inserted);
    return this.shape(inserted);
  }

  private runUpsert(rows: FakeRow[]): QueryResult {
    const keySets = this.uniqueKeySets(this.upsertOptions.onConflict);
    const result: FakeRow[] = [];

    for (const row of rows) {
      const existing = this.rows().find((candidate) =>
        keySets.every((keys) =>
          keys.every((key) => candidate[key] === row[key]),
        ),
      );

      if (!existing) {
        const violation = this.checkUniques([row], this.uniqueKeySets());
        if (violation) return violation;
        const inserted = this.materialize(row);
        this.rows().push(inserted);
        result.push(inserted);
        continue;
      }

      if (this.upsertOptions.ignoreDuplicates) {
        // ON CONFLICT DO NOTHING: no write, no rows returned.
        continue;
      }

      const merged = { ...existing, ...row, id: existing.id };
      const violation = this.checkUniques(
        [merged],
        this.uniqueKeySets(),
        existing.id,
      );
      if (violation) return violation;
      Object.assign(existing, merged);
      result.push(existing);
    }

    return this.shape(result);
  }

  private runUpdate(): QueryResult {
    const payload = (this.payload ?? {}) as FakeRow;
    const targets = this.rows().filter((row) => matches(row, this.filters));
    for (const target of targets) {
      const merged = { ...target, ...payload, id: target.id };
      const violation = this.checkUniques(
        [merged],
        this.uniqueKeySets(),
        target.id,
      );
      if (violation) return violation;
      Object.assign(target, merged);
      target.updated_at = new Date().toISOString();
    }
    return this.shape(targets);
  }

  private async execute(): Promise<QueryResult> {
    try {
      if (this.kind === "insert") return this.runInsert(toRows(this.payload!));
      if (this.kind === "upsert") return this.runUpsert(toRows(this.payload!));
      if (this.kind === "update") return this.runUpdate();
      return this.runSelect();
    } catch (error) {
      return failure("XX000", error instanceof Error ? error.message : String(error));
    }
  }
}

export type FakeSupabase = {
  from: (table: string) => FakeQuery;
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{ data: { signedUrl: string } | null; error: FakeError | null }>;
    };
  };
};

export type FakeStorageFile = { bucket: string; path: string };

/**
 * Creates a fake Supabase client backed by `db`. `storageFiles` lists the
 * objects that exist in the private bucket so signed-URL creation can succeed
 * or report `file_missing` realistically.
 */
export function createFakeSupabase(
  db: FakeDb,
  storageFiles: FakeStorageFile[] = [],
): FakeSupabase {
  return {
    from: (table: string) => new FakeQuery(db, table),
    storage: {
      from: (bucket: string) => ({
        createSignedUrl: async (path: string, _expiresIn: number) => {
          const exists = storageFiles.some(
            (file) => file.bucket === bucket && file.path === path,
          );
          if (!exists) {
            return {
              data: null,
              error: { code: "not_found", message: "Object not found" },
            };
          }
          return {
            data: {
              signedUrl: `https://storage.example/${bucket}/${path}?token=test-signed-token`,
            },
            error: null,
          };
        },
      }),
    },
  };
}
