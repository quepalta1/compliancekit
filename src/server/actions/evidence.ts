"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/server/queries/organization";

export type EvidenceActionState = { error: string } | null;

export async function createEvidenceItem(
  _prevState: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const expiresAt = (formData.get("expires_at") as string) || null;
  const controlIds = (formData.get("control_ids") as string) || "";

  if (!title?.trim()) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();

  const { data: evidence, error } = await supabase
    .from("evidence_items")
    .insert({
      organization_id: ctx.organization.id,
      title: title.trim(),
      description: description?.trim() || null,
      expires_at: expiresAt || null,
      owner_user_id: ctx.user.id,
    })
    .select("id")
    .single();

  if (error || !evidence) {
    return { error: error?.message ?? "Failed to create evidence item." };
  }

  // Link controls
  if (controlIds.trim()) {
    const ids = controlIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length > 0) {
      const rows = ids.map((controlId) => ({
        evidence_item_id: evidence.id,
        control_id: controlId,
      }));

      const { error: linkError } = await supabase
        .from("evidence_item_controls")
        .insert(rows);

      if (linkError) {
        return { error: linkError.message };
      }
    }
  }

  redirect(`/app/evidence/${evidence.id}`);
}

export async function updateEvidenceItem(
  _prevState: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const evidenceId = formData.get("evidence_id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const expiresAt = (formData.get("expires_at") as string) || null;
  const controlIds = (formData.get("control_ids") as string) || "";

  if (!evidenceId || !title?.trim()) {
    return { error: "Evidence ID and title are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("evidence_items")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      expires_at: expiresAt || null,
    })
    .eq("id", evidenceId)
    .eq("organization_id", ctx.organization.id);

  if (error) {
    return { error: error.message };
  }

  // Replace control links
  await supabase
    .from("evidence_item_controls")
    .delete()
    .eq("evidence_item_id", evidenceId);

  if (controlIds.trim()) {
    const ids = controlIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length > 0) {
      const rows = ids.map((controlId) => ({
        evidence_item_id: evidenceId,
        control_id: controlId,
      }));

      const { error: linkError } = await supabase
        .from("evidence_item_controls")
        .insert(rows);

      if (linkError) {
        return { error: linkError.message };
      }
    }
  }

  redirect(`/app/evidence/${evidenceId}`);
}

export async function deleteEvidenceItem(
  evidenceId: string,
): Promise<void> {
  const ctx = await getCurrentOrganization();
  if (!ctx) return;

  const supabase = await createClient();

  await supabase
    .from("evidence_items")
    .delete()
    .eq("id", evidenceId)
    .eq("organization_id", ctx.organization.id);

  redirect("/app/evidence");
}

export async function uploadEvidenceFile(
  formData: FormData,
): Promise<{ success: true; fileId: string } | { error: string }> {
  const ctx = await getCurrentOrganization();
  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const file = formData.get("file") as File | null;
  const evidenceItemId = formData.get("evidence_item_id") as string;

  if (!file || !evidenceItemId) {
    return { error: "File and evidence item ID are required." };
  }

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only PDF and image files (PNG, JPG) are accepted." };
  }

  const supabase = await createClient();

  const storagePath = `org/${ctx.organization.id}/evidence/${evidenceItemId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(storagePath, file, {
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: fileRecord, error: insertError } = await supabase
    .from("evidence_files")
    .insert({
      evidence_item_id: evidenceItemId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      uploaded_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (insertError || !fileRecord) {
    return { error: insertError?.message ?? "Failed to save file metadata." };
  }

  return { success: true, fileId: fileRecord.id };
}
