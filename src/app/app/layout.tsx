import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get current path from headers for sidebar active state
  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") ?? "/app/dashboard";

  // If no organization selected, redirect to create one
  // (but not if already on the create-org page)
  if (!profile?.last_organization_id && !currentPath.includes("/create-org")) {
    redirect("/app/create-org");
  }

  // Fetch the current organization (if set)
  let organization = null;
  if (profile?.last_organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.last_organization_id)
      .single();
    organization = org;
  }

  const userName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "User";
  const userEmail = user.email ?? "";

  // If on create-org page, render without sidebar
  if (!organization) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar
        currentPath={currentPath}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {organization.name}
            </h2>
          </div>
          <UserMenu userName={userName} userEmail={userEmail} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
