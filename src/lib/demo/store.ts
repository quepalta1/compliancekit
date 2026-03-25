// ---------------------------------------------------------------------------
// In-memory data store for demo mode
// Supports the Supabase query patterns used throughout ComplianceKit
// ---------------------------------------------------------------------------

import {
  DEMO_PROFILE,
  DEMO_ORGANIZATION,
  DEMO_MEMBER,
  DEMO_PLANS,
  DEMO_SUBSCRIPTION,
  DEMO_CONTROLS,
  DEMO_POLICY_TEMPLATES,
  DEMO_ASSESSMENT,
  DEMO_ANSWERS,
  DEMO_CONTROL_STATUSES,
  DEMO_REMEDIATION_ACTIONS,
  DEMO_EVIDENCE_ITEMS,
  DEMO_EVIDENCE_ITEM_CONTROLS,
  DEMO_EVIDENCE_FILES,
  DEMO_POLICY_DOCUMENTS,
  DEMO_ONBOARDING_RESPONSE,
  DEMO_EMAIL_NOTIFICATIONS,
  DEMO_ORGANIZATION_INVITES,
} from "./data";

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

let counter = 1000;
function nextId(): string {
  counter++;
  return `demo-auto-${counter}`;
}

class DemoStore {
  private tables: Record<string, any[]> = {};

  constructor() {
    this.seed();
  }

  private seed() {
    this.tables = {
      profiles: deepClone([DEMO_PROFILE]),
      organizations: deepClone([DEMO_ORGANIZATION]),
      organization_members: deepClone([DEMO_MEMBER]),
      organization_invites: deepClone(DEMO_ORGANIZATION_INVITES),
      plans: deepClone(DEMO_PLANS),
      subscriptions: deepClone([DEMO_SUBSCRIPTION]),
      control_catalog: deepClone(DEMO_CONTROLS),
      assessments: deepClone([DEMO_ASSESSMENT]),
      assessment_answers: deepClone(DEMO_ANSWERS),
      assessment_control_statuses: deepClone(DEMO_CONTROL_STATUSES),
      remediation_actions: deepClone(DEMO_REMEDIATION_ACTIONS),
      evidence_items: deepClone(DEMO_EVIDENCE_ITEMS),
      evidence_item_controls: deepClone(DEMO_EVIDENCE_ITEM_CONTROLS),
      evidence_files: deepClone(DEMO_EVIDENCE_FILES),
      email_notifications: deepClone(DEMO_EMAIL_NOTIFICATIONS),
      policy_templates: deepClone(DEMO_POLICY_TEMPLATES),
      policy_documents: deepClone(DEMO_POLICY_DOCUMENTS),
      onboarding_responses: deepClone([DEMO_ONBOARDING_RESPONSE]),
    };
  }

  getTable(name: string): any[] {
    if (!this.tables[name]) {
      this.tables[name] = [];
    }
    return this.tables[name];
  }

  insert(table: string, row: any): any {
    const rows = this.getTable(table);
    const newRow = deepClone(row);
    // Auto-generate id if not present and table typically has one
    if (!newRow.id && !this.isCompositePKTable(table)) {
      newRow.id = nextId();
    }
    // Auto-set created_at if missing
    if (newRow.created_at === undefined && this.hasCreatedAt(table)) {
      newRow.created_at = new Date().toISOString();
    }
    rows.push(newRow);
    return deepClone(newRow);
  }

  insertMany(table: string, rowsToInsert: any[]): any[] {
    return rowsToInsert.map((r) => this.insert(table, r));
  }

  update(table: string, match: Record<string, any>, data: any): any[] {
    const rows = this.getTable(table);
    const updated: any[] = [];
    for (const row of rows) {
      if (this.matches(row, match)) {
        Object.assign(row, deepClone(data));
        updated.push(deepClone(row));
      }
    }
    return updated;
  }

  upsert(table: string, row: any, onConflict: string): any {
    const keys = onConflict.split(",").map((k) => k.trim());
    const match: Record<string, any> = {};
    for (const k of keys) {
      match[k] = row[k];
    }
    const rows = this.getTable(table);
    const existing = rows.find((r) => this.matches(r, match));
    if (existing) {
      Object.assign(existing, deepClone(row));
      return deepClone(existing);
    }
    return this.insert(table, row);
  }

  delete(table: string, match: Record<string, any>): any[] {
    const rows = this.getTable(table);
    const deleted: any[] = [];
    const remaining: any[] = [];
    for (const row of rows) {
      if (this.matches(row, match)) {
        deleted.push(deepClone(row));
      } else {
        remaining.push(row);
      }
    }
    this.tables[table] = remaining;
    return deleted;
  }

  private matches(row: any, match: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(match)) {
      if (row[key] !== value) return false;
    }
    return true;
  }

  private isCompositePKTable(table: string): boolean {
    return [
      "organization_members",
      "evidence_item_controls",
    ].includes(table);
  }

  private hasCreatedAt(table: string): boolean {
    return ![
      "plans",
      "control_catalog",
      "policy_templates",
      "evidence_item_controls",
    ].includes(table);
  }
}

// Singleton — shared across the process lifetime in demo mode
export const demoStore = new DemoStore();
