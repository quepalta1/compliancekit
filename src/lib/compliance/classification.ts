/* ------------------------------------------------------------------ */
/*  Deterministic NIS2 classification engine                          */
/*  Pure rules-based logic — no AI involved.                          */
/* ------------------------------------------------------------------ */

import type { EntityClass } from '@/lib/constants';

// ── Sector lists per NIS2 Annexes ──────────────────────────────────

/** Annex I — sectors of high criticality (eligible for "essential") */
export const ANNEX_I_SECTORS = [
  'energy',
  'transport',
  'banking',
  'financial_market',
  'health',
  'drinking_water',
  'waste_water',
  'digital_infrastructure',
  'ict_service_management',
  'public_administration',
  'space',
] as const;

/** Annex II — other critical sectors (typically "important") */
export const ANNEX_II_SECTORS = [
  'postal_courier',
  'waste_management',
  'chemicals',
  'food',
  'manufacturing',
  'digital_providers',
  'research',
] as const;

export type AnnexISector = (typeof ANNEX_I_SECTORS)[number];
export type AnnexIISector = (typeof ANNEX_II_SECTORS)[number];
export type Sector = AnnexISector | AnnexIISector | 'other';

// ── EU member-state list ───────────────────────────────────────────

export const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
] as const;

export type EuCountryCode = (typeof EU_COUNTRIES)[number]['code'];
export type Country = EuCountryCode | 'non_eu';

// ── Onboarding answer types ────────────────────────────────────────

export type EmployeeCount = 'under_50' | '50_to_249' | '250_plus';
export type AnnualRevenue = 'under_10m' | '10m_to_50m' | 'over_50m';
export type EssentialServiceAnswer = 'yes' | 'no' | 'unsure';

export interface OnboardingAnswers {
  sector: Sector;
  employee_count: EmployeeCount;
  annual_revenue: AnnualRevenue;
  provides_essential_service: EssentialServiceAnswer;
  country: Country;
}

// ── Onboarding question definitions ────────────────────────────────

export interface QuestionOption {
  value: string;
  label: string;
}

export interface OnboardingQuestion {
  id: keyof OnboardingAnswers;
  label: string;
  description: string;
  options: QuestionOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'sector',
    label: 'Which sector does your organization primarily operate in?',
    description:
      'NIS2 applies to specific sectors listed in Annex I (high criticality) and Annex II (other critical sectors).',
    options: [
      { value: 'energy', label: 'Energy' },
      { value: 'transport', label: 'Transport' },
      { value: 'banking', label: 'Banking' },
      { value: 'financial_market', label: 'Financial Market Infrastructures' },
      { value: 'health', label: 'Health' },
      { value: 'drinking_water', label: 'Drinking Water' },
      { value: 'waste_water', label: 'Waste Water' },
      { value: 'digital_infrastructure', label: 'Digital Infrastructure' },
      { value: 'ict_service_management', label: 'ICT Service Management (B2B)' },
      { value: 'public_administration', label: 'Public Administration' },
      { value: 'space', label: 'Space' },
      { value: 'postal_courier', label: 'Postal and Courier Services' },
      { value: 'waste_management', label: 'Waste Management' },
      { value: 'chemicals', label: 'Chemicals' },
      { value: 'food', label: 'Food Production, Processing and Distribution' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'digital_providers', label: 'Digital Providers' },
      { value: 'research', label: 'Research' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'employee_count',
    label: 'How many employees does your organization have?',
    description:
      'Entity size is a key factor in NIS2 applicability. Medium and large entities are generally in scope.',
    options: [
      { value: 'under_50', label: 'Fewer than 50 employees' },
      { value: '50_to_249', label: '50 to 249 employees' },
      { value: '250_plus', label: '250 or more employees' },
    ],
  },
  {
    id: 'annual_revenue',
    label: "What is your organization's annual revenue or balance sheet total?",
    description:
      'Revenue thresholds complement employee count for determining entity size under NIS2.',
    options: [
      { value: 'under_10m', label: 'Under EUR 10 million' },
      { value: '10m_to_50m', label: 'EUR 10 million to EUR 50 million' },
      { value: 'over_50m', label: 'Over EUR 50 million' },
    ],
  },
  {
    id: 'provides_essential_service',
    label:
      'Does your organization provide a service that is essential for the maintenance of critical societal or economic activities?',
    description:
      'Some smaller entities may still fall under NIS2 if they provide essential services.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Unsure' },
    ],
  },
  {
    id: 'country',
    label: 'In which EU member state is your organization established?',
    description: 'NIS2 applies to entities established within the European Union.',
    options: [
      { value: 'AT', label: 'Austria' },
      { value: 'BE', label: 'Belgium' },
      { value: 'BG', label: 'Bulgaria' },
      { value: 'HR', label: 'Croatia' },
      { value: 'CY', label: 'Cyprus' },
      { value: 'CZ', label: 'Czech Republic' },
      { value: 'DK', label: 'Denmark' },
      { value: 'EE', label: 'Estonia' },
      { value: 'FI', label: 'Finland' },
      { value: 'FR', label: 'France' },
      { value: 'DE', label: 'Germany' },
      { value: 'GR', label: 'Greece' },
      { value: 'HU', label: 'Hungary' },
      { value: 'IE', label: 'Ireland' },
      { value: 'IT', label: 'Italy' },
      { value: 'LV', label: 'Latvia' },
      { value: 'LT', label: 'Lithuania' },
      { value: 'LU', label: 'Luxembourg' },
      { value: 'MT', label: 'Malta' },
      { value: 'NL', label: 'Netherlands' },
      { value: 'PL', label: 'Poland' },
      { value: 'PT', label: 'Portugal' },
      { value: 'RO', label: 'Romania' },
      { value: 'SK', label: 'Slovakia' },
      { value: 'SI', label: 'Slovenia' },
      { value: 'ES', label: 'Spain' },
      { value: 'SE', label: 'Sweden' },
      { value: 'non_eu', label: 'Non-EU country' },
    ],
  },
];

// ── Classification result ──────────────────────────────────────────

export interface ClassificationResult {
  nis2_applicable: boolean;
  entity_class: EntityClass;
  explanation: string;
}

// ── Size helpers ───────────────────────────────────────────────────

type EntitySize = 'large' | 'medium' | 'small';

function determineEntitySize(
  employeeCount: EmployeeCount,
  annualRevenue: AnnualRevenue
): EntitySize {
  if (employeeCount === '250_plus' || annualRevenue === 'over_50m') {
    return 'large';
  }
  if (employeeCount === '50_to_249' || annualRevenue === '10m_to_50m') {
    return 'medium';
  }
  return 'small';
}

// ── Sector helpers ─────────────────────────────────────────────────

function isAnnexISector(sector: Sector): sector is AnnexISector {
  return (ANNEX_I_SECTORS as readonly string[]).includes(sector);
}

function isAnnexIISector(sector: Sector): sector is AnnexIISector {
  return (ANNEX_II_SECTORS as readonly string[]).includes(sector);
}

// ── Human-readable labels ──────────────────────────────────────────

function sectorLabel(sector: Sector): string {
  const question = ONBOARDING_QUESTIONS.find((q) => q.id === 'sector');
  const option = question?.options.find((o) => o.value === sector);
  return option?.label ?? sector;
}

function sizeLabel(size: EntitySize): string {
  switch (size) {
    case 'large':
      return 'large';
    case 'medium':
      return 'medium-sized';
    case 'small':
      return 'small';
  }
}

// ── Main classification function ───────────────────────────────────

export function classifyNis2(answers: OnboardingAnswers): ClassificationResult {
  const { sector, employee_count, annual_revenue, provides_essential_service, country } = answers;

  // 1. Non-EU entities are out of scope
  if (country === 'non_eu') {
    return {
      nis2_applicable: false,
      entity_class: 'out_of_scope',
      explanation: 'NIS2 applies to entities established in the EU.',
    };
  }

  // 2. Sectors not listed in Annex I or II
  if (sector === 'other') {
    return {
      nis2_applicable: false,
      entity_class: 'out_of_scope',
      explanation: 'Your sector is not currently listed in NIS2 Annexes I or II.',
    };
  }

  const size = determineEntitySize(employee_count, annual_revenue);
  const sectorName = sectorLabel(sector);
  const sizeName = sizeLabel(size);

  // 3. Annex I sectors
  if (isAnnexISector(sector)) {
    if (size === 'large') {
      return {
        nis2_applicable: true,
        entity_class: 'essential',
        explanation: `As a ${sizeName} entity in the ${sectorName} sector (Annex I), your organization is classified as an essential entity under NIS2.`,
      };
    }

    if (size === 'medium') {
      return {
        nis2_applicable: true,
        entity_class: 'important',
        explanation: `As a ${sizeName} entity in the ${sectorName} sector (Annex I), your organization is classified as an important entity under NIS2.`,
      };
    }

    // Small entity in Annex I
    if (provides_essential_service === 'yes') {
      return {
        nis2_applicable: true,
        entity_class: 'important',
        explanation: `Although your organization is small, it provides an essential service in the ${sectorName} sector (Annex I) and is classified as an important entity under NIS2.`,
      };
    }

    return {
      nis2_applicable: false,
      entity_class: 'out_of_scope',
      explanation:
        'Small entities in NIS2 sectors are generally out of scope unless they provide an essential service.',
    };
  }

  // 4. Annex II sectors
  if (isAnnexIISector(sector)) {
    if (size === 'large' || size === 'medium') {
      return {
        nis2_applicable: true,
        entity_class: 'important',
        explanation: `As a ${sizeName} entity in the ${sectorName} sector (Annex II), your organization is classified as an important entity under NIS2.`,
      };
    }

    // Small entity in Annex II
    if (provides_essential_service === 'yes') {
      return {
        nis2_applicable: true,
        entity_class: 'important',
        explanation: `Although your organization is small, it provides an essential service in the ${sectorName} sector (Annex II) and is classified as an important entity under NIS2.`,
      };
    }

    return {
      nis2_applicable: false,
      entity_class: 'out_of_scope',
      explanation:
        'Small entities in NIS2 sectors are generally out of scope unless they provide an essential service.',
    };
  }

  // Fallback — should not be reachable given the checks above
  return {
    nis2_applicable: false,
    entity_class: 'unknown',
    explanation: 'Unable to determine NIS2 classification. Please review your answers.',
  };
}
