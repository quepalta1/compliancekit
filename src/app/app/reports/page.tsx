import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View reports from completed compliance assessments.
        </p>
      </div>

      {completedAssessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-medium">
              No completed assessments
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete an assessment to generate a report.
            </p>
            <Link href="/app/assessment" className={buttonVariants({ className: "mt-4" })}>Go to Assessments</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {completedAssessments.map((assessment: any) => {
            const score = Number(assessment.score_pct);
            return (
              <Card
                key={assessment.id}
                className="transition-colors hover:bg-muted/30"
              >
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>
                      {new Date(assessment.completed_at!).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <p className="text-3xl font-bold">
                      {score.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                  </div>
                  <Progress value={score} className="mb-4" />
                  <Link href={`/app/reports/${assessment.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    View Report
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
