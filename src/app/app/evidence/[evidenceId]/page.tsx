import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileCheck,
  FileText,
  Pencil,
  Shield,
  Trash2,
  Download,
} from "lucide-react";
import { deleteEvidenceItem } from "@/server/actions/evidence";
import { FileUpload } from "@/components/evidence/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ evidenceId: string }>;
}

function getEvidenceStatus(expiresAt: string | null): {
  label: string;
  variant: "secondary" | "destructive" | "outline";
  className: string;
} {
  if (!expiresAt) {
    return { label: "Valid", variant: "secondary", className: "bg-green-100 text-green-700 border-green-200" };
  }

  const now = new Date();
  const expires = new Date(expiresAt);

  if (expires < now) {
    return { label: "Expired", variant: "destructive", className: "" };
  }

  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  if (expires <= ninetyDays) {
    return { label: "Expiring", variant: "secondary", className: "bg-amber-100 text-amber-700 border-amber-200" };
  }

  return { label: "Valid", variant: "secondary", className: "bg-green-100 text-green-700 border-green-200" };
}

export default async function EvidenceDetailPage({ params }: Props) {
  const { evidenceId } = await params;
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const supabase = await createClient();

  // Fetch evidence item
  const { data: evidence, error } = await supabase
    .from("evidence_items")
    .select("*")
    .eq("id", evidenceId)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (error || !evidence) {
    redirect("/app/evidence");
  }

  // Fetch linked controls
  const { data: linkedControls } = await supabase
    .from("evidence_item_controls")
    .select("control_id, control_catalog(id, control_code, title)")
    .eq("evidence_item_id", evidenceId);

  // Fetch files
  const { data: files } = await supabase
    .from("evidence_files")
    .select("*")
    .eq("evidence_item_id", evidenceId)
    .order("uploaded_at", { ascending: false });

  // Generate signed URLs for files
  const filesWithUrls = await Promise.all(
    (files ?? []).map(async (file: any) => {
      const { data } = await supabase.storage
        .from("evidence")
        .createSignedUrl(file.storage_path, 3600);

      return {
        ...file,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );

  const status = getEvidenceStatus(evidence.expires_at);
  const controls = (linkedControls ?? []).map(
    (lc: any) => lc.control_catalog as unknown as { id: string; control_code: string; title: string } | null
  ).filter(Boolean) as { id: string; control_code: string; title: string }[];

  const deleteWithId = deleteEvidenceItem.bind(null, evidenceId);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link href="/app/evidence" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Evidence
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {evidence.title}
            </h1>
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
          </div>
          {evidence.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {evidence.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/app/evidence/${evidenceId}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <form action={deleteWithId}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Expiration Date
            </div>
            <p className="mt-1 text-sm">
              {evidence.expires_at
                ? new Date(evidence.expires_at).toLocaleDateString()
                : "No expiration"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              Status
            </div>
            <p className="mt-1">
              <Badge variant={status.variant} className={status.className}>
                {status.label}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Linked Controls */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Linked Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {controls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No controls linked to this evidence item.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {controls.map((control: any) =>
                control ? (
                  <Badge key={control.id} variant="secondary" className="gap-1.5">
                    <span className="font-mono text-xs">{control.control_code}</span>
                    <span>{control.title}</span>
                  </Badge>
                ) : null,
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filesWithUrls.length === 0 ? (
            <p className="mb-4 text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          ) : (
            <div className="mb-4 space-y-2">
              {filesWithUrls.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file_size / 1024).toFixed(1)} KB
                        {" · "}
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {file.signedUrl && (
                    <a
                      href={file.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <FileUpload evidenceItemId={evidenceId} />
        </CardContent>
      </Card>
    </div>
  );
}
