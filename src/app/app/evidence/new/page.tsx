import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import { EvidenceForm } from "@/components/evidence/evidence-form";

export default async function NewEvidencePage() {
  const ctx = await getCurrentOrganization();
  if (!ctx) redirect("/app/create-org");

  const supabase = await createClient();

  const { data: controls } = await supabase
    .from("control_catalog")
    .select("id, control_code, title")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Evidence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new evidence item and link it to relevant controls.
        </p>
      </div>

      <EvidenceForm controls={controls ?? []} mode="create" />
    </div>
  );
}
