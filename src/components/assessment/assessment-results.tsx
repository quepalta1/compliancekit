"use client";

import { BarChart3, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

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
          <h1 className="text-2xl font-bold text-gray-900">
            Assessment Results
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Completed{" "}
            {new Date(assessment.completed_at).toLocaleDateString()}
          </p>
        </div>
        <Link
          href="/app/assessment"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to assessments
        </Link>
      </div>

      {/* Score overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <BarChart3 className="h-4 w-4" />
            Overall Score
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {score.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <XCircle className="h-4 w-4" />
            Red
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">{redCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            Amber
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {amberCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle className="h-4 w-4" />
            Green
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {greenCount}
          </p>
        </div>
      </div>

      {/* Control RAG overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Control Status
        </h2>
        <div className="space-y-2">
          {controlStatuses.map((cs) => {
            const control = controlMap.get(cs.control_id);
            const colors =
              ragColors[cs.rag as keyof typeof ragColors] || ragColors.red;
            return (
              <div
                key={cs.control_id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
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

      {/* Remediation actions */}
      {remediationActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Remediation Actions ({remediationActions.length})
          </h2>
          <div className="space-y-3">
            {remediationActions.map((action) => {
              const control = controlMap.get(action.control_id);
              return (
                <div
                  key={action.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            priorityColors[
                              action.priority as keyof typeof priorityColors
                            ] || ""
                          }`}
                        >
                          {action.priority}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {control?.control_code}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        action.status === "done"
                          ? "bg-green-100 text-green-700"
                          : action.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {action.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
