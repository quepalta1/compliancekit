"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  connectSupplierSchema,
  createBuyerRequirementSchema,
  submitSupplierRequirementResponseSchema,
} from "@/lib/validation";
import { getCurrentOrganization } from "@/server/queries/organization";

export type NetworkActionState = { error: string } | { success: string } | null;

export async function createBuyerRequirement(
  _prevState: NetworkActionState,
  formData: FormData,
): Promise<NetworkActionState> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const parsed = createBuyerRequirementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    requirementType: formData.get("requirementType"),
    frameworkRef: formData.get("frameworkRef"),
    evidenceHint: formData.get("evidenceHint"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: currentRequirements } = await supabase
    .from("buyer_requirements")
    .select("sort_order")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = (currentRequirements?.[0]?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("buyer_requirements").insert({
    organization_id: ctx.organization.id,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    requirement_type: parsed.data.requirementType,
    framework_ref: parsed.data.frameworkRef ?? null,
    evidence_hint: parsed.data.evidenceHint ?? null,
    sort_order: nextSortOrder,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/requirements");
  revalidatePath("/app/suppliers");
  revalidatePath("/app/customers");
  return { success: "Requirement added." };
}

export async function connectSupplier(
  _prevState: NetworkActionState,
  formData: FormData,
): Promise<NetworkActionState> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const parsed = connectSupplierSchema.safeParse({
    supplierSlug: formData.get("supplierSlug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  if (parsed.data.supplierSlug === ctx.organization.slug) {
    return { error: "You cannot connect your organization to itself." };
  }

  const supabase = await createClient();

  const { data: supplier, error: supplierError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", parsed.data.supplierSlug)
    .single();

  if (supplierError || !supplier) {
    return { error: "No supplier workspace was found for that slug." };
  }

  const { error } = await supabase.from("supplier_relationships").insert({
    customer_organization_id: ctx.organization.id,
    supplier_organization_id: supplier.id,
    created_by: ctx.user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That supplier is already connected to your workspace." };
    }
    return { error: error.message };
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/suppliers");
  revalidatePath("/app/customers");
  return { success: `Connected ${supplier.name} as a supplier.` };
}

export async function submitSupplierRequirementResponse(
  _prevState: NetworkActionState,
  formData: FormData,
): Promise<NetworkActionState> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const parsed = submitSupplierRequirementResponseSchema.safeParse({
    relationshipId: formData.get("relationshipId"),
    requirementId: formData.get("requirementId"),
    complianceStatus: formData.get("complianceStatus"),
    responseText: formData.get("responseText"),
    evidenceSummary: formData.get("evidenceSummary"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: relationship, error: relationshipError } = await supabase
    .from("supplier_relationships")
    .select("id, supplier_organization_id, customer_organization_id")
    .eq("id", parsed.data.relationshipId)
    .single();

  if (relationshipError || !relationship) {
    return { error: "Relationship not found." };
  }

  if (relationship.supplier_organization_id !== ctx.organization.id) {
    return { error: "Only the supplier workspace can submit this response." };
  }

  const { data: requirement, error: requirementError } = await supabase
    .from("buyer_requirements")
    .select("id, organization_id")
    .eq("id", parsed.data.requirementId)
    .single();

  if (requirementError || !requirement) {
    return { error: "Requirement not found." };
  }

  if (requirement.organization_id !== relationship.customer_organization_id) {
    return { error: "This requirement does not belong to the selected buyer." };
  }

  const { error } = await supabase.from("supplier_requirement_responses").upsert(
    {
      relationship_id: parsed.data.relationshipId,
      requirement_id: parsed.data.requirementId,
      compliance_status: parsed.data.complianceStatus,
      response_text: parsed.data.responseText,
      evidence_summary: parsed.data.evidenceSummary ?? null,
      submitted_by: ctx.user.id,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "relationship_id,requirement_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/dashboard");
  revalidatePath("/app/suppliers");
  revalidatePath("/app/customers");
  return { success: "Response saved." };
}
