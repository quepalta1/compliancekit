/* ------------------------------------------------------------------ */
/*  Zod validation schemas for ComplianceKit                           */
/* ------------------------------------------------------------------ */

import { z } from 'zod';
import {
  REQUIREMENT_CATEGORIES,
  REQUIREMENT_TYPES,
  SUPPLIER_COMPLIANCE_STATUSES,
} from './constants';

// ── Auth ────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginValues = z.infer<typeof loginSchema>;

// ── Organizations ───────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric characters and hyphens only',
    ),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;

export const createBuyerRequirementSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  category: z.enum(REQUIREMENT_CATEGORIES),
  requirementType: z.enum(REQUIREMENT_TYPES),
  frameworkRef: z
    .string()
    .max(80, 'Framework reference must be at most 80 characters')
    .optional()
    .transform((value) => value?.trim() || undefined),
  evidenceHint: z
    .string()
    .max(240, 'Evidence hint must be at most 240 characters')
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export const connectSupplierSchema = z.object({
  supplierSlug: z
    .string()
    .min(3, 'Supplier slug must be at least 3 characters')
    .max(50, 'Supplier slug must be at most 50 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Supplier slug must be lowercase alphanumeric characters and hyphens only',
    ),
});

export const submitSupplierRequirementResponseSchema = z.object({
  relationshipId: z.string().uuid('Invalid relationship id'),
  requirementId: z.string().uuid('Invalid requirement id'),
  complianceStatus: z.enum(SUPPLIER_COMPLIANCE_STATUSES),
  responseText: z
    .string()
    .min(10, 'Response must be at least 10 characters')
    .max(2000, 'Response must be at most 2000 characters'),
  evidenceSummary: z
    .string()
    .max(500, 'Evidence summary must be at most 500 characters')
    .optional()
    .transform((value) => value?.trim() || undefined),
});
