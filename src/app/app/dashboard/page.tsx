import { getCurrentOrganization } from "@/server/queries/organization";
import { getBuyerNetwork, getSupplierNetwork, getBuyerRequirements } from "@/server/queries/network";
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
  CheckCircle2,
  XOctagon,
  Shield,
  Building2,
  Handshake,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

  const [buyerNetwork, supplierNetwork, buyerRequirements] = await Promise.all([
    getBuyerNetwork(organization.id),
    getSupplierNetwork(organization.id),
    getBuyerRequirements(organization.id),
  ]);

  const totalSuppliers = buyerNetwork.length;
  const totalCustomers = supplierNetwork.length;
  const totalBuyerRequirements = buyerRequirements.length;
  const avgSupplierCompletion = totalSuppliers > 0
    ? Math.round(buyerNetwork.reduce((sum, s) => sum + s.summary.completionPct, 0) / totalSuppliers)
    : 0;
  const totalIncomingRequirements = supplierNetwork.reduce(
    (sum, c) => sum + c.requirements.length, 0
  );
  const totalResponded = supplierNetwork.reduce(
    (sum, c) => sum + c.requirements.filter(r => r.response).length, 0
  );

  const redCount = controlStatuses.filter((s: any) => s.rag === "red").length;
  const amberCount = controlStatuses.filter(
    (s: any) => s.rag === "amber",
  ).length;
  const greenCount = controlStatuses.filter(
    (s: any) => s.rag === "green",
  ).length;
  const totalControls = controlStatuses.length;
  const scorePct = latestAssessment
    ? Number(latestAssessment.score_pct)
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to {organization.name}
        </p>
      </div>

      {/* Onboarding CTA */}
      {!onboardingComplete && (
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-accent to-primary" />
          <CardContent className="flex items-center justify-between py-8 pl-8 pr-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Get started with ComplianceKit
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Complete your organization profile to assess framework readiness, or start defining supplier requirements right away.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/app/onboarding"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  Start Onboarding
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/app/requirements"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Define Supplier Requirements
                </Link>
              </div>
            </div>
            <Shield className="hidden h-20 w-20 text-primary/10 md:block" />
          </CardContent>
        </Card>
      )}

      {/* Dashboard content when onboarding is complete */}
      {onboardingComplete && (
        <>
          {/* Top metric cards */}
          {latestAssessment && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Compliance Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Compliance Score
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      {scorePct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={scorePct}
                    className="mt-3 h-2"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {totalControls} controls assessed
                  </p>
                </CardContent>
              </Card>

              {/* Red Controls */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Red Controls
                  </CardTitle>
                  <XOctagon className="h-4 w-4 text-[#dc2626]" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-[#dc2626]">
                      {redCount}
                    </span>
                    <Badge
                      variant="destructive"
                      className="mb-1 text-[10px]"
                    >
                      Critical
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              {/* Amber Controls */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Amber Controls
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-[#f59e0b]">
                      {amberCount}
                    </span>
                    <Badge className="mb-1 border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[10px] text-[#f59e0b]">
                      Needs Attention
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Partially implemented
                  </p>
                </CardContent>
              </Card>

              {/* Green Controls */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Green Controls
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-[#16a34a]">
                      {greenCount}
                    </span>
                    <Badge className="mb-1 border-[#16a34a]/30 bg-[#16a34a]/10 text-[10px] text-[#16a34a]">
                      Compliant
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Fully implemented
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Framework Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Framework Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    organization.nis2_applicable ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {organization.nis2_applicable
                    ? "NIS2 Applicable"
                    : "Out of Scope"}
                </Badge>
                {organization.entity_class && (
                  <span className="text-sm text-muted-foreground capitalize">
                    Entity class:{" "}
                    <span className="font-medium text-foreground">
                      {organization.entity_class.replace("_", " ")}
                    </span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/app/assessment" className="group">
                <Card className="h-full transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-muted/50">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Assessment</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {latestAssessment
                          ? `${openActions} open remediation actions`
                          : "Start your first compliance assessment"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/evidence" className="group">
                <Card className="h-full transition-colors duration-200 group-hover:border-[#16a34a]/30 group-hover:bg-muted/50">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16a34a]/10">
                      <FileCheck className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Evidence</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Upload and track compliance evidence
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/policies" className="group">
                <Card className="h-full transition-colors duration-200 group-hover:border-accent/30 group-hover:bg-muted/50">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Policies</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Generate and manage policy documents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Supplier Network */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Supplier Network</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">As Buyer</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">
                connected suppliers{totalSuppliers > 0 ? ` · ${avgSupplierCompletion}% avg. completion` : ''}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalBuyerRequirements} requirements defined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">As Supplier</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                buyer relationships
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalResponded} of {totalIncomingRequirements} requirements responded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/app/requirements" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ClipboardList className="h-3.5 w-3.5" /> Manage Requirements
              </Link>
              <Link href="/app/suppliers" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Building2 className="h-3.5 w-3.5" /> View Suppliers
              </Link>
              <Link href="/app/customers" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Handshake className="h-3.5 w-3.5" /> View Customers
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
