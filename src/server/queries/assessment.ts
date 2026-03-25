import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";

export async function getAssessment(assessmentId: string) {
  const ctx = await getCurrentOrganization();
  if (!ctx) return null;

  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (error || !assessment) return null;

  return assessment;
}

export async function getAssessmentAnswers(assessmentId: string) {
  const supabase = await createClient();

  const { data: answers, error } = await supabase
    .from("assessment_answers")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("answered_at", { ascending: true });

  if (error) {
    console.error("Error fetching assessment answers:", error);
    return [];
  }

  return answers ?? [];
}

export async function getAssessmentResults(assessmentId: string) {
  const supabase = await createClient();

  const { data: statuses, error: statusError } = await supabase
    .from("assessment_control_statuses")
    .select("*, control_catalog(*)")
    .eq("assessment_id", assessmentId)
    .order("priority_rank", { ascending: true });

  if (statusError) {
    console.error("Error fetching assessment results:", statusError);
    return { statuses: [], actions: [] };
  }

  const { data: actions, error: actionsError } = await supabase
    .from("remediation_actions")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: true });

  if (actionsError) {
    console.error("Error fetching remediation actions:", actionsError);
    return { statuses: statuses ?? [], actions: [] };
  }

  return {
    statuses: statuses ?? [],
    actions: actions ?? [],
  };
}

export async function getControlCatalog() {
  const supabase = await createClient();

  const { data: controls, error } = await supabase
    .from("control_catalog")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching control catalog:", error);
    return [];
  }

  return controls ?? [];
}

export async function getLatestAssessment(organizationId: string) {
  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !assessment) return null;

  return assessment;
}
