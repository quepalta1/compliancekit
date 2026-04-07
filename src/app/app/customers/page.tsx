import { getCurrentOrganization } from "@/server/queries/organization";
import { getSupplierNetwork } from "@/server/queries/network";
import { redirect } from "next/navigation";
import { SupplierResponseForm } from "@/components/network/supplier-response-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Handshake } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  animal_welfare: "Animal Welfare",
  sustainability: "Sustainability",
  labor: "Labor & Human Rights",
  privacy: "Privacy & Data Protection",
  operations: "Operations",
  other: "Other",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  compliant: "border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]",
  partial: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]",
  not_compliant: "border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]",
};

const STATUS_LABELS: Record<string, string> = {
  compliant: "Compliant",
  partial: "Partially Compliant",
  not_compliant: "Not Compliant",
  not_applicable: "Not Applicable",
};

export default async function CustomersPage() {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const { organization } = ctx;
  const network = await getSupplierNetwork(organization.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and respond to buyer requirements from organizations you supply to.
        </p>
      </div>

      {/* Empty state */}
      {network.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Handshake className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              No buyer relationships yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              When a buyer connects your organization, their requirements will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {network.map(({ relationship, customer, requirements, summary }) => (
            <Card key={relationship.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold">
                      {customer?.name ?? "Unknown Buyer"}
                    </CardTitle>
                    {customer?.slug && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {customer.slug}
                      </p>
                    )}
                  </div>
                  <Badge className="shrink-0 border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]">
                    Active
                  </Badge>
                </div>

                {/* Completion progress */}
                <div className="mt-3 space-y-1.5">
                  <Progress value={summary.completionPct} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {summary.respondedRequirements} of {summary.totalRequirements}{" "}
                    requirement{summary.totalRequirements === 1 ? "" : "s"} responded
                    {summary.totalRequirements > 0 && (
                      <span className="ml-1 font-medium text-foreground">
                        ({summary.completionPct}%)
                      </span>
                    )}
                  </p>
                </div>
              </CardHeader>

              {requirements.length > 0 && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="space-y-0">
                      {requirements.map((req, index) => (
                        <div key={req.id}>
                          <div className="py-4">
                            {/* Requirement header */}
                            <div className="mb-2 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {req.title}
                                </span>
                                {req.response && (
                                  <Badge
                                    className={
                                      req.response.compliance_status === "not_applicable"
                                        ? undefined
                                        : STATUS_BADGE_CLASSES[req.response.compliance_status]
                                    }
                                    variant={
                                      req.response.compliance_status === "not_applicable"
                                        ? "secondary"
                                        : "default"
                                    }
                                  >
                                    {STATUS_LABELS[req.response.compliance_status] ??
                                      req.response.compliance_status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {req.description}
                              </p>

                              {/* Category / type badges */}
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                <Badge variant="outline" className="text-xs">
                                  {CATEGORY_LABELS[req.category] ?? req.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {req.requirement_type === "framework"
                                    ? "Framework"
                                    : "Buyer Policy"}
                                </Badge>
                              </div>

                              {/* Framework ref */}
                              {req.framework_ref && (
                                <p className="text-xs text-muted-foreground">
                                  Ref: {req.framework_ref}
                                </p>
                              )}

                              {/* Evidence hint */}
                              {req.evidence_hint && (
                                <p className="text-xs italic text-muted-foreground">
                                  Hint: {req.evidence_hint}
                                </p>
                              )}
                            </div>

                            {/* Response form */}
                            <div className="mt-3 rounded-md bg-muted/30 p-3">
                              <SupplierResponseForm
                                relationshipId={relationship.id}
                                requirementId={req.id}
                                existingResponse={req.response}
                              />
                            </div>
                          </div>

                          {index < requirements.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {requirements.length === 0 && (
                <>
                  <Separator />
                  <CardContent className="py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      This buyer has not added any requirements yet.
                    </p>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
