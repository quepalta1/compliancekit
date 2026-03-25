/* ------------------------------------------------------------------ */
/*  Row-level TypeScript interfaces matching the Supabase schema       */
/* ------------------------------------------------------------------ */

import type {
  EntityClass,
  AssessmentAnswer,
  RagStatus,
  AssessmentStatus,
  EvidenceStatus,
  RemediationPriority,
  RemediationStatus,
  MemberRole,
  PolicyStatus,
} from './constants';

// ── Auth / profiles ─────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  full_name: string | null;
  last_organization_id: string | null;
  created_at: string;
}

// ── Organizations ───────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  country_code: string | null;
  sector: string | null;
  employee_band: string | null;
  nis2_applicable: boolean | null;
  entity_class: EntityClass;
  onboarding_completed_at: string | null;
  created_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: Exclude<MemberRole, 'owner'>;
  token_hash: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// ── Billing ─────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  code: string;
  name: string;
  price_eur: number;
  max_members: number | null;
  features_json: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// ── Onboarding ──────────────────────────────────────────────────────

export interface OnboardingResponse {
  id: string;
  organization_id: string;
  answers_json: Record<string, unknown>;
  derived_result_json: Record<string, unknown>;
  completed_by: string | null;
  completed_at: string;
}

// ── Control catalog ─────────────────────────────────────────────────

export interface ControlCatalog {
  id: string;
  framework: string;
  control_code: string;
  article_ref: string;
  title: string;
  description: string;
  guidance: string;
  weight: number;
  sort_order: number;
  iso27001_refs: string[];
}

// ── Assessments ─────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  organization_id: string;
  status: AssessmentStatus;
  score_pct: number;
  started_by: string | null;
  started_at: string;
  completed_at: string | null;
}

/** A single answer row (not the union type). */
export interface AssessmentAnswerRow {
  id: string;
  assessment_id: string;
  control_id: string;
  answer: AssessmentAnswer;
  note: string | null;
  answered_by: string | null;
  answered_at: string;
}

export interface AssessmentControlStatus {
  id: string;
  assessment_id: string;
  control_id: string;
  score: number;
  rag: RagStatus;
  priority_rank: number;
  remediation_summary: string;
}

// ── Remediation ─────────────────────────────────────────────────────

export interface RemediationAction {
  id: string;
  organization_id: string;
  assessment_id: string;
  control_id: string;
  title: string;
  description: string;
  priority: RemediationPriority;
  status: RemediationStatus;
  owner_user_id: string | null;
  due_date: string | null;
  created_at: string;
}

// ── Evidence ────────────────────────────────────────────────────────

export interface EvidenceItem {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  status: EvidenceStatus;
  expires_at: string | null;
  last_reviewed_at: string | null;
  created_at: string;
}

export interface EvidenceItemControl {
  evidence_item_id: string;
  control_id: string;
}

export interface EvidenceFile {
  id: string;
  evidence_item_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  checksum_sha256: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

// ── Notifications ───────────────────────────────────────────────────

export interface EmailNotification {
  id: string;
  organization_id: string;
  evidence_item_id: string;
  template_code: string;
  reminder_day: number;
  recipient_email: string;
  provider_message_id: string | null;
  sent_at: string;
}

// ── Policies ────────────────────────────────────────────────────────

export interface PolicyTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  default_sections_json: Record<string, unknown>;
  prompt_version: string;
  is_active: boolean;
}

export interface PolicyDocument {
  id: string;
  organization_id: string;
  template_id: string;
  requested_by: string | null;
  status: PolicyStatus;
  model: string;
  input_context_json: Record<string, unknown>;
  input_hash: string;
  structured_content_json: Record<string, unknown> | null;
  docx_path: string | null;
  pdf_path: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}
