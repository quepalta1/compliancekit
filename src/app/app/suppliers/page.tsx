import { getCurrentOrganization } from "@/server/queries/organization";
import { getBuyerNetwork } from "@/server/queries/network";
import { redirect } from "next/navigation";
import { ConnectSupplierForm } from "@/components/network/connect-supplier-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  Clock,
} from "lucide-react";

export default async function SuppliersPage() {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const { organization } = ctx;
  const network = await getBuyerNetwork(organization.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Connected Suppliers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor supplier compliance with your requirements.
        </p>
      </div>

      {/* Connect supplier form */}
      <ConnectSupplierForm />

      {/* Supplier cards */}
      {network.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              No suppliers connected yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the form above to connect your first supplier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {network.map(({ relationship, supplier, summary }) => (
            <Card key={relationship.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate font-semibold">
                      {supplier?.name ?? "Unknown Supplier"}
                    </CardTitle>
                    {supplier?.slug && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {supplier.slug}
                      </p>
                    )}
                  </div>
                  <Badge className="shrink-0 border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]">
                    Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Completion progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {summary.completionPct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={summary.completionPct} className="h-1.5" />
                </div>

                {/* Status counts */}
                <div className="flex items-center gap-4">
                  {/* Compliant */}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                    <span className="text-xs font-medium tabular-nums text-[#16a34a]">
                      {summary.compliantCount}
                    </span>
                  </div>

                  {/* Partial */}
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />
                    <span className="text-xs font-medium tabular-nums text-[#f59e0b]">
                      {summary.partialCount}
                    </span>
                  </div>

                  {/* Non-compliant */}
                  <div className="flex items-center gap-1.5">
                    <XOctagon className="h-3.5 w-3.5 text-[#dc2626]" />
                    <span className="text-xs font-medium tabular-nums text-[#dc2626]">
                      {summary.notCompliantCount}
                    </span>
                  </div>

                  {/* Pending */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {summary.pendingRequirements}
                    </span>
                  </div>
                </div>

                {/* Requirements responded text */}
                <p className="text-xs text-muted-foreground">
                  {summary.respondedRequirements} of {summary.totalRequirements}{" "}
                  requirement{summary.totalRequirements === 1 ? "" : "s"} responded
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
