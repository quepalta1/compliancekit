import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { StartAssessmentButton } from "@/components/assessment/start-button";

export default async function AssessmentListPage() {
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  if (!ctx.organization.onboarding_completed_at) {
    redirect("/app/onboarding");
  }

  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("started_at", { ascending: false });

  const hasAssessments = assessments && assessments.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Assess your organization against NIS2 Article 21(2) controls.
          </p>
        </div>
        <StartAssessmentButton />
      </div>

      {!hasAssessments && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No assessments yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start your first assessment to evaluate your NIS2 compliance posture.
          </p>
        </div>
      )}

      {hasAssessments && (
        <div className="mt-6 space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {assessments.map((a: any) => (
            <Link
              key={a.id}
              href={`/app/assessment/${a.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    a.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Assessment{" "}
                    <span className="text-gray-500">
                      {new Date(a.started_at).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                    {a.status === "completed" && (
                      <span className="text-sm text-gray-500">
                        Score: {Number(a.score_pct).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
