import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import { EvidenceForm } from "@/components/evidence/evidence-form";

interface Props {
  params: Promise<{ evidenceId: string }>;
}

export default async function EditEvidencePage({ params }: Props) {
  const { evidenceId } = await params;
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const supabase = await createClient();

  // Fetch the evidence item
  const { data: evidence, error } = await supabase
    .from("evidence_items")
    .select("*")
    .eq("id", evidenceId)
    .eq("organization_id", ctx.organization.id)
    .single();

  if (error || !evidence) {
    redirect("/app/evidence");
  }

  // Fetch linked control IDs
  const { data: linkedControls } = await supabase
    .from("evidence_item_controls")
    .select("control_id")
    .eq("evidence_item_id", evidenceId);

  const controlIds = (linkedControls ?? []).map(
    (lc: { control_id: string }) => lc.control_id,
  );

  // Fetch all controls from control_catalog
  const { data: controls } = await supabase
    .from("control_catalog")
    .select("id, control_code, title")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Evidence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the evidence item details and linked controls.
        </p>
      </div>

      <EvidenceForm
        controls={controls ?? []}
        mode="edit"
        initialData={{
          id: evidence.id,
          title: evidence.title,
          description: evidence.description,
          expires_at: evidence.expires_at,
          control_ids: controlIds,
        }}
      />
    </div>
  );
}
