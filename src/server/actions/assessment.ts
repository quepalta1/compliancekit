"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/server/queries/organization";
import {
  answerToScore,
  scoreToRag,
  calculateOverallScore,
  generateRemediationSummary,
  generateRemediationActions,
} from "@/lib/compliance/scoring";
import type { AssessmentAnswer } from "@/lib/constants";

export async function startAssessment(): Promise<
  { id: string } | { error: string }
> {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    return { error: "You must be logged in with an active organization." };
  }

  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({
      organization_id: ctx.organization.id,
      status: "draft",
      started_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (error || !assessment) {
    return { error: error?.message ?? "Failed to create assessment." };
  }

  redirect(`/app/assessment/${assessment.id}`);
}

export type SubmitAnswerState = { error?: string; nextControlIndex?: number } | null;

export async function submitAnswer(
  _prevState: SubmitAnswerState,
  formData: FormData,
): Promise<SubmitAnswerState> {
  const assessmentId = formData.get("assessmentId") as string;
  const controlId = formData.get("controlId") as string;
  const answer = formData.get("answer") as AssessmentAnswer;
  const note = (formData.get("note") as string) || null;

  if (!assessmentId || !controlId || !answer) {
    return { error: "Missing required fields." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("assessment_answers")
    .upsert(
      {
        assessment_id: assessmentId,
        control_id: controlId,
        answer,
        note,
        answered_by: user?.id ?? null,
      },
      { onConflict: "assessment_id,control_id" },
    );

  if (error) {
    return { error: error.message };
  }

  // Determine the next control index
  const { data: controls } = await supabase
    .from("control_catalog")
    .select("id")
    .order("sort_order", { ascending: true });

  if (!controls) {
    return { error: "Failed to load controls." };
  }

  const currentIndex = controls.findIndex((c: any) => c.id === controlId);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= controls.length) {
    return { nextControlIndex: undefined };
  }

  return { nextControlIndex: nextIndex };
}

export async function completeAssessment(
  assessmentId: string,
): Promise<{ error?: string }> {
  const ctx = await getCurrentOrganization();
  if (!ctx) return { error: "Not authenticated." };

  const supabase = await createClient();

  // Fetch all answers joined with control_catalog for weights and guidance
  const { data: answers, error: answersError } = await supabase
    .from("assessment_answers")
    .select("*, control_catalog(*)")
    .eq("assessment_id", assessmentId);

  if (answersError || !answers) {
    return { error: answersError?.message ?? "Failed to load answers." };
  }

  if (answers.length === 0) {
    return { error: "No answers found for this assessment." };
  }

  // Calculate score and RAG for each control
  const controlStatuses = answers.map((a: any) => {
    const score = answerToScore(a.answer as AssessmentAnswer);
    const rag = scoreToRag(score);
    return {
      assessment_id: assessmentId,
      control_id: a.control_id,
      score,
      rag,
      weight: Number(a.control_catalog?.weight ?? 1),
      title: a.control_catalog?.title ?? "",
      guidance: a.control_catalog?.guidance ?? "",
      answer: a.answer as AssessmentAnswer,
    };
  });

  // Sort for priority ranking: red first (by weight desc), then amber, then green
  const ragOrder = { red: 0, amber: 1, green: 2 } as const;
  const sorted = [...controlStatuses].sort((a, b) => {
    const ragDiff = ragOrder[a.rag] - ragOrder[b.rag];
    if (ragDiff !== 0) return ragDiff;
    return b.weight - a.weight;
  });

  // Upsert control statuses and remediation actions
  for (let i = 0; i < sorted.length; i++) {
    const cs = sorted[i];
    const priorityRank = i + 1;
    const remediationSummary = generateRemediationSummary(
      cs.title,
      cs.guidance,
      cs.rag,
      cs.answer,
    );

    const { error: statusError } = await supabase
      .from("assessment_control_statuses")
      .upsert(
        {
          assessment_id: assessmentId,
          control_id: cs.control_id,
          score: cs.score,
          rag: cs.rag,
          priority_rank: priorityRank,
          remediation_summary: remediationSummary,
        },
        { onConflict: "assessment_id,control_id" },
      );

    if (statusError) {
      return { error: statusError.message };
    }

    // Generate remediation actions for red and amber controls
    if (cs.rag === "red" || cs.rag === "amber") {
      const actions = generateRemediationActions(
        cs.control_id,
        cs.title,
        cs.guidance,
        cs.rag,
        cs.answer,
      );

      for (const action of actions) {
        await supabase.from("remediation_actions").insert({
          organization_id: ctx.organization.id,
          assessment_id: assessmentId,
          control_id: cs.control_id,
          ...action,
        });
      }
    }
  }

  // Calculate overall score
  const scorePct = calculateOverallScore(
    controlStatuses.map((cs) => ({ answer: cs.answer, weight: cs.weight })),
  );

  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      status: "completed",
      score_pct: scorePct,
      completed_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (updateError) {
    return { error: updateError.message };
  }

  redirect(`/app/assessment/${assessmentId}`);
}
