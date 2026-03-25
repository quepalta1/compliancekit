insert into public.plans (code, name, price_eur, max_members, features_json)
values
  (
    'free',
    'Free',
    0,
    1,
    '{
      "assessments_per_month": 1,
      "policy_generations_per_month": 1,
      "evidence_items_limit": 25,
      "team_members": 1,
      "pdf_export": false
    }'::jsonb
  ),
  (
    'starter',
    'Starter',
    49,
    1,
    '{
      "assessments_per_month": 5,
      "policy_generations_per_month": 10,
      "evidence_items_limit": 100,
      "team_members": 1,
      "pdf_export": true
    }'::jsonb
  ),
  (
    'pro',
    'Pro',
    149,
    5,
    '{
      "assessments_per_month": 25,
      "policy_generations_per_month": 50,
      "evidence_items_limit": 500,
      "team_members": 5,
      "pdf_export": true
    }'::jsonb
  ),
  (
    'team',
    'Team',
    249,
    15,
    '{
      "assessments_per_month": 100,
      "policy_generations_per_month": 200,
      "evidence_items_limit": 2000,
      "team_members": 15,
      "pdf_export": true
    }'::jsonb
  )
on conflict (code) do update
set
  name = excluded.name,
  price_eur = excluded.price_eur,
  max_members = excluded.max_members,
  features_json = excluded.features_json;

insert into public.control_catalog (
  control_code,
  article_ref,
  title,
  description,
  guidance,
  weight,
  sort_order,
  iso27001_refs
)
values
  (
    'NIS2-01',
    'Article 21(2)(a)',
    'Cyber risk management policy',
    'Establish and maintain a documented cybersecurity risk management policy approved by management.',
    'Check whether the organization has a current policy defining scope, responsibilities, review cadence, and risk ownership.',
    1.00,
    1,
    array['5.1', '5.2', '5.7']
  ),
  (
    'NIS2-02',
    'Article 21(2)(a)',
    'Risk assessments and treatment planning',
    'Perform periodic risk assessments and maintain a documented risk treatment plan.',
    'Check whether risks are identified, analyzed, prioritized, assigned, and tracked to mitigation or acceptance.',
    1.00,
    2,
    array['5.3', '5.4', '8.2']
  ),
  (
    'NIS2-03',
    'Article 21(2)(b)',
    'Incident response policy and roles',
    'Define incident response procedures, ownership, escalation, and coordination responsibilities.',
    'Check whether incident handling is documented and whether internal roles and external contacts are clearly assigned.',
    1.00,
    3,
    array['5.24', '5.25']
  ),
  (
    'NIS2-04',
    'Article 21(2)(b)',
    'Incident detection, logging, and reporting',
    'Monitor for incidents, record them consistently, and support timely reporting and post-incident review.',
    'Check whether security events are logged, reviewed, classified, and reported through a defined workflow.',
    1.00,
    4,
    array['8.15', '8.16', '5.26']
  ),
  (
    'NIS2-05',
    'Article 21(2)(c)',
    'Business continuity and disaster recovery plans',
    'Maintain business continuity and disaster recovery plans for relevant services and systems.',
    'Check whether continuity and recovery plans exist, define recovery objectives, and are reviewed periodically.',
    1.00,
    5,
    array['5.29', '5.30']
  ),
  (
    'NIS2-06',
    'Article 21(2)(c)',
    'Backups and restoration testing',
    'Back up critical data and systems and verify that restoration works in practice.',
    'Check whether backups are documented, protected, retained appropriately, and tested through restore exercises.',
    1.00,
    6,
    array['8.13', '8.14']
  ),
  (
    'NIS2-07',
    'Article 21(2)(d)',
    'Crisis management and communications',
    'Prepare for severe incidents with defined crisis coordination and communication procedures.',
    'Check whether crisis roles, external communication paths, and decision-making processes are documented and rehearsed.',
    1.00,
    7,
    array['5.29', '5.30', '5.5']
  ),
  (
    'NIS2-08',
    'Article 21(2)(e)',
    'Supply chain security policy',
    'Establish a policy for managing cybersecurity risk from suppliers and service providers.',
    'Check whether supplier security expectations, categorization, and review criteria are documented.',
    1.00,
    8,
    array['5.19', '5.20', '5.21']
  ),
  (
    'NIS2-09',
    'Article 21(2)(e)',
    'Supplier due diligence and onboarding',
    'Assess supplier risk before onboarding third parties with access to data, systems, or critical services.',
    'Check whether vendor reviews cover security posture, data handling, criticality, and dependency risk.',
    1.00,
    9,
    array['5.19', '5.20']
  ),
  (
    'NIS2-10',
    'Article 21(2)(e)',
    'Supplier monitoring and contractual controls',
    'Maintain contractual security clauses and ongoing review for important suppliers.',
    'Check whether contracts define security obligations and whether supplier performance is monitored over time.',
    1.00,
    10,
    array['5.20', '5.21', '5.22']
  ),
  (
    'NIS2-11',
    'Article 21(2)(f)',
    'Secure development policy',
    'Apply secure development principles to internally built software and system changes.',
    'Check whether development standards, code review expectations, and secure design requirements are documented.',
    1.00,
    11,
    array['8.25', '8.27', '8.28']
  ),
  (
    'NIS2-12',
    'Article 21(2)(f)',
    'Vulnerability and patch management',
    'Identify vulnerabilities and remediate them within defined timelines.',
    'Check whether assets are patched, vulnerabilities are tracked, and exceptions are managed explicitly.',
    1.00,
    12,
    array['8.8', '8.19']
  ),
  (
    'NIS2-13',
    'Article 21(2)(f)',
    'Change and release management',
    'Control production changes to reduce security regressions and service disruption.',
    'Check whether releases and infrastructure changes follow approvals, testing, rollback planning, and documentation.',
    1.00,
    13,
    array['8.32', '8.33']
  ),
  (
    'NIS2-14',
    'Article 21(2)(g)',
    'Security testing and effectiveness reviews',
    'Test the effectiveness of cybersecurity measures and identify weaknesses for remediation.',
    'Check whether the organization runs periodic reviews, technical testing, or audits to validate security controls.',
    1.00,
    14,
    array['5.35', '8.29', '8.34']
  ),
  (
    'NIS2-15',
    'Article 21(2)(g)',
    'Cyber hygiene baseline and staff awareness',
    'Maintain baseline cyber hygiene practices and provide recurring awareness training.',
    'Check whether staff receive role-appropriate guidance on phishing, passwords, device use, and incident escalation.',
    1.00,
    15,
    array['6.3', '6.4', '6.8']
  ),
  (
    'NIS2-16',
    'Article 21(2)(h)',
    'Cryptography and key management',
    'Define how encryption is used and how cryptographic keys are managed across the organization.',
    'Check whether encryption standards exist for data at rest and in transit and whether key handling is controlled.',
    1.00,
    16,
    array['8.24', '5.31', '5.32']
  ),
  (
    'NIS2-17',
    'Article 21(2)(i)',
    'Human resources security lifecycle',
    'Manage security responsibilities during hiring, role changes, and offboarding.',
    'Check whether joiner-mover-leaver processes include security responsibilities, confidentiality, and timely access revocation.',
    1.00,
    17,
    array['6.1', '6.2', '6.5']
  ),
  (
    'NIS2-18',
    'Article 21(2)(i)',
    'Asset inventory and classification',
    'Maintain an inventory of relevant assets and classify them according to business importance and sensitivity.',
    'Check whether systems, devices, software, data, and critical services are inventoried and assigned owners.',
    1.00,
    18,
    array['5.9', '5.12', '5.13']
  ),
  (
    'NIS2-19',
    'Article 21(2)(i), Article 21(2)(j)',
    'Access control and privileged access',
    'Restrict access based on role and control the use of privileged accounts.',
    'Check whether access is approved, reviewed, least-privilege based, and separated for privileged actions.',
    1.00,
    19,
    array['5.15', '5.16', '8.2']
  ),
  (
    'NIS2-20',
    'Article 21(2)(j)',
    'Multi-factor authentication and secure remote access',
    'Protect remote and sensitive access with strong authentication and secure connection methods.',
    'Check whether MFA is enforced for administrators, remote access, and high-risk applications.',
    1.00,
    20,
    array['5.17', '8.5', '8.20']
  ),
  (
    'NIS2-21',
    'Article 21(2)(j)',
    'Secure communications and emergency channels',
    'Use secure communications for routine operations and maintain resilient channels for emergencies.',
    'Check whether sensitive communications are protected and whether fallback communication paths exist during incidents.',
    1.00,
    21,
    array['8.20', '5.14', '5.29']
  )
on conflict (control_code) do update
set
  article_ref = excluded.article_ref,
  title = excluded.title,
  description = excluded.description,
  guidance = excluded.guidance,
  weight = excluded.weight,
  sort_order = excluded.sort_order,
  iso27001_refs = excluded.iso27001_refs;

insert into public.policy_templates (
  code,
  name,
  description,
  default_sections_json,
  prompt_version,
  is_active
)
values
  (
    'incident-response-plan',
    'Incident Response Plan',
    'A practical incident response plan for SMEs covering preparation, escalation, response, and post-incident review.',
    '[
      "Purpose and scope",
      "Roles and responsibilities",
      "Incident severity levels",
      "Detection and reporting",
      "Containment and eradication",
      "Recovery steps",
      "Internal and external communications",
      "Post-incident review"
    ]'::jsonb,
    'v1',
    true
  ),
  (
    'access-control-policy',
    'Access Control Policy',
    'A baseline access control policy covering least privilege, joiner-mover-leaver processes, privileged access, and MFA.',
    '[
      "Purpose and scope",
      "Access control principles",
      "User account lifecycle",
      "Privileged access management",
      "Authentication requirements",
      "Access reviews",
      "Third-party access",
      "Exceptions and enforcement"
    ]'::jsonb,
    'v1',
    true
  ),
  (
    'risk-management-policy',
    'Cyber Risk Management Policy',
    'A policy describing how the organization identifies, assesses, treats, and monitors cybersecurity risk.',
    '[
      "Purpose and scope",
      "Risk governance",
      "Risk assessment methodology",
      "Risk treatment options",
      "Risk acceptance",
      "Reporting and review",
      "Roles and responsibilities"
    ]'::jsonb,
    'v1',
    true
  ),
  (
    'supplier-security-policy',
    'Supplier Security Policy',
    'A policy for evaluating and managing third-party cybersecurity risk across onboarding, contracting, and ongoing oversight.',
    '[
      "Purpose and scope",
      "Supplier categorization",
      "Due diligence requirements",
      "Contractual security requirements",
      "Ongoing monitoring",
      "Incident notification expectations",
      "Termination and exit"
    ]'::jsonb,
    'v1',
    true
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  default_sections_json = excluded.default_sections_json,
  prompt_version = excluded.prompt_version,
  is_active = excluded.is_active;
