"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrganizationSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export type OrgActionState = { error: string } | null;

export async function createOrganization(
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
  };

  const result = createOrganizationSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an organization" };
  }

  // Check if slug is already taken
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", result.data.slug)
    .single();

  if (existing) {
    return { error: "This slug is already taken. Please choose another." };
  }

  // Create the organization
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: result.data.name,
      slug: result.data.slug,
    })
    .select()
    .single();

  if (orgError || !organization) {
    return { error: orgError?.message ?? "Failed to create organization" };
  }

  // Add the user as owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organization.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    // Rollback: delete the organization
    await supabase.from("organizations").delete().eq("id", organization.id);
    return { error: "Failed to add you as organization owner" };
  }

  // Look up the free plan and create a subscription
  const { data: freePlan } = await supabase
    .from("plans")
    .select("id")
    .eq("code", "free")
    .single();

  if (freePlan) {
    await supabase.from("subscriptions").insert({
      organization_id: organization.id,
      plan_id: freePlan.id,
      status: "active",
    });
  }

  // Update the user's profile with the new organization
  await supabase
    .from("profiles")
    .update({ last_organization_id: organization.id })
    .eq("user_id", user.id);

  redirect("/app/dashboard");
}
