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

interface Props {
  params: Promise<{ evidenceId: string }>;
}

function getEvidenceStatus(expiresAt: string | null): {
  label: string;
  className: string;
} {
  if (!expiresAt) {
    return { label: "Valid", className: "bg-green-100 text-green-700" };
  }

  const now = new Date();
  const expires = new Date(expiresAt);

  if (expires < now) {
    return { label: "Expired", className: "bg-red-100 text-red-700" };
  }

  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  if (expires <= ninetyDays) {
    return { label: "Expiring", className: "bg-amber-100 text-amber-700" };
  }

  return { label: "Valid", className: "bg-green-100 text-green-700" };
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
      <Link
        href="/app/evidence"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Evidence
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {evidence.title}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          {evidence.description && (
            <p className="mt-2 text-sm text-gray-600">
              {evidence.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/evidence/${evidenceId}/edit`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Calendar className="h-4 w-4" />
            Expiration Date
          </div>
          <p className="mt-1 text-sm text-gray-900">
            {evidence.expires_at
              ? new Date(evidence.expires_at).toLocaleDateString()
              : "No expiration"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <FileCheck className="h-4 w-4" />
            Status
          </div>
          <p className="mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </p>
        </div>
      </div>

      {/* Linked Controls */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-900">
            Linked Controls
          </h2>
        </div>
        {controls.length === 0 ? (
          <p className="text-sm text-gray-500">
            No controls linked to this evidence item.
          </p>
        ) : (
          <div className="space-y-2">
            {controls.map((control: any) =>
              control ? (
                <div
                  key={control.id}
                  className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2"
                >
                  <span className="inline-flex items-center rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono font-medium text-gray-600">
                    {control.control_code}
                  </span>
                  <span className="text-sm text-gray-700">
                    {control.title}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Files */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-900">Files</h2>
        </div>

        {filesWithUrls.length === 0 ? (
          <p className="mb-4 text-sm text-gray-500">
            No files uploaded yet.
          </p>
        ) : (
          <div className="mb-4 space-y-2">
            {filesWithUrls.map((file: any) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
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
                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
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
      </div>
    </div>
  );
}
