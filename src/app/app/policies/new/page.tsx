import { getCurrentOrganization } from "@/server/queries/organization";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PolicyForm } from "@/components/policies/policy-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ template?: string }>;
}

export default async function NewPolicyPage({ searchParams }: Props) {
  const { template: defaultTemplateId } = await searchParams;

  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("policy_templates")
    .select("id, code, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!templates || templates.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No policy templates are available at this time.
          </p>
          <Link
            href="/app/policies"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/app/policies"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Policies
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Generate Policy</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a template and provide context to generate a customized
          compliance policy document.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PolicyForm
          templates={templates}
          defaultTemplateId={defaultTemplateId}
        />
      </div>
    </div>
  );
}
