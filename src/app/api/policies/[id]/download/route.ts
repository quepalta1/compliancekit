import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";

/**
 * GET /api/policies/[id]/download?format=docx|pdf
 *
 * Validates org membership, then generates a signed URL from Supabase Storage
 * and redirects to it.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format");

  if (!format || !["docx", "pdf"].includes(format)) {
    return NextResponse.json(
      { error: "Invalid format. Use ?format=docx or ?format=pdf" },
      { status: 400 },
    );
  }

  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Fetch the policy document and verify org membership
  const { data: doc, error: docError } = await supabase
    .from("policy_documents")
    .select("id, organization_id, docx_path, pdf_path, status")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json(
      { error: "Policy document not found" },
      { status: 404 },
    );
  }

  // Verify the document belongs to the user's current organization
  if (doc.organization_id !== ctx.organization.id) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 },
    );
  }

  if (doc.status !== "completed") {
    return NextResponse.json(
      { error: "Document is not yet completed" },
      { status: 400 },
    );
  }

  const storagePath = format === "docx" ? doc.docx_path : doc.pdf_path;

  if (!storagePath) {
    return NextResponse.json(
      { error: `No ${format.toUpperCase()} file available for this document` },
      { status: 404 },
    );
  }

  // Generate a signed URL (valid for 60 seconds)
  const { data: signedUrlData, error: storageError } = await supabase.storage
    .from("generated-documents")
    .createSignedUrl(storagePath, 60);

  if (storageError || !signedUrlData?.signedUrl) {
    console.error(
      "[policies/download] Error creating signed URL:",
      storageError?.message,
    );
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrlData.signedUrl);
}
