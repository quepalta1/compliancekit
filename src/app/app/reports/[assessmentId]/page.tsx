import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  BarChart3,
  XCircle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { PrintButton } from "@/components/print-button";

interface Props {
  params: Promise<{ assessmentId: string }>;
}

const ragColors = {
  red: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  green: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default async function AssessmentReportPage({ params }: Props) {
  const { assessmentId } = await params;
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const supabase = await createClient();

  // Fetch assessment
  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (error || !assessment || assessment.status !== "completed") {
    redirect("/app/assessment");
  }

  // Fetch controls
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

  const controlMap = new Map<string, any>(
    (controls ?? []).map((c: any) => [c.id, c]),
  );

  const statuses = controlStatuses ?? [];
  const actions = remediationActions ?? [];

  const score = Number(assessment.score_pct);
  const redCount = statuses.filter((s: any) => s.rag === "red").length;
  const amberCount = statuses.filter((s: any) => s.rag === "amber").length;
  const greenCount = statuses.filter((s: any) => s.rag === "green").length;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header (hidden in print) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/app/assessment"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/dashboard-pdf?assessmentId=${assessmentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Report content (print-friendly) */}
      <div className="print:p-0">
        {/* Report title */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            NIS2 Compliance Assessment Report
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>{ctx.organization.name}</span>
            <span className="text-gray-300">|</span>
            <span>
              Completed{" "}
              {new Date(assessment.completed_at!).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Score overview */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 print:border-gray-300">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <BarChart3 className="h-4 w-4" />
              Overall Score
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {score.toFixed(0)}%
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 print:border-gray-300">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <XCircle className="h-4 w-4" />
              Red
            </div>
            <p className="mt-2 text-3xl font-bold text-red-600">{redCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 print:border-gray-300">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Amber
            </div>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {amberCount}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 print:border-gray-300">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle className="h-4 w-4" />
              Green
            </div>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {greenCount}
            </p>
          </div>
        </div>

        {/* Control statuses */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Control Status Overview
          </h2>
          <div className="space-y-2">
            {statuses.map((cs: any) => {
              const control = controlMap.get(cs.control_id);
              const colors =
                ragColors[cs.rag as keyof typeof ragColors] ?? ragColors.red;
              return (
                <div
                  key={cs.control_id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 print:border-gray-300"
                >
                  <div className={`h-3 w-3 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-mono text-gray-500 w-16">
                    {control?.control_code}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {control?.title}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {cs.rag.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {(Number(cs.score) * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remediation details */}
        {statuses.filter((s: any) => s.rag === "red" || s.rag === "amber").length >
          0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Remediation Summary
            </h2>
            <div className="space-y-4">
              {statuses
                .filter((s: any) => s.rag === "red" || s.rag === "amber")
                .map((cs: any) => {
                  const control = controlMap.get(cs.control_id);
                  const colors =
                    ragColors[cs.rag as keyof typeof ragColors] ??
                    ragColors.red;
                  const relatedActions = actions.filter(
                    (a: any) => a.control_id === cs.control_id,
                  );

                  return (
                    <div
                      key={cs.control_id}
                      className="rounded-lg border border-gray-200 bg-white p-5 print:border-gray-300"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`h-3 w-3 rounded-full ${colors.dot}`}
                        />
                        <span className="text-xs font-mono text-gray-500">
                          {control?.control_code}
                        </span>
                        <span className="font-medium text-gray-900">
                          {control?.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {cs.remediation_summary}
                      </p>
                      {relatedActions.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                          {relatedActions.map((action: any) => (
                            <div key={action.id} className="text-sm">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    priorityColors[
                                      action.priority as keyof typeof priorityColors
                                    ] ?? ""
                                  }`}
                                >
                                  {action.priority}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {action.title}
                                </span>
                              </div>
                              <p className="text-gray-600">
                                {action.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          Generated by ComplianceKit on{" "}
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
