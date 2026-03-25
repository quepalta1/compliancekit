/* ------------------------------------------------------------------ */
/*  Zod validation schemas for ComplianceKit                           */
/* ------------------------------------------------------------------ */

import { z } from 'zod';

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
