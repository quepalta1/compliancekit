import { summarizeCompliance } from "@/lib/network/summary";
import { createClient } from "@/lib/supabase/server";

type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
};

type SupplierRelationshipRow = {
  id: string;
  customer_organization_id: string;
  supplier_organization_id: string;
  created_at: string;
  status: "active";
};

type BuyerRequirementRow = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  requirement_type: string;
  framework_ref: string | null;
  evidence_hint: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type SupplierRequirementResponseRow = {
  id: string;
  relationship_id: string;
  requirement_id: string;
  compliance_status: "compliant" | "partial" | "not_compliant" | "not_applicable";
  response_text: string;
  evidence_summary: string | null;
  submitted_at: string;
  updated_at: string;
};

async function getOrganizationsByIds(ids: string[]): Promise<Record<string, OrganizationSummary>> {
  if (ids.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .in("id", ids);

  return Object.fromEntries(
    (data ?? []).map((organization: OrganizationSummary) => [organization.id, organization]),
  );
}

export async function getBuyerRequirements(organizationId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("buyer_requirements")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as BuyerRequirementRow[];
}

export async function getBuyerNetwork(organizationId: string) {
  const supabase = await createClient();

  const { data: relationships } = await supabase
    .from("supplier_relationships")
    .select("*")
    .eq("customer_organization_id", organizationId)
    .order("created_at", { ascending: false });

  const relationshipRows = (relationships ?? []) as SupplierRelationshipRow[];
  const requirements = await getBuyerRequirements(organizationId);
  const suppliersById = await getOrganizationsByIds(
    relationshipRows.map((relationship) => relationship.supplier_organization_id),
  );

  let responses: SupplierRequirementResponseRow[] = [];
  if (relationshipRows.length > 0) {
    const { data } = await supabase
      .from("supplier_requirement_responses")
      .select("*")
      .in(
        "relationship_id",
        relationshipRows.map((relationship) => relationship.id),
      );

    responses = (data ?? []) as SupplierRequirementResponseRow[];
  }

  return relationshipRows.map((relationship) => {
    const relationshipResponses = responses.filter(
      (response) => response.relationship_id === relationship.id,
    );

    return {
      relationship,
      supplier: suppliersById[relationship.supplier_organization_id] ?? null,
      responses: relationshipResponses,
      summary: summarizeCompliance(
        requirements.length,
        relationshipResponses.map((response) => response.compliance_status),
      ),
    };
  });
}

export async function getSupplierNetwork(organizationId: string) {
  const supabase = await createClient();

  const { data: relationships } = await supabase
    .from("supplier_relationships")
    .select("*")
    .eq("supplier_organization_id", organizationId)
    .order("created_at", { ascending: false });

  const relationshipRows = (relationships ?? []) as SupplierRelationshipRow[];
  const customersById = await getOrganizationsByIds(
    relationshipRows.map((relationship) => relationship.customer_organization_id),
  );

  const customerIds = relationshipRows.map(
    (relationship) => relationship.customer_organization_id,
  );

  let requirements: BuyerRequirementRow[] = [];
  if (customerIds.length > 0) {
    const { data } = await supabase
      .from("buyer_requirements")
      .select("*")
      .in("organization_id", customerIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    requirements = (data ?? []) as BuyerRequirementRow[];
  }

  let responses: SupplierRequirementResponseRow[] = [];
  if (relationshipRows.length > 0) {
    const { data } = await supabase
      .from("supplier_requirement_responses")
      .select("*")
      .in(
        "relationship_id",
        relationshipRows.map((relationship) => relationship.id),
      );

    responses = (data ?? []) as SupplierRequirementResponseRow[];
  }

  return relationshipRows.map((relationship) => {
    const relationshipRequirements = requirements.filter(
      (requirement) =>
        requirement.organization_id === relationship.customer_organization_id,
    );
    const relationshipResponses = responses.filter(
      (response) => response.relationship_id === relationship.id,
    );
    const responsesByRequirementId = new Map(
      relationshipResponses.map((response) => [response.requirement_id, response]),
    );

    return {
      relationship,
      customer: customersById[relationship.customer_organization_id] ?? null,
      requirements: relationshipRequirements.map((requirement) => ({
        ...requirement,
        response: responsesByRequirementId.get(requirement.id) ?? null,
      })),
      summary: summarizeCompliance(
        relationshipRequirements.length,
        relationshipResponses.map((response) => response.compliance_status),
      ),
    };
  });
}
