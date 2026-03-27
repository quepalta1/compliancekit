import { getCurrentOrganization, getOrganizationMembers } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import { Users, Mail, UserPlus, Shield, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const roleConfig = {
  owner: { label: "Owner", icon: Crown, className: "bg-amber-100 text-amber-700 border-amber-200" },
  admin: { label: "Admin", icon: Shield, className: "bg-blue-100 text-blue-700 border-blue-200" },
  member: { label: "Member", icon: Users, className: "" },
} as const;

export default async function TeamPage() {
  const ctx = await getCurrentOrganization();

  if (!ctx) {
    redirect("/app/create-org");
  }

  const members = await getOrganizationMembers(ctx.organization.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage members of {ctx.organization.name}
          </p>
        </div>
      </div>

      {/* Members list */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Members ({members.length})
        </h2>
        <Card>
          <CardContent className="divide-y">
            {members.map((member: any) => {
              const profile = member.profiles as {
                user_id: string;
                full_name: string | null;
                created_at: string;
              } | null;
              const role =
                roleConfig[member.role as keyof typeof roleConfig] ??
                roleConfig.member;
              const RoleIcon = role.icon;
              const initial = (profile?.full_name ?? "U").charAt(0).toUpperCase();

              return (
                <div
                  key={member.user_id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar size="lg">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {profile?.full_name ?? "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined{" "}
                      {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={role.className}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    {role.label}
                  </Badge>
                </div>
              );
            })}
            {members.length === 0 && (
              <div className="py-8 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">No members found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Invite Members
        </h2>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <UserPlus className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle>Invite a team member</CardTitle>
                <CardDescription>
                  Send an invitation email to join your organization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    id="invite-email"
                    name="email"
                    disabled
                    placeholder="colleague@company.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  name="role"
                  disabled
                  className="flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="button" disabled>
                <UserPlus className="h-4 w-4" />
                Send Invite
              </Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              Invite functionality coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
