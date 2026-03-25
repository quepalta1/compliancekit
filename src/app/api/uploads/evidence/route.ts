import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";

/**
 * POST /api/uploads/evidence
 *
 * Generates a signed upload URL for uploading evidence files to Supabase Storage.
 * The client uses the returned URL to upload the file directly.
 */
export async function POST(request: NextRequest) {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: { fileName: string; contentType: string; evidenceItemId: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { fileName, contentType, evidenceItemId } = body;

  if (!fileName || !contentType || !evidenceItemId) {
    return NextResponse.json(
      { error: "Missing required fields: fileName, contentType, evidenceItemId" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Verify the evidence item belongs to the current organization
  const { data: evidenceItem, error: evidenceError } = await supabase
    .from("evidence_items")
    .select("id")
    .eq("id", evidenceItemId)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (evidenceError || !evidenceItem) {
    return NextResponse.json(
      { error: "Evidence item not found or access denied" },
      { status: 404 },
    );
  }

  // Build storage path: org_id/evidence_item_id/timestamp_filename
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `org/${ctx.organization.id}/evidence/${evidenceItemId}/${timestamp}_${sanitizedFileName}`;

  // Create signed upload URL
  const { data: signedUrl, error: storageError } = await supabase.storage
    .from("evidence")
    .createSignedUploadUrl(storagePath);

  if (storageError || !signedUrl) {
    console.error(
      "[uploads/evidence] Error creating signed URL:",
      storageError?.message,
    );
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    signedUrl: signedUrl.signedUrl,
    token: signedUrl.token,
    path: storagePath,
  });
}
