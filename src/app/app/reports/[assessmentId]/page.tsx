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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  params: Promise<{ assessmentId: string }>;
}

const ragDot: Record<string, string> = {
  red: "bg-[#dc2626]",
  amber: "bg-[#f59e0b]",
  green: "bg-[#16a34a]",
};

const ragBadge: Record<string, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

const priorityBadge: Record<string, { className: string; variant: "destructive" | "secondary" }> = {
  high: { className: "", variant: "destructive" },
  medium: { className: "bg-amber-100 text-amber-700 border-amber-200", variant: "secondary" },
  low: { className: "bg-green-100 text-green-700 border-green-200", variant: "secondary" },
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
        <Link href="/app/assessment" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/dashboard-pdf?assessmentId=${assessmentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
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
        <div className="mb-8 pb-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">
            NIS2 Compliance Assessment Report
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{ctx.organization.name}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>
              Completed{" "}
              {new Date(assessment.completed_at!).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Score overview */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Card className="print:border">
            <CardContent className="pt-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Overall Score
              </div>
              <p className="mt-2 text-3xl font-bold">{score.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#dc2626] print:border">
            <CardContent className="pt-1">
              <div className="flex items-center gap-2 text-sm font-medium text-[#dc2626]">
                <XCircle className="h-4 w-4" />
                Red
              </div>
              <p className="mt-2 text-3xl font-bold text-[#dc2626]">{redCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#f59e0b] print:border">
            <CardContent className="pt-1">
              <div className="flex items-center gap-2 text-sm font-medium text-[#f59e0b]">
                <AlertTriangle className="h-4 w-4" />
                Amber
              </div>
              <p className="mt-2 text-3xl font-bold text-[#f59e0b]">{amberCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#16a34a] print:border">
            <CardContent className="pt-1">
              <div className="flex items-center gap-2 text-sm font-medium text-[#16a34a]">
                <CheckCircle className="h-4 w-4" />
                Green
              </div>
              <p className="mt-2 text-3xl font-bold text-[#16a34a]">{greenCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Control statuses */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Control Status Overview
          </h2>
          <Card>
            <CardContent className="divide-y">
              {statuses.map((cs: any) => {
                const control = controlMap.get(cs.control_id);
                const dot = ragDot[cs.rag] || ragDot.red;
                const badge = ragBadge[cs.rag] || ragBadge.red;
                return (
                  <div
                    key={cs.control_id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className={`h-3 w-3 shrink-0 rounded-full ${dot}`} />
                    <span className="text-xs font-mono text-muted-foreground w-16">
                      {control?.control_code}
                    </span>
                    <span className="flex-1 text-sm">
                      {control?.title}
                    </span>
                    <Badge variant="outline" className={badge}>
                      {cs.rag.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right tabular-nums">
                      {(Number(cs.score) * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Remediation details */}
        {statuses.filter((s: any) => s.rag === "red" || s.rag === "amber").length >
          0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Remediation Summary
            </h2>
            <div className="space-y-4">
              {statuses
                .filter((s: any) => s.rag === "red" || s.rag === "amber")
                .map((cs: any) => {
                  const control = controlMap.get(cs.control_id);
                  const dot = ragDot[cs.rag] || ragDot.red;
                  const relatedActions = actions.filter(
                    (a: any) => a.control_id === cs.control_id,
                  );

                  return (
                    <Card key={cs.control_id}>
                      <CardContent>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-3 w-3 rounded-full ${dot}`} />
                          <span className="text-xs font-mono text-muted-foreground">
                            {control?.control_code}
                          </span>
                          <span className="font-medium">
                            {control?.title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {cs.remediation_summary}
                        </p>
                        {relatedActions.length > 0 && (
                          <div className="space-y-2 pl-4 border-l-2 border-muted">
                            {relatedActions.map((action: any) => {
                              const pb = priorityBadge[action.priority] || priorityBadge.medium;
                              return (
                                <div key={action.id} className="text-sm">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <Badge variant={pb.variant} className={pb.className}>
                                      {action.priority}
                                    </Badge>
                                    <span className="font-medium">
                                      {action.title}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground">
                                    {action.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <Separator className="mb-6" />
        <div className="text-center text-xs text-muted-foreground">
          Generated by ComplianceKit on{" "}
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
