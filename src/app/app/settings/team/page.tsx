import { getCurrentOrganization, getOrganizationMembers } from "@/server/queries/organization";
import { redirect } from "next/navigation";
import { Users, Mail, UserPlus, Shield, Crown } from "lucide-react";

const roleConfig = {
  owner: { label: "Owner", icon: Crown, colors: "bg-amber-100 text-amber-700" },
  admin: { label: "Admin", icon: Shield, colors: "bg-blue-100 text-blue-700" },
  member: { label: "Member", icon: Users, colors: "bg-gray-100 text-gray-700" },
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
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage members of {ctx.organization.name}
          </p>
        </div>
      </div>

      {/* Members list */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Members ({members.length})
        </h2>
        <div className="space-y-2">
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

            return (
              <div
                key={member.user_id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                  {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {profile?.full_name ?? "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined{" "}
                    {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${role.colors}`}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  {role.label}
                </span>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No members found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Invite Members
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <UserPlus className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Invite a team member
              </p>
              <p className="text-xs text-gray-500">
                Send an invitation email to join your organization
              </p>
            </div>
          </div>
          <form className="flex items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="invite-email"
                  name="email"
                  disabled
                  placeholder="colleague@company.com"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="invite-role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="invite-role"
                name="role"
                disabled
                className="block rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4" />
              Send Invite
            </button>
          </form>
          <p className="mt-3 text-xs text-gray-400">
            Invite functionality coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
