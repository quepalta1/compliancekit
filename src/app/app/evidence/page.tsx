import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileCheck, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";

function getEvidenceStatus(expiresAt: string | null): {
  label: string;
  variant: "secondary" | "destructive" | "outline";
  className: string;
} {
  if (!expiresAt) {
    return {
      label: "Valid",
      variant: "secondary",
      className: "bg-green-100 text-green-700 border-green-200",
    };
  }

  const now = new Date();
  const expires = new Date(expiresAt);

  if (expires < now) {
    return {
      label: "Expired",
      variant: "destructive",
      className: "",
    };
  }

  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  if (expires <= ninetyDays) {
    return {
      label: "Expiring",
      variant: "secondary",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Valid",
    variant: "secondary",
    className: "bg-green-100 text-green-700 border-green-200",
  };
}

export default async function EvidenceListPage() {
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const supabase = await createClient();

  const { data: evidenceItems } = await supabase
    .from("evidence_items")
    .select("*, evidence_item_controls(control_id)")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const hasEvidence = evidenceItems && evidenceItems.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage your compliance evidence items.
          </p>
        </div>
        <Link href="/app/evidence/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" />
          Add Evidence
        </Link>
      </div>

      {!hasEvidence && (
        <Card className="mt-8 border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">
              No evidence items yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first evidence item to start tracking compliance
              documentation.
            </p>
          </CardContent>
        </Card>
      )}

      {hasEvidence && (
        <div className="mt-6 space-y-3">
          {evidenceItems.map((item: any) => {
            const status = getEvidenceStatus(item.expires_at);
            const controlCount = item.evidence_item_controls?.length ?? 0;

            return (
              <Link key={item.id} href={`/app/evidence/${item.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="mt-0.5 flex items-center gap-3">
                          <Badge
                            variant={status.variant}
                            className={status.className}
                          >
                            {status.label}
                          </Badge>
                          {item.expires_at && (
                            <span className="text-sm text-muted-foreground">
                              Expires{" "}
                              {new Date(item.expires_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {controlCount} control{controlCount !== 1 ? "s" : ""}
                          </span>
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
