import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  FileCheck,
  FileText,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const result = await getCurrentOrganization();

  if (!result) {
    redirect("/app/create-org");
  }

  const { organization } = result;
  const onboardingComplete = !!organization?.onboarding_completed_at;
  const supabase = await createClient();

  // Fetch latest assessment if onboarding is complete
  let latestAssessment = null;
  let controlStatuses: Array<{ rag: string }> = [];
  let openActions = 0;

  if (onboardingComplete) {
    const { data: assessment } = await supabase
      .from("assessments")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessment) {
      latestAssessment = assessment;

      const { data: statuses } = await supabase
        .from("assessment_control_statuses")
        .select("rag")
        .eq("assessment_id", assessment.id);

      controlStatuses = statuses ?? [];

      const { count } = await supabase
        .from("remediation_actions")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("status", "open");

      openActions = count ?? 0;
    }
  }

  const redCount = controlStatuses.filter((s: any) => s.rag === "red").length;
  const amberCount = controlStatuses.filter((s: any) => s.rag === "amber").length;
  const greenCount = controlStatuses.filter((s: any) => s.rag === "green").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome to {organization.name}
      </p>

      {!onboardingComplete && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-blue-900">
            Get started with ComplianceKit
          </h2>
          <p className="mt-1 text-sm text-blue-700">
            Complete your onboarding to determine your NIS2 applicability and
            begin your compliance assessment.
          </p>
          <Link
            href="/app/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Onboarding
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {onboardingComplete && (
        <>
          {/* Score cards */}
          {latestAssessment && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <BarChart3 className="h-4 w-4" />
                  Compliance Score
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {Number(latestAssessment.score_pct).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                  <XCircle className="h-4 w-4" />
                  Red Controls
                </div>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {redCount}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Amber Controls
                </div>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {amberCount}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Green Controls
                </div>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {greenCount}
                </p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/app/assessment"
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ClipboardCheck className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Assessment</p>
                <p className="text-sm text-gray-500">
                  {latestAssessment
                    ? `${openActions} open actions`
                    : "Start your first assessment"}
                </p>
              </div>
            </Link>

            <Link
              href="/app/evidence"
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <FileCheck className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Evidence</p>
                <p className="text-sm text-gray-500">Track compliance evidence</p>
              </div>
            </Link>

            <Link
              href="/app/policies"
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Policies</p>
                <p className="text-sm text-gray-500">Generate policy documents</p>
              </div>
            </Link>
          </div>

          {/* NIS2 Classification */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              NIS2 Classification
            </h3>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  organization.nis2_applicable
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {organization.nis2_applicable ? "NIS2 Applicable" : "Out of Scope"}
              </span>
              <span className="text-sm text-gray-600 capitalize">
                Entity class: {organization.entity_class?.replace("_", " ")}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
