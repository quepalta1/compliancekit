import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderComplianceReportPdf } from "@/lib/documents/report-pdf";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get assessmentId from query params
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessmentId");

  if (!assessmentId) {
    return new Response(
      JSON.stringify({ error: "Missing assessmentId parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Fetch the user's organization membership to get org id
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return new Response(
      JSON.stringify({ error: "Organization not found" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const orgId = membership.organization_id;

  // Fetch assessment (RLS ensures org-level access)
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("organization_id", orgId)
    .single();

  if (assessmentError || !assessment) {
    return new Response(
      JSON.stringify({ error: "Assessment not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Fetch control catalog
  const { data: controls } = await supabase
    .from("control_catalog")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch control statuses
  const { data: controlStatuses } = await supabase
    .from("assessment_control_statuses")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("priority_rank", { ascending: true });

  // Fetch remediation actions
  const { data: remediationActions } = await supabase
    .from("remediation_actions")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: true });

  // Fetch organization info
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();

  if (!organization) {
    return new Response(
      JSON.stringify({ error: "Organization not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Generate PDF
  try {
    const pdfBuffer = await renderComplianceReportPdf({
      organization,
      assessment,
      controls: controls ?? [],
      controlStatuses: controlStatuses ?? [],
      remediationActions: remediationActions ?? [],
    });

    const fileName = `compliance-report-${assessmentId.slice(0, 8)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[dashboard-pdf] Error generating PDF:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
