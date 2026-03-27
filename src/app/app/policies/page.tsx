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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const statusConfig = {
  queued: {
    label: "Queued",
    icon: Clock,
    variant: "secondary" as const,
    className: "",
  },
  generating: {
    label: "Generating",
    icon: Loader2,
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    variant: "secondary" as const,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    variant: "destructive" as const,
    className: "",
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
          <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate and manage compliance policy documents
          </p>
        </div>
        <Link href="/app/policies/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" />
          Generate Policy
        </Link>
      </div>

      {/* Policy Templates */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Available Templates
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(templates ?? []).map((template: any) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <FileText className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">
                      {template.code}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{template.description}</CardDescription>
                <Link href={`/app/policies/new?template=${template.id}`} className={buttonVariants({ variant: "link", className: "p-0 h-auto" })}>
                  Generate
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
          {(!templates || templates.length === 0) && (
            <p className="text-sm text-muted-foreground col-span-full">
              No policy templates available yet.
            </p>
          )}
        </div>
      </div>

      {/* Generated Documents */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Generated Documents
        </h2>
        {(!documents || documents.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                No policy documents generated yet. Use the templates above to
                create your first policy.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => {
              const status =
                statusConfig[doc.status as keyof typeof statusConfig] ??
                statusConfig.queued;
              const StatusIcon = status.icon;

              return (
                <Card key={doc.id}>
                  <CardContent className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {(doc.policy_templates as { name: string } | null)?.name ??
                          "Policy Document"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={status.variant}
                      className={status.className}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </Badge>
                    {doc.status === "completed" && (doc.pdf_path || doc.docx_path) && (
                      <div className="flex items-center gap-2">
                        {doc.pdf_path && (
                          <a href={`/api/policies/${doc.id}/download?format=pdf`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        )}
                        {doc.docx_path && (
                          <a href={`/api/policies/${doc.id}/download?format=docx`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            <Download className="h-3.5 w-3.5" />
                            DOCX
                          </a>
                        )}
                      </div>
                    )}
                    {doc.status === "failed" && doc.error_message && (
                      <span className="text-xs text-destructive max-w-48 truncate">
                        {doc.error_message}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
