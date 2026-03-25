import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, FileText } from "lucide-react";

export default async function ReportsPage() {
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  const completedAssessments = assessments ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View reports from completed compliance assessments.
        </p>
      </div>

      {completedAssessments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No completed assessments
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete an assessment to generate a report.
          </p>
          <Link
            href="/app/assessment"
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Assessments
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {completedAssessments.map((assessment: any) => {
            const score = Number(assessment.score_pct);
            return (
              <div
                key={assessment.id}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <BarChart3 className="h-4 w-4" />
                  <span>
                    {new Date(assessment.completed_at!).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {score.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500">Compliance Score</p>
                </div>
                <Link
                  href={`/app/reports/${assessment.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Report
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
