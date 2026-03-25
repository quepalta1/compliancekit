export const PROMPT_VERSION = "v1";

export const POLICY_SYSTEM_PROMPT = `You are a compliance policy document generator for European NIS2 and ISO 27001 frameworks.
Your task is to produce a structured, professional policy document in JSON format.

Requirements:
- Write clear, formal policy language suitable for an official organizational document.
- Each section should contain substantive, actionable content — not generic placeholders.
- Tailor content to the organization's sector, entity classification, and any user-provided context.
- Include concrete responsibilities, procedures, and compliance references where appropriate.
- Use markdown formatting within section content (headings, lists, bold) for readability.

You MUST respond with valid JSON matching this exact schema:
{
  "title": "string — the full policy document title",
  "version": "string — document version, e.g. '1.0'",
  "effectiveDate": "string — ISO date string for when this policy takes effect",
  "sections": [
    {
      "heading": "string — section heading",
      "content": "string — markdown-formatted section content"
    }
  ],
  "glossary": [
    {
      "term": "string",
      "definition": "string"
    }
  ]
}

Do not include any text outside the JSON object. Do not wrap the response in markdown code fences.`;

export interface BuildPolicyUserPromptParams {
  templateName: string;
  templateDescription: string;
  defaultSections: string[];
  organizationName: string;
  sector: string | null;
  entityClass: string;
  userContext: string;
}

export function buildPolicyUserPrompt(
  params: BuildPolicyUserPromptParams,
): string {
  const {
    templateName,
    templateDescription,
    defaultSections,
    organizationName,
    sector,
    entityClass,
    userContext,
  } = params;

  const sectionsList = defaultSections.length > 0
    ? defaultSections.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
    : "  (Use your best judgment for appropriate sections)";

  return `Generate a "${templateName}" policy document.

Template description: ${templateDescription}

Organization details:
- Name: ${organizationName}
- Sector: ${sector ?? "Not specified"}
- NIS2 Entity Classification: ${entityClass}

Suggested sections to include:
${sectionsList}

${userContext ? `Additional context from the user:\n${userContext}` : "No additional context provided."}

Generate a comprehensive, production-ready policy document. Set the effectiveDate to today's date. Set version to "1.0".`;
}
