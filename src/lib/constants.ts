/* ------------------------------------------------------------------ */
/*  Shared constants & derived type aliases for ComplianceKit          */
/* ------------------------------------------------------------------ */

// ── Enum-like const arrays ──────────────────────────────────────────

export const ENTITY_CLASSES = ['essential', 'important', 'out_of_scope', 'unknown'] as const;
export const ASSESSMENT_ANSWERS = ['yes', 'partial', 'no'] as const;
export const RAG_STATUSES = ['red', 'amber', 'green'] as const;
export const ASSESSMENT_STATUSES = ['draft', 'completed'] as const;
export const EVIDENCE_STATUSES = ['valid', 'expiring', 'expired'] as const;
export const REMEDIATION_PRIORITIES = ['high', 'medium', 'low'] as const;
export const REMEDIATION_STATUSES = ['open', 'in_progress', 'done'] as const;
export const MEMBER_ROLES = ['owner', 'admin', 'member'] as const;
export const POLICY_STATUSES = ['queued', 'generating', 'completed', 'failed'] as const;
export const PLAN_CODES = ['free', 'starter', 'pro', 'team'] as const;
export const REMINDER_DAYS = [90, 60, 30] as const;

// ── Type aliases derived from the const arrays ──────────────────────

export type EntityClass = (typeof ENTITY_CLASSES)[number];
export type AssessmentAnswer = (typeof ASSESSMENT_ANSWERS)[number];
export type RagStatus = (typeof RAG_STATUSES)[number];
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type RemediationPriority = (typeof REMEDIATION_PRIORITIES)[number];
export type RemediationStatus = (typeof REMEDIATION_STATUSES)[number];
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type PolicyStatus = (typeof POLICY_STATUSES)[number];
export type PlanCode = (typeof PLAN_CODES)[number];
export type ReminderDay = (typeof REMINDER_DAYS)[number];

// ── Scoring ─────────────────────────────────────────────────────────

export const ANSWER_SCORE_MAP: Record<AssessmentAnswer, number> = {
  yes: 1,
  partial: 0.5,
  no: 0,
};

/** Score >= this value maps to RAG "green" */
export const GREEN_THRESHOLD = 0.8;

/** Score >= this value (but below GREEN_THRESHOLD) maps to RAG "amber" */
export const AMBER_THRESHOLD = 0.4;
