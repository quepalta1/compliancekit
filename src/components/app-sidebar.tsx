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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function AppSidebar({ currentPath }: AppSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          CK
        </div>
        <span className="text-lg font-semibold text-gray-900">
          ComplianceKit
        </span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const isActive = currentPath.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Settings section */}
        <div className="mt-8">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Settings
          </p>
          <ul className="mt-2 space-y-1">
            {settingsNav.map((item) => {
              const isActive = currentPath.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
