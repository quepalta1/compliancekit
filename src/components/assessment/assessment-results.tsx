"use client";

import { BarChart3, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface Assessment {
  id: string;
  score_pct: number;
  completed_at: string;
}

interface Control {
  id: string;
  control_code: string;
  title: string;
}

interface ControlStatus {
  control_id: string;
  score: number;
  rag: string;
  priority_rank: number;
  remediation_summary: string;
}

interface RemediationAction {
  id: string;
  control_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
}

interface Props {
  assessment: Assessment;
  controls: Control[];
  controlStatuses: ControlStatus[];
  remediationActions: RemediationAction[];
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

const priorityBadge: Record<string, { className: string; variant: "destructive" | "secondary" | "outline" }> = {
  high: { className: "", variant: "destructive" },
  medium: { className: "bg-amber-100 text-amber-700 border-amber-200", variant: "secondary" },
  low: { className: "bg-green-100 text-green-700 border-green-200", variant: "secondary" },
};

export function AssessmentResults({
  assessment,
  controls,
  controlStatuses,
  remediationActions,
}: Props) {
  const score = Number(assessment.score_pct);
  const redCount = controlStatuses.filter((s) => s.rag === "red").length;
  const amberCount = controlStatuses.filter((s) => s.rag === "amber").length;
  const greenCount = controlStatuses.filter((s) => s.rag === "green").length;

  const controlMap = new Map(controls.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Assessment Results
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completed{" "}
            {new Date(assessment.completed_at).toLocaleDateString()}
          </p>
        </div>
        <Link
          href="/app/assessment"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to assessments
        </Link>
      </div>

      {/* Score overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Overall Score
            </div>
            <p className="mt-2 text-3xl font-bold">{score.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#dc2626]">
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[#dc2626]">
              <XCircle className="h-4 w-4" />
              Red
            </div>
            <p className="mt-2 text-3xl font-bold text-[#dc2626]">{redCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#f59e0b]">
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[#f59e0b]">
              <AlertTriangle className="h-4 w-4" />
              Amber
            </div>
            <p className="mt-2 text-3xl font-bold text-[#f59e0b]">{amberCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#16a34a]">
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[#16a34a]">
              <CheckCircle className="h-4 w-4" />
              Green
            </div>
            <p className="mt-2 text-3xl font-bold text-[#16a34a]">{greenCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Control RAG overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Control Status</h2>
        <Card>
          <CardContent className="divide-y">
            {controlStatuses.map((cs) => {
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

      {/* Remediation actions */}
      {remediationActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Remediation Actions ({remediationActions.length})
          </h2>
          <div className="space-y-3">
            {remediationActions.map((action) => {
              const control = controlMap.get(action.control_id);
              const pb = priorityBadge[action.priority] || priorityBadge.medium;
              return (
                <Card key={action.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={pb.variant} className={pb.className}>
                            {action.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {control?.control_code}
                          </span>
                        </div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          action.status === "done"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : action.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : ""
                        }
                      >
                        {action.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
