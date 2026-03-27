import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { StartAssessmentButton } from "@/components/assessment/start-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
          <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assess your organization against NIS2 Article 21(2) controls.
          </p>
        </div>
        <StartAssessmentButton />
      </div>

      {!hasAssessments && (
        <Card className="mt-8 border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">
              No assessments yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start your first assessment to evaluate your NIS2 compliance posture.
            </p>
          </CardContent>
        </Card>
      )}

      {hasAssessments && (
        <div className="mt-6 space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {assessments.map((a: any) => {
            const score = Number(a.score_pct);
            return (
              <Link key={a.id} href={`/app/assessment/${a.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between">
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
                        <p className="font-medium">
                          Assessment{" "}
                          <span className="text-muted-foreground">
                            {new Date(a.started_at).toLocaleDateString()}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            variant={a.status === "completed" ? "secondary" : "outline"}
                            className={
                              a.status === "completed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {a.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
                          {a.status === "completed" && (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={score}
                                className="w-24 [&_[data-slot=progress-track]]:h-1.5"
                              />
                              <span className="text-sm text-muted-foreground">
                                {score.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
