import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssessmentFlow } from "@/components/assessment/assessment-flow";
import { AssessmentResults } from "@/components/assessment/assessment-results";

interface Props {
  params: Promise<{ assessmentId: string }>;
}

export default async function AssessmentDetailPage({ params }: Props) {
  const { assessmentId } = await params;
  const supabase = await createClient();

  // Fetch assessment
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();

  if (error || !assessment) {
    redirect("/app/assessment");
  }

  // Fetch controls
  const { data: controls } = await supabase
    .from("control_catalog")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch existing answers
  const { data: existingAnswers } = await supabase
    .from("assessment_answers")
    .select("*")
    .eq("assessment_id", assessmentId);

  if (assessment.status === "completed") {
    // Fetch results
    const { data: controlStatuses } = await supabase
      .from("assessment_control_statuses")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("priority_rank", { ascending: true });

    const { data: remediationActions } = await supabase
      .from("remediation_actions")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("created_at", { ascending: true });

    return (
      <AssessmentResults
        assessment={assessment}
        controls={controls ?? []}
        controlStatuses={controlStatuses ?? []}
        remediationActions={remediationActions ?? []}
      />
    );
  }

  return (
    <AssessmentFlow
      assessmentId={assessmentId}
      controls={controls ?? []}
      existingAnswers={existingAnswers ?? []}
    />
  );
}
