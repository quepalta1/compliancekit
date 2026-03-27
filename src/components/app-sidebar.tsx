"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileCheck,
  FileText,
  BarChart3,
  CreditCard,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Assessment", href: "/app/assessment", icon: ClipboardCheck },
  { label: "Evidence", href: "/app/evidence", icon: FileCheck },
  { label: "Policies", href: "/app/policies", icon: FileText },
  { label: "Reports", href: "/app/reports", icon: BarChart3 },
];

const settingsNav = [
  { label: "Billing", href: "/app/settings/billing", icon: CreditCard },
  { label: "Team", href: "/app/settings/team", icon: Users },
];

interface AppSidebarProps {
  currentPath: string;
  userName: string;
  userEmail: string;
}

export function AppSidebar({ currentPath, userName, userEmail }: AppSidebarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          ComplianceKit
        </span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2">
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = currentPath.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Settings section */}
        <div className="mt-6">
          <Separator className="mb-4 bg-sidebar-border" />
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Settings
          </p>
          <ul className="space-y-0.5">
            {settingsNav.map((item) => {
              const isActive = currentPath.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">
              {userName}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
