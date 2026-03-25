import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileCheck, Plus, ArrowRight } from "lucide-react";

function getEvidenceStatus(expiresAt: string | null): {
  label: string;
  className: string;
} {
  if (!expiresAt) {
    return {
      label: "Valid",
      className: "bg-green-100 text-green-700",
    };
  }

  const now = new Date();
  const expires = new Date(expiresAt);

  if (expires < now) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700",
    };
  }

  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  if (expires <= ninetyDays) {
    return {
      label: "Expiring",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Valid",
    className: "bg-green-100 text-green-700",
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
          <h1 className="text-2xl font-bold text-gray-900">Evidence</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your compliance evidence items.
          </p>
        </div>
        <Link
          href="/app/evidence/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Evidence
        </Link>
      </div>

      {!hasEvidence && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileCheck className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No evidence items yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first evidence item to start tracking compliance
            documentation.
          </p>
        </div>
      )}

      {hasEvidence && (
        <div className="mt-6 space-y-3">
          {evidenceItems.map((item: any) => {
            const status = getEvidenceStatus(item.expires_at);
            const controlCount = item.evidence_item_controls?.length ?? 0;

            return (
              <Link
                key={item.id}
                href={`/app/evidence/${item.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <div className="mt-0.5 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {item.expires_at && (
                        <span className="text-sm text-gray-500">
                          Expires{" "}
                          {new Date(item.expires_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {controlCount} control{controlCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
