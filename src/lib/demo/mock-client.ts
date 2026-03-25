// ---------------------------------------------------------------------------
// Mock Supabase client for ComplianceKit demo mode
// Drop-in replacement that operates entirely in-memory.
// ---------------------------------------------------------------------------

import { demoStore } from "./store";
import { DEMO_USER } from "./data";

// ---- FK relationships used for join resolution ----------------------------

const FK_MAP: Record<string, Record<string, { table: string; fk: string }>> = {
  evidence_items: {
    evidence_item_controls: {
      table: "evidence_item_controls",
      fk: "evidence_item_id",
    },
  },
  evidence_item_controls: {
    control_catalog: { table: "control_catalog", fk: "id" },
  },
  subscriptions: {
    plans: { table: "plans", fk: "id" },
  },
  policy_documents: {
    policy_templates: { table: "policy_templates", fk: "id" },
  },
  organization_members: {
    profiles: { table: "profiles", fk: "user_id" },
  },
  assessment_answers: {
    control_catalog: { table: "control_catalog", fk: "id" },
  },
};

// Resolve which FK column on the source row points to the related table
const FK_COLUMN_MAP: Record<string, Record<string, string>> = {
  subscriptions: { plans: "plan_id" },
  policy_documents: { policy_templates: "template_id" },
  evidence_item_controls: { control_catalog: "control_id" },
  assessment_answers: { control_catalog: "control_id" },
  organization_members: { profiles: "user_id" },
};

// ---- Types ----------------------------------------------------------------

type FilterOp =
  | { op: "eq"; column: string; value: any }
  | { op: "neq"; column: string; value: any }
  | { op: "gte"; column: string; value: any }
  | { op: "gt"; column: string; value: any }
  | { op: "lt"; column: string; value: any }
  | { op: "lte"; column: string; value: any }
  | { op: "in"; column: string; value: any[] }
  | { op: "is"; column: string; value: any };

interface OrderSpec {
  column: string;
  ascending: boolean;
}

// ---- Query Builder --------------------------------------------------------

class MockQueryBuilder {
  private tableName: string;
  private selectColumns: string = "*";
  private selectOpts: { count?: string; head?: boolean } = {};
  private filters: FilterOp[] = [];
  private orders: OrderSpec[] = [];
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" | "delete" | "upsert" =
    "select";
  private payload: any = null;
  private upsertConflict: string = "id";
  private returningSelect: string | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // ---- Chainable query methods -------------------------------------------

  select(columns?: string, opts?: { count?: string; head?: boolean }) {
    this.selectColumns = columns ?? "*";
    if (opts) {
      this.selectOpts = opts;
    }
    if (this.operation === "insert" || this.operation === "update" || this.operation === "upsert") {
      // .select() after insert/update/upsert means "return data"
      this.returningSelect = columns ?? "*";
      return this as any;
    }
    this.operation = "select";
    return this as any;
  }

  insert(data: any) {
    this.operation = "insert";
    this.payload = data;
    return this as any;
  }

  update(data: any) {
    this.operation = "update";
    this.payload = data;
    return this as any;
  }

  upsert(data: any, opts?: { onConflict?: string }) {
    this.operation = "upsert";
    this.payload = data;
    this.upsertConflict = opts?.onConflict ?? "id";
    return this as any;
  }

  delete() {
    this.operation = "delete";
    return this as any;
  }

  eq(column: string, value: any) {
    this.filters.push({ op: "eq", column, value });
    return this as any;
  }

  neq(column: string, value: any) {
    this.filters.push({ op: "neq", column, value });
    return this as any;
  }

  gte(column: string, value: any) {
    this.filters.push({ op: "gte", column, value });
    return this as any;
  }

  gt(column: string, value: any) {
    this.filters.push({ op: "gt", column, value });
    return this as any;
  }

  lt(column: string, value: any) {
    this.filters.push({ op: "lt", column, value });
    return this as any;
  }

  lte(column: string, value: any) {
    this.filters.push({ op: "lte", column, value });
    return this as any;
  }

  in(column: string, values: any[]) {
    this.filters.push({ op: "in", column, value: values });
    return this as any;
  }

  is(column: string, value: any) {
    this.filters.push({ op: "is", column, value });
    return this as any;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true });
    return this as any;
  }

  limit(n: number) {
    this.limitCount = n;
    return this as any;
  }

  // ---- Terminators -------------------------------------------------------

  async single(): Promise<{ data: any; error: any }> {
    const result = await this.execute();
    if (result.error) return result;
    const arr = result.data as any[];
    if (!arr || arr.length === 0) {
      return { data: null, error: { message: "Row not found", code: "PGRST116" } };
    }
    return { data: arr[0], error: null };
  }

  async maybeSingle(): Promise<{ data: any; error: any }> {
    const result = await this.execute();
    if (result.error) return result;
    const arr = result.data as any[];
    if (!arr || arr.length === 0) {
      return { data: null, error: null };
    }
    return { data: arr[0], error: null };
  }

  // Allow awaiting the builder directly (implicit execute)
  then(
    resolve: (value: { data: any; error: any; count?: number }) => any,
    reject?: (err: any) => any,
  ) {
    return this.execute().then(resolve, reject);
  }

  // ---- Execution ----------------------------------------------------------

  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      switch (this.operation) {
        case "select":
          return this.execSelect();
        case "insert":
          return this.execInsert();
        case "update":
          return this.execUpdate();
        case "upsert":
          return this.execUpsert();
        case "delete":
          return this.execDelete();
        default:
          return { data: null, error: null };
      }
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  private execSelect(): { data: any; error: any; count?: number } {
    let rows = [...demoStore.getTable(this.tableName)];

    // Apply filters
    rows = this.applyFilters(rows);

    // Head + count mode: just return count
    if (this.selectOpts.head && this.selectOpts.count === "exact") {
      return { data: null, error: null, count: rows.length };
    }

    // Apply ordering
    rows = this.applyOrder(rows);

    // Apply limit
    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    // Deep clone before projecting
    rows = JSON.parse(JSON.stringify(rows));

    // Handle joins and column projection
    rows = this.applySelectProjection(rows);

    const result: { data: any; error: any; count?: number } = { data: rows, error: null };
    if (this.selectOpts.count === "exact") {
      result.count = rows.length;
    }
    return result;
  }

  private execInsert(): { data: any; error: any } {
    const isArray = Array.isArray(this.payload);
    const items = isArray ? this.payload : [this.payload];
    const inserted = demoStore.insertMany(this.tableName, items);

    if (this.returningSelect !== null) {
      let result = JSON.parse(JSON.stringify(inserted));
      result = this.applySelectProjection(result);
      return { data: isArray ? result : result, error: null };
    }
    return { data: null, error: null };
  }

  private execUpdate(): { data: any; error: any } {
    const match = this.buildMatchFromFilters();
    const updated = demoStore.update(this.tableName, match, this.payload);

    if (this.returningSelect !== null) {
      let result = JSON.parse(JSON.stringify(updated));
      result = this.applySelectProjection(result);
      return { data: result, error: null };
    }
    return { data: null, error: null };
  }

  private execUpsert(): { data: any; error: any } {
    const result = demoStore.upsert(
      this.tableName,
      this.payload,
      this.upsertConflict,
    );

    if (this.returningSelect !== null) {
      let rows = [JSON.parse(JSON.stringify(result))];
      rows = this.applySelectProjection(rows);
      return { data: rows, error: null };
    }
    return { data: null, error: null };
  }

  private execDelete(): { data: any; error: any } {
    const match = this.buildMatchFromFilters();
    demoStore.delete(this.tableName, match);
    return { data: null, error: null };
  }

  // ---- Helpers ------------------------------------------------------------

  private applyFilters(rows: any[]): any[] {
    for (const f of this.filters) {
      rows = rows.filter((row) => {
        const val = row[f.column];
        switch (f.op) {
          case "eq":
            return val === f.value;
          case "neq":
            return val !== f.value;
          case "gte":
            return val >= f.value;
          case "gt":
            return val > f.value;
          case "lt":
            return val < f.value;
          case "lte":
            return val <= f.value;
          case "in":
            return (f.value as any[]).includes(val);
          case "is":
            if (f.value === null) return val === null || val === undefined;
            return val === f.value;
          default:
            return true;
        }
      });
    }
    return rows;
  }

  private applyOrder(rows: any[]): any[] {
    if (this.orders.length === 0) return rows;
    return rows.sort((a, b) => {
      for (const ord of this.orders) {
        const aVal = a[ord.column];
        const bVal = b[ord.column];
        if (aVal === bVal) continue;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return ord.ascending ? cmp : -cmp;
      }
      return 0;
    });
  }

  private applySelectProjection(rows: any[]): any[] {
    const sel = this.returningSelect ?? this.selectColumns;
    if (!sel || sel === "*") return rows;

    // Parse joins: e.g. "*, evidence_item_controls(control_id)" or
    // "*, plans(*)" or "control_id, control_catalog(id, control_code, title)"
    const joins: Array<{
      relName: string;
      relColumns: string;
    }> = [];
    const scalarColumns: string[] = [];

    // Match patterns like "related_table(col1, col2)" or "related_table(*)"
    const joinRegex = /(\w+)\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    let remaining = sel;

    while ((match = joinRegex.exec(sel)) !== null) {
      joins.push({ relName: match[1], relColumns: match[2].trim() });
      remaining = remaining.replace(match[0], "");
    }

    // Parse remaining scalar columns
    const scalarParts = remaining
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const part of scalarParts) {
      if (part === "*") {
        scalarColumns.push("*");
      } else {
        scalarColumns.push(part);
      }
    }

    return rows.map((row) => {
      let projected: any;

      // Column projection
      if (scalarColumns.includes("*")) {
        projected = { ...row };
      } else {
        projected = {};
        for (const col of scalarColumns) {
          projected[col] = row[col];
        }
      }

      // Resolve joins
      for (const join of joins) {
        const fkInfo = FK_MAP[this.tableName]?.[join.relName];
        const fkColumn =
          FK_COLUMN_MAP[this.tableName]?.[join.relName];

        if (fkInfo) {
          if (fkInfo.fk === "id" && fkColumn) {
            // Many-to-one: source row has FK pointing to related table's id
            const relatedTable = demoStore.getTable(fkInfo.table);
            const related = relatedTable.find(
              (r) => r.id === row[fkColumn],
            );
            projected[join.relName] = related
              ? this.projectColumns(
                  JSON.parse(JSON.stringify(related)),
                  join.relColumns,
                )
              : null;
          } else {
            // One-to-many: related rows have FK pointing to this row
            const relatedTable = demoStore.getTable(fkInfo.table);
            const relatedRows = relatedTable.filter(
              (r) => r[fkInfo.fk] === row.id,
            );
            projected[join.relName] = relatedRows.map((r) =>
              this.projectColumns(
                JSON.parse(JSON.stringify(r)),
                join.relColumns,
              ),
            );
          }
        } else {
          // Fallback: try to find a table matching relName and guess the FK
          const relatedTable = demoStore.getTable(join.relName);
          // Try common FK patterns
          const possibleFKs = [
            `${this.tableName.replace(/s$/, "")}_id`,
            `${this.tableName}_id`,
          ];
          let matched = false;
          for (const fk of possibleFKs) {
            const relatedRows = relatedTable.filter(
              (r) => r[fk] === row.id,
            );
            if (relatedRows.length > 0 || relatedTable.length === 0) {
              projected[join.relName] = relatedRows.map((r) =>
                this.projectColumns(
                  JSON.parse(JSON.stringify(r)),
                  join.relColumns,
                ),
              );
              matched = true;
              break;
            }
          }
          if (!matched) {
            projected[join.relName] = [];
          }
        }
      }

      return projected;
    });
  }

  private projectColumns(row: any, columns: string): any {
    if (columns === "*") return row;
    const cols = columns.split(",").map((c) => c.trim());
    const result: any = {};
    for (const col of cols) {
      result[col] = row[col];
    }
    return result;
  }

  private buildMatchFromFilters(): Record<string, any> {
    const match: Record<string, any> = {};
    for (const f of this.filters) {
      if (f.op === "eq") {
        match[f.column] = f.value;
      }
    }
    return match;
  }
}

// ---- Mock Auth ------------------------------------------------------------

function createMockAuth() {
  const demoUser = {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    user_metadata: DEMO_USER.user_metadata,
    app_metadata: {},
    aud: "authenticated",
    role: "authenticated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    getUser: async () => ({ data: { user: demoUser }, error: null }),

    getSession: async () => ({
      data: {
        session: {
          access_token: "demo-access-token",
          refresh_token: "demo-refresh-token",
          user: demoUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
        },
      },
      error: null,
    }),

    signUp: async (_creds: any) => ({
      data: { user: demoUser, session: null },
      error: null,
    }),

    signInWithPassword: async (_creds: any) => ({
      data: {
        user: demoUser,
        session: {
          access_token: "demo-access-token",
          refresh_token: "demo-refresh-token",
          user: demoUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
        },
      },
      error: null,
    }),

    signInWithOAuth: async (_opts: any) => ({
      data: { url: "/app/dashboard", provider: "demo" },
      error: null,
    }),

    signOut: async () => ({ error: null }),

    resetPasswordForEmail: async (_email: string) => ({
      data: {},
      error: null,
    }),

    exchangeCodeForSession: async (_code: string) => ({
      data: {
        user: demoUser,
        session: {
          access_token: "demo-access-token",
          refresh_token: "demo-refresh-token",
          user: demoUser,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
        },
      },
      error: null,
    }),

    onAuthStateChange: (_callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),

    admin: {
      getUserById: async (_id: string) => ({
        data: { user: demoUser },
        error: null,
      }),
    },
  };
}

// ---- Mock Storage ---------------------------------------------------------

function createMockStorage() {
  return {
    from: (bucket: string) => ({
      upload: async (_path: string, _data: any, _opts?: any) => ({
        data: { path: _path },
        error: null,
      }),
      createSignedUrl: async (path: string, _expiresIn: number) => ({
        data: {
          signedUrl: `https://demo.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=demo`,
        },
        error: null,
      }),
      createSignedUploadUrl: async (path: string) => ({
        data: {
          signedUrl: `https://demo.supabase.co/storage/v1/upload/sign/${bucket}/${path}?token=demo`,
          path,
          token: "demo-upload-token",
        },
        error: null,
      }),
      download: async (_path: string) => ({
        data: new Blob(["demo file content"], {
          type: "application/octet-stream",
        }),
        error: null,
      }),
      remove: async (_paths: string[]) => ({
        data: [],
        error: null,
      }),
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}`,
        },
      }),
    }),
  };
}

// ---- Mock Supabase Client -------------------------------------------------

function createMockSupabaseClient() {
  return {
    from: (table: string) => {
      const builder = new MockQueryBuilder(table);
      return builder;
    },
    auth: createMockAuth(),
    storage: createMockStorage(),
    // Minimal rpc stub
    rpc: async (fn: string, _params?: any) => {
      console.warn(`[demo] rpc("${fn}") called — returning empty result`);
      return { data: null, error: null };
    },
  };
}

/**
 * Create a mock Supabase client for demo mode.
 * Drop-in replacement for the real Supabase client.
 */
export function createMockClient() {
  return createMockSupabaseClient();
}
