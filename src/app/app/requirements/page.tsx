import { getCurrentOrganization } from "@/server/queries/organization";
import { getBuyerRequirements } from "@/server/queries/network";
import { redirect } from "next/navigation";
import { RequirementForm } from "@/components/network/requirement-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  animal_welfare: "Animal Welfare",
  sustainability: "Sustainability",
  labor: "Labor & Human Rights",
  privacy: "Privacy & Data Protection",
  operations: "Operations",
  other: "Other",
};

export default async function RequirementsPage() {
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const { organization } = ctx;
  const requirements = await getBuyerRequirements(organization.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Buyer Requirements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define requirements that your suppliers must meet.
        </p>
      </div>

      {/* Create form */}
      <RequirementForm />

      {/* Requirements list */}
      {requirements.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No requirements yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first requirement above to start defining what your suppliers must demonstrate.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Active Requirements ({requirements.length})
          </h2>
          {requirements.map((req) => (
            <Card key={req.id}>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {/* Title and badges */}
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="font-medium leading-snug text-foreground">
                      {req.title}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {req.description}
                  </p>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[req.category] ?? req.category}
                    </Badge>
                    <Badge variant={req.requirement_type === "framework" ? "default" : "secondary"}>
                      {req.requirement_type === "framework" ? "Framework" : "Buyer Policy"}
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
                      {req.evidence_hint}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
