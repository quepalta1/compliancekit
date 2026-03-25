// ---------------------------------------------------------------------------
// Pre-seeded demo data for ComplianceKit demo mode
// ---------------------------------------------------------------------------

const NOW = new Date().toISOString();

// Helpers for deterministic dates relative to "now"
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

// ---- User & Profile -------------------------------------------------------

export const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@compliancekit.app",
  user_metadata: { full_name: "Anna Schmidt" },
};

export const DEMO_PROFILE = {
  user_id: "demo-user-001",
  full_name: "Anna Schmidt",
  last_organization_id: "demo-org-001",
  created_at: NOW,
};

// ---- Organization ----------------------------------------------------------

export const DEMO_ORGANIZATION = {
  id: "demo-org-001",
  name: "Demo GmbH",
  slug: "demo-gmbh",
  country_code: "DE",
  sector: "digital_infrastructure",
  employee_band: "50_to_249",
  nis2_applicable: true,
  entity_class: "important",
  onboarding_completed_at: daysAgo(30),
  created_at: daysAgo(60),
};

export const DEMO_MEMBER = {
  organization_id: "demo-org-001",
  user_id: "demo-user-001",
  role: "owner",
  joined_at: daysAgo(60),
};

// ---- Plans (mirrored from seed.sql) ----------------------------------------

export const DEMO_PLANS = [
  {
    id: "demo-plan-free",
    code: "free",
    name: "Free",
    price_eur: 0,
    max_members: 1,
    features_json: {
      assessments_per_month: 1,
      policy_generations_per_month: 1,
      evidence_items_limit: 25,
      team_members: 1,
      pdf_export: false,
    },
  },
  {
    id: "demo-plan-starter",
    code: "starter",
    name: "Starter",
    price_eur: 49,
    max_members: 1,
    features_json: {
      assessments_per_month: 5,
      policy_generations_per_month: 10,
      evidence_items_limit: 100,
      team_members: 1,
      pdf_export: true,
    },
  },
  {
    id: "demo-plan-pro",
    code: "pro",
    name: "Pro",
    price_eur: 149,
    max_members: 5,
    features_json: {
      assessments_per_month: 25,
      policy_generations_per_month: 50,
      evidence_items_limit: 500,
      team_members: 5,
      pdf_export: true,
    },
  },
  {
    id: "demo-plan-team",
    code: "team",
    name: "Team",
    price_eur: 249,
    max_members: 15,
    features_json: {
      assessments_per_month: 100,
      policy_generations_per_month: 200,
      evidence_items_limit: 2000,
      team_members: 15,
      pdf_export: true,
    },
  },
];

// ---- Subscription ----------------------------------------------------------

export const DEMO_SUBSCRIPTION = {
  id: "demo-sub-001",
  organization_id: "demo-org-001",
  plan_id: "demo-plan-free",
  stripe_customer_id: null,
  stripe_subscription_id: null,
  status: "active",
  current_period_start: daysAgo(30),
  current_period_end: daysFromNow(0),
  cancel_at_period_end: false,
  created_at: daysAgo(30),
  updated_at: NOW,
};

// ---- Control Catalog (21 NIS2 controls from seed.sql) ----------------------

export const DEMO_CONTROLS = [
  {
    id: "demo-ctrl-01",
    framework: "nis2",
    control_code: "NIS2-01",
    article_ref: "Article 21(2)(a)",
    title: "Cyber risk management policy",
    description:
      "Establish and maintain a documented cybersecurity risk management policy approved by management.",
    guidance:
      "Check whether the organization has a current policy defining scope, responsibilities, review cadence, and risk ownership.",
    weight: 1.0,
    sort_order: 1,
    iso27001_refs: ["5.1", "5.2", "5.7"],
  },
  {
    id: "demo-ctrl-02",
    framework: "nis2",
    control_code: "NIS2-02",
    article_ref: "Article 21(2)(a)",
    title: "Risk assessments and treatment planning",
    description:
      "Perform periodic risk assessments and maintain a documented risk treatment plan.",
    guidance:
      "Check whether risks are identified, analyzed, prioritized, assigned, and tracked to mitigation or acceptance.",
    weight: 1.0,
    sort_order: 2,
    iso27001_refs: ["5.3", "5.4", "8.2"],
  },
  {
    id: "demo-ctrl-03",
    framework: "nis2",
    control_code: "NIS2-03",
    article_ref: "Article 21(2)(b)",
    title: "Incident response policy and roles",
    description:
      "Define incident response procedures, ownership, escalation, and coordination responsibilities.",
    guidance:
      "Check whether incident handling is documented and whether internal roles and external contacts are clearly assigned.",
    weight: 1.0,
    sort_order: 3,
    iso27001_refs: ["5.24", "5.25"],
  },
  {
    id: "demo-ctrl-04",
    framework: "nis2",
    control_code: "NIS2-04",
    article_ref: "Article 21(2)(b)",
    title: "Incident detection, logging, and reporting",
    description:
      "Monitor for incidents, record them consistently, and support timely reporting and post-incident review.",
    guidance:
      "Check whether security events are logged, reviewed, classified, and reported through a defined workflow.",
    weight: 1.0,
    sort_order: 4,
    iso27001_refs: ["8.15", "8.16", "5.26"],
  },
  {
    id: "demo-ctrl-05",
    framework: "nis2",
    control_code: "NIS2-05",
    article_ref: "Article 21(2)(c)",
    title: "Business continuity and disaster recovery plans",
    description:
      "Maintain business continuity and disaster recovery plans for relevant services and systems.",
    guidance:
      "Check whether continuity and recovery plans exist, define recovery objectives, and are reviewed periodically.",
    weight: 1.0,
    sort_order: 5,
    iso27001_refs: ["5.29", "5.30"],
  },
  {
    id: "demo-ctrl-06",
    framework: "nis2",
    control_code: "NIS2-06",
    article_ref: "Article 21(2)(c)",
    title: "Backups and restoration testing",
    description:
      "Back up critical data and systems and verify that restoration works in practice.",
    guidance:
      "Check whether backups are documented, protected, retained appropriately, and tested through restore exercises.",
    weight: 1.0,
    sort_order: 6,
    iso27001_refs: ["8.13", "8.14"],
  },
  {
    id: "demo-ctrl-07",
    framework: "nis2",
    control_code: "NIS2-07",
    article_ref: "Article 21(2)(d)",
    title: "Crisis management and communications",
    description:
      "Prepare for severe incidents with defined crisis coordination and communication procedures.",
    guidance:
      "Check whether crisis roles, external communication paths, and decision-making processes are documented and rehearsed.",
    weight: 1.0,
    sort_order: 7,
    iso27001_refs: ["5.29", "5.30", "5.5"],
  },
  {
    id: "demo-ctrl-08",
    framework: "nis2",
    control_code: "NIS2-08",
    article_ref: "Article 21(2)(e)",
    title: "Supply chain security policy",
    description:
      "Establish a policy for managing cybersecurity risk from suppliers and service providers.",
    guidance:
      "Check whether supplier security expectations, categorization, and review criteria are documented.",
    weight: 1.0,
    sort_order: 8,
    iso27001_refs: ["5.19", "5.20", "5.21"],
  },
  {
    id: "demo-ctrl-09",
    framework: "nis2",
    control_code: "NIS2-09",
    article_ref: "Article 21(2)(e)",
    title: "Supplier due diligence and onboarding",
    description:
      "Assess supplier risk before onboarding third parties with access to data, systems, or critical services.",
    guidance:
      "Check whether vendor reviews cover security posture, data handling, criticality, and dependency risk.",
    weight: 1.0,
    sort_order: 9,
    iso27001_refs: ["5.19", "5.20"],
  },
  {
    id: "demo-ctrl-10",
    framework: "nis2",
    control_code: "NIS2-10",
    article_ref: "Article 21(2)(e)",
    title: "Supplier monitoring and contractual controls",
    description:
      "Maintain contractual security clauses and ongoing review for important suppliers.",
    guidance:
      "Check whether contracts define security obligations and whether supplier performance is monitored over time.",
    weight: 1.0,
    sort_order: 10,
    iso27001_refs: ["5.20", "5.21", "5.22"],
  },
  {
    id: "demo-ctrl-11",
    framework: "nis2",
    control_code: "NIS2-11",
    article_ref: "Article 21(2)(f)",
    title: "Secure development policy",
    description:
      "Apply secure development principles to internally built software and system changes.",
    guidance:
      "Check whether development standards, code review expectations, and secure design requirements are documented.",
    weight: 1.0,
    sort_order: 11,
    iso27001_refs: ["8.25", "8.27", "8.28"],
  },
  {
    id: "demo-ctrl-12",
    framework: "nis2",
    control_code: "NIS2-12",
    article_ref: "Article 21(2)(f)",
    title: "Vulnerability and patch management",
    description:
      "Identify vulnerabilities and remediate them within defined timelines.",
    guidance:
      "Check whether assets are patched, vulnerabilities are tracked, and exceptions are managed explicitly.",
    weight: 1.0,
    sort_order: 12,
    iso27001_refs: ["8.8", "8.19"],
  },
  {
    id: "demo-ctrl-13",
    framework: "nis2",
    control_code: "NIS2-13",
    article_ref: "Article 21(2)(f)",
    title: "Change and release management",
    description:
      "Control production changes to reduce security regressions and service disruption.",
    guidance:
      "Check whether releases and infrastructure changes follow approvals, testing, rollback planning, and documentation.",
    weight: 1.0,
    sort_order: 13,
    iso27001_refs: ["8.32", "8.33"],
  },
  {
    id: "demo-ctrl-14",
    framework: "nis2",
    control_code: "NIS2-14",
    article_ref: "Article 21(2)(g)",
    title: "Security testing and effectiveness reviews",
    description:
      "Test the effectiveness of cybersecurity measures and identify weaknesses for remediation.",
    guidance:
      "Check whether the organization runs periodic reviews, technical testing, or audits to validate security controls.",
    weight: 1.0,
    sort_order: 14,
    iso27001_refs: ["5.35", "8.29", "8.34"],
  },
  {
    id: "demo-ctrl-15",
    framework: "nis2",
    control_code: "NIS2-15",
    article_ref: "Article 21(2)(g)",
    title: "Cyber hygiene baseline and staff awareness",
    description:
      "Maintain baseline cyber hygiene practices and provide recurring awareness training.",
    guidance:
      "Check whether staff receive role-appropriate guidance on phishing, passwords, device use, and incident escalation.",
    weight: 1.0,
    sort_order: 15,
    iso27001_refs: ["6.3", "6.4", "6.8"],
  },
  {
    id: "demo-ctrl-16",
    framework: "nis2",
    control_code: "NIS2-16",
    article_ref: "Article 21(2)(h)",
    title: "Cryptography and key management",
    description:
      "Define how encryption is used and how cryptographic keys are managed across the organization.",
    guidance:
      "Check whether encryption standards exist for data at rest and in transit and whether key handling is controlled.",
    weight: 1.0,
    sort_order: 16,
    iso27001_refs: ["8.24", "5.31", "5.32"],
  },
  {
    id: "demo-ctrl-17",
    framework: "nis2",
    control_code: "NIS2-17",
    article_ref: "Article 21(2)(i)",
    title: "Human resources security lifecycle",
    description:
      "Manage security responsibilities during hiring, role changes, and offboarding.",
    guidance:
      "Check whether joiner-mover-leaver processes include security responsibilities, confidentiality, and timely access revocation.",
    weight: 1.0,
    sort_order: 17,
    iso27001_refs: ["6.1", "6.2", "6.5"],
  },
  {
    id: "demo-ctrl-18",
    framework: "nis2",
    control_code: "NIS2-18",
    article_ref: "Article 21(2)(i)",
    title: "Asset inventory and classification",
    description:
      "Maintain an inventory of relevant assets and classify them according to business importance and sensitivity.",
    guidance:
      "Check whether systems, devices, software, data, and critical services are inventoried and assigned owners.",
    weight: 1.0,
    sort_order: 18,
    iso27001_refs: ["5.9", "5.12", "5.13"],
  },
  {
    id: "demo-ctrl-19",
    framework: "nis2",
    control_code: "NIS2-19",
    article_ref: "Article 21(2)(i), Article 21(2)(j)",
    title: "Access control and privileged access",
    description:
      "Restrict access based on role and control the use of privileged accounts.",
    guidance:
      "Check whether access is approved, reviewed, least-privilege based, and separated for privileged actions.",
    weight: 1.0,
    sort_order: 19,
    iso27001_refs: ["5.15", "5.16", "8.2"],
  },
  {
    id: "demo-ctrl-20",
    framework: "nis2",
    control_code: "NIS2-20",
    article_ref: "Article 21(2)(j)",
    title: "Multi-factor authentication and secure remote access",
    description:
      "Protect remote and sensitive access with strong authentication and secure connection methods.",
    guidance:
      "Check whether MFA is enforced for administrators, remote access, and high-risk applications.",
    weight: 1.0,
    sort_order: 20,
    iso27001_refs: ["5.17", "8.5", "8.20"],
  },
  {
    id: "demo-ctrl-21",
    framework: "nis2",
    control_code: "NIS2-21",
    article_ref: "Article 21(2)(j)",
    title: "Secure communications and emergency channels",
    description:
      "Use secure communications for routine operations and maintain resilient channels for emergencies.",
    guidance:
      "Check whether sensitive communications are protected and whether fallback communication paths exist during incidents.",
    weight: 1.0,
    sort_order: 21,
    iso27001_refs: ["8.20", "5.14", "5.29"],
  },
];

// ---- Policy Templates (from seed.sql) --------------------------------------

export const DEMO_POLICY_TEMPLATES = [
  {
    id: "demo-tpl-irp",
    code: "incident-response-plan",
    name: "Incident Response Plan",
    description:
      "A practical incident response plan for SMEs covering preparation, escalation, response, and post-incident review.",
    default_sections_json: [
      "Purpose and scope",
      "Roles and responsibilities",
      "Incident severity levels",
      "Detection and reporting",
      "Containment and eradication",
      "Recovery steps",
      "Internal and external communications",
      "Post-incident review",
    ],
    prompt_version: "v1",
    is_active: true,
  },
  {
    id: "demo-tpl-acp",
    code: "access-control-policy",
    name: "Access Control Policy",
    description:
      "A baseline access control policy covering least privilege, joiner-mover-leaver processes, privileged access, and MFA.",
    default_sections_json: [
      "Purpose and scope",
      "Access control principles",
      "User account lifecycle",
      "Privileged access management",
      "Authentication requirements",
      "Access reviews",
      "Third-party access",
      "Exceptions and enforcement",
    ],
    prompt_version: "v1",
    is_active: true,
  },
  {
    id: "demo-tpl-rmp",
    code: "risk-management-policy",
    name: "Cyber Risk Management Policy",
    description:
      "A policy describing how the organization identifies, assesses, treats, and monitors cybersecurity risk.",
    default_sections_json: [
      "Purpose and scope",
      "Risk governance",
      "Risk assessment methodology",
      "Risk treatment options",
      "Risk acceptance",
      "Reporting and review",
      "Roles and responsibilities",
    ],
    prompt_version: "v1",
    is_active: true,
  },
  {
    id: "demo-tpl-ssp",
    code: "supplier-security-policy",
    name: "Supplier Security Policy",
    description:
      "A policy for evaluating and managing third-party cybersecurity risk across onboarding, contracting, and ongoing oversight.",
    default_sections_json: [
      "Purpose and scope",
      "Supplier categorization",
      "Due diligence requirements",
      "Contractual security requirements",
      "Ongoing monitoring",
      "Incident notification expectations",
      "Termination and exit",
    ],
    prompt_version: "v1",
    is_active: true,
  },
];

// ---- Assessment (completed) ------------------------------------------------

export const DEMO_ASSESSMENT = {
  id: "demo-assess-001",
  organization_id: "demo-org-001",
  status: "completed",
  score_pct: 57.14,
  started_by: "demo-user-001",
  started_at: daysAgo(14),
  completed_at: daysAgo(14),
};

// Answers: mix of yes (10), partial (6), no (5) to get a realistic mid-range score
const ANSWER_MAP: Record<string, "yes" | "partial" | "no"> = {
  "demo-ctrl-01": "yes",
  "demo-ctrl-02": "partial",
  "demo-ctrl-03": "yes",
  "demo-ctrl-04": "partial",
  "demo-ctrl-05": "no",
  "demo-ctrl-06": "partial",
  "demo-ctrl-07": "no",
  "demo-ctrl-08": "yes",
  "demo-ctrl-09": "partial",
  "demo-ctrl-10": "no",
  "demo-ctrl-11": "yes",
  "demo-ctrl-12": "yes",
  "demo-ctrl-13": "partial",
  "demo-ctrl-14": "no",
  "demo-ctrl-15": "yes",
  "demo-ctrl-16": "yes",
  "demo-ctrl-17": "yes",
  "demo-ctrl-18": "partial",
  "demo-ctrl-19": "yes",
  "demo-ctrl-20": "yes",
  "demo-ctrl-21": "no",
};

function answerToScore(a: "yes" | "partial" | "no"): number {
  if (a === "yes") return 100;
  if (a === "partial") return 50;
  return 0;
}

function scoreToRag(s: number): "green" | "amber" | "red" {
  if (s >= 80) return "green";
  if (s >= 40) return "amber";
  return "red";
}

export const DEMO_ANSWERS = DEMO_CONTROLS.map((ctrl, i) => ({
  id: `demo-answer-${String(i + 1).padStart(2, "0")}`,
  assessment_id: "demo-assess-001",
  control_id: ctrl.id,
  answer: ANSWER_MAP[ctrl.id],
  note: null,
  answered_by: "demo-user-001",
  answered_at: daysAgo(14),
}));

// Control statuses with RAG
const controlStatusesRaw = DEMO_CONTROLS.map((ctrl) => {
  const answer = ANSWER_MAP[ctrl.id];
  const score = answerToScore(answer);
  const rag = scoreToRag(score);
  return { ctrl, score, rag, weight: ctrl.weight };
});

// Sort for priority rank: red first, then amber, then green
const ragOrder = { red: 0, amber: 1, green: 2 } as const;
const sortedStatuses = [...controlStatusesRaw].sort((a, b) => {
  const ragDiff = ragOrder[a.rag] - ragOrder[b.rag];
  if (ragDiff !== 0) return ragDiff;
  return b.weight - a.weight;
});

export const DEMO_CONTROL_STATUSES = sortedStatuses.map((s, i) => ({
  id: `demo-cs-${String(i + 1).padStart(2, "0")}`,
  assessment_id: "demo-assess-001",
  control_id: s.ctrl.id,
  score: s.score,
  rag: s.rag,
  priority_rank: i + 1,
  remediation_summary:
    s.rag === "green"
      ? "Control is adequately implemented."
      : s.rag === "amber"
        ? `Partial implementation of ${s.ctrl.title}. Review guidance and close gaps.`
        : `${s.ctrl.title} is not implemented. Immediate action required.`,
}));

// ---- Remediation Actions (for red and amber controls) ----------------------

let actionIdx = 0;
export const DEMO_REMEDIATION_ACTIONS: Array<Record<string, unknown>> = [];
for (const cs of DEMO_CONTROL_STATUSES) {
  if (cs.rag === "red" || cs.rag === "amber") {
    const ctrl = DEMO_CONTROLS.find((c) => c.id === cs.control_id)!;
    actionIdx++;
    DEMO_REMEDIATION_ACTIONS.push({
      id: `demo-action-${String(actionIdx).padStart(2, "0")}`,
      organization_id: "demo-org-001",
      assessment_id: "demo-assess-001",
      control_id: cs.control_id,
      title:
        cs.rag === "red"
          ? `Implement ${ctrl.title}`
          : `Improve ${ctrl.title}`,
      description:
        cs.rag === "red"
          ? `Urgently establish processes for: ${ctrl.description}`
          : `Close gaps identified in: ${ctrl.guidance}`,
      priority: cs.rag === "red" ? "high" : "medium",
      status: "open",
      owner_user_id: "demo-user-001",
      due_date: dateOnly(daysFromNow(cs.rag === "red" ? 30 : 60)),
      created_at: daysAgo(14),
    });
  }
}

// ---- Evidence Items --------------------------------------------------------

export const DEMO_EVIDENCE_ITEMS = [
  {
    id: "demo-ev-001",
    organization_id: "demo-org-001",
    title: "ISO 27001 Certificate",
    description:
      "Current ISO 27001:2022 certificate issued by TUV Rheinland.",
    owner_user_id: "demo-user-001",
    status: "valid",
    expires_at: dateOnly(daysFromNow(200)),
    last_reviewed_at: dateOnly(daysAgo(10)),
    created_at: daysAgo(45),
  },
  {
    id: "demo-ev-002",
    organization_id: "demo-org-001",
    title: "Penetration Test Report Q4 2025",
    description: "External penetration test performed by SecureAudit AG.",
    owner_user_id: "demo-user-001",
    status: "expiring",
    expires_at: dateOnly(daysFromNow(30)),
    last_reviewed_at: dateOnly(daysAgo(60)),
    created_at: daysAgo(90),
  },
  {
    id: "demo-ev-003",
    organization_id: "demo-org-001",
    title: "Employee Security Training Records 2024",
    description:
      "Completion records for annual security awareness training.",
    owner_user_id: "demo-user-001",
    status: "expired",
    expires_at: dateOnly(daysAgo(15)),
    last_reviewed_at: dateOnly(daysAgo(100)),
    created_at: daysAgo(365),
  },
];

// Link evidence to controls
export const DEMO_EVIDENCE_ITEM_CONTROLS = [
  { evidence_item_id: "demo-ev-001", control_id: "demo-ctrl-01" },
  { evidence_item_id: "demo-ev-001", control_id: "demo-ctrl-02" },
  { evidence_item_id: "demo-ev-002", control_id: "demo-ctrl-14" },
  { evidence_item_id: "demo-ev-002", control_id: "demo-ctrl-12" },
  { evidence_item_id: "demo-ev-003", control_id: "demo-ctrl-15" },
];

// Evidence files
export const DEMO_EVIDENCE_FILES = [
  {
    id: "demo-ef-001",
    evidence_item_id: "demo-ev-001",
    storage_path: "org/demo-org-001/evidence/demo-ev-001/iso27001-cert.pdf",
    file_name: "iso27001-cert.pdf",
    mime_type: "application/pdf",
    byte_size: 245_000,
    checksum_sha256: null,
    uploaded_by: "demo-user-001",
    uploaded_at: daysAgo(45),
  },
];

// ---- Policy Document (completed) -------------------------------------------

export const DEMO_POLICY_DOCUMENTS = [
  {
    id: "demo-policy-doc-001",
    organization_id: "demo-org-001",
    template_id: "demo-tpl-irp",
    requested_by: "demo-user-001",
    status: "completed",
    model: "gpt-4o",
    input_context_json: {
      templateId: "demo-tpl-irp",
      context: "",
      organizationId: "demo-org-001",
    },
    input_hash: "demo-hash-001",
    structured_content_json: {
      title: "Incident Response Plan",
      sections: [
        {
          heading: "Purpose and scope",
          body: "This document establishes the incident response framework for Demo GmbH, covering all digital services operated by the organization under NIS2 obligations.",
        },
        {
          heading: "Roles and responsibilities",
          body: "The CISO leads the incident response team. Department heads are responsible for escalating anomalies. All staff must report suspected incidents within 1 hour of detection.",
        },
        {
          heading: "Incident severity levels",
          body: "P1 (Critical): Service outage affecting customers. P2 (High): Data breach or confirmed intrusion. P3 (Medium): Suspicious activity under investigation. P4 (Low): Minor policy violation.",
        },
        {
          heading: "Detection and reporting",
          body: "Security events are captured via centralised SIEM. Alerts are triaged by the SOC within 15 minutes. NIS2 reportable incidents must be communicated to the national CSIRT within 24 hours.",
        },
        {
          heading: "Containment and eradication",
          body: "Affected systems are isolated immediately. Forensic images are captured before remediation. Root cause analysis is performed and documented.",
        },
        {
          heading: "Recovery steps",
          body: "Restoration follows the documented DR plan. Systems are verified before reconnection. Stakeholders are notified upon full recovery.",
        },
        {
          heading: "Internal and external communications",
          body: "Internal updates are shared via the #incident Slack channel. External notifications follow the legal communication plan including CSIRT, affected customers, and supervisory authorities.",
        },
        {
          heading: "Post-incident review",
          body: "A retrospective is held within 5 business days. Lessons learned are documented and tracked as remediation actions in ComplianceKit.",
        },
      ],
    },
    docx_path:
      "org/demo-org-001/policies/demo-policy-doc-001/policy.docx",
    pdf_path:
      "org/demo-org-001/policies/demo-policy-doc-001/policy.pdf",
    error_message: null,
    created_at: daysAgo(7),
    completed_at: daysAgo(7),
  },
];

// ---- Onboarding Response ---------------------------------------------------

export const DEMO_ONBOARDING_RESPONSE = {
  id: "demo-onboard-001",
  organization_id: "demo-org-001",
  answers_json: {
    sector: "digital_infrastructure",
    employee_count: "50_to_249",
    annual_revenue: "10m_to_50m",
    provides_essential_service: "yes",
    country: "DE",
  },
  derived_result_json: {
    nis2_applicable: true,
    entity_class: "important",
    reasoning:
      "The organization operates in the digital infrastructure sector with 50-249 employees in Germany.",
  },
  completed_by: "demo-user-001",
  completed_at: daysAgo(30),
};

// ---- Email notifications (empty for demo) ----------------------------------

export const DEMO_EMAIL_NOTIFICATIONS: Array<Record<string, unknown>> = [];

// ---- Organization invites (empty for demo) ---------------------------------

export const DEMO_ORGANIZATION_INVITES: Array<Record<string, unknown>> = [];
