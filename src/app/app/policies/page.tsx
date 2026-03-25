import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";
import { AutoRefresh } from "@/components/policies/auto-refresh";

const statusConfig = {
  queued: {
    label: "Queued",
    icon: Clock,
    colors: "bg-gray-100 text-gray-700",
  },
  generating: {
    label: "Generating",
    icon: Loader2,
    colors: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    colors: "bg-green-100 text-green-700",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    colors: "bg-red-100 text-red-700",
  },
} as const;

export default async function PoliciesPage() {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const supabase = await createClient();

  // Fetch active policy templates
  const { data: templates } = await supabase
    .from("policy_templates")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Fetch policy documents for this organization
  const { data: documents } = await supabase
    .from("policy_documents")
    .select("*, policy_templates(name, code)")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const hasInProgress = (documents ?? []).some(
    (d: any) => d.status === "queued" || d.status === "generating",
  );

  return (
    <div>
      {hasInProgress && <AutoRefresh intervalMs={5000} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and manage compliance policy documents
          </p>
        </div>
        <Link
          href="/app/policies/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Generate Policy
        </Link>
      </div>

      {/* Policy Templates */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Templates
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(templates ?? []).map((template: any) => (
            <div
              key={template.id}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <FileText className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {template.code}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
              <Link
                href={`/app/policies/new?template=${template.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Generate
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
          {(!templates || templates.length === 0) && (
            <p className="text-sm text-gray-500 col-span-full">
              No policy templates available yet.
            </p>
          )}
        </div>
      </div>

      {/* Generated Documents */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generated Documents
        </h2>
        {(!documents || documents.length === 0) ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No policy documents generated yet. Use the templates above to
              create your first policy.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => {
              const status =
                statusConfig[doc.status as keyof typeof statusConfig] ??
                statusConfig.queued;
              const StatusIcon = status.icon;

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {(doc.policy_templates as { name: string } | null)?.name ??
                        "Policy Document"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.colors}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                  {doc.status === "completed" && (doc.pdf_path || doc.docx_path) && (
                    <div className="flex items-center gap-2">
                      {doc.pdf_path && (
                        <a
                          href={`/api/policies/${doc.id}/download?format=pdf`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      )}
                      {doc.docx_path && (
                        <a
                          href={`/api/policies/${doc.id}/download?format=docx`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          DOCX
                        </a>
                      )}
                    </div>
                  )}
                  {doc.status === "failed" && doc.error_message && (
                    <span className="text-xs text-red-600 max-w-48 truncate">
                      {doc.error_message}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
