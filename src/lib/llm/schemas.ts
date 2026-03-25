import { z } from "zod";

export const policySectionSchema = z.object({
  heading: z.string(),
  content: z.string(), // markdown-formatted content
});

export const policyOutputSchema = z.object({
  title: z.string(),
  version: z.string(),
  effectiveDate: z.string(),
  sections: z.array(policySectionSchema),
  glossary: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      }),
    )
    .optional(),
});

export type PolicyOutput = z.infer<typeof policyOutputSchema>;
export type PolicySection = z.infer<typeof policySectionSchema>;
