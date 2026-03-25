"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/server/queries/organization";
import { getOpenAI } from "@/lib/llm/openai";
import { POLICY_SYSTEM_PROMPT, buildPolicyUserPrompt } from "@/lib/llm/prompts";
import { policyOutputSchema } from "@/lib/llm/schemas";
import { renderPolicyDocx } from "@/lib/documents/docx-renderer";
import { renderPolicyPdf } from "@/lib/documents/pdf-renderer";

export type PolicyActionState = { error: string } | null;

/**
 * Simple hash function for deduplication.
 * Uses a basic DJB2 hash of the JSON-stringified input.
 */
function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Processes a queued policy document: calls OpenAI, renders DOCX/PDF,
 * uploads to Supabase Storage, and updates the row.
 */
export async function processPolicy(policyDocumentId: string): Promise<void> {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // Fetch the policy document row
  const { data: doc, error: docError } = await supabase
    .from("policy_documents")
    .select("*")
    .eq("id", policyDocumentId)
    .single();

  if (docError || !doc) {
    console.error("[processPolicy] Document not found:", docError?.message);
    return;
  }

  if (doc.status !== "queued") {
    return;
  }

  // Update status to 'generating'
  await supabase
    .from("policy_documents")
    .update({ status: "generating" })
    .eq("id", policyDocumentId);

  try {
    // Fetch the policy template
    const { data: template, error: templateError } = await supabase
      .from("policy_templates")
      .select("*")
      .eq("id", doc.template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateError?.message ?? "unknown"}`);
    }

    // Fetch the organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", doc.organization_id)
      .single();

    if (orgError || !organization) {
      throw new Error(`Organization not found: ${orgError?.message ?? "unknown"}`);
    }

    // Extract default sections from template
    const defaultSections: string[] = Array.isArray(template.default_sections_json)
      ? template.default_sections_json
      : typeof template.default_sections_json === "object" &&
          template.default_sections_json !== null
        ? Object.values(template.default_sections_json).map(String)
        : [];

    // Extract user context from input
    const userContext =
      typeof doc.input_context_json === "object" &&
      doc.input_context_json !== null &&
      "context" in doc.input_context_json
        ? String((doc.input_context_json as Record<string, unknown>).context ?? "")
        : "";

    // Build the prompt
    const userPrompt = buildPolicyUserPrompt({
      templateName: template.name,
      templateDescription: template.description,
      defaultSections,
      organizationName: organization.name,
      sector: organization.sector,
      entityClass: organization.entity_class,
      userContext,
    });

    // Call OpenAI
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: doc.model || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: POLICY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("OpenAI returned empty content");
    }

    // Parse and validate the response
    const parsed = JSON.parse(rawContent);
    const policyOutput = policyOutputSchema.parse(parsed);

    // Store structured content
    await supabase
      .from("policy_documents")
      .update({
        structured_content_json: policyOutput as unknown as Record<string, unknown>,
      })
      .eq("id", policyDocumentId);

    // Render DOCX and PDF
    const [docxBuffer, pdfBuffer] = await Promise.all([
      renderPolicyDocx(policyOutput, organization.name),
      renderPolicyPdf(policyOutput, organization.name),
    ]);

    // Upload to Supabase Storage using service client (bypasses RLS)
    const docxPath = `org/${organization.id}/policies/${policyDocumentId}/policy.docx`;
    const pdfPath = `org/${organization.id}/policies/${policyDocumentId}/policy.pdf`;

    const [docxUpload, pdfUpload] = await Promise.all([
      serviceClient.storage
        .from("generated-documents")
        .upload(docxPath, docxBuffer, {
          contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          upsert: true,
        }),
      serviceClient.storage
        .from("generated-documents")
        .upload(pdfPath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        }),
    ]);

    if (docxUpload.error) {
      console.error("[processPolicy] DOCX upload error:", docxUpload.error.message);
    }
    if (pdfUpload.error) {
      console.error("[processPolicy] PDF upload error:", pdfUpload.error.message);
    }

    // Update the document row with completed status
    await supabase
      .from("policy_documents")
      .update({
        status: "completed",
        docx_path: docxPath,
        pdf_path: pdfPath,
        completed_at: new Date().toISOString(),
      })
      .eq("id", policyDocumentId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error during policy generation";

    console.error("[processPolicy] Error:", message);

    await supabase
      .from("policy_documents")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", policyDocumentId);
  }
}

export async function generatePolicy(
  _prevState: PolicyActionState,
  formData: FormData,
): Promise<PolicyActionState> {
  const templateId = formData.get("templateId") as string;
  const context = (formData.get("context") as string) || "";

  if (!templateId) {
    return { error: "Please select a policy template." };
  }

  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const supabase = await createClient();

  const inputContextJson = {
    templateId,
    context,
    organizationId: ctx.organization.id,
  };
  const inputHash = simpleHash(JSON.stringify(inputContextJson));

  // Check if a completed document already exists with same org + template + hash
  const { data: existing } = await supabase
    .from("policy_documents")
    .select("id")
    .eq("organization_id", ctx.organization.id)
    .eq("template_id", templateId)
    .eq("input_hash", inputHash)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (existing) {
    redirect("/app/policies");
  }

  // Insert new policy document with status 'queued'
  const { data: newDoc, error } = await supabase
    .from("policy_documents")
    .insert({
      organization_id: ctx.organization.id,
      template_id: templateId,
      requested_by: ctx.user.id,
      status: "queued",
      model: "gpt-4o",
      input_context_json: inputContextJson,
      input_hash: inputHash,
    })
    .select("id")
    .single();

  if (error || !newDoc) {
    return { error: error?.message ?? "Failed to create policy document." };
  }

  // Fire and forget — process in background, don't block the user
  // The policies page shows status and will update when complete
  processPolicy(newDoc.id).catch((err) => {
    console.error("[generatePolicy] Background processing error:", err);
  });

  redirect("/app/policies");
}
