import { createClient } from "@/lib/supabase/server";

export async function getCurrentOrganization() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile?.last_organization_id) return null;

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.last_organization_id)
    .single();

  if (!organization) return null;

  return { user, profile, organization };
}

export async function getOrganizationMembers(orgId: string) {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("organization_members")
    .select("*, profiles(*)")
    .eq("organization_id", orgId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching organization members:", error);
    return [];
  }

  return members ?? [];
}
